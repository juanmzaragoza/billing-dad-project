"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { ReactNode } from "react";

/**
 * Props for ViewDialog component
 */
export interface ViewDialogProps {
	/**
	 * Title of the dialog
	 */
	title: string;
	/**
	 * Description/subtitle of the dialog
	 */
	description?: string;
	/**
	 * Content to display in the dialog
	 */
	children: ReactNode;
	/**
	 * Whether the dialog is open
	 */
	isOpen: boolean;
	/**
	 * Callback when dialog should close
	 */
	onClose: () => void;
	/**
	 * Optional: Custom max width class
	 */
	maxWidth?: string;
}

/**
 * Reusable dialog component for viewing record details
 * Can be used for invoices, purchase orders, clients, suppliers, etc.
 */
export function ViewDialog({
	title,
	description,
	children,
	isOpen,
	onClose,
	maxWidth = "max-w-6xl",
}: ViewDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className={`${maxWidth} max-h-[90vh] overflow-y-auto w-[95vw]`}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>
				<div className="mt-4">{children}</div>
			</DialogContent>
		</Dialog>
	);
}

