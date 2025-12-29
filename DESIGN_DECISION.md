# Decisiones de Diseño: Clientes y Facturas

## Problema
¿Cómo manejar los datos de clientes en relación con las facturas?

## Opciones Consideradas

### Opción 1: Datos Embebidos (Actual)
**Estructura:** Los datos del cliente se guardan directamente en cada factura.

**Ventajas:**
- ✅ Simplicidad: Una sola query para obtener facturas completas
- ✅ Preservación histórica: Si el cliente cambia, las facturas mantienen los datos originales
- ✅ Mejor rendimiento: No requiere joins
- ✅ Inmutabilidad: Las facturas son documentos históricos que no deberían cambiar

**Desventajas:**
- ❌ Duplicación de datos
- ❌ No hay gestión centralizada de clientes
- ❌ Difícil autocompletar datos del cliente al crear facturas

### Opción 2: Referencia a Colección de Clientes (Normalización)
**Estructura:** Facturas referencian clientes por ID, datos del cliente en colección separada.

**Ventajas:**
- ✅ Sin duplicación de datos
- ✅ Gestión centralizada de clientes
- ✅ Fácil actualizar datos del cliente

**Desventajas:**
- ❌ Requiere múltiples queries o joins
- ❌ Si el cliente cambia, las facturas históricas mostrarían datos incorrectos
- ❌ Más complejidad en las queries
- ❌ Problemas legales: Las facturas deben preservar los datos originales

### Opción 3: Enfoque Híbrido (RECOMENDADO) ⭐
**Estructura:** 
- Colección `clients` para gestión y autocompletado
- En facturas: snapshot de datos del cliente + referencia opcional al ID

**Ventajas:**
- ✅ Gestión centralizada de clientes
- ✅ Autocompletado fácil al crear facturas
- ✅ Preservación histórica: Las facturas guardan snapshot de datos
- ✅ Rendimiento: Una sola query para facturas (datos embebidos)
- ✅ Flexibilidad: Puedes buscar facturas por cliente usando el ID
- ✅ Cumplimiento legal: Las facturas preservan datos históricos

**Desventajas:**
- ⚠️ Ligeramente más complejo de implementar
- ⚠️ Duplicación controlada (necesaria para preservar historial)

## Decisión: Opción 3 - Enfoque Híbrido

### Implementación

#### 1. Colección `clients`
```typescript
interface ClientDocument {
  _id: ObjectId;
  name: string;
  taxId?: string;
  taxCondition?: string;
  address?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2. Facturas con Snapshot
```typescript
interface InvoiceDocument {
  // ... otros campos
  clientId?: string; // Referencia opcional al cliente
  client: ClientSnapshot; // Snapshot de datos al momento de facturación
}
```

### Flujo de Trabajo

1. **Crear/Editar Cliente:**
   - Se guarda en colección `clients`
   - Permite reutilización y gestión centralizada

2. **Crear Factura:**
   - Usuario selecciona cliente (autocompletado desde `clients`)
   - Al guardar, se crea snapshot de datos del cliente en la factura
   - Se guarda referencia opcional `clientId` para búsquedas

3. **Consultar Facturas:**
   - Datos del cliente ya están en la factura (una sola query)
   - Si necesitas datos actualizados del cliente, consultas `clients` usando `clientId`

4. **Actualizar Cliente:**
   - Solo afecta la colección `clients`
   - Las facturas históricas mantienen sus datos originales

## Beneficios del Enfoque Híbrido

1. **Cumplimiento Legal:** Las facturas preservan datos históricos (requisito en Argentina)
2. **Rendimiento:** Consultas rápidas sin joins
3. **UX:** Autocompletado y gestión de clientes
4. **Mantenibilidad:** Clientes centralizados pero facturas independientes
5. **Escalabilidad:** Fácil agregar funcionalidades (historial, reportes por cliente, etc.)

## Próximos Pasos

1. Crear colección `clients` y servicio `client.service.ts`
2. Actualizar `InvoiceDocument` para incluir `clientId` y `client` (snapshot)
3. Crear componente de selección de clientes con autocompletado
4. Actualizar formulario de facturas para usar clientes






