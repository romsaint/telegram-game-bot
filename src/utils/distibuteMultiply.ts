import { levels } from "../consts/levels.const"
import { redisClient } from "../db/redis/redisClient"

export async function distibuteMultiply(gameData: string, userId: number, level: string) {
    if (level === levels[0]) {
        if (gameData === '5') {
            await redisClient.set(`${userId}-game`, 7)
        }
        if (gameData === '3.7') {
            await redisClient.set(`${userId}-game`, 3)
        }
        if (gameData === '2.4') {
            await redisClient.set(`${userId}-game`, 2)
        }
        if (gameData === '1.8') {
            await redisClient.set(`${userId}-game`, 1.8)
        }
        if (gameData === '1.4') {
            await redisClient.set(`${userId}-game`, 1.4)
        }
        if (gameData === '1.2') {
            await redisClient.set(`${userId}-game`, 1.3)
        }
        if (gameData === '0') {
            await redisClient.set(`${userId}-game`, 1.2)
        }
    }
    if (level === levels[1]) {
        if (gameData === '6') {
            await redisClient.set(`${userId}-game`, 7)
        }
        if (gameData === '4') {
            await redisClient.set(`${userId}-game`, 3.5)
        }
        if (gameData === '2.5') {
            await redisClient.set(`${userId}-game`, 2.8)
        }
        if (gameData === '1.8') {
            await redisClient.set(`${userId}-game`, 2.1)
        }
        if (gameData === '0') {
            await redisClient.set(`${userId}-game`, 1.8)
        }
    }
    if (level === levels[2]) {
        if (gameData === '7') {
            await redisClient.set(`${userId}-game`, 7)
        }
        if (gameData === '3') {
            await redisClient.set(`${userId}-game`, 4)
        }
        if (gameData === '0') {
            await redisClient.set(`${userId}-game`, 2.9)
        }
    }
}