import { ConfigSerivce } from './config/config.service'
import TelegramBot from 'node-telegram-bot-api';
import { onStart } from './botHandlers/onStart';
import { onText } from './botHandlers/onText';
import { onQuery } from './botHandlers/onQuery';
import { onDeposit } from './botHandlers/onDeposit';
import { mongoClient } from './db/mongo/mongoClient';

const config = new ConfigSerivce()
const token = config.get('TOKEN')

export const bot = new TelegramBot(token, { polling: true })

async function connectMongo() {
    await mongoClient.connect()
}
connectMongo()

bot.setMyCommands([
    { command: "start", description: "Play!" },
    { command: "deposit", description: "Money money money" },
])

bot.onText(/\/start/, onStart)

bot.onText(/\/deposit/, onDeposit)
bot.on('text', onText)
bot.on('callback_query', onQuery)