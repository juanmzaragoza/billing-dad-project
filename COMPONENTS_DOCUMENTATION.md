# Documentación de Componentes Reutilizables

Este documento describe todos los componentes reutilizables, hooks y schemas disponibles en el proyecto, con ejemplos de uso.

## Tabla de Contenidos

1. [Componentes de Formulario](#componentes-de-formulario)
2. [Hooks Personalizados](#hooks-personalizados)
3. [Schemas de Validación](#schemas-de-validación)
4. [Componentes de Dominio](#componentes-de-dominio)
5. [Componentes Compartidos](#componentes-compartidos)
6. [Ejemplos de Uso](#ejemplos-de-uso)

---

## Componentes de Formulario

### Campos Individuales (`components/forms/fields/`)

#### `TaxIdField`
Campo para CUIT/CUIL/DNI con validación.

**Props:**
```typescript
interface TaxIdFieldProps {
  field: ControllerRenderProps<FieldValues, string>;
  className?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
}
```

**Ejemplo:**
```tsx
<FormField
  control={form.control}
  name="clientTaxId"
  render={({ field }) => (
    <TaxIdField
      field={field}
      required={!isUnbilled}
      maxLength={11}
      placeholder="20123456789"
    />
  )}
/>
```

#### `TaxConditionField`
Selector de condición frente al IVA.

**Props:**
```typescript
interface TaxConditionFieldProps {
  field: ControllerRenderProps<FieldValues, string>;
  className?: string;
  placeholder?: string;
  required?: boolean;
  conditions?: TaxCondition[];
}
```

**Ejemplo:**
```tsx
<FormField
  control={form.control}
  name="clientTaxCondition"
  render={({ field }) => (
    <TaxConditionField
      field={field}
      required={!isUnbilled}
    />
  )}
/>
```

#### `AddressField`
Campo de dirección.

**Props:**
```typescript
interface AddressFieldProps {
  field: ControllerRenderProps<FieldValues, string>;
  className?: string;
  placeholder?: string;
  required?: boolean;
  label?: string;
}
```

**Ejemplo:**
```tsx
<FormField
  control={form.control}
  name="clientAddress"
  render={({ field }) => (
    <AddressField
      field={field}
      label="Dirección"
      placeholder="Calle y número"
    />
  )}
/>
```

#### `ItemFields`
Campos para un item individual (descripción, cantidad, precio unitario, tasa de IVA).

**Props:**
```typescript
interface ItemFieldsProps<TFieldValues extends FieldValues = FieldValues> {
  field: { id: string };
  index: number;
  control: Control<TFieldValues>;
  onRemove?: () => void;
  canRemove?: boolean;
}
```

**Uso:** Normalmente usado dentro de `ItemsSection`, no directamente.

---

### Secciones de Formulario (`components/forms/sections/`)

#### `FormSection`
Contenedor genérico para agrupar campos relacionados.

**Props:**
```typescript
interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  showSeparator?: boolean;
  className?: string;
}
```

**Ejemplo:**
```tsx
<FormSection title="Información de la Factura" description="Datos básicos de la factura">
  {/* Campos aquí */}
</FormSection>
```

#### `FiscalInfoSection`
Sección completa de información fiscal (Tax ID, Tax Condition, Address).

**Props:**
```typescript
interface FiscalInfoSectionProps {
  fieldPrefix: string; // "client", "supplier", etc.
  required?: boolean;
  showFiscalFields?: boolean;
  showAddress?: boolean;
  title?: string;
  gridCols?: string;
  showSeparator?: boolean;
}
```

**Ejemplo:**
```tsx
// Para facturas AFIP
<FiscalInfoSection
  fieldPrefix="client"
  required={!isUnbilled}
  showFiscalFields={!isUnbilled}
  showAddress={true}
  title="Datos del Cliente"
/>

// Para formularios de cliente/proveedor
<FiscalInfoSection
  fieldPrefix=""
  required={false}
  showFiscalFields={true}
  showAddress={true}
  title="Información Fiscal"
/>
```

#### `ItemsSection`
Sección para gestionar una lista de items con funcionalidad de agregar/eliminar.

**Props:**
```typescript
interface ItemsSectionProps<TFieldValues extends FieldValues = FieldValues> {
  fields: UseFieldArrayReturn<TFieldValues>["fields"];
  onAdd: () => void;
  onRemove: (index: number) => void;
  control: Control<TFieldValues>;
  title?: string;
  showSeparator?: boolean;
}
```

**Ejemplo:**
```tsx
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "items",
});

const defaultItem = {
  description: "",
  quantity: 1,
  unitPrice: 0,
  taxRate: "21" as const,
};

<ItemsSection
  fields={fields}
  onAdd={() => append(defaultItem)}
  onRemove={remove}
  control={form.control}
  title="Items"
/>
```

---

### Totales (`components/forms/totals/`)

#### `InvoiceTotals`
Componente para mostrar subtotal, IVA y total.

**Props:**
```typescript
interface InvoiceTotalsProps {
  subtotal: number;
  tax: number;
  total: number;
  currency?: string; // default: "$"
  decimals?: number; // default: 2
  className?: string;
}
```

**Ejemplo:**
```tsx
const items = useWatch({ control: form.control, name: "items" });
const { subtotal, tax, total } = useItemsCalculations(items);

<InvoiceTotals subtotal={subtotal} tax={tax} total={total} />
```

---

## Hooks Personalizados

### `useItemsCalculations`
Hook para calcular subtotal, IVA y total de un array de items.

**Uso:**
```tsx
import { useItemsCalculations } from "@/lib/hooks";
import { useWatch } from "react-hook-form";

const items = useWatch({ control: form.control, name: "items" });
const { subtotal, tax, total } = useItemsCalculations(items);
```

**Retorna:**
```typescript
{
  subtotal: number;
  tax: number;
  total: number;
}
```

### `useEntitySelector`
Hook genérico para funcionalidad de selector de entidades (búsqueda, selección, dropdown).

**Opciones:**
```typescript
interface UseEntitySelectorOptions<T> {
  value?: string;
  fetchByIdEndpoint: (id: string) => string;
  searchEndpoint: (query: string) => string;
  debounceDelay?: number;
  onSelect?: (entity: T | null) => void;
  onInputChange?: (value: string) => void;
}
```

**Retorna:**
```typescript
{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  entities: T[];
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedEntity: T | null;
  setSelectedEntity: (entity: T | null) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  handleSelect: (entity: T) => void;
  handleClear: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
```

**Uso:** Normalmente usado dentro de componentes como `ClientSelector` o `SupplierSelector`.

### `useEntityCreation`
Hook para crear entidades desde formularios (validación, API calls, actualización de campos).

**Opciones:**
```typescript
interface UseEntityCreationOptions<TFormValues extends FieldValues> {
  form: UseFormReturn<TFormValues>;
  nameField: FieldPath<TFormValues>;
  idField?: FieldPath<TFormValues>;
  taxIdField?: FieldPath<TFormValues>;
  taxConditionField?: FieldPath<TFormValues>;
  addressField?: FieldPath<TFormValues>;
  createEndpoint: string;
  getEntityData: (formValues: TFormValues) => {
    name: string;
    taxId?: string;
    taxCondition?: string;
    address?: string;
  };
  updateFormFields: (
    form: UseFormReturn<TFormValues>,
    entity: { _id: string; name: string; taxId?: string; taxCondition?: string; address?: string },
    formValues: TFormValues
  ) => void;
  validationFields?: FieldPath<TFormValues>[];
  nameRequiredMessage?: string;
  creationErrorMessage?: string;
}
```

**Retorna:**
```typescript
{
  createEntity: () => Promise<void>;
}
```

**Ejemplo:**
```tsx
const { createEntity: createClient } = useEntityCreation({
  form,
  nameField: "clientName",
  idField: "clientId",
  taxIdField: "clientTaxId",
  taxConditionField: "clientTaxCondition",
  addressField: "clientAddress",
  createEndpoint: "/api/clients",
  getEntityData: (formValues) => ({
    name: formValues.clientName,
    taxId: formValues.clientTaxId,
    taxCondition: formValues.clientTaxCondition,
    address: formValues.clientAddress,
  }),
  updateFormFields: (form, newClient, formValues) => {
    form.setValue("clientId", newClient._id as string);
    form.setValue("clientName", formValues.clientName || newClient.name);
    // ... más campos
  },
  validationFields: ["clientName", "clientTaxId", "clientTaxCondition", "clientAddress"],
});
```

### `useFiscalDataValidation`
Hook para validar si hay suficientes datos fiscales para crear una entidad.

**Opciones:**
```typescript
interface UseFiscalDataValidationOptions<TFormValues extends FieldValues> {
  form: UseFormReturn<TFormValues>;
  nameField: keyof TFormValues;
  taxIdField?: keyof TFormValues;
  taxConditionField?: keyof TFormValues;
  requireFiscalData?: boolean;
}
```

**Retorna:**
```typescript
{
  hasEnoughDataToCreate: () => boolean;
}
```

**Ejemplo:**
```tsx
const { hasEnoughDataToCreate } = useFiscalDataValidation({
  form,
  nameField: "clientName",
  taxIdField: "clientTaxId",
  taxConditionField: "clientTaxCondition",
  requireFiscalData: !isUnbilled,
});
```

---

## Schemas de Validación

### `fiscal.schemas.ts`

#### `taxIdSchema`
Schema para validar CUIT/CUIL/DNI.

```typescript
import { taxIdSchema } from "@/lib/schemas";

const schema = z.object({
  taxId: taxIdSchema.optional(),
});
```

#### `taxConditionEnum`
Enum para condición frente al IVA.

```typescript
import { taxConditionEnum } from "@/lib/schemas";

const schema = z.object({
  taxCondition: taxConditionEnum.optional(),
});
```

### `item.schemas.ts`

#### `itemSchema`
Schema para un item individual.

```typescript
import { itemSchema } from "@/lib/schemas";

const schema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(0.01),
  unitPrice: z.number().min(0),
  taxRate: z.enum(["0", "10.5", "21"]),
});
```

#### `itemsArraySchema`
Schema para un array de items.

```typescript
import { itemsArraySchema } from "@/lib/schemas";

const schema = z.object({
  items: itemsArraySchema,
});
```

---

## Componentes de Dominio

### `ClientSelector`
Selector de clientes con búsqueda y creación.

**Props:**
```typescript
interface ClientSelectorProps {
  value?: string; // clientId
  onSelect: (client: ClientDocument | null) => void;
  onInputChange?: (value: string) => void;
  onCreateNew?: () => void;
  className?: string;
  placeholder?: string;
  hasEnoughDataToCreate?: () => boolean;
}
```

**Ejemplo:**
```tsx
<ClientSelector
  value={form.watch("clientId")}
  onSelect={(client) => {
    if (client) {
      form.setValue("clientId", client._id as string);
      form.setValue("clientName", client.name);
      // ... más campos
    }
  }}
  onInputChange={(value) => {
    form.setValue("clientName", value);
    form.setValue("clientId", undefined);
  }}
  onCreateNew={createClient}
  hasEnoughDataToCreate={hasEnoughDataToCreate}
/>
```

### `SupplierSelector`
Selector de proveedores con búsqueda y creación (similar a `ClientSelector`).

**Props:**
```typescript
interface SupplierSelectorProps {
  value?: string; // supplierId
  onSelect: (supplier: SupplierDocument | null) => void;
  onInputChange?: (value: string) => void;
  onCreateNew?: () => void;
  className?: string;
  placeholder?: string;
  hasEnoughDataToCreate?: () => boolean;
}
```

---

## Componentes Compartidos

### `CrudListPage`
Componente genérico para páginas de listado CRUD.

**Props:**
```typescript
interface CrudListPageProps<T, TFormValues> {
  title: string;
  description: string;
  icon: LucideIcon;
  newButtonLabel: string;
  createDialogTitle: string;
  createDialogDescription: string;
  fetchItems: () => Promise<T[]>;
  onCreate: (data: TFormValues) => Promise<T>;
  onDelete: (item: T) => Promise<void>;
  getItemId: (item: T) => string | undefined;
  getDisplayName: (item: T) => string;
  columns: CrudListColumn<T>[];
  formComponent: (props: {
    onSubmit: (data: TFormValues) => void;
    onCancel: () => void;
  }) => ReactNode;
  emptyStateMessage?: string;
  emptyStateHelperText?: string;
  renderActions?: (item: T, onDelete: () => void) => ReactNode;
  deleteConfirmationMessage?: (item: T) => string;
}
```

**Ejemplo:**
```tsx
<CrudListPage<InvoiceDocument, InvoiceFormValues>
  title="Facturas"
  description="Gestiona tus facturas y documentos fiscales"
  icon={Receipt}
  newButtonLabel="Nueva Factura"
  createDialogTitle="Nueva Factura"
  createDialogDescription="Completa los datos para crear una nueva factura"
  fetchItems={invoiceActions.getAllInvoices}
  onCreate={invoiceActions.createInvoice}
  onDelete={async (invoice) => {
    const id = invoice._id?.toString();
    if (!id) throw new Error("ID inválido");
    await invoiceActions.deleteInvoice(id);
  }}
  getItemId={(invoice) => invoice._id?.toString()}
  getDisplayName={(invoice) => `Cliente: ${invoice.clientName} - Total: $${invoice.total.toFixed(2)}`}
  columns={columns}
  formComponent={({ onSubmit, onCancel }) => (
    <InvoiceForm onSubmit={onSubmit} onCancel={onCancel} />
  )}
  renderActions={(invoice, onDelete) => (
    <CrudListPageActions
      onView={() => console.log("View:", invoice)}
      onDelete={onDelete}
    />
  )}
/>
```

### `CrudListPageActions`
Componente para acciones estándar (ver, eliminar) en listas CRUD.

**Props:**
```typescript
interface CrudListPageActionsProps {
  onView?: () => void;
  onDelete: () => void;
}
```

---

## Ejemplos de Uso

### Formulario Completo de Factura

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { 
  FormSection, 
  FiscalInfoSection, 
  ItemsSection, 
  InvoiceTotals 
} from "@/components/forms";
import { ClientSelector } from "@/components/clients/client-selector";
import { useItemsCalculations, useFiscalDataValidation, useEntityCreation } from "@/lib/hooks";
import { itemsArraySchema } from "@/lib/schemas";

export function InvoiceForm({ onSubmit, onCancel }: InvoiceFormProps) {
  const form = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { /* ... */ },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const invoiceType = form.watch("invoiceType");
  const isUnbilled = invoiceType === "Unbilled";

  // Hooks para validación y creación
  const { hasEnoughDataToCreate } = useFiscalDataValidation({
    form,
    nameField: "clientName",
    taxIdField: "clientTaxId",
    taxConditionField: "clientTaxCondition",
    requireFiscalData: !isUnbilled,
  });

  const { createEntity: createClient } = useEntityCreation({
    form,
    nameField: "clientName",
    idField: "clientId",
    taxIdField: "clientTaxId",
    taxConditionField: "clientTaxCondition",
    addressField: "clientAddress",
    createEndpoint: "/api/clients",
    getEntityData: (formValues) => ({
      name: formValues.clientName,
      taxId: formValues.clientTaxId,
      taxCondition: formValues.clientTaxCondition,
      address: formValues.clientAddress,
    }),
    updateFormFields: (form, newClient, formValues) => {
      form.setValue("clientId", newClient._id as string);
      form.setValue("clientName", formValues.clientName || newClient.name);
      // ... más campos
    },
    validationFields: ["clientName", "clientTaxId", "clientTaxCondition", "clientAddress"],
  });

  // Cálculos de totales
  const items = useWatch({ control: form.control, name: "items" });
  const { subtotal, tax, total } = useItemsCalculations(items);

  const defaultItem = {
    description: "",
    quantity: 1,
    unitPrice: 0,
    taxRate: "21" as const,
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Información de la factura */}
        <FormSection title="Información de la Factura">
          {/* Campos básicos */}
        </FormSection>

        {/* Datos del cliente */}
        <FormSection title="Datos del Cliente">
          <ClientSelector
            value={form.watch("clientId")}
            onSelect={(client) => {
              if (client) {
                form.setValue("clientId", client._id as string);
                form.setValue("clientName", client.name);
                // ... más campos
              }
            }}
            onCreateNew={createClient}
            hasEnoughDataToCreate={hasEnoughDataToCreate}
          />
          {!isUnbilled && (
            <FiscalInfoSection
              fieldPrefix="client"
              required={true}
              showFiscalFields={true}
              showAddress={true}
            />
          )}
        </FormSection>

        {/* Items */}
        <ItemsSection
          fields={fields}
          onAdd={() => append(defaultItem)}
          onRemove={remove}
          control={form.control}
          title="Items"
        />

        {/* Totales */}
        <FormSection title="Totales" showSeparator={false}>
          <InvoiceTotals subtotal={subtotal} tax={tax} total={total} />
        </FormSection>

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Crear Factura</Button>
        </div>
      </form>
    </Form>
  );
}
```

### Formulario de Orden de Compra

```tsx
"use client";

import { FormSection, ItemsSection, InvoiceTotals, FiscalInfoSection } from "@/components/forms";
import { SupplierSelector } from "@/components/suppliers/supplier-selector";
import { useItemsCalculations, useFiscalDataValidation, useEntityCreation } from "@/lib/hooks";
import { useWatch } from "react-hook-form";

export function PurchaseOrderForm({ onSubmit, onCancel }: PurchaseOrderFormProps) {
  const form = useForm({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: { /* ... */ },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Hooks
  const { hasEnoughDataToCreate } = useFiscalDataValidation({
    form,
    nameField: "supplierName",
    taxIdField: "supplierTaxId",
    taxConditionField: "supplierTaxCondition",
    requireFiscalData: true,
  });

  const { createEntity: createSupplier } = useEntityCreation({
    form,
    nameField: "supplierName",
    idField: "supplierId",
    taxIdField: "supplierTaxId",
    taxConditionField: "supplierTaxCondition",
    addressField: "supplierAddress",
    createEndpoint: "/api/suppliers",
    getEntityData: (formValues) => ({
      name: formValues.supplierName,
      taxId: formValues.supplierTaxId,
      taxCondition: formValues.supplierTaxCondition,
      address: formValues.supplierAddress,
    }),
    updateFormFields: (form, newSupplier, formValues) => {
      form.setValue("supplierId", newSupplier._id as string);
      form.setValue("supplierName", formValues.supplierName || newSupplier.name);
      // ... más campos
    },
    validationFields: ["supplierName", "supplierTaxId", "supplierTaxCondition", "supplierAddress"],
  });

  const items = useWatch({ control: form.control, name: "items" });
  const { subtotal, tax, total } = useItemsCalculations(items);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Información de la orden */}
        <FormSection title="Información de la Orden">
          {/* Campos básicos */}
        </FormSection>

        {/* Datos del proveedor */}
        <FormSection title="Datos del Proveedor">
          <SupplierSelector
            value={form.watch("supplierId")}
            onSelect={(supplier) => {
              if (supplier) {
                form.setValue("supplierId", supplier._id as string);
                form.setValue("supplierName", supplier.name);
                // ... más campos
              }
            }}
            onCreateNew={createSupplier}
            hasEnoughDataToCreate={hasEnoughDataToCreate}
          />
          <FiscalInfoSection
            fieldPrefix="supplier"
            required={true}
            showFiscalFields={true}
            showAddress={true}
          />
        </FormSection>

        {/* Items */}
        <ItemsSection
          fields={fields}
          onAdd={() => append(defaultItem)}
          onRemove={remove}
          control={form.control}
          title="Productos/Servicios"
        />

        {/* Totales */}
        <FormSection title="Totales" showSeparator={false}>
          <InvoiceTotals subtotal={subtotal} tax={tax} total={total} />
        </FormSection>

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Crear Orden</Button>
        </div>
      </form>
    </Form>
  );
}
```

---

## Estructura de Archivos

```
components/
├── forms/
│   ├── fields/
│   │   ├── tax-id-field.tsx
│   │   ├── tax-condition-field.tsx
│   │   ├── address-field.tsx
│   │   └── item-fields.tsx
│   ├── sections/
│   │   ├── form-section.tsx
│   │   ├── fiscal-info-section.tsx
│   │   └── items-section.tsx
│   ├── totals/
│   │   └── invoice-totals.tsx
│   └── index.ts
├── clients/
│   └── client-selector.tsx
├── suppliers/
│   └── supplier-selector.tsx
└── shared/
    └── crud-list-page/
        ├── crud-list-page.tsx
        ├── crud-list-page-actions.tsx
        └── index.ts

lib/
├── hooks/
│   ├── use-items-calculations.ts
│   ├── use-entity-selector.ts
│   ├── use-entity-creation.ts
│   ├── use-fiscal-data-validation.ts
│   └── index.ts
└── schemas/
    ├── fiscal.schemas.ts
    ├── item.schemas.ts
    └── index.ts
```

---

## Mejores Prácticas

1. **Siempre usar `useWatch` para cálculos en tiempo real**: No usar `form.watch()` directamente en cálculos, usar `useWatch` hook.

2. **Separar lógica en hooks**: Extraer lógica compleja a hooks personalizados para reutilización.

3. **Tipos explícitos**: Evitar `any`, usar tipos específicos de TypeScript.

4. **Componentes "dumb"**: Los campos de formulario deben ser componentes simples que reciben `field` de react-hook-form.

5. **Composición sobre configuración**: Crear componentes pequeños que se combinan en lugar de componentes grandes con muchas props.




