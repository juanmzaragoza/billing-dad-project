"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
	const router = useRouter();

	useEffect(() => {
		// Redirigir a Facturas como página principal
		router.replace("/dashboard/facturas");
	}, [router]);

	return null;
}
