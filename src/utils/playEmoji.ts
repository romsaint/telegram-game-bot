import { exhaustiveUniqueRandom } from 'unique-random'
import { levels, reallyLevels } from '../consts/levels.const'
const random = exhaustiveUniqueRandom(0, 9)
const random2 = exhaustiveUniqueRandom(0, 9)

export function playEmoji(userId: number, level: number, id: string): { inline_keyboard: any[], infected: number, infectedEmoji: any[] } | null {
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

        const infectedEmoji = []

        for (let i = 0; i < randomEmoji.length; i++) {
            const emoji = randomEmoji[i]
            if (infected.includes(i)) {
                infectedEmoji.push(emoji)
                inline_keyboard.push([{ text: emoji, callback_data: `${userId}-${emoji}-infected-${id}` }])
            } else {
                inline_keyboard.push([{ text: emoji, callback_data: `${userId}-${emoji}-healthy-${id}` }])
            }
        }

        return { inline_keyboard, infected: infected.length, infectedEmoji}
    } catch (e) {
        return null
    }
}