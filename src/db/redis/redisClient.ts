import Redis from "ioredis";
import { ConfigSerivce } from "../../config/config.service";

const config = new ConfigSerivce()

export const redisClient = new Redis({
    host: 'localhost',
    port: 6379
})