"use client";

import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { TaxIdField } from "../fields/tax-id-field";
import { TaxConditionField } from "../fields/tax-condition-field";
import { AddressField } from "../fields/address-field";
import { FormSection } from "./form-section";
import type { FiscalInfoSectionProps } from "./sections.types";

/**
 * Reusable section for fiscal information (Tax ID, Tax Condition, Address)
 * Can be used in client, supplier, and invoice forms
 */
export function FiscalInfoSection({
	fieldPrefix,
	required = false,
	showFiscalFields = true,
	showAddress = true,
	title = "Información Fiscal",
	gridCols = "grid-cols-1 sm:grid-cols-2",
	showSeparator = true,
}: FiscalInfoSectionProps) {
	const form = useFormContext();

	return (
		<FormSection title={title} showSeparator={showSeparator}>
			<div className={`grid gap-4 ${gridCols}`}>
				{showFiscalFields && (
					<FormField
						control={form.control}
						name={`${fieldPrefix}TaxId`}
						render={({ field }) => (
							<TaxIdField
								field={field}
								required={required}
								maxLength={required ? 11 : undefined}
							/>
						)}
					/>
				)}

				{showFiscalFields && (
					<FormField
						control={form.control}
						name={`${fieldPrefix}TaxCondition`}
						render={({ field }) => (
							<TaxConditionField field={field} required={required} />
						)}
					/>
				)}

				{showAddress && (
					<FormField
						control={form.control}
						name={`${fieldPrefix}Address`}
						render={({ field }) => (
							<AddressField
								field={field}
								required={required}
								className={
									!showFiscalFields ? "sm:col-span-2" : undefined
								}
							/>
						)}
					/>
				)}
			</div>
		</FormSection>
	);
}

