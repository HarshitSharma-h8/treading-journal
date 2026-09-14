import { createTrade } from './src/lib/server/trades';
import { tradeSchema } from './src/lib/validations/trade';

async function test() {
  try {
    const body = {
      symbol: "TEST",
      tradeType: "BUY",
      entryPrice: 100,
      exitPrice: 110,
      quantity: 1,
      tradeDate: new Date().toISOString()
    };
    
    const validatedData = tradeSchema.parse(body);
    console.log("Validated:", validatedData);
    
    // Hardcode a valid userId for testing
    const userId = "c1b5e5c7-1b3a-4b7e-9b3a-4b7e9b3a4b7e"; // This doesn't exist, it should throw FK error
    
    await createTrade(userId, validatedData as any);
  } catch (err: any) {
    console.error("Caught error:", err.message);
  }
}

test();
