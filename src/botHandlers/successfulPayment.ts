import { Message } from "node-telegram-bot-api";
import { mongoClient } from "../db/mongo/mongoClient";
import { IUser } from "../interfaces/user.interface";
import { redisClient } from "../db/redis/redisClient";
import { bot } from "../app";

export async function successfulPayment(msg: Message) {
    const userId = msg.from?.id;
    if (!userId) return
    try {
        if (msg.successful_payment) {
            const amount = msg.successful_payment.total_amount / 100; // сумма в рублях

            const usersCollection = mongoClient.db('casino').collection<IUser>('users')

            await usersCollection.updateOne(
                { id: userId },
                { $inc: { balance: amount } }
            );
            const user = await usersCollection.findOne({ id: userId }, { projection: { balance: 1 } })
            if (!user) {
                return
            }
            const balance = user.balance
            await redisClient.del(`${userId}`)

            bot.sendMessage(userId, `Платеж успешно зачислен! Ваш баланс - ${balance}`);
        }
    } catch (e) {
        bot.sendMessage(userId, 'ОШИБКА')
    }
}