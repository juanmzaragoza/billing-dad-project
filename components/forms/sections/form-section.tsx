"use client";

import { Separator } from "@/components/ui/separator";
import type { FormSectionProps } from "./sections.types";

/**
 * Reusable section wrapper for form sections
 * Provides consistent spacing and styling
 */
export function FormSection({
	title,
	description,
	children,
	showSeparator = true,
	className,
}: FormSectionProps) {
	return (
		<div className={`space-y-4 ${className || ""}`}>
			<div>
				<h3 className="text-lg font-semibold">{title}</h3>
				{description && (
					<p className="text-sm text-muted-foreground mt-1">{description}</p>
				)}
			</div>
			{children}
			{showSeparator && <Separator />}
		</div>
	);
}


