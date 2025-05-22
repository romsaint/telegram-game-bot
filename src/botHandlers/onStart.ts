import { Message } from "node-telegram-bot-api"
import { redisClient } from "../db/redis/redisClient"
import { bot } from "../app"
import { mongoClient } from "../db/mongo/mongoClient"
import { IUser } from "../interfaces/user.interface"

export async function onStart(msg: Message) {
    const userId = msg.from?.id
    if (!userId) return

    try {
        const user: IUser = {
            balance: 0,
            gameCount: 0,
            id: userId,
            loseSum: 0,
            username: msg.from?.username || 'UNKNOWN SLAYER',
            winSum: 0
        }

        const usersCollection = mongoClient.db('casino').collection<IUser>('users')
        const isUserExists = await usersCollection.findOne({ id: userId })

        if (!isUserExists) {
            await usersCollection.insertOne(user)
        }

        const key = `${userId}`

        if (await redisClient.get(key)) {
            bot.sendMessage(userId, 'Вы уже играете', {
                reply_markup: {
                    inline_keyboard: [[{ text: 'Выйти', callback_data: 'EXIT' }]]
                }
            })
            return
        } else {
            await redisClient.setex(key, 3600 * 12, 'MONEY_STATE')
            bot.sendMessage(userId, 'Введите сумму игры (минимум 10)', {
                reply_markup: {
                    inline_keyboard: [[{ text: 'Выйти', callback_data: 'EXIT' }]]
                }
            })

            return
        }
    } catch (e) {
        bot.sendMessage(userId, 'Ошибка')
    }
}