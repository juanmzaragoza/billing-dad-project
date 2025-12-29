# Guía de Arquitectura y Decisiones de Diseño

Este documento describe los principios arquitectónicos, decisiones de diseño y patrones utilizados en el proyecto.

## Principios de Diseño

### 1. Separación de Responsabilidades (Single Responsibility Principle)

Cada componente debe tener una única responsabilidad clara:

- **Componentes de UI** (`components/ui/`): Componentes visuales básicos sin lógica de negocio
- **Componentes de Formulario** (`components/forms/`): Campos y secciones de formularios reutilizables
- **Componentes de Dominio** (`components/clients/`, `components/suppliers/`, etc.): Componentes específicos de cada entidad
- **Hooks personalizados** (`lib/hooks/`): Lógica reutilizable que puede ser usada por múltiples componentes
- **Servicios** (`lib/services/`): Lógica de negocio y acceso a datos
- **Schemas** (`lib/schemas/`): Validación y tipos compartidos

### 2. Composición sobre Herencia

En lugar de crear componentes grandes con muchas variantes, crear componentes pequeños que se combinan:

```tsx
// ❌ Mal: Un componente grande con muchas props condicionales
<InvoiceForm type="invoice" showItems={true} showClient={true} />

// ✅ Bien: Componentes pequeños que se combinan
<FormSection title="Cliente">
  <ClientSelector />
  <FiscalInfoSection fieldPrefix="client" />
</FormSection>
<FormSection title="Items">
  <ItemsSection fields={fields} onAdd={append} onRemove={remove} />
</FormSection>
```

### 3. Props Genéricas y Tipos Fuertes

Usar TypeScript para asegurar que los componentes sean tipados correctamente:

```tsx
// ✅ Componente genérico pero tipado
interface SelectorProps<T> {
  value?: string;
  onSelect: (item: T | null) => void;
  fetchItems: (query: string) => Promise<T[]>;
  getDisplayName: (item: T) => string;
}
```

### 4. Configuración vs. Código

Permitir personalización mediante props en lugar de hardcodear valores:

```tsx
// ❌ Mal: Valores hardcodeados
<TaxConditionSelect />

// ✅ Bien: Configurable
<TaxConditionSelect 
  conditions={["Responsable Inscripto", "Consumidor Final"]}
  required={!isUnbilled}
/>
```

### 5. DRY (Don't Repeat Yourself)

Extraer código duplicado a componentes, hooks o funciones reutilizables:

```tsx
// ❌ Mal: Código duplicado
const calculateSubtotal = () => {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
};

// ✅ Bien: Hook reutilizable
const { subtotal, tax, total } = useItemsCalculations(items);
```

---

## Estructura de Carpetas

```
components/
├── ui/                          # Componentes UI base (shadcn/ui)
│   └── ...
├── forms/                       # Componentes de formulario reutilizables
│   ├── fields/                  # Campos individuales
│   ├── sections/                # Secciones de formulario
│   └── totals/                  # Componentes de totales
├── clients/                     # Componentes específicos de clientes
├── suppliers/                   # Componentes específicos de proveedores
└── shared/                      # Componentes compartidos
    └── crud-list-page/          # Componente genérico de listado CRUD

lib/
├── hooks/                       # Hooks reutilizables
├── schemas/                     # Esquemas de validación Zod
├── services/                    # Servicios de negocio
├── types/                       # Tipos TypeScript
└── helpers/                     # Funciones helper
```

---

## Patrones de Implementación

### Pattern 1: Form Fields Reutilizables

Los campos deben ser "dumb components" que reciben `field` de react-hook-form:

```tsx
interface TaxIdFieldProps {
  field: ControllerRenderProps<FieldValues, string>;
  className?: string;
  placeholder?: string;
  maxLength?: number;
}

export function TaxIdField({ field, ...props }: TaxIdFieldProps) {
  return (
    <FormItem>
      <FormLabel>CUIT/CUIL/DNI</FormLabel>
      <FormControl>
        <Input {...field} {...props} />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
```

**Ventajas:**
- Reutilizable en cualquier formulario
- Tipado fuerte con TypeScript
- Fácil de testear

### Pattern 2: Hooks para Lógica Reutilizable

Extraer lógica compleja a hooks personalizados:

