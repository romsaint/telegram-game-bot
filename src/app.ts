import { ConfigSerivce } from './config/config.service'
import TelegramBot from 'node-telegram-bot-api';
import { onStart } from './botHandlers/onStart';
import { onText } from './botHandlers/onText';
import { onQuery } from './botHandlers/onQuery';
import { onDeposit } from './botHandlers/onDeposit';
import { mongoClient } from './db/mongo/mongoClient';
import { checkBalance } from './botHandlers/checkBalance';
import { IUser } from './interfaces/user.interface';
import { redisClient } from './db/redis/redisClient';
import { onStat } from './botHandlers/onStat';
import { onWithdrawal } from './botHandlers/onWithdrawal';

const config = new ConfigSerivce()
const token = config.get('TOKEN')

export const bot = new TelegramBot(token, { polling: true })

async function connectMongo() {
  await mongoClient.connect()
}
connectMongo()

bot.setMyCommands([
  { command: "start", description: "Играть!" },
  { command: "deposit", description: "Пополнить баланс" },
  { command: "balance", description: "Посмотреть баланс" },
  { command: "stat", description: "Посмотреть статистику игр" },
  { command: "withdrawal", description: "Вывод средств" },
])

bot.onText(/\/start/, onStart)
bot.onText(/\/deposit/, onDeposit)
bot.onText(/\/balance/, checkBalance)
bot.onText(/\/stat/, onStat)
bot.onText(/\/withdrawal/, onWithdrawal)

bot.on('text', onText)
bot.on('callback_query', onQuery)

// Обработка pre_checkout_query (подтверждение оплаты)
bot.on('pre_checkout_query', (query) => {
  bot.answerPreCheckoutQuery(query.id, true);
});

// Обработка успешного платежа
bot.on('successful_payment', async (msg) => {
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
});
