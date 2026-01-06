"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
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
	/**
	 * Optional: Callback for print action
	 */
	onPrint?: () => void;
	/**
	 * Optional: Show action buttons
	 */
	showActions?: boolean;
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
	onPrint,
	showActions = true,
}: ViewDialogProps) {
	const handlePrint = () => {
		if (onPrint) {
			onPrint();
		} else {
			// Default print behavior
			window.print();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className={`${maxWidth} max-h-[90vh] overflow-y-auto w-[95vw]`}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>
				<div className="mt-4">{children}</div>
				{showActions && onPrint && (
					<DialogFooter>
						<Button variant="outline" onClick={handlePrint}>
							<Printer className="mr-2 h-4 w-4" />
							Imprimir
						</Button>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}

