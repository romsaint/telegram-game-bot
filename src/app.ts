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
import { preCheckoutQuery } from './botHandlers/preCheckoutQuery';
import { successfulPayment } from './botHandlers/successfulPayment';

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
bot.on('pre_checkout_query', preCheckoutQuery);

// Обработка успешного платежа
bot.on('successful_payment', successfulPayment);
