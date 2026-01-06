import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/firestore";

export async function GET() {
	try {
		const { db } = await connectToDatabase();
		
		// Calculate current month dates
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth();
		
		// Format dates as YYYY-MM-DD strings without timezone dependency
		const formatDate = (date: Date): string => {
			const y = date.getFullYear();
			const m = String(date.getMonth() + 1).padStart(2, '0');
			const d = String(date.getDate()).padStart(2, '0');
			return `${y}-${m}-${d}`;
		};
		
		const firstDayOfMonth = new Date(year, month, 1);
		const lastDayOfMonth = new Date(year, month + 1, 0);
		const startDate = formatDate(firstDayOfMonth);
		const endDate = formatDate(lastDayOfMonth);
		
		// Execute all queries in parallel using MongoDB aggregations
		// This is much more efficient than fetching all documents
		
		const [
			invoiceStats,
			monthlyRevenueResult,
			purchaseOrderStats,
			totalPurchaseOrders,
			activePurchaseOrders,
		] = await Promise.all([
			// 1. Invoice statistics: total invoices and total revenue sum
			db.collection("invoices").aggregate([
				{
					$group: {
						_id: null,
						totalInvoices: { $sum: 1 },
						totalRevenue: { $sum: { $ifNull: ["$total", 0] } },
					},
				},
			]).toArray(),
			
			// 2. Current month revenue: sum of invoices from current month only
			db.collection("invoices").aggregate([
				{
					$match: {
						date: {
							$gte: startDate,
							$lte: endDate,
						},
					},
				},
				{
					$group: {
						_id: null,
						monthlyRevenue: { $sum: { $ifNull: ["$total", 0] } },
					},
				},
			]).toArray(),
			
			// 3. Purchase order statistics: sum of expenses (excluding cancelled)
			db.collection("purchaseOrders").aggregate([
				{
					$match: {
						status: { $ne: "Cancelada" },
					},
				},
				{
					$group: {
						_id: null,
						totalExpenses: { $sum: { $ifNull: ["$total", 0] } },
					},
				},
			]).toArray(),
			
			// 4. Total purchase orders (count all, including cancelled)
			db.collection("purchaseOrders").countDocuments(),
			
			// 5. Active orders (not completed or cancelled)
			db.collection("purchaseOrders").countDocuments({
				status: { $nin: ["Completada", "Cancelada"] },
			}),
		]);
		
		// Extract results from aggregations
		const invoiceStatsResult = invoiceStats[0] || { totalInvoices: 0, totalRevenue: 0 };
		const monthlyRevenueResultData = monthlyRevenueResult[0] || { monthlyRevenue: 0 };
		const purchaseOrderStatsResult = purchaseOrderStats[0] || { totalExpenses: 0 };
		
		const totalRevenue = invoiceStatsResult.totalRevenue || 0;
		const monthlyRevenue = monthlyRevenueResultData.monthlyRevenue || 0;
		const totalExpenses = purchaseOrderStatsResult.totalExpenses || 0;
		const totalProfit = totalRevenue - totalExpenses;
		
		return NextResponse.json(
			{
				success: true,
				data: {
					totalInvoices: invoiceStatsResult.totalInvoices || 0,
					totalPurchaseOrders: totalPurchaseOrders || 0,
					activePurchaseOrders: activePurchaseOrders || 0,
					monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
					totalRevenue: Math.round(totalRevenue * 100) / 100,
					totalExpenses: Math.round(totalExpenses * 100) / 100,
					totalProfit: Math.round(totalProfit * 100) / 100,
				},
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error fetching dashboard stats:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Error fetching dashboard statistics",
			},
			{ status: 500 },
		);
	}
}

