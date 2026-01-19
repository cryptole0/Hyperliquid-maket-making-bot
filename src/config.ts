import { config } from 'dotenv';
config()

// Hyperliquid API Configuration
const HYPERLIQUID_API_URL = process.env.HYPERLIQUID_API_URL || "https://api.hyperliquid.xyz";
const HYPERLIQUID_WS_URL = process.env.HYPERLIQUID_WS_URL || "wss://api.hyperliquid.xyz/ws";

// Trading Configuration
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const SYMBOL = process.env.SYMBOL || "ETH";
const BASE_URL = process.env.BASE_URL || "https://api.hyperliquid.xyz";

// Market Making Parameters
const SPREAD_PERCENTAGE = parseFloat(process.env.SPREAD_PERCENTAGE || "0.1"); // 0.1% spread
const ORDER_SIZE = parseFloat(process.env.ORDER_SIZE || "0.01"); // Order size in base currency
const MAX_POSITION_SIZE = parseFloat(process.env.MAX_POSITION_SIZE || "1.0"); // Maximum position size
const UPDATE_INTERVAL_MS = parseInt(process.env.UPDATE_INTERVAL_MS || "1000"); // How often to update quotes
const PRICE_TICK_SIZE = parseFloat(process.env.PRICE_TICK_SIZE || "0.01"); // Minimum price movement

// Telegram Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";
const TELEGRAM_ENABLED = process.env.TELEGRAM_ENABLED === "true";

export {
  HYPERLIQUID_API_URL,
  HYPERLIQUID_WS_URL,
  PRIVATE_KEY,
  SYMBOL,
  BASE_URL,
  SPREAD_PERCENTAGE,
  ORDER_SIZE,
  MAX_POSITION_SIZE,
  UPDATE_INTERVAL_MS,
  PRICE_TICK_SIZE,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
  TELEGRAM_ENABLED
}