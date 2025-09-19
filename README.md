# Sistema de Gestión Veterinaria 🐾

Sistema completo para gestión de clínica veterinaria con notificaciones automáticas, inventario y seguimiento de pacientes.

## 🚀 Características

- ✅ Gestión de mascotas y propietarios
- ✅ Historial médico completo
- ✅ Sistema de citas con calendario
- ✅ Notificaciones automáticas (Email/WhatsApp)
- ✅ Inventario de medicamentos
- ✅ Dashboard con estadísticas
- ✅ Sistema de roles (Admin, Veterinario, Recepcionista, Cliente)

## 📋 Requisitos Previos

### Opción 1: Con Docker (Recomendado)
- Docker Desktop instalado
- 4GB RAM mínimo

### Opción 2: Instalación Manual
- Node.js 18+
- PostgreSQL 14+
- Redis 7+

## 🔧 Instalación y Configuración

### Método 1: Docker (Más Fácil) 🐳

1. Clona el repositorio
2. Ejecuta con Docker Compose:
```bash
cd Veterinaria
docker-compose up -d
```

3. Accede a:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Método 2: Instalación Manual

#### 1. Instalar PostgreSQL
```bash
# Windows: Descarga desde https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql
```

#### 2. Crear base de datos
```sql
CREATE DATABASE veterinary_db;
```

#### 3. Instalar Redis
```bash
# Windows: Descarga desde https://github.com/microsoftarchive/redis/releases
# Mac: brew install redis
# Linux: sudo apt-get install redis-server
```

#### 4. Configurar Backend
```bash
cd backend
npm install
# Actualiza el archivo .env con tus credenciales
npm run dev
```

#### 5. Configurar Frontend
```bash
cd frontend
npm install
npm start
```

## 🌐 Despliegue en Internet (GRATUITO)

### Opción A: Usando Render.com (Recomendado - Todo Gratis)

1. **Base de Datos PostgreSQL (Gratis)**
   - Ve a [Render.com](https://render.com)
   - Crea cuenta gratuita
   - New > PostgreSQL
   - Selecciona plan gratuito
   - Guarda las credenciales

2. **Redis (Gratis)**
   - Ve a [Redis Cloud](https://redis.com/try-free/)
   - Crea cuenta gratuita (30MB gratis)
   - Crea nueva base de datos
   - Guarda las credenciales

3. **Backend en Render**
   - En Render: New > Web Service
   - Conecta tu GitHub
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Agrega las variables de entorno

4. **Frontend en Vercel**
   - Ve a [Vercel](https://vercel.com)
   - Importa proyecto desde GitHub
   - Framework: Create React App
   - Variable de entorno: `REACT_APP_API_URL=https://tu-backend.onrender.com/api`

### Opción B: Usando Railway (Más fácil pero con límites)

1. Ve a [Railway.app](https://railway.app)
2. Conecta con GitHub
3. Deploy > New Project
4. Selecciona el repositorio
5. Railway detectará automáticamente los servicios
6. Agrega PostgreSQL y Redis desde el marketplace

### Opción C: Usando Ngrok (Temporal - Para mostrar rápidamente)

1. Instala ngrok:
```bash
# Windows/Mac/Linux
npm install -g ngrok
```

2. Ejecuta tu aplicación localmente con Docker:
```bash
docker-compose up
```

3. Expón tu aplicación:
```bash
# Exponer frontend
ngrok http 3000

# En otra terminal, exponer backend
ngrok http 3001
```

4. Comparte las URLs generadas por ngrok

## 📱 Acceso Remoto Rápido (Sin configuración)

### Usar Tailscale (Red privada virtual)
1. Instala [Tailscale](https://tailscale.com) en tu PC
2. Instala Tailscale en el dispositivo remoto
3. Comparte el enlace de tu máquina
4. Accede usando: `http://tu-maquina-tailscale:3000`

## 🔐 Credenciales por Defecto

### Usuario Admin
- Email: admin@veterinaria.com
- Password: admin123

### Base de Datos (Docker)
- Host: localhost
- Puerto: 5432
- Usuario: postgres
- Password: postgres123
- Database: veterinary_db

## 📝 Variables de Entorno

Crea un archivo `.env` en la carpeta backend:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_DATABASE=veterinary_db

# JWT
JWT_SECRET=cambiar_en_produccion
JWT_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_aplicacion

# WhatsApp (Opcional - Twilio)
TWILIO_ACCOUNT_SID=opcional
TWILIO_AUTH_TOKEN=opcional
TWILIO_WHATSAPP_NUMBER=opcional
```

## 🚀 Comandos Útiles

```bash
# Iniciar todo con Docker
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Limpiar todo (incluyendo datos)
docker-compose down -v

# Acceder a PostgreSQL
docker exec -it veterinary_postgres psql -U postgres -d veterinary_db

# Acceder a Redis
docker exec -it veterinary_redis redis-cli
```

## 🔍 Solución de Problemas

### Error: Puerto en uso
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Error: No se conecta a la base de datos
- Verifica que PostgreSQL esté ejecutándose
- Verifica las credenciales en `.env`
- Prueba conexión: `psql -h localhost -U postgres -d veterinary_db`

### Error: Redis no conecta
- Verifica que Redis esté ejecutándose
- Prueba conexión: `redis-cli ping`

## 📱 Acceso desde el móvil

1. Asegúrate que tu PC y móvil estén en la misma red WiFi
2. Encuentra tu IP local:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`
3. En tu móvil accede a: `http://TU_IP_LOCAL:3000`

## 🌍 URLs de Producción

Una vez desplegado, tendrás:
- Frontend: https://tu-app.vercel.app
- Backend: https://tu-api.onrender.com
- Documentación API: https://tu-api.onrender.com/api-docs

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs: `docker-compose logs`
2. Verifica las variables de entorno
3. Asegúrate que los puertos no estén ocupados

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js, TypeScript, Express, TypeORM
- **Frontend**: React, TypeScript, Material-UI
- **Base de Datos**: PostgreSQL
- **Cache**: Redis
- **Autenticación**: JWT
- **Notificaciones**: Nodemailer, Twilio