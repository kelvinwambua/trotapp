import { v } from "convex/values";
import { createFlutterwaveSubAccount } from "./flutterwave";
import { mutation } from "./_generated/server";

export const createPaymentAccount = mutation({
    args: {
      userId: v.id('users'),
      accountNumber: v.string(),
      bankCode: v.string(),
      bankName: v.string(),
      businessName: v.string(),
      mobileNumber: v.string(),
      splitRatio: v.number(),
    },
    handler: async (ctx, args) => {

      const subaccountData = await createFlutterwaveSubAccount({
        account_bank: args.bankCode,
        account_number: args.accountNumber,
        business_name: args.businessName,
        business_mobile: args.mobileNumber,
        split_value: args.splitRatio
      });
  
      return await ctx.db.insert('paymentAccounts', {
        userId: args.userId,
        flutterwaveSubAccountId: subaccountData.data.subaccount_id,
        accountType: 'owner',
        accountNumber: args.accountNumber,
        bankCode: args.bankCode,
        bankName: args.bankName,
        splitRatio: args.splitRatio,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          settlement_bank: args.bankName,
          account_holder_name: args.businessName,
          mobile_number: args.mobileNumber,
        }
      });
    }
  })