import { v4 } from "uuid"
import { distributeByLevel } from "../utils/distributeByLevel"
import { bot } from "../app"
import { redisClient } from "../db/redis/redisClient"
import { CallbackQuery } from "node-telegram-bot-api"

export async function onQuery(query: CallbackQuery) {
    const data = query.data
    const userId = query.from.id

    if (data?.includes('зараженных')) {
        let id = v4()
        id = id.slice(0, 8)

        const game = distributeByLevel(userId, data, id)
        if (game) {
            await bot.sendMessage(userId, `Выбери одно эмодзи, но учти - есть ${game?.infected} зараженных!`, {
                reply_markup: {
                    inline_keyboard: game.inline_keyboard
                }
            })

            await redisClient.setex(`${userId}-message`, 3600 * 12, id)

            return
        } else {
            bot.sendMessage(userId, 'ERROR')
            return
        }
    }
    if (data === 'EXIT') {
        bot.sendMessage(userId, 'Вы вышли из игры')

        await redisClient.del(`${userId}-start`)
        await redisClient.del(`${userId}-message`)
        await redisClient.del(`${userId}`)
        return
    }

    if (data?.split('-')[2] === 'infected' || data?.split('-')[2] === 'healthy') {
        const idFromRedis = await redisClient.get(`${userId}-message`)
        
        if (data?.split('-')[3] !== idFromRedis) {
            bot.sendMessage(userId, 'Это старая игра')
            return
        }

    }
    if (data?.split('-')[2] === 'infected') {
        await redisClient.del(`${userId}-start`)
        await redisClient.del(`${userId}-message`)
        await redisClient.del(`${userId}`)

        bot.sendMessage(userId, 'Вы проиграли :(')
        return
    }
    if (data?.split('-')[2] === 'healthy') {
        bot.sendMessage(userId, 'Вы выиграли!! Вы можете продолжить играть либо выйти с выигрышем', {
            reply_markup: {
                inline_keyboard: [[{ text: 'Выйти', callback_data: "EXIT" }]]
            }
        })
        return
    }
}