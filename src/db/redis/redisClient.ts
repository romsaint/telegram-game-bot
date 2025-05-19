import Redis from "ioredis";
import { ConfigSerivce } from "../../config/config.service";

const config = new ConfigSerivce()
const password = config.get('REDIS_PASSWORD')

export const reidsClient = new Redis({
    host: 'localhost',
    port: 6379,
    password
})