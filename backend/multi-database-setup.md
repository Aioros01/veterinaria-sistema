# 🔥 CONFIGURACIÓN MULTI-BASE DE DATOS (MÁXIMO ALMACENAMIENTO GRATIS)

## Estrategia: Dividir datos en múltiples servicios gratuitos

### 1. Base de Datos Principal (CockroachDB - 10GB)
- Usuarios, Mascotas, Citas
- URL: https://cockroachlabs.com

### 2. Base de Datos Secundaria (Neon - 3GB)
- Inventario, Medicinas
- URL: https://neon.tech

### 3. Archivos e Imágenes (Cloudinary - 25GB)
- Fotos de mascotas
- Documentos médicos
- URL: https://cloudinary.com

### 4. Logs y Analytics (MongoDB Atlas - 512MB)
- Registros de actividad
- Estadísticas
- URL: https://mongodb.com/atlas

### 5. Cache (Upstash Redis - 10,000 comandos/día)
- Cache de consultas frecuentes
- URL: https://upstash.com

## TOTAL ALMACENAMIENTO GRATIS: ~38GB+

## Configuración en .env:

```env
# Base Principal (CockroachDB)
DB_MAIN_HOST=free-tier.gcp-us-central1.cockroachlabs.cloud
DB_MAIN_PORT=26257
DB_MAIN_DATABASE=defaultdb
DB_MAIN_USERNAME=tu_usuario
DB_MAIN_PASSWORD=tu_password

# Base Secundaria (Neon)
DB_SECONDARY_HOST=ep-xxx.us-east-2.aws.neon.tech
DB_SECONDARY_PORT=5432
DB_SECONDARY_DATABASE=neondb
DB_SECONDARY_USERNAME=tu_usuario
DB_SECONDARY_PASSWORD=tu_password

# Archivos (Cloudinary)
CLOUDINARY_CLOUD_NAME=tu_cloud
CLOUDINARY_API_KEY=tu_key
CLOUDINARY_API_SECRET=tu_secret

# Cache (Upstash)
REDIS_URL=redis://default:xxx@xxx.upstash.io:6379

# Analytics (MongoDB)
MONGODB_URI=mongodb+srv://usuario:pass@cluster.mongodb.net/
```

## Código para Múltiples Bases:

```typescript
// config/multiDatabase.ts
import { DataSource } from 'typeorm';

// Base principal para datos críticos
export const MainDB = new DataSource({
  type: 'cockroachdb',
  host: process.env.DB_MAIN_HOST,
  port: 26257,
  username: process.env.DB_MAIN_USERNAME,
  password: process.env.DB_MAIN_PASSWORD,
  database: process.env.DB_MAIN_DATABASE,
  ssl: true,
  entities: [User, Pet, Appointment]
});

// Base secundaria para inventario
export const SecondaryDB = new DataSource({
  type: 'postgres',
  host: process.env.DB_SECONDARY_HOST,
  port: 5432,
  username: process.env.DB_SECONDARY_USERNAME,
  password: process.env.DB_SECONDARY_PASSWORD,
  database: process.env.DB_SECONDARY_DATABASE,
  ssl: true,
  entities: [Medicine, Inventory]
});

// Inicializar ambas
export async function initializeDatabases() {
  await MainDB.initialize();
  await SecondaryDB.initialize();
  console.log('✅ Todas las bases de datos conectadas');
}
```

## Script de Migración desde Supabase:

```bash
# 1. Exportar datos de Supabase
pg_dump tu_supabase_url > backup.sql

# 2. Dividir el backup
# - users, pets, appointments -> cockroachdb.sql
# - medicines, inventory -> neon.sql

# 3. Importar a cada base
psql cockroachdb_url < cockroachdb.sql
psql neon_url < neon.sql
```

## Ventajas:
✅ 38GB+ almacenamiento total GRATIS
✅ Alta disponibilidad (múltiples proveedores)
✅ Escalable (agrega más cuentas si necesitas)
✅ Backups distribuidos
✅ Sin single point of failure

## Crecimiento Futuro:
Cuando tu negocio crezca, consolidas todo en un solo servicio pago.
Por ahora, aprovecha todos los planes gratuitos disponibles.