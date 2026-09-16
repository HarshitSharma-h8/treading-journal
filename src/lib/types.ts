export type Direction = "BUY" | "SELL";

export type TradeTypeEnum = "INTRADAY" | "SWING" | "DELIVERY";

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
  journalId: string;
  symbol: string;
  direction: Direction;
  tradeType: TradeTypeEnum;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  entryTime: string;
  exitTime?: string;
  
  // Optional/Computed fields (PnL is now computed on the fly on the frontend, but we might pass it from somewhere. Wait, getTrades won't return pnl unless we calculate it. Wait, the frontend calculates it.)
  pnl?: number;
  
  // Optional fields
  stopLoss?: number;
  target?: number;
  setupStrategy?: string;
  exitReason?: string;
  tradeNote?: string;
  source?: string;
  
  // Backward compatibility
  strategyId?: string;
  marketCondition?: MarketCondition;
  emotion?: Emotion;
  planFollowed?: boolean;
  tradeStyle?: string;
  stopLossSource?: string;
  targetSource?: string;
  
  // Deprecated fields kept for typing backwards compatibility
  tradeDate?: string;
  tradeSetup?: string;
  quickNote?: string;
  whatWentWell?: string;
  whatWentWrong?: string;
  lesson?: string;
  screenshot?: string;
}
