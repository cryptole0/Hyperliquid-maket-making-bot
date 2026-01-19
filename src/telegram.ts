import TelegramBot from 'node-telegram-bot-api';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_ENABLED } from './config';
import { log } from './utils';
import { Order, Position, OrderBook } from './types';
import { formatPrice, formatSize } from './utils';

export class TelegramService {
  private bot: TelegramBot | null = null;
  private chatId: string;
  private enabled: boolean;

  constructor() {
    this.enabled = TELEGRAM_ENABLED && !!TELEGRAM_BOT_TOKEN && !!TELEGRAM_CHAT_ID;
    this.chatId = TELEGRAM_CHAT_ID;

    if (this.enabled) {
      try {
        this.bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
        this.setupCommands();
        log.success('Telegram bot initialized');
      } catch (error: any) {
        log.error(`Failed to initialize Telegram bot: ${error.message}`);
        this.enabled = false;
      }
    } else {
      log.warn('Telegram notifications disabled (missing token or chat ID)');
    }
  }

  private setupCommands(): void {
    if (!this.bot) return;

    // Handle /start command
    this.bot.onText(/\/start/, (msg) => {
      this.sendMessage(
        `🤖 Hyperliquid Market Making Bot\n\n` +
        `Available commands:\n` +
        `/status - Get bot status\n` +
        `/position - Get current position\n` +
        `/orders - Get active orders\n` +
        `/help - Show this help message`
      );
    });

    // Handle /help command
    this.bot.onText(/\/help/, (msg) => {
      this.sendMessage(
        `📚 Bot Commands:\n\n` +
        `/status - Get current bot status and configuration\n` +
        `/position - View current position details\n` +
        `/orders - List all active orders\n` +
        `/help - Show this help message`
      );
    });
  }

  async sendMessage(text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<void> {
    if (!this.enabled || !this.bot) return;

    try {
      await this.bot.sendMessage(this.chatId, text, { parse_mode: parseMode });
    } catch (error: any) {
      log.error(`Failed to send Telegram message: ${error.message}`);
    }
  }

  async sendNotification(title: string, message: string, emoji: string = '📢'): Promise<void> {
    const text = `${emoji} <b>${title}</b>\n\n${message}`;
    await this.sendMessage(text);
  }

  async sendStatus(config: any, position: Position | null, activeOrdersCount: number): Promise<void> {
    const statusText = `
📊 <b>Bot Status</b>

<b>Configuration:</b>
Symbol: ${config.symbol}
Spread: ${config.spreadPercentage}%
Order Size: ${formatSize(config.orderSize)}
Max Position: ${formatSize(config.maxPositionSize)}
Update Interval: ${config.updateIntervalMs}ms

<b>Current State:</b>
Position: ${position ? `${formatSize(position.size)} @ ${formatPrice(position.entryPrice)}` : 'None'}
Active Orders: ${activeOrdersCount}
Status: ${config.isRunning ? '🟢 Running' : '🔴 Stopped'}
    `.trim();

    await this.sendMessage(statusText);
  }

  async sendPositionUpdate(position: Position | null): Promise<void> {
    if (position) {
      const text = `
📈 <b>Position Update</b>

Symbol: ${position.symbol}
Size: ${formatSize(position.size)}
Entry Price: ${formatPrice(position.entryPrice)}
Unrealized PnL: ${formatPrice(position.unrealizedPnl)}
      `.trim();
      await this.sendMessage(text);
    } else {
      await this.sendMessage('📉 <b>Position Closed</b>\n\nNo open position.');
    }
  }

  async sendOrderPlaced(order: Order): Promise<void> {
    const sideEmoji = order.side === 'buy' ? '🟢' : '🔴';
    const text = `
${sideEmoji} <b>Order Placed</b>

Side: ${order.side.toUpperCase()}
Symbol: ${order.symbol}
Size: ${formatSize(order.size)}
Price: ${formatPrice(order.price || 0)}
Type: ${order.type}
    `.trim();
    await this.sendMessage(text);
  }

  async sendOrderFilled(order: Order, fillPrice: number): Promise<void> {
    const sideEmoji = order.side === 'buy' ? '🟢' : '🔴';
    const text = `
✅ <b>Order Filled</b>

${sideEmoji} ${order.side.toUpperCase()} ${formatSize(order.size)} ${order.symbol}
Fill Price: ${formatPrice(fillPrice)}
    `.trim();
    await this.sendMessage(text);
  }

  async sendOrderCancelled(orderId: string): Promise<void> {
    await this.sendMessage(`❌ <b>Order Cancelled</b>\n\nOrder ID: ${orderId}`);
  }

  async sendActiveOrders(orders: Order[]): Promise<void> {
    if (orders.length === 0) {
      await this.sendMessage('📋 <b>Active Orders</b>\n\nNo active orders.');
      return;
    }

    let text = `📋 <b>Active Orders</b> (${orders.length})\n\n`;
    orders.forEach((order, index) => {
      const sideEmoji = order.side === 'buy' ? '🟢' : '🔴';
      text += `${index + 1}. ${sideEmoji} ${order.side.toUpperCase()} ${formatSize(order.size)} @ ${formatPrice(order.price || 0)}\n`;
    });

    await this.sendMessage(text);
  }

  async sendError(error: string): Promise<void> {
    await this.sendMessage(`⚠️ <b>Error</b>\n\n${error}`);
  }

  async sendAlert(message: string): Promise<void> {
    await this.sendNotification('Alert', message, '🚨');
  }

  async sendInfo(message: string): Promise<void> {
    await this.sendNotification('Info', message, 'ℹ️');
  }

  // Method to register command handlers from the bot
  registerCommandHandler(command: string, handler: (msg: TelegramBot.Message) => void): void {
    if (!this.bot) return;

    this.bot.onText(new RegExp(`/${command}`), handler);
  }

  // Method to get bot instance for external command registration
  getBot(): TelegramBot | null {
    return this.bot;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}