```tsx
export function useItemsCalculations(items: InvoiceItem[]) {
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [items]);

  const tax = useMemo(() => {
    return items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const taxRate = parseFloat(item.taxRate);
      return sum + (itemSubtotal * taxRate) / 100;
    }, 0);
  }, [items]);

  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  return { subtotal, tax, total };
}
```

**Ventajas:**
- Lógica separada de la UI
- Fácil de testear
- Reutilizable en múltiples componentes

### Pattern 3: Componentes de Sección

Agrupar campos relacionados en secciones:

```tsx
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  showSeparator?: boolean;
}

export function FormSection({ title, description, children, showSeparator = true }: FormSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
      {showSeparator && <Separator />}
    </div>
  );
}
```

**Ventajas:**
- Consistencia visual
- Fácil de mantener
- Reutilizable

### Pattern 4: Separación de Tipos e Interfaces

Todos los tipos e interfaces deben estar en archivos separados (`.types.ts`):

```
components/
├── forms/
│   ├── fields/
│   │   ├── tax-id-field.tsx
│   │   └── fields.types.ts      # Tipos para todos los campos
│   └── sections/
│       ├── form-section.tsx
│       └── sections.types.ts    # Tipos para todas las secciones
```

**Ventajas:**
- Organización clara
- Fácil de encontrar tipos
- Mejor para imports

### Pattern 5: Hooks para Lógica de Negocio

Extraer lógica de negocio compleja a hooks:

```tsx
// Hook para selector de entidades
export function useEntitySelector<T>({
  value,
  fetchByIdEndpoint,
  searchEndpoint,
  onSelect,
}: UseEntitySelectorOptions<T>) {
  // Lógica de búsqueda, selección, estado, etc.
}

// Hook para creación de entidades
export function useEntityCreation<TFormValues>({
  form,
  createEndpoint,
  getEntityData,
  updateFormFields,
}: UseEntityCreationOptions<TFormValues>) {
  // Lógica de validación, API calls, actualización de formulario
}
```

**Ventajas:**
- Lógica separada de componentes
- Reutilizable
- Fácil de testear

---

## Decisiones de Arquitectura

### 1. ¿Por qué componentes separados en lugar de props condicionales?

**Decisión:** Crear componentes pequeños y específicos en lugar de componentes grandes con muchas props condicionales.

**Razón:** 
- Más fácil de mantener
- Mejor rendimiento (menos re-renders)
- Más fácil de testear
- Mejor tipado

**Ejemplo:**
```tsx
// ❌ Evitar
<FormField type="taxId" required={true} showLabel={true} />

// ✅ Preferir
<TaxIdField field={field} required={true} />
```

### 2. ¿Por qué hooks en lugar de funciones helper?

**Decisión:** Usar hooks para lógica que necesita estado o efectos de React.

**Razón:**
- Integración natural con React
- Puede usar otros hooks
- Mejor para lógica reactiva
- Fácil de testear con React Testing Library

**Ejemplo:**
```tsx
// ✅ Hook para cálculos reactivos
const { subtotal, tax, total } = useItemsCalculations(items);

// ✅ Hook para lógica de selector
const { entities, isLoading, handleSelect } = useEntitySelector({...});
```

### 3. ¿Por qué separar tipos en archivos `.types.ts`?

**Decisión:** Todos los tipos e interfaces deben estar en archivos separados.

**Razón:**
- Organización clara
- Fácil de encontrar
- Mejor para imports
- Separación de concerns

### 4. ¿Por qué `CrudListPage` genérico?

**Decisión:** Crear un componente genérico para todas las páginas de listado CRUD.

**Razón:**
- Reduce código duplicado significativamente
- Consistencia en toda la aplicación
- Fácil de mantener
- Fácil de extender

**Resultado:**
- Páginas de listado pasan de ~230 líneas a ~80 líneas
- Reducción de ~65% de código

### 5. ¿Por qué hooks para lógica de formularios?

**Decisión:** Extraer lógica de formularios (validación, creación de entidades) a hooks.

**Razón:**
- Reutilizable entre formularios
- Separación de concerns
- Fácil de testear
- Menos código en componentes

**Ejemplo:**
```tsx
// Lógica de validación fiscal
const { hasEnoughDataToCreate } = useFiscalDataValidation({...});

// Lógica de creación de entidades
const { createEntity } = useEntityCreation({...});
```

