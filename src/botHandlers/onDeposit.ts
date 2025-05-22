import { Message } from "node-telegram-bot-api";
import { bot } from "../app";
import { redisClient } from "../db/redis/redisClient";


export async function onDeposit(msg: Message) {
    const userId = msg.from?.id
    if (!userId) return

    try {
        const data = msg.text
        if (!data) {
            return
        }

        const money = parseInt(data)

        if (money < 10) {
            bot.sendMessage(userId, 'Минимум 10 рублей')
            return
        }
        const key = `${userId}`

        if (await redisClient.get(key) === 'DEPOSIT_STATE') {
            bot.sendMessage(userId, 'Внесите деньги или выйдите', {
                reply_markup: {
                    inline_keyboard: [[{ text: 'Выйти', callback_data: 'EXIT' }]]
                }
            })
            return
        } else {
            await redisClient.set(key, 'DEPOSIT_STATE')
        }

        bot.sendMessage(userId, 'Введите сумму взноса')
    } catch (e) {
        console.log(e)
        bot.sendMessage(userId, 'Ошибка')
    }
}