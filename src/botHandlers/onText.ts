import { Message } from "node-telegram-bot-api"
import { bot } from "../app"
import { levels } from "../consts/levels.const"
import { redisClient } from "../db/redis/redisClient"
import { mongoClient } from "../db/mongo/mongoClient"
import { IUser } from "../interfaces/user.interface"
import { noTextArr } from "../consts/noTextArr"
import { deleteState } from "../utils/deleteState"
import { ConfigSerivce } from "../config/config.service"


export async function onText(msg: Message) {
    const userId = msg.from?.id
    if (!userId) return

    try {
        const data = msg.text
        const key = `${userId}`

        if (!userId || !data) {
            return
        }
        if (noTextArr.includes(data)) {
            return
        }
        const money = Number(data)
        const dataRedis = await redisClient.get(key)

        if (!dataRedis) {
            return
        }

        const usersCollection = mongoClient.db('casino').collection<IUser>('users')
        const user: IUser | null = await usersCollection.findOne({ id: userId })

        if (user) {
            if (dataRedis === 'MONEY_STATE') {
                if (isNaN(user.balance) || isNaN(money) || user.balance < money) {
                    bot.sendMessage(userId, 'Недостаточно средств')
                    await deleteState(userId)
                    return
                }
                if (money < 10) {
                    bot.sendMessage(userId, 'Минимум 10 рублей')
                    return
                }
                await redisClient.set(`${key}-money`, money)

                const collection = mongoClient.db('casino').collection<IUser>('users')
                await collection.updateOne({ id: userId }, { $inc: { balance: -money } })

                bot.sendMessage(userId, 'Выберите уровень сложности', {
                    reply_markup: {
                        inline_keyboard: [[{ text: levels[0], callback_data: levels[0] }], [{ text: levels[1], callback_data: levels[1] }], [{ text: levels[2], callback_data: levels[2] }]]
                    }
                })
                return
            }
            if (dataRedis === 'DEPOSIT_STATE') {
                if (isNaN(money) || money < 10) {
                    bot.sendMessage(userId, 'Минимум 10 рублей')
                    return
                }

                const payload = `deposit_${userId}_${Date.now()}`;
                const config = new ConfigSerivce()
                const providerToken = config.get('PAYMENT_TOKEN')
                if(!providerToken) {
                    return
                }

                await bot.sendInvoice(userId, 'Счет', 'Пополнение баланса', payload, providerToken, 'rub', [{amount: money * 100, label: 'Рублей'}])

                return
            }
        } else {
            bot.sendMessage(userId, 'Нажмите /start чтобы зарегистрироваться')
        }
    } catch (e) {
        console.log(e)
        bot.sendMessage(userId, 'Ошибка')
    }
}