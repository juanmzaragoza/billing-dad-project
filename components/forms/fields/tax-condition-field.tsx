"use client";

import {
	FormControl,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { TaxCondition } from "@/lib/schemas/fiscal.schemas";
import type { TaxConditionFieldProps } from "./fields.types";

const DEFAULT_CONDITIONS: TaxCondition[] = [
	"Responsable Inscripto",
	"Consumidor Final",
	"Exento",
	"Monotributo",
];

/**
 * Reusable field for Tax Condition (Condición frente al IVA) - Argentina
 * Can be used in client, supplier, and invoice forms
 */
export function TaxConditionField({
	field,
	className,
	placeholder = "Selecciona la condición",
	required = false,
	conditions = DEFAULT_CONDITIONS,
}: TaxConditionFieldProps) {
	return (
		<FormItem className="min-h-[80px] flex flex-col">
			<FormLabel>
				Condición frente al IVA {!required && "(Opcional)"}
			</FormLabel>
			<Select onValueChange={field.onChange} value={field.value}>
				<FormControl>
					<SelectTrigger className={className}>
						<SelectValue placeholder={placeholder} />
					</SelectTrigger>
				</FormControl>
				<SelectContent>
					{conditions.map((condition) => (
						<SelectItem key={condition} value={condition}>
							{condition}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<FormMessage className="text-xs mt-1 min-h-[16px]" />
		</FormItem>
	);
}


