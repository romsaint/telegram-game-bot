import {IConfigService} from './config.interface'
import {DotenvParseOutput, config} from 'dotenv'

export class ConfigSerivce implements IConfigService {
    private config: DotenvParseOutput
    constructor() {
        const {error, parsed} = config()
        if(error) {
            throw new Error('File .env not found')
        }
        if(!parsed) {
            throw new Error('empty .env file')
        }
        this.config = parsed
    }
    get(key: string): string {
        const res = this.config[key]
        if(!res) {
            throw new Error('key empty')
        }
        return res
    }
}