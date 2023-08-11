import { Client, Account, Databases, Storage } from "appwrite";

const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('64d5a63d5becd67ba789');


export const account = new Account(client);

export const db = new Databases(client);

export const storage = new Storage(client);