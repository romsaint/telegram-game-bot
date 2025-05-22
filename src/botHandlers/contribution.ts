import { Message } from "node-telegram-bot-api";
import { IUser } from "../interfaces/user.interface";
import { mongoClient } from "../db/mongo/mongoClient";
import { bot } from "../app";
import { redisClient } from "../db/redis/redisClient";

export async function contribution(msg: Message) {
    const userId = msg.from?.id
    const data = msg.text
    if (!userId || !data) return

    const money = parseInt(data)
    const key = `${userId}-start`

    if (await redisClient.get(key) !== 'DEPOSIT_STATE') {
        return
    }

    const usersCollection = mongoClient.db('casino').collection<IUser>('users')
    const user: IUser | null = await usersCollection.findOne({ id: userId })

    if (!user) {
        bot.sendMessage(userId, 'Нажмите /start чтобы зарегистрироваться')
        return
    }
    
    await redisClient.del(key)
    await usersCollection.updateOne(
        { id: userId },
        { $inc: { balance: money } }
    );
}