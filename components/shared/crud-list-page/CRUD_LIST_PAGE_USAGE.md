# Uso del Componente CrudListPage

El componente `CrudListPage` es un componente genérico reutilizable para crear páginas de listado CRUD (Create, Read, Update, Delete) de forma rápida y consistente.

## Características

- ✅ Manejo automático de estado de carga
- ✅ Estado vacío personalizable
- ✅ Dialog para crear nuevos items
- ✅ Tabla configurable con columnas personalizadas
- ✅ Acciones estándar (Ver, Eliminar) con soporte para acciones personalizadas
- ✅ Manejo de errores y mensajes toast
- ✅ Totalmente tipado con TypeScript

## Ejemplo: Página de Facturas

```tsx
"use client";

import { Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CrudListPage, type CrudListColumn } from "@/components/shared/crud-list-page";
import { CrudListPageActions } from "@/components/shared/crud-list-page-actions";
import { InvoiceForm } from "./invoice-form";
import type { InvoiceDocument } from "@/lib/types/invoice.types";
import type { InvoiceFormValues } from "./invoice-form";
import * as invoiceActions from "./actions";

export default function FacturasPage() {
  // Definir las columnas de la tabla
  const columns: CrudListColumn<InvoiceDocument>[] = [
    {
      key: "date",
      header: "Fecha",
      render: (invoice) => formatDate(invoice.date),
    },
    {
      key: "invoiceType",
      header: "Tipo",
      render: (invoice) => (
        <Badge variant="outline">
          {getInvoiceTypeLabel(invoice.invoiceType)}
        </Badge>
      ),
    },
    // ... más columnas
  ];

  return (
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
      getDisplayName={(invoice) =>
        `Cliente: ${invoice.clientName} - Total: $${invoice.total.toFixed(2)}`
      }
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
  );
}
```

## Ejemplo: Página de Órdenes de Compra (Futuro)

```tsx
"use client";

import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CrudListPage, type CrudListColumn } from "@/components/shared/crud-list-page";
import { CrudListPageActions } from "@/components/shared/crud-list-page-actions";
import { PurchaseOrderForm } from "./purchase-order-form";
import type { PurchaseOrderDocument } from "@/lib/types/purchase-order.types";
import type { PurchaseOrderFormValues } from "./purchase-order-form";
import * as purchaseOrderActions from "./actions";

export default function OrdenesCompraPage() {
  const columns: CrudListColumn<PurchaseOrderDocument>[] = [
    {
      key: "orderNumber",
      header: "Número",
      render: (order) => (
        <span className="font-mono">{order.orderNumber}</span>
      ),
    },
    {
      key: "date",
      header: "Fecha",
      render: (order) => formatDate(order.date),
    },
    {
      key: "supplierName",
      header: "Proveedor",
      render: (order) => order.supplierName,
    },
    {
      key: "status",
      header: "Estado",
      render: (order) => (
        <Badge variant={
          order.status === "Completada" ? "default" :
          order.status === "En Proceso" ? "secondary" :
          "outline"
        }>
          {order.status}
        </Badge>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (order) => (
        <span className="font-semibold">${order.total.toFixed(2)}</span>
      ),
    },
  ];

  return (
    <CrudListPage<PurchaseOrderDocument, PurchaseOrderFormValues>
      title="Órdenes de Compra"
      description="Administra tus órdenes de compra y pedidos"
      icon={ShoppingCart}
      newButtonLabel="Nueva Orden"
      createDialogTitle="Nueva Orden de Compra"
      createDialogDescription="Completa los datos para crear una nueva orden de compra"
      fetchItems={purchaseOrderActions.getAllPurchaseOrders}
      onCreate={purchaseOrderActions.createPurchaseOrder}
      onDelete={async (order) => {
        const id = order._id?.toString();
        if (!id) throw new Error("ID inválido");
        await purchaseOrderActions.deletePurchaseOrder(id);
      }}
      getItemId={(order) => order._id?.toString()}
      getDisplayName={(order) =>
        `Proveedor: ${order.supplierName} - Total: $${order.total.toFixed(2)}`
      }
      columns={columns}
      formComponent={({ onSubmit, onCancel }) => (
        <PurchaseOrderForm onSubmit={onSubmit} onCancel={onCancel} />
      )}
      renderActions={(order, onDelete) => (
        <CrudListPageActions
          onView={() => console.log("View order:", order)}
          onDelete={onDelete}
        />
      )}
    />
  );
}
```

## Props del Componente

### Props Requeridas

- `title`: Título de la página
- `description`: Descripción/subtítulo
- `icon`: Icono de Lucide React
- `newButtonLabel`: Texto del botón "Nuevo"
- `createDialogTitle`: Título del dialog de creación
- `createDialogDescription`: Descripción del dialog
- `fetchItems`: Función async que retorna array de items
- `onCreate`: Función async que crea un item
- `onDelete`: Función async que elimina un item
- `getItemId`: Función que extrae el ID de un item
- `getDisplayName`: Función que retorna nombre para mensajes
- `columns`: Array de definiciones de columnas
- `formComponent`: Componente del formulario

### Props Opcionales

- `emptyStateMessage`: Mensaje personalizado para estado vacío
- `emptyStateHelperText`: Texto de ayuda para estado vacío
- `renderActions`: Función para renderizar acciones personalizadas
- `deleteConfirmationMessage`: Mensaje personalizado de confirmación

## Definición de Columnas

```tsx
interface CrudListColumn<T> {
  key: string;              // Identificador único de la columna
  header: string;           // Título de la columna
  render: (item: T) => ReactNode;  // Función que renderiza el contenido
  className?: string;       // Clases CSS opcionales
}
```

## Acciones Personalizadas

Puedes usar `CrudListPageActions` para acciones estándar o crear tus propias acciones:

```tsx
renderActions={(item, onDelete) => (
  <div className="flex gap-2">
    <Button onClick={() => handleEdit(item)}>Editar</Button>
    <Button onClick={() => handleDuplicate(item)}>Duplicar</Button>
    <CrudListPageActions onDelete={onDelete} />
  </div>
)}
```

## Beneficios

1. **Consistencia**: Todas las páginas CRUD tienen el mismo look & feel
2. **Rapidez**: Implementación mucho más rápida
3. **Mantenibilidad**: Cambios centralizados se reflejan en todas las páginas
4. **Menos código**: Reducción significativa de código duplicado
5. **Tipado**: TypeScript asegura tipo correcto en todo momento

## Reducción de Código

- **Antes**: ~230 líneas por página
- **Después**: ~80 líneas por página
- **Reducción**: ~65% menos código


