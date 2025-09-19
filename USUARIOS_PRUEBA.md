# 🏥 USUARIOS DE PRUEBA - SISTEMA VETERINARIA

## 📋 Cuentas Disponibles

### 1. 👨‍💼 ADMINISTRADOR
- **Email:** `admin@veterinaria.com`
- **Contraseña:** `admin123456`
- **Permisos:** 
  - Ver TODAS las mascotas, citas, historiales
  - Panel de administración con auditoría completa
  - Gestión de inventario
  - Ver quién creó/modificó cada registro

### 2. 👨‍⚕️ VETERINARIO
- **Email:** `vet@veterinaria.com`
- **Contraseña:** `vet123456`
- **Nombre:** Dr. Juan Pérez
- **Permisos:**
  - Ver citas asignadas
  - Crear historiales médicos
  - Gestionar inventario de medicamentos
  - Ver información de pacientes

### 3. 👤 CLIENTE (Usuario Regular)
- **Email:** `cliente@ejemplo.com`
- **Contraseña:** `cliente123`
- **Permisos:**
  - Ver solo SUS mascotas
  - Agendar citas para sus mascotas
  - Ver historiales médicos de sus mascotas
  - No tiene acceso a inventario ni panel admin

## 🚀 Cómo Usar

1. **Iniciar los servidores:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend  
   cd frontend
   npm start
   ```

2. **Acceder a la aplicación:**
   - Abrir navegador en: http://localhost:3000

3. **Probar diferentes roles:**
   - Inicia sesión con cada cuenta para ver las diferentes vistas y permisos

## 📱 Funcionalidades por Rol

### ADMIN puede:
- ✅ Ver Panel de Administración (/admin)
- ✅ Ver TODAS las mascotas del sistema
- ✅ Ver TODAS las citas con información del dueño
- ✅ Ver quién creó cada registro
- ✅ Gestionar inventario completo
- ✅ Ver actividad reciente del sistema

### VETERINARIO puede:
- ✅ Ver sus citas asignadas
- ✅ Crear historiales médicos
- ✅ Gestionar medicamentos
- ✅ Ver información de pacientes

### CLIENTE puede:
- ✅ Registrar mascotas
- ✅ Agendar citas
- ✅ Ver solo SUS mascotas
- ✅ Ver historiales de sus mascotas
- ❌ NO puede ver Panel Admin
- ❌ NO puede ver Inventario

## 🔑 Crear Nuevos Usuarios

Para registrar un nuevo cliente:
1. Ir a http://localhost:3000/register
2. Llenar el formulario
3. El nuevo usuario será creado como rol "client"

## 📝 Notas Importantes

- El administrador puede ver QUIÉN y CUÁNDO se creó cada registro
- Las contraseñas están encriptadas con bcrypt
- Los tokens JWT expiran después de 24 horas
- La base de datos es CockroachDB en la nube