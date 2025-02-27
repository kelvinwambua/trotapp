const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLUTTERWAVE_BASE_URL = "https://api.flutterwave.com/v3";

interface CreateSubAccountParams {
  account_bank: string;
  account_number: string;
  business_name: string;
  business_mobile: string;
  split_value: number; 
  business_email?: string;
}

export async function createFlutterwaveSubAccount(params: CreateSubAccountParams) {
  try {
    const response = await fetch(`${FLUTTERWAVE_BASE_URL}/subaccounts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating subaccount:', error);
    throw error;
  }
}
export async function getSubAccount(subaccountId: string) {
    try {
      const response = await fetch(`${FLUTTERWAVE_BASE_URL}/subaccounts/${subaccountId}`, {
        headers: {
          'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching subaccount:', error);
      throw error;
    }
  }
