import { MongoClient, Db } from "mongodb";

/**
 * MongoDB connection interface
 */
export interface MongoConnection {
	client: MongoClient;
	db: Db;
}

