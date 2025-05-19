import { ConfigSerivce } from './config/config.service'
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { distributeByLevel } from './utils/distributeByLevel';
import { levels } from './consts/levels.const';

const config = new ConfigSerivce()
const token = config.get('TOKEN')

const bot = new TelegramBot(token, { polling: true })


bot.setMyCommands([
    { command: "start", description: "Play!" },
    { command: "deposit", description: "Money money money" },
])

bot.onText(/\/start/, async (msg: Message) => {
    const chatId = msg.from?.id

    // await mongoClient.connect()
    // const users = await mongoClient.db().collection('users')
    // users.findOne({$where: {'s': 1}})

    if (!chatId) {
        return
    }
    bot.sendMessage(chatId, 'Выбери уровень сложности', {
        reply_markup: {
            inline_keyboard: [[{ text: levels[0], callback_data: levels[0] }], [{ text: levels[1], callback_data: levels[1] }], [{ text: levels[2], callback_data: levels[2] }]]
        }
    })
})

bot.onText(/\/deposit/, (msg: Message) => {

})

bot.on('callback_query', query => {
    const data = query.data
    const chatId = query.from.id
    if (data?.includes('зараженных')) {
        const game = distributeByLevel(chatId, data)
        if (game) {
            bot.sendMessage(chatId, `Выбери одно эмодзи, но учти - есть ${game?.infected} зараженных!`, {
                reply_markup: {
                    inline_keyboard: game.inline_keyboard
                }
            })
        } else {
            bot.sendMessage(chatId, 'ERROR')
        }
    }
    if(data?.split('-')[2] === 'infected') {
        bot.sendMessage(chatId, 'Вы проиграли :(')
    }
    if(data?.split('-')[2] === 'healthy') {
        bot.sendMessage(chatId, 'Вы выиграли!! Вы можете продолжить играть')
    }
})