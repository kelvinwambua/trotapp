import { StyleSheet, View, Text, ActivityIndicator, ScrollView, Dimensions, Image, Pressable } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  error: '#FF3B30',
  text: '#1C1C1E',
  gray: '#64748B',
  lightGray: '#F0F9FF',
  borderGray: '#E2E8F0',
  white: '#FFFFFF',
  background: '#F8F9FA',
};

const EarningsPage = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const convexUser = useQuery(api.users.current);
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'year'>('week');
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    const now = new Date();
    switch (timeFrame) {
      case 'week':
        setDateRange({
          startDate: format(subDays(now, 7), 'yyyy-MM-dd'),
          endDate: format(now, 'yyyy-MM-dd'),
        });
        break;
      case 'month':
        setDateRange({
          startDate: format(subMonths(now, 1), 'yyyy-MM-dd'),
          endDate: format(now, 'yyyy-MM-dd'),
        });
        break;
      case 'year':
        setDateRange({
          startDate: format(subYears(now, 1), 'yyyy-MM-dd'),
          endDate: format(now, 'yyyy-MM-dd'),
        });
        break;
    }
  }, [timeFrame]);
  

  const earningsData = useQuery(api.earnings.getEarningsData, {
    userId: convexUser?._id!,
    timeFrame,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const earningsSummary = useQuery(api.earnings.getEarningsSummary, {
    userId: convexUser?._id!,
  });

  const carStats = useQuery(api.earnings.getCarRentalStats, {
    userId: convexUser?._id!,
    timeFrame,
  });

  if (!earningsData || !earningsSummary || !carStats) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          animation: 'slide_from_right',
          title: 'Earnings',
          headerTitleStyle: styles.headerTitle,
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.timeFrameSelector}>
          {['week', 'month', 'year'].map((tf) => (
            <Pressable
              key={tf}
              style={[
                styles.timeFrameOption,
                timeFrame === tf && styles.activeTimeFrame,
              ]}
              onPress={() => setTimeFrame(tf as 'week' | 'month' | 'year')}
            >
              <Text style={[
                styles.timeFrameText,
                timeFrame === tf && styles.activeTimeFrameText,
              ]}>
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Revenue Over Time</Text>
          <LineChart
            data={{
              labels: earningsData.labels,
              datasets: earningsData.datasets,
            }}
            width={width - 32}
            height={220}
            chartConfig={{
              backgroundColor: Colors.white,
              backgroundGradientFrom: Colors.white,
              backgroundGradientTo: Colors.white,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              style: { borderRadius: 16 },
              propsForLabels: {
                fontFamily: 'DMSans_400Regular',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Total Earnings"
            value={`$${earningsSummary.totalEarnings.toLocaleString()}`}
            trend={earningsData.trend}
            icon="attach-money"
          />
          <StatCard
            title="Total Bookings"
            value={earningsSummary.totalBookings.toString()}
            trend={earningsData.bookingsTrend}
            icon="calendar-today"
          />
          <StatCard
            title="Active Fleet"
            value={earningsSummary.activeFleetSize.toString()}
            icon="directions-car"
          />
          <StatCard
            title="Utilization Rate"
            value={`${Math.round(earningsSummary.utilizationRate)}%`}
            icon="trending-up"
          />
        </View>

        <View style={styles.carsSection}>
          <View style={styles.carsSectionHeader}>
            <Text style={styles.carsSectionTitle}>Vehicle Performance</Text>
          </View>
          <View style={styles.carsList}>
            {carStats.cars.map((car) => (
              <Pressable
                key={car.id}
                style={styles.carCard}
                onPress={() =>   router.push({
                      pathname: "/(auth)/(tabs)/(profile)/car-details/[id]",
                      params: { id: car.id }
                    })}
              >
                <Image 
                  source={{ uri: car.imageUrl }}
                  style={styles.carImage}
                  defaultSource={require('@/assets/images/car.jpg')}
                />
                <View style={styles.carDetails}>
                  <Text style={styles.carName} numberOfLines={1}>{car.name}</Text>
                  <View style={styles.carStatRow}>
                    <MaterialIcons name="calendar-today" size={16} color={Colors.gray} />
                    <Text style={styles.carType}>
                      {car.totalRentals} rentals
                    </Text>
                  </View>
                  <View style={styles.carStatRow}>
                    <MaterialIcons name="attach-money" size={16} color={Colors.gray} />
                    <Text style={styles.carType}>
                      ${car.totalEarnings.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.features}>
                    <Text style={styles.featureText}>{car.utilization}% util</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.featureText}>${car.avgDailyEarnings}/day</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const StatCard = ({ title, value, trend, icon }: any) => (
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      <MaterialIcons name={icon} size={24} color={Colors.primary} />
      <Text style={styles.statTitle}>{title}</Text>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    {trend !== undefined && (
      <Text
        style={[
          styles.trend,
          { color: trend >= 0 ? Colors.success : Colors.error },
        ]}
      >
        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
      </Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
  },
  timeFrameSelector: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 4,
  },
  timeFrameOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTimeFrame: {
    backgroundColor: Colors.white,
    borderRadius: 8,
  },
  timeFrameText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: Colors.gray,
  },
  activeTimeFrameText: {
    color: Colors.primary,
  },
  chartContainer: {
    margin: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statTitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: Colors.gray,
  },
  statValue: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 24,
    color: Colors.text,
    marginBottom: 4,
  },
  trend: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
  },
  carsSection: {
    paddingTop: 8,
  },
  carsSectionHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGray,
  },
  carsSectionTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    color: Colors.text,
  },
  carsList: {
    padding: 16,
  },
  carCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 104,
   
  },
  carImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  carDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  carName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },
  carStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  carType: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Colors.gray,
  },
  features: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  featureText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: Colors.primary,
  },
  dot: {
    color: Colors.gray,
    marginHorizontal: 6,
  },
});

export default EarningsPage;