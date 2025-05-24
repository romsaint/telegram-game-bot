import { Message } from "node-telegram-bot-api";
import { bot } from "../app";

export async function onWithdrawal(msg: Message) {
    const userId = msg.from?.id
    if (!userId) return

    bot.sendMessage(userId, 'Вывод будет доступен после 31.05.2025')
}