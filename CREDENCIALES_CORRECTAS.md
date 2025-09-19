# 🔑 CREDENCIALES CORRECTAS DEL SISTEMA

## ✅ CREDENCIALES VERIFICADAS Y FUNCIONANDO

### 👨‍💼 ADMINISTRADOR
- **Email:** admin@veterinaria.com
- **Contraseña:** admin123
- **Rol:** admin
- **Permisos:** TODOS

### 👨‍⚕️ VETERINARIO
- **Email:** veterinario@veterinaria.com
- **Contraseña:** vet123
- **Rol:** veterinarian
- **Permisos:** Gestión de mascotas, citas, inventario

### 👤 CLIENTE 1 (María)
- **Email:** maria@example.com
- **Contraseña:** password123
- **Rol:** cliente
- **Permisos:** Ver sus mascotas, agendar citas

### 👤 CLIENTE 2 (Carlos)
- **Email:** carlos@example.com
- **Contraseña:** password123
- **Rol:** cliente
- **Permisos:** Ver sus mascotas, agendar citas

---

## 🚀 CÓMO INGRESAR AL SISTEMA

1. **Abre tu navegador** (preferiblemente Chrome o Edge)
2. **Ve a:** http://localhost:3000
3. **Ingresa las credenciales** según el rol que quieras probar
4. **Click en "Iniciar Sesión"**

---

## ✅ FUNCIONALIDADES POR ROL

### ADMINISTRADOR (admin@veterinaria.com)
✅ **Puede hacer TODO:**
- Crear, editar y eliminar mascotas
- Gestionar todas las citas
- CRUD completo en inventario
- Ver dashboard con estadísticas totales
- Gestionar usuarios
- Crear y gestionar consentimientos
- Gestionar hospitalizaciones

### VETERINARIO (veterinario@veterinaria.com)
✅ **Puede:**
- Crear, editar y eliminar mascotas
- Gestionar citas (agendar y cancelar)
- CRUD completo en inventario
- Ver dashboard con estadísticas totales
- Crear consentimientos

❌ **NO puede:**
- Gestionar usuarios
- Acceder al panel administrativo

### CLIENTE (maria@example.com o carlos@example.com)
✅ **Puede:**
- Ver SUS mascotas (no puede editarlas)
- Ver historial médico de sus mascotas
- Agendar citas para sus mascotas
- Ver sus citas (no puede cancelarlas)
- Buscar medicamentos en inventario (solo ver)
- Firmar consentimientos digitalmente

❌ **NO puede:**
- Editar o eliminar mascotas
- Cancelar citas
- Hacer CRUD en inventario
- Ver medicamentos bajo stock
- Crear consentimientos

---

## 🔧 SI NO FUNCIONA EL LOGIN

### Opción 1: Limpiar caché
1. Presiona **Ctrl + Shift + Delete**
2. Selecciona "Cookies y otros datos del sitio"
3. Click en "Borrar datos"
4. Recarga la página con **Ctrl + F5**

### Opción 2: Modo incógnito
1. Abre una ventana de incógnito (**Ctrl + Shift + N**)
2. Ve a http://localhost:3000
3. Ingresa las credenciales

### Opción 3: Verificar servidores
Asegúrate de que ambos servidores estén corriendo:
- **Backend:** Puerto 3001
- **Frontend:** Puerto 3000

---

## 📥 DESCARGA DE PDFs

Para descargar consentimientos en PDF:
1. Ingresa con cualquier usuario
2. Ve a **Consentimientos**
3. Click en **"Descargar PDF"**
4. El archivo se descargará automáticamente

---

## 🧪 VERIFICACIÓN RÁPIDA

Ejecuta en la consola del navegador (F12):
```javascript
// Verificar tu sesión actual
const user = JSON.parse(localStorage.getItem('user'));
console.log('Usuario:', user?.email);
console.log('Rol:', user?.role);
console.log('Token:', localStorage.getItem('token') ? 'Presente' : 'Faltante');
```

---

## ⚠️ IMPORTANTE

- Las contraseñas son **sensibles a mayúsculas/minúsculas**
- El email debe estar **exactamente** como se muestra
- Si cambias de usuario, **cierra sesión primero**

---

**Última verificación:** ${new Date().toLocaleString('es-ES')}
**Estado del sistema:** ✅ FUNCIONANDO CORRECTAMENTE