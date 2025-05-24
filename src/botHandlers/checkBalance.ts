import { Message } from "node-telegram-bot-api";
import { mongoClient } from "../db/mongo/mongoClient";
import { IUser } from "../interfaces/user.interface";
import { bot } from "../app";

export async function checkBalance(msg: Message) {
    const userId = msg.from?.id
    if (!userId) return

    const collection = mongoClient.db('casino').collection<IUser>('users')
    const user = await collection.findOne({id: userId}, {projection: {balance: 1}})

    if(!user) {
        bot.sendMessage(userId, 'У вас нет денег')
        return
    }
    const money = user.balance
    
    bot.sendMessage(userId, `${money}`)
}