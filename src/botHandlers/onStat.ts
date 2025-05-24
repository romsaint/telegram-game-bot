import { Message } from "node-telegram-bot-api";
import { mongoClient } from "../db/mongo/mongoClient";
import { IUser } from "../interfaces/user.interface";
import { bot } from "../app";

export async function onStat(msg: Message) {
    const userId = msg.from?.id
    if (!userId) return

    const collection = mongoClient.db('casino').collection<IUser>('users')
    const user: IUser | null = await collection.findOne({id: userId})

    if(!user) {
        bot.sendMessage(userId, 'Нажмите /start чтобы зарегистрироваться')
        return
    }
    
    const data = `Количество игр - ${user.gameCount}. Чистая сумма выигрыша - ${user.winSum}. Сумма проигрыша - ${user.loseSum}. Текущая сумма - ${user.balance}`
    
    bot.sendMessage(userId, data)
}