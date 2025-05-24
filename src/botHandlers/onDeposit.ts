import { Message } from "node-telegram-bot-api";
import { bot } from "../app";
import { redisClient } from "../db/redis/redisClient";
import { deposit } from "../utils/deposit";


export async function onDeposit(msg: Message) {
    const userId = msg.from?.id
    if (!userId) return

    try {
        const data = msg.text
        if (!data) {
            return
        }

        const key = `${userId}`
        deposit(key, userId)
    } catch (e) {
        console.log(e)
        bot.sendMessage(userId, 'Ошибка')
    }
}