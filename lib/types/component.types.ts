import type * as React from "react";
import type { ReactNode } from "react";
import type { ClientDocument } from "./client.types";
import type { InvoiceFormValues } from "@/app/(protected)/facturas/invoice-form";
import type { PurchaseOrderFormValues } from "@/lib/schemas/purchase-order.schemas";

/**
 * Client Selector component props
 */
export interface ClientSelectorProps {
	value?: string; // clientId
	onSelect: (client: ClientDocument | null) => void;
	onInputChange?: (value: string) => void; // Called when user types manually
	onCreateNew?: () => void;
	className?: string;
	placeholder?: string;
	// Function to check if there's enough data to create a client
	hasEnoughDataToCreate?: () => boolean;
}

/**
 * Invoice Form component props
 */
export interface InvoiceFormProps {
	onSubmit: (data: InvoiceFormValues) => void;
	onCancel: () => void;
	defaultValues?: Partial<InvoiceFormValues>;
}

/**
 * Purchase Order Form component props
 */
export interface PurchaseOrderFormProps {
	onSubmit: (data: PurchaseOrderFormValues) => void;
	onCancel: () => void;
	defaultValues?: Partial<PurchaseOrderFormValues>;
}

/**
 * Sidebar component props
 */
export interface SidebarProps {
	onMobileClose?: () => void;
}

/**
 * Theme Provider component props
 */
export interface ThemeProviderProps {
	children: React.ReactNode;
	[key: string]: unknown;
}

/**
 * Error Page component props
 */
export interface ErrorPageProps {
	title?: string;
	description?: string;
	errorCode?: string;
	actions?: ReactNode;
}

/**
 * Settings Sidebar Nav component props
 */
export interface SettingsSidebarNavProps extends React.HTMLAttributes<HTMLElement> {
	items: {
		href: string;
		title: string;
	}[];
}

/**
 * Settings Layout component props
 */
export interface SettingsLayoutProps {
	children: React.ReactNode;
}

