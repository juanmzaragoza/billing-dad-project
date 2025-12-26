import connectToDatabase from "@/lib/db/firestore";
import { Collection, Db, ObjectId } from "mongodb";
import type { ClientDocument } from "@/lib/types/client.types";

class ClientService {
	private getCollection(db: Db): Collection<ClientDocument> {
		return db.collection<ClientDocument>("clients");
	}

	/**
	 * Create a new client
	 */
	async createClient(data: Omit<ClientDocument, "_id" | "createdAt" | "updatedAt">): Promise<ClientDocument> {
		const { db } = await connectToDatabase();
		const collection = this.getCollection(db);

		const documentWithDates: Omit<ClientDocument, "_id"> = {
			...data,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const result = await collection.insertOne(documentWithDates as ClientDocument);

		return {
			_id: result.insertedId.toString(),
			...documentWithDates,
		};
	}

	/**
	 * Get all clients
	 */
	async getAllClients(): Promise<ClientDocument[]> {
		const { db } = await connectToDatabase();
		const collection = this.getCollection(db);

		const documents = await collection
			.find({})
			.sort({ name: 1 })
			.toArray();

		return documents.map((doc) => ({
			...doc,
			_id: doc._id.toString(),
		}));
	}

	/**
	 * Get a client by ID
	 */
	async getClientById(id: string): Promise<ClientDocument | null> {
		const { db } = await connectToDatabase();
		const collection = this.getCollection(db);

		let objectId: ObjectId;
		try {
			objectId = new ObjectId(id);
		} catch {
			return null;
		}

		const document = await collection.findOne({ _id: objectId });

		if (!document) {
			return null;
		}

		return {
			...document,
			_id: document._id.toString(),
		};
	}

	/**
	 * Update a client
	 */
	async updateClient(
		id: string,
		data: Partial<Omit<ClientDocument, "_id" | "createdAt">>,
	): Promise<ClientDocument | null> {
		const { db } = await connectToDatabase();
		const collection = this.getCollection(db);

		let objectId: ObjectId;
		try {
			objectId = new ObjectId(id);
		} catch {
			return null;
		}

		const updateData = {
			...data,
			updatedAt: new Date(),
		};

		const result = await collection.findOneAndUpdate(
			{ _id: objectId },
			{ $set: updateData },
			{ returnDocument: "after" },
		);

		if (!result) {
			return null;
		}

		return {
			...result,
			_id: result._id.toString(),
		};
	}

	/**
	 * Delete a client
	 */
	async deleteClient(id: string): Promise<boolean> {
		const { db } = await connectToDatabase();
		const collection = this.getCollection(db);

		let objectId: ObjectId;
		try {
			objectId = new ObjectId(id);
		} catch {
			return false;
		}

		const result = await collection.deleteOne({ _id: objectId });

		return result.deletedCount === 1;
	}

	/**
	 * Search clients by name or tax ID
	 */
	async searchClients(query: string): Promise<ClientDocument[]> {
		const { db } = await connectToDatabase();
		const collection = this.getCollection(db);

		const searchRegex = new RegExp(query, "i");

		const documents = await collection
			.find({
				$or: [
					{ name: searchRegex },
					{ taxId: searchRegex },
				],
			})
			.sort({ name: 1 })
			.limit(20)
			.toArray();

		return documents.map((doc) => ({
			...doc,
			_id: doc._id.toString(),
		}));
	}
}

const clientService = new ClientService();
export default clientService;

