export type TradeType = "BUY" | "SELL";

export type Emotion = 
  | "Calm" 
  | "Confident" 
  | "Fearful" 
  | "Greedy" 
  | "Frustrated" 
  | "FOMO" 
  | "Revenge" 
  | "Neutral";

export type MarketCondition = 
  | "Trending" 
  | "Range" 
  | "Volatile" 
  | "Choppy" 
  | "Calm";

export interface Trade {
  id: string;
  tradeDate: string; // Prisma uses tradeDate (sent as string JSON)
  symbol: string;
  tradeType: TradeType;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  
  // Optional fields
  strategyId?: string; // Prisma uses strategyId
  stopLoss?: number;
  target?: number;
  marketCondition?: MarketCondition;
  tradeSetup?: string;
  emotion?: Emotion;
  planFollowed?: boolean;
  quickNote?: string;
  whatWentWell?: string;
  whatWentWrong?: string;
  lesson?: string;
  screenshot?: string; // Storing as base64 or object URL for now
}
