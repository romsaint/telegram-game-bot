import { Message } from "node-telegram-bot-api"
import { redisClient } from "../db/redis/redisClient"
import { bot } from "../app"
import { mongoClient } from "../db/mongo/mongoClient"
import { IUser } from "../interfaces/user.interface"
import { deleteState } from "../utils/deleteState"


export async function onStart(msg: Message) {
    const userId = msg.from?.id
    if (!userId) return
    const users = await redisClient.get('users')

    if (users) {
        if (!users.includes(`${userId}`)) {
            await redisClient.set('users', `${users};${userId}`)
        }
    } else {
        await redisClient.set('users', `${userId}`)
    }

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
        // await deleteState(userId)
        // await usersCollection.deleteOne({id: userId})
        // return
        if (!isUserExists) {
            await usersCollection.insertOne(user)
        }

        const key = `${userId}`

        if (await redisClient.get(key)) {
            bot.sendMessage(userId, 'Вы уже играете', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Выйти', callback_data: 'EXIT' }],
                        [{ text: 'Пополнить баланс', callback_data: 'DEPOSIT' }]
                    ]
                }
            })
            return
        } else {
            await redisClient.setex(key, 3600 * 12, 'MONEY_STATE')
            bot.sendMessage(userId, 'Введите сумму игры (минимум 10)', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Выйти', callback_data: 'EXIT' }],
                        [{ text: 'Пополнить баланс', callback_data: 'DEPOSIT' }]
                    ]
                }
            })

            return
        }
    } catch (e) {
        console.log(e)
        bot.sendMessage(userId, 'Ошибка')
    }
}