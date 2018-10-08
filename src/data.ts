
import { MongoClient } from 'mongodb';
let client: MongoClient

export async function createDb(mongoConnectionString: string) {
    if (client) {
        throw new Error(`Client already exists!`);
    }
    client = await MongoClient.connect(mongoConnectionString);
    return client.db();
}

export function closeConnection() {
    return client.close();
}
