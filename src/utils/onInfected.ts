import { Collection } from "mongodb"
import { bot } from "../app"
import { redisClient } from "../db/redis/redisClient"
import { deleteState } from "./deleteState"
import { IUser } from "../interfaces/user.interface"

export async function onInfected(userId: number, collection: Collection<IUser>, data: string) {
    const spendMoney = await redisClient.get(`${userId}-money`)
        const emoji = await redisClient.get(`${userId}-infected-emoji`) as Buffer | null

        if (!emoji) {
            bot.sendMessage(userId, 'ОШИБКА')
            return
        }
        const infectedEmojiArr = JSON.parse(emoji.toString('utf8')) as string[]

        if (spendMoney) {
            await collection.updateOne(
                { id: userId },
                {
                    $inc: {
                        loseSum: Number(spendMoney),
                        gameCount: 1
                    }
                }
            )
        }
        deleteState(userId)

        bot.sendMessage(userId, 'Вы проиграли :(')
        bot.sendMessage(userId, `Зараженные емодзи - ${infectedEmojiArr.join(' ')}`)
        return
}