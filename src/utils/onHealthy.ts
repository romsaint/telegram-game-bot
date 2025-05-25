import { Collection } from "mongodb"
import { bot } from "../app"
import { redisClient } from "../db/redis/redisClient"
import { deleteState } from "./deleteState"
import { distibuteMultiply } from "./distibuteMultiply"
import { exitWin } from "./exitWin"
import { IUser } from "../interfaces/user.interface"

export async function onHealthy(userId: number, collection: Collection<IUser>, data: string) {
    const gameData = await redisClient.get(`${userId}-game`)
        const level = await redisClient.get(`${userId}-level-game`)
        const emoji = data?.split('-')[1]
        const clicked = await redisClient.get(`${userId}-emoji-clicked`)
        
        if (clicked && clicked.toString().includes(emoji)) {
            bot.sendMessage(userId, 'Вы уже нажимали на него')
            return
        }
        
        if (clicked) {
            await redisClient.set(`${userId}-emoji-clicked`, Buffer.from(`${emoji}${clicked}`))
        } else {
            await redisClient.set(`${userId}-emoji-clicked`, Buffer.from(`${emoji}`))
        }
        
        if (!gameData || !level) {
            bot.sendMessage(userId, 'ЧТО-ТО НЕ ТАК')
            return
        }
        
        await distibuteMultiply(gameData, userId, level)
        const balance = await redisClient.get(`${userId}-game`)
        const spendMoney = await redisClient.get(`${userId}-money`)
        const isEnd = await redisClient.get(`${userId}-game-end`)
        
        if (!balance || !spendMoney) {
            bot.sendMessage(userId, 'ОШИБКА')
            return
        }
        const win = Math.round(Number(balance) * Number(spendMoney))
        const poorWin = (Number(balance) * Number(spendMoney)) - Number(spendMoney)
        
        await collection.updateOne(
            { id: userId },
            {
                $inc: {
                    winSum: poorWin,
                    gameCount: 1
                }
            }
        )

        if (isEnd) {
            bot.sendMessage(userId, `Вы прошли игру!!`)
            await exitWin(userId, collection)
            await deleteState(userId)
        } else {
            bot.sendMessage(userId, `Вы выиграли!! ваш баланс - ${win} Вы можете продолжить играть либо выйти с выигрышем`, {
                reply_markup: {
                    inline_keyboard: [[{ text: 'Выйти', callback_data: "EXIT-WIN" }]]
                }
            })
        }
}