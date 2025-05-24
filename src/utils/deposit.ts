import { bot } from "../app"
import { redisClient } from "../db/redis/redisClient"

export async function deposit(key: string, userId: number) {
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

    bot.sendMessage(userId, 'Введите сумму взноса', {
        reply_markup: {
            inline_keyboard: [[{ text: 'Выйти', callback_data: 'EXIT-DEPOSIT' }]]
        }
    })
}