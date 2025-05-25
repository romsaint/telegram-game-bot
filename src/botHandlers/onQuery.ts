import { v4 } from "uuid"
import { distributeByLevel } from "../utils/distributeByLevel"
import { bot } from "../app"
import { redisClient } from "../db/redis/redisClient"
import { CallbackQuery } from "node-telegram-bot-api"
import { deleteState } from "../utils/deleteState"
import { mongoClient } from "../db/mongo/mongoClient"
import { IUser } from "../interfaces/user.interface"
import { deposit } from "../utils/deposit"
import { exitWin } from "../utils/exitWin"
import { onHealthy } from "../utils/onHealthy"
import { onInfected } from "../utils/onInfected"

export async function onQuery(query: CallbackQuery) {
    const data = query.data
    const userId = query.from.id
    const collection = mongoClient.db('casino').collection<IUser>('users')

    if (data?.includes('зараженных')) {
        let id = v4()
        id = id.slice(0, 8)

        const game = distributeByLevel(userId, data, id)
        if (game) {
            await redisClient.set(`${userId}-level-game`, data)
            await redisClient.set(`${userId}-infected-emoji`, Buffer.from(JSON.stringify(game.infectedEmoji)))

            await bot.sendMessage(userId, `Выбери одно эмодзи, но учти - есть ${game?.infected} зараженных!`, {
                reply_markup: {
                    inline_keyboard: game.inline_keyboard
                }
            })

            await redisClient.setex(`${userId}-message`, 3600 * 12, id)
            await redisClient.set(`${userId}-game`, 0)

            return
        } else {
            bot.sendMessage(userId, 'ОШИБКА')
            return
        }
    }

    if (data === 'EXIT') {
        bot.sendMessage(userId, 'Вы вышли из игры')
        await deleteState(userId)

        return
    }
    if (data === 'DEPOSIT') {
        deposit(`${userId}`, userId)
        return
    }
    if (data === 'EXIT-DEPOSIT') {
        bot.sendMessage(userId, 'Вы ничего не внесли')
        await deleteState(userId)

        return
    }
    if (data === 'EXIT-WIN') {
        await exitWin(userId, collection)
    }

    if (data?.split('-')[2] === 'infected' || data?.split('-')[2] === 'healthy') {
        const idFromRedis = await redisClient.get(`${userId}-message`)

        if (data?.split('-')[3] !== idFromRedis) {
            bot.sendMessage(userId, 'Это старая игра')
            return
        }

    }
    if (data?.split('-')[2] === 'infected') {
        await onInfected(userId, collection, data)
    }
    if (data?.split('-')[2] === 'healthy') {
        await onHealthy(userId, collection, data)
    }
}