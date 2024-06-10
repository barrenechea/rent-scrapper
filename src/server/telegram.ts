import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";

class TelegramBot {
  public bot: Telegraf;
  constructor() {
    this.bot = new Telegraf(process.env.BOT_TOKEN ?? "");

    process.once("SIGINT", () => this.bot.stop("SIGINT"));
    process.once("SIGTERM", () => this.bot.stop("SIGTERM"));

    this.bot.on(message("text"), (ctx) => {
      const text = ctx.message.text.trim();
      const userId = ctx.message.from.id;

      console.log(`Received message from ${userId}: ${text}`);
    });

    void this.bot.launch();
  }

  async sendResult(userId: string, message: string): Promise<void> {
    await this.bot.telegram.sendMessage(userId, message, {
      parse_mode: "HTML",
    });
  }
}

export default TelegramBot;
