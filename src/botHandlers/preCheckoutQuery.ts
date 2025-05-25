import { PreCheckoutQuery } from "node-telegram-bot-api";
import { bot } from "../app";

export async function preCheckoutQuery(query: PreCheckoutQuery) {
    bot.answerPreCheckoutQuery(query.id, true);
}