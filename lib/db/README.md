# Firebase Firestore Database Setup

Este proyecto utiliza Firebase Firestore a través de MongoDB API.

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con la siguiente configuración:

```env
# Firebase Firestore MongoDB Connection
MONGODB_URI=mongodb://root-user:TU_PASSWORD@TU_INSTANCE_ID.nam5.firestore.goog:443/TU_DATABASE?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false

# Database name
DB_NAME=tu-database-name
```

### 2. Conexión

El archivo `lib/db/firestore.ts` maneja la conexión a la base de datos con:
- Pool de conexiones reutilizable
- Manejo de errores
- Cache para evitar múltiples conexiones

### 3. Uso

```typescript
import connectToDatabase from "@/lib/db/firestore";

const { db } = await connectToDatabase();
const collection = db.collection("tu-coleccion");
```

## Servicios

Los servicios están en `lib/services/` y proporcionan una capa de abstracción sobre la base de datos.

### Test Service

El servicio de prueba (`lib/services/test.service.ts`) incluye:
- `createTest()` - Crear un documento de prueba
- `getAllTests()` - Obtener todos los documentos
- `getTestById()` - Obtener un documento por ID
- `updateTest()` - Actualizar un documento
- `deleteTest()` - Eliminar un documento
- `testConnection()` - Probar la conexión a la base de datos

## API Routes

### Probar Conexión
```
GET /api/test/connection
```

### CRUD de Test Documents
```
GET    /api/test          - Obtener todos
POST   /api/test          - Crear nuevo
GET    /api/test/[id]     - Obtener por ID
PUT    /api/test/[id]     - Actualizar
DELETE /api/test/[id]     - Eliminar
```

## Ejemplo de Uso

### Crear un documento de prueba
```bash
curl -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "message": "Hello World"}'
```

### Probar la conexión
```bash
curl http://localhost:3000/api/test/connection
```





