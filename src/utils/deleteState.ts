import { redisClient } from "../db/redis/redisClient"

export async function deleteState(userId: number) {
    await redisClient.del(`${userId}-start`)
    await redisClient.del(`${userId}-game`)
    await redisClient.del(`${userId}-message`)
    await redisClient.del(`${userId}-money`)
    await redisClient.del(`${userId}-infected-emoji`)
    await redisClient.del(`${userId}-emoji-clicked`)
    await redisClient.del(`${userId}-game-end`)
    await redisClient.del(`${userId}`)
}