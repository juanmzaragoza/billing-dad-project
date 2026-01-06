"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, ShoppingCart, BarChart3, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
	totalInvoices: number;
	totalPurchaseOrders: number;
	activePurchaseOrders: number;
	monthlyRevenue: number;
	totalRevenue: number;
	totalExpenses: number;
	totalProfit: number;
}

export default function DashboardPage() {
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				setLoading(true);
				setError(null);
				
				const response = await fetch("/api/dashboard");
				
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				
				const result = await response.json();
				
				console.log("Dashboard API response:", result);

				if (result.success) {
					setStats(result.data);
					console.log("Dashboard stats loaded:", result.data);
				} else {
					const errorMsg = result.error || "Error al cargar las estadísticas";
					setError(errorMsg);
					console.error("Dashboard API error:", errorMsg);
				}
			} catch (err) {
				const errorMsg = err instanceof Error ? err.message : "Error al conectar con el servidor";
				setError(errorMsg);
				console.error("Error fetching dashboard stats:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, []);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("es-AR", {
			style: "currency",
			currency: "ARS",
		}).format(amount);
	};

	// Determinar el color de la ganancia
	const profitColor = stats && stats.totalProfit >= 0 
		? 'border-green-500 bg-green-500/10' 
		: 'border-red-500 bg-red-500/10';
	const profitTextColor = stats && stats.totalProfit >= 0
		? 'text-green-600 dark:text-green-400'
		: 'text-red-600 dark:text-red-400';

	// Debug info
	if (error) {
		console.error("Dashboard error state:", error);
	}
	if (stats) {
		console.log("Dashboard stats state:", stats);
	}

	return (
		<div className="space-y-8">
			{/* Header Section */}
			<div className="flex flex-col gap-2">
				<h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground text-lg">
					Vista general de tu negocio
				</p>
				{error && (
					<div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
						Error: {error}
					</div>
				)}
			</div>

			{/* Financial Overview - Main Metrics */}
			<div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
				<Card className="border-green-500/50 bg-green-500/5">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Ingresos Totales
						</CardTitle>
						<TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
					</CardHeader>
					<CardContent>
						{loading ? (
							<Skeleton className="h-8 w-32" />
						) : error ? (
							<div className="text-2xl font-bold text-destructive">Error</div>
						) : (
							<div className="text-3xl font-bold text-green-600 dark:text-green-400">
								{formatCurrency(stats?.totalRevenue ?? 0)}
							</div>
						)}
						<p className="text-xs text-muted-foreground mt-2">
							{loading ? (
								<Skeleton className="h-4 w-40" />
							) : error ? (
								<span className="text-destructive">No disponible</span>
							) : (
								<>Ingresos del mes: {formatCurrency(stats?.monthlyRevenue ?? 0)}</>
							)}
						</p>
					</CardContent>
				</Card>

				<Card className="border-red-500/50 bg-red-500/5">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Egresos Totales
						</CardTitle>
						<TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
					</CardHeader>
					<CardContent>
						{loading ? (
							<Skeleton className="h-8 w-32" />
						) : error ? (
							<div className="text-2xl font-bold text-destructive">Error</div>
						) : (
							<div className="text-3xl font-bold text-red-600 dark:text-red-400">
								{formatCurrency(stats?.totalExpenses ?? 0)}
							</div>
						)}
						<p className="text-xs text-muted-foreground mt-2">
							Total de órdenes de compra (excluyendo canceladas)
						</p>
					</CardContent>
				</Card>

				<Card className={`border-2 ${loading ? 'border-muted' : profitColor}`}>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Ganancia Total
						</CardTitle>
						<DollarSign className={`h-5 w-5 ${loading ? 'text-muted-foreground' : profitTextColor}`} />
					</CardHeader>
					<CardContent>
						{loading ? (
							<Skeleton className="h-8 w-32" />
						) : error ? (
							<div className="text-2xl font-bold text-destructive">Error</div>
						) : (
							<div className={`text-3xl font-bold ${profitTextColor}`}>
								{formatCurrency(stats?.totalProfit ?? 0)}
							</div>
						)}
						<p className="text-xs text-muted-foreground mt-2">
							Ingresos - Egresos
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Additional Stats Cards */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Facturas
						</CardTitle>
						<Receipt className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{loading ? (
							<Skeleton className="h-8 w-20" />
						) : error ? (
							<div className="text-2xl font-bold text-destructive">Error</div>
						) : (
							<div className="text-2xl font-bold">
								{stats?.totalInvoices ?? 0}
							</div>
						)}
						<p className="text-xs text-muted-foreground">
							Facturas registradas
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Órdenes de Compra
						</CardTitle>
						<ShoppingCart className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{loading ? (
							<Skeleton className="h-8 w-20" />
						) : error ? (
							<div className="text-2xl font-bold text-destructive">Error</div>
						) : (
							<>
								<div className="text-2xl font-bold">
									{stats?.activePurchaseOrders ?? 0}
								</div>
								<p className="text-xs text-muted-foreground">
									Órdenes activas de {stats?.totalPurchaseOrders ?? 0} totales
								</p>
							</>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Ingresos del Mes
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{loading ? (
							<Skeleton className="h-8 w-32" />
						) : error ? (
							<div className="text-2xl font-bold text-destructive">Error</div>
						) : (
							<div className="text-2xl font-bold">
								{formatCurrency(stats?.monthlyRevenue ?? 0)}
							</div>
						)}
						<p className="text-xs text-muted-foreground">
							Total facturado este mes
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Reportes
						</CardTitle>
						<BarChart3 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">
							Reportes disponibles
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card className="hover:shadow-lg transition-shadow cursor-pointer">
					<Link href="/facturas">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Receipt className="h-5 w-5" />
								Facturas
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-4">
								Gestiona tus facturas, crea nuevas y visualiza el historial
							</p>
							<Button variant="outline" className="w-full">
								Ver Facturas
							</Button>
						</CardContent>
					</Link>
				</Card>

				<Card className="hover:shadow-lg transition-shadow cursor-pointer">
					<Link href="/ordenes-compra">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<ShoppingCart className="h-5 w-5" />
								Órdenes de Compra
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-4">
								Administra tus órdenes de compra y proveedores
							</p>
							<Button variant="outline" className="w-full">
								Ver Órdenes
							</Button>
						</CardContent>
					</Link>
				</Card>

				<Card className="hover:shadow-lg transition-shadow cursor-pointer">
					<Link href="/reportes">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BarChart3 className="h-5 w-5" />
								Reportes
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-4">
								Visualiza y analiza tus datos financieros
							</p>
							<Button variant="outline" className="w-full">
								Ver Reportes
							</Button>
						</CardContent>
					</Link>
				</Card>
			</div>
		</div>
	);
}
