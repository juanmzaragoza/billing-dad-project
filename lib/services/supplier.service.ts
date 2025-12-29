import connectToDatabase from "@/lib/db/firestore";
import { Collection, Db, ObjectId } from "mongodb";
import type { SupplierDocument } from "@/lib/types/supplier.types";

class SupplierService {
	private getCollection(db: Db): Collection<SupplierDocument> {
		return db.collection<SupplierDocument>("suppliers");
	}

	/**
	 * Create a new supplier
	 */
	async createSupplier(
		data: Omit<SupplierDocument, "_id" | "createdAt" | "updatedAt">,
	): Promise<SupplierDocument> {
		const { db } = await connectToDatabase();
		const collection = this.getCollection(db);

		const documentWithDates: Omit<SupplierDocument, "_id"> = {
			...data,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const result = await collection.insertOne(
			documentWithDates as SupplierDocument,
		);

		return {
			_id: result.insertedId.toString(),
			...documentWithDates,
		};
	}

	/**
	 * Get all suppliers
	 */
	async getAllSuppliers(): Promise<SupplierDocument[]> {
		const { db } = await connectToDatabase();
		const collection = this.getCollection(db);

		const documents = await collection.find({}).sort({ name: 1 }).toArray();

		return documents.map((doc) => ({
			...doc,
			_id: doc._id.toString(),
		}));
	}

	/**
	 * Get a supplier by ID
	 */
	async getSupplierById(id: string): Promise<SupplierDocument | null> {
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
	 * Update a supplier
	 */
	async updateSupplier(
		id: string,
		data: Partial<Omit<SupplierDocument, "_id" | "createdAt">>,
	): Promise<SupplierDocument | null> {
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
	 * Delete a supplier
	 */
	async deleteSupplier(id: string): Promise<boolean> {
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
	 * Search suppliers by name or tax ID
	 */
	async searchSuppliers(query: string): Promise<SupplierDocument[]> {
		const { db } = await connectToDatabase();
		const collection = this.getCollection(db);

		const searchRegex = new RegExp(query, "i");

		const documents = await collection
			.find({
				$or: [{ name: searchRegex }, { taxId: searchRegex }],
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

const supplierService = new SupplierService();
export default supplierService;


