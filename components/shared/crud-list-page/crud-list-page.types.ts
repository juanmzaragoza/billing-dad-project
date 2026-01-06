import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Column definition for the table
 */
export interface CrudListColumn<T> {
	key: string;
	header: string;
	render: (item: T) => ReactNode;
	className?: string;
}

/**
 * Props for CrudListPage component
 */
export interface CrudListPageProps<T, TFormValues> {
	/**
	 * Title of the page
	 */
	title: string;
	/**
	 * Description/subtitle of the page
	 */
	description: string;
	/**
	 * Icon to display in header and empty state
	 */
	icon: LucideIcon;
	/**
	 * Label for the "new" button
	 */
	newButtonLabel: string;
	/**
	 * Label for the create dialog title
	 */
	createDialogTitle: string;
	/**
	 * Label for the create dialog description
	 */
	createDialogDescription: string;
	/**
	 * Function to fetch all items
	 */
	fetchItems: () => Promise<T[]>;
	/**
	 * Function to create a new item
	 */
	onCreate: (data: TFormValues) => Promise<T>;
	/**
	 * Function to delete an item
	 */
	onDelete: (item: T) => Promise<void>;
	/**
	 * Function to get the ID of an item
	 */
	getItemId: (item: T) => string | undefined;
	/**
	 * Function to get the display name for success messages
	 */
	getDisplayName: (item: T) => string;
	/**
	 * Table column definitions
	 */
	columns: CrudListColumn<T>[];
	/**
	 * Form component to render in the create dialog
	 */
	formComponent: (props: {
		onSubmit: (data: TFormValues) => void;
		onCancel: () => void;
	}) => ReactNode;
	/**
	 * Optional: Custom empty state message
	 */
	emptyStateMessage?: string;
	/**
	 * Optional: Custom empty state helper text
	 */
	emptyStateHelperText?: string;
	/**
	 * Optional: Additional actions column render function
	 * Receives the item, a delete handler function, and a view handler function
	 */
	renderActions?: (item: T, onDelete: () => void, onView?: () => void) => ReactNode;
	/**
	 * Optional: Delete confirmation message
	 */
	deleteConfirmationMessage?: (item: T) => string;
	/**
	 * Optional: View component to render in the view dialog
	 * Receives the item to display
	 */
	viewComponent?: (props: { item: T }) => ReactNode;
	/**
	 * Optional: Function to get the view dialog title
	 */
	getViewTitle?: (item: T) => string;
	/**
	 * Optional: Function to get the view dialog description
	 */
	getViewDescription?: (item: T) => string;
	/**
	 * Optional: Callback for print action in view dialog
	 */
	onPrint?: (item: T) => void;
}

