import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { Id } from './_generated/dataModel';
import { format, parseISO, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, addDays } from 'date-fns';
import { subDays, subMonths, subYears } from 'date-fns';

interface TimeFrameData {
  labels: string[];
  datasets: {
    data: number[];
  }[];
  trend: number;
  bookingsTrend: number;
}

interface EarningsSummary {
  totalEarnings: number;
  totalBookings: number;
  activeFleetSize: number;
  utilizationRate: number;
  peakEarnings: number;
  averageDailyRevenue: number;
}

export const getEarningsData = query({
  args: {
    userId: v.id('users'),
    timeFrame: v.string(),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, { userId, timeFrame, startDate, endDate }): Promise<TimeFrameData> => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    const transactions = await ctx.db
      .query('transactions')
      .filter(q => q.eq(q.field('receiverId'), userId))
      .filter(q => q.eq(q.field('status'), 'completed'))
      .filter(q => q.gte(q.field('createdAt'), startDate))
      .filter(q => q.lte(q.field('createdAt'), endDate))
      .collect();
    
    const previousStartDate = format(
      timeFrame === 'week' ? subDays(start, 7) :
      timeFrame === 'month' ? subMonths(start, 1) :
      subYears(start, 1),
      'yyyy-MM-dd'
    );

    const previousTransactions = await ctx.db
      .query('transactions')
      .filter(q => q.eq(q.field('receiverId'), userId))
      .filter(q => q.eq(q.field('status'), 'completed'))
      .filter(q => q.gte(q.field('createdAt'), previousStartDate))
      .filter(q => q.lt(q.field('createdAt'), startDate))
      .collect();

    let intervals;
    let formatString;
    
    if (timeFrame === 'week') {
      intervals = eachDayOfInterval({ start, end });
      formatString = 'EEE';
    } else if (timeFrame === 'month') {
      intervals = eachWeekOfInterval({ start, end });
      formatString = 'MMM d';
    } else {
      intervals = eachMonthOfInterval({ start, end });
      formatString = 'MMM';
    }
    
    const labels = intervals.map(date => format(date, formatString));
    const data = intervals.map((intervalStart, index) => {
      let intervalEnd;
      if (index < intervals.length - 1) {
        intervalEnd = addDays(intervals[index + 1], -1);
      } else {
        intervalEnd = end;
      }
      
      const intervalStartStr = format(intervalStart, 'yyyy-MM-dd');
      const intervalEndStr = format(intervalEnd, 'yyyy-MM-dd');
      
      const intervalTransactions = transactions.filter(t => {
        const txDate = t.createdAt.split('T')[0]; 
        return txDate >= intervalStartStr && txDate <= intervalEndStr;
      });
      

      const sum = intervalTransactions.reduce((sum, t) => sum + t.amount, 0);
      return sum;
    });
    const currentTotal = transactions.reduce((sum, t) => sum + t.amount, 0);
    const previousTotal = previousTransactions.reduce((sum, t) => sum + t.amount, 0);
    const trend = previousTotal === 0 ? 0 :
      Math.round(((currentTotal - previousTotal) / previousTotal) * 100);


    const bookings = await ctx.db
      .query('bookings')
      .filter(q => q.eq(q.field('ownerId'), userId))
      .filter(q => q.gte(q.field('startDate'), startDate))
      .filter(q => q.lte(q.field('endDate'), endDate))
      .collect();
    
    const previousBookings = await ctx.db
      .query('bookings')
      .filter(q => q.eq(q.field('ownerId'), userId))
      .filter(q => q.gte(q.field('startDate'), previousStartDate))
      .filter(q => q.lt(q.field('startDate'), startDate))
      .collect();

    const currentBookings = bookings.length;
    const previousBookingsNumber = previousBookings.length;
    const bookingsTrend = previousBookingsNumber === 0 ? 0 :
      Math.round(((currentBookings - previousBookingsNumber) / previousBookingsNumber) * 100);

    return {
      labels,
      datasets: [{
        data
      }],
      trend,
      bookingsTrend
    };
  },
});

export const getEarningsSummary = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, { userId }): Promise<EarningsSummary> => {
    const [bookings, transactions, posts] = await Promise.all([
      ctx.db
        .query('bookings')
        .filter(q => q.eq(q.field('ownerId'), userId))
        .collect(),
      ctx.db
        .query('transactions')
        .filter(q => q.eq(q.field('receiverId'), userId))
        .filter(q => q.eq(q.field('status'), 'completed'))
        .collect(),
      ctx.db
        .query('posts')
        .filter(q => q.eq(q.field('posterId'), userId))
        .filter(q => q.eq(q.field('status'), 'active'))
        .collect(),
    ]);

    const totalEarnings = transactions.reduce((sum, t) => sum + t.amount, 0);
    const peakEarnings = Math.max(...transactions.map(t => t.amount));
    const averageDailyRevenue = totalEarnings / Math.max(1, bookings.length);

    const activeFleetSize = posts.length;
    const utilizationRate = calculateUtilizationRate(bookings, posts);

    return {
      totalEarnings,
      totalBookings: bookings.length,
      activeFleetSize,
      utilizationRate,
      peakEarnings,
      averageDailyRevenue,
    };
  },
});
export const getCarRentalStats = query({
  args: {
    userId: v.id('users'),
    timeFrame: v.string(),
  },
  handler: async (ctx, { userId, timeFrame }): Promise<{
    cars: Array<{
      id: string;
      name: string;
      imageUrl: string;
      totalRentals: number;
      totalEarnings: number;
      utilization: number;
      avgDailyEarnings: number;
    }>;
  }> => {

    const posts = await ctx.db
      .query('posts')
      .filter(q => q.eq(q.field('posterId'), userId))
      .collect();

    const bookings = await ctx.db
      .query('bookings')
      .filter(q => q.eq(q.field('ownerId'), userId))
      .collect();

    const transactions = await ctx.db
      .query('transactions')
      .filter(q => q.eq(q.field('receiverId'), userId))
      .filter(q => q.eq(q.field('status'), 'completed'))
      .collect();

    const carStats = await Promise.all(posts.map(async (post) => {
      const carBookings = bookings.filter(b => b.postId === post._id);
      const carTransactions = transactions.filter(t => t.bookingId && carBookings.some(b => b._id === t.bookingId));
      
      const totalEarnings = carTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalDaysRented = carBookings.reduce((sum, booking) => {
        const start = new Date(booking.startDate);
        const end = new Date(booking.endDate);
        return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      }, 0);

      const imageUrl = post.carImageUrl?.[0] ? 
        await ctx.storage.getUrl(post.carImageUrl[0] as Id<'_storage'>) :
        null;

      return {
        id: post._id,
        name: `${post.carYear} ${post.carMake} ${post.carModel}`,
        imageUrl: imageUrl || '',
        totalRentals: carBookings.length,
        totalEarnings,
        utilization: Math.round((totalDaysRented / 30) * 100), 
        avgDailyEarnings: totalDaysRented ? Math.round(totalEarnings / totalDaysRented) : 0,
      };
    }));

    return {
      cars: carStats.sort((a, b) => b.totalEarnings - a.totalEarnings)
    };
  },
});

function calculateUtilizationRate(bookings: any[], posts: any[]): number {
  if (posts.length === 0) return 0;
  
  const totalDaysRented = bookings.reduce((sum, booking) => {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }, 0);

  const totalPossibleDays = posts.length * 30; 
  return (totalDaysRented / totalPossibleDays) * 100;
}