---

## Nomenclatura

### Componentes
- PascalCase: `TaxIdField`, `ClientSelector`
- Archivos: kebab-case: `tax-id-field.tsx`, `client-selector.tsx`

### Hooks
- camelCase con prefijo `use`: `useItemsCalculations`, `useEntitySelector`
- Archivos: kebab-case: `use-items-calculations.ts`

### Tipos e Interfaces
- PascalCase: `TaxIdFieldProps`, `ClientSelectorProps`
- Archivos: kebab-case con sufijo `.types.ts`: `fields.types.ts`

### Funciones y Variables
- camelCase: `calculateSubtotal`, `getEntityData`

---

## Mejores Prácticas

### 1. Performance

- Usar `useMemo` y `useCallback` cuando sea necesario
- Evitar re-renders innecesarios
- Usar `useWatch` en lugar de `form.watch()` para cálculos reactivos

```tsx
// ❌ Mal: Se ejecuta en cada render
const items = form.watch("items");
const { subtotal } = useItemsCalculations(items);

// ✅ Bien: Se suscribe correctamente a cambios
const items = useWatch({ control: form.control, name: "items" });
const { subtotal } = useItemsCalculations(items);
```

### 2. Tipado

- Evitar `any`, usar tipos específicos
- Tipar props de componentes
- Tipar valores de retorno de funciones

```tsx
// ❌ Mal
function calculateTotal(items: any[]): any {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Bien
function calculateTotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}
```

### 3. Documentación

- JSDoc para componentes públicos
- Ejemplos de uso en comentarios
- Documentar props complejas

```tsx
/**
 * Campo para CUIT/CUIL/DNI con validación
 * 
 * @example
 * <TaxIdField field={field} required={true} maxLength={11} />
 */
export function TaxIdField({ field, ...props }: TaxIdFieldProps) {
  // ...
}
```

### 4. Testing

- Componentes deben ser fácilmente testeables
- Lógica de negocio en hooks/helpers (más fácil de testear)
- Props claras y predecibles

### 5. Accesibilidad

- Labels apropiados
- ARIA attributes cuando sea necesario
- Keyboard navigation

---

## Flujo de Datos

### Formularios

```
Usuario → Componente → React Hook Form → Schema (Zod) → Servicio → API → Base de Datos
```

### Selectores

```
Usuario → Selector → Hook (useEntitySelector) → API → Estado → Callback → Formulario
```

### Listados

```
Página → CrudListPage → Server Actions → Servicio → API → Base de Datos → Render
```

---

## Reducción de Código

### Antes de Componentización

- **Invoice Form**: ~460 líneas
- **Purchase Order Form**: ~400 líneas (estimado)
- **List Pages**: ~230 líneas cada una
- **Total**: ~1,320 líneas

### Después de Componentización

- **Invoice Form**: ~427 líneas (reutiliza componentes)
- **Purchase Order Form**: ~363 líneas (reutiliza componentes)
- **List Pages**: ~80 líneas cada una (usa CrudListPage)
- **Total**: ~950 líneas

**Reducción: ~28% menos código**

### Componentes Reutilizados

- `ItemsSection`: ~130 líneas reutilizadas
- `InvoiceTotals`: ~30 líneas reutilizadas
- Campos fiscales: ~150 líneas reutilizadas
- `useItemsCalculations`: ~30 líneas reutilizadas
- `CrudListPage`: ~150 líneas reutilizadas por página
- **Total reutilizado**: ~490 líneas

---

## Próximos Pasos

1. **Expandir reutilización**: Identificar más patrones comunes
2. **Mejorar tipos**: Hacer componentes aún más genéricos donde sea apropiado
3. **Testing**: Agregar tests para componentes reutilizables
4. **Documentación**: Mantener documentación actualizada
5. **Performance**: Optimizar re-renders donde sea necesario

---

## Lecciones Aprendidas

1. **Componentización temprana**: Es más fácil componentizar desde el inicio que refactorizar después
2. **Hooks para lógica**: Los hooks son excelentes para lógica reutilizable
3. **Tipos separados**: Mantener tipos en archivos separados mejora la organización
4. **Composición**: Componentes pequeños que se combinan son mejores que componentes grandes
5. **Genéricos cuando sea apropiado**: `CrudListPage` genérico reduce código significativamente




