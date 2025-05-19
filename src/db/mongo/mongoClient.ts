import { MongoClient } from "mongodb";
import { ConfigSerivce } from "../../config/config.service";


const config = new ConfigSerivce()
const password = config.get('MONGO_PASSWORD')


const uri = `mongodb+srv://snm20061977:${password}@cluster52.qbvbgdt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster52`

export const mongoClient = new MongoClient(uri, {
    appName: 'Cluster52'
});