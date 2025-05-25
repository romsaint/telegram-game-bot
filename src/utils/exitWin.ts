import { Collection } from "mongodb"
import { bot } from "../app"
import { redisClient } from "../db/redis/redisClient"
import { deleteState } from "./deleteState"
import { IUser } from "../interfaces/user.interface"

export async function exitWin(userId: number, collection: Collection<IUser>) {
    const winMoneyData = await redisClient.get(`${userId}-money`)
    const gameData = await redisClient.get(`${userId}-game`)
    const emoji = await redisClient.get(`${userId}-infected-emoji`) as Buffer | null

    if (!winMoneyData || !gameData || !emoji) {
        bot.sendMessage(userId, `ОШИБКА`)

        return
    }
    const infectedEmojiArr = JSON.parse(emoji.toString('utf8')) as string[]

    const winMoney = Math.round(Number(winMoneyData) * Number(gameData))
    await collection.updateOne({ id: userId }, { $inc: { balance: winMoney } })

    bot.sendMessage(userId, `Вы выиграли ${winMoney}`)
    bot.sendMessage(userId, `Зараженные емодзи - ${infectedEmojiArr.join(' ')}`)

    await deleteState(userId)

    return
}