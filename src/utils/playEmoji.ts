import { exhaustiveUniqueRandom } from 'unique-random'
import { levels, reallyLevels } from '../consts/levels.const'
const random = exhaustiveUniqueRandom(0, 9)
const random2 = exhaustiveUniqueRandom(0, 9)

export function playEmoji(userId: number, level: number): { inline_keyboard: any[], infected: number } | null {
    try {
        const emoji = ['😀', '🤮', '🤑', '💀', '💯', '🥳', '🤙', '🥴', '😉', '😭']
        const randomIdx = [random(), random(), random(), random(), random(), random(), random(), random(), random(), random()]
        const randomEmoji = []
        const infected = []
        const inline_keyboard: any[] = []

        for (let i = 0; i < reallyLevels[level]; i++) {
            infected.push(random2())
        }

        for (const i of randomIdx) {
            randomEmoji.push(emoji[i])
        }

        for (let i = 0; i < randomEmoji.length; i++) {
            const emoji = randomEmoji[i]
            if (infected.includes(i)) {
                console.log(emoji)
                inline_keyboard.push([{ text: emoji, callback_data: `${userId}-${emoji}-infected` }])
            } else {
                inline_keyboard.push([{ text: emoji, callback_data: `${userId}-${emoji}-healthy` }])
            }
        }

        return { inline_keyboard, infected: infected.length }
    } catch (e) {
        return null
    }
}