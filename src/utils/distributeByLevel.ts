import { levels } from "../consts/levels.const";
import { playEmoji } from "./playEmoji";

export function distributeByLevel(from: number, level: string, id: string) {
    try {
        if (level === levels[0]) {
            return playEmoji(from, 0, id)
        }
        if (level === levels[1]) {
            return playEmoji(from, 1, id)
        }
        if (level === levels[2]) {
            return playEmoji(from, 2, id)
        }
    } catch (e) {
        return null
    }
}