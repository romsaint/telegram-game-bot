import { v4 } from "uuid"
import { distributeByLevel } from "../utils/distributeByLevel"
import { bot } from "../app"
import { redisClient } from "../db/redis/redisClient"
import { CallbackQuery } from "node-telegram-bot-api"
import { deleteState } from "../utils/deleteState"
import { distibuteMultiply } from "../utils/distibuteMultiply"
import { mongoClient } from "../db/mongo/mongoClient"
import { IUser } from "../interfaces/user.interface"
import { deposit } from "../utils/deposit"

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

    if (data?.split('-')[2] === 'infected' || data?.split('-')[2] === 'healthy') {
        const idFromRedis = await redisClient.get(`${userId}-message`)

        if (data?.split('-')[3] !== idFromRedis) {
            bot.sendMessage(userId, 'Это старая игра')
            return
        }

    }
    if (data?.split('-')[2] === 'infected') {
        const spendMoney = await redisClient.get(`${userId}-money`)
        const emoji = await redisClient.get(`${userId}-infected-emoji`) as Buffer | null

        if(!emoji) {
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
    if (data?.split('-')[2] === 'healthy') {
        const gameData = await redisClient.get(`${userId}-game`)
        const level = await redisClient.get(`${userId}-level-game`)
        const emoji = data?.split('-')[1]
        const clicked = await redisClient.get(`${userId}-emoji-clicked`)
   
        if(clicked && clicked.toString().includes(emoji)) {
             bot.sendMessage(userId, 'Вы уже нажимали на него')
            return
        }

        if(clicked) {
            await redisClient.set(`${userId}-emoji-clicked`, Buffer.from(`${emoji}${clicked}`))
        }else{
            await redisClient.set(`${userId}-emoji-clicked`, Buffer.from(`${emoji}`))
        }
        
        if (!gameData || !level) {
            bot.sendMessage(userId, 'ЧТО-ТО НЕ ТАК')
            return
        }

        await distibuteMultiply(gameData, userId, level)
        const balance = await redisClient.get(`${userId}-game`)
        const spendMoney = await redisClient.get(`${userId}-money`)
   
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
      
        bot.sendMessage(userId, `Вы выиграли!! ваш баланс - ${win} Вы можете продолжить играть либо выйти с выигрышем`, {
            reply_markup: {
                inline_keyboard: [[{ text: 'Выйти', callback_data: "EXIT-WIN" }]]
            }
        })
        return
    }
}