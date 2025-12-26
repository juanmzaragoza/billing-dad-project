import { MongoClient } from "mongodb";
import type { MongoConnection } from "@/lib/types/db.types";

if (!process.env.MONGODB_URI) {
	throw new Error(
		"Please define the MONGODB_URI environment variable inside .env.local",
	);
}

const uri: string = process.env.MONGODB_URI;
const dbName: string = process.env.DB_NAME || "billind-dad";

declare global {
	var mongo: {
		conn: MongoConnection | null;
		promise: Promise<MongoConnection> | null;
	} | undefined;
}

let cached = global.mongo;

if (!cached) {
	cached = global.mongo = { conn: null, promise: null };
}

async function connectToDatabase(): Promise<MongoConnection> {
	if (cached!.conn) {
		return cached!.conn;
	}

	if (!cached!.promise) {
		const opts = {
			maxPoolSize: 10,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
		};

		cached!.promise = MongoClient.connect(uri, opts).then((client) => {
			return {
				client,
				db: client.db(dbName),
			};
		});
	}

	try {
		cached!.conn = await cached!.promise;
	} catch (e) {
		cached!.promise = null;
		throw e;
	}

	return cached!.conn;
}

export default connectToDatabase;

