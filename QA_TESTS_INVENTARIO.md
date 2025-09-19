# 🧪 Tests de QA - Módulo de Inventario
## Sistema de Gestión Veterinaria

---

## 📋 CRITERIOS DE ACEPTACIÓN

### 1. PERMISOS POR ROL

#### ✅ ADMIN (admin@veterinaria.com / admin123)
- [ ] DEBE poder ver el botón "Agregar Medicamento"
- [ ] DEBE poder crear nuevos medicamentos
- [ ] DEBE poder editar medicamentos existentes
- [ ] DEBE poder eliminar medicamentos
- [ ] DEBE poder ver todos los medicamentos
- [ ] DEBE poder buscar y filtrar medicamentos
- [ ] DEBE poder ver pestañas de Stock Bajo y Por Vencer

#### ✅ VETERINARIO (veterinario@veterinaria.com / vet123)
- [ ] DEBE poder ver el botón "Agregar Medicamento"
- [ ] DEBE poder crear nuevos medicamentos
- [ ] DEBE poder editar medicamentos existentes
- [ ] DEBE poder eliminar medicamentos
- [ ] DEBE poder ver todos los medicamentos
- [ ] DEBE poder buscar y filtrar medicamentos
- [ ] DEBE poder ver pestañas de Stock Bajo y Por Vencer

#### ❌ CLIENTE (maria@example.com / password123)
- [ ] NO DEBE ver el botón "Agregar Medicamento"
- [ ] NO DEBE ver botones de editar
- [ ] NO DEBE ver botones de eliminar
- [ ] DEBE poder ver todos los medicamentos (solo lectura)
- [ ] DEBE poder buscar y filtrar medicamentos
- [ ] DEBE poder ver pestañas de Stock Bajo y Por Vencer

---

## 🔍 CASOS DE PRUEBA DETALLADOS

### TEST 01: Crear Medicamento (Admin/Veterinario)
**Precondición:** Iniciar sesión como admin o veterinario
**Pasos:**
1. Navegar a Inventario
2. Click en "Agregar Medicamento"
3. Completar formulario:
   - Nombre: "Amoxicilina Test"
   - Principio Activo: "Amoxicilina"
   - Presentación: "Tabletas"
   - Concentración: "500mg"
   - Laboratorio: "Lab Test"
   - Categoría: "Antibiótico"
   - Stock Actual: 100
   - Stock Mínimo: 20
   - Precio Unitario: 25.50
   - Fecha Vencimiento: [fecha futura]
4. Click en "Agregar"

**Resultado Esperado:**
- ✅ Mensaje de éxito "Medicamento creado exitosamente"
- ✅ El medicamento aparece en la lista
- ✅ Los datos se muestran correctamente

---

### TEST 02: Editar Medicamento (Admin/Veterinario)
**Precondición:** Existe al menos un medicamento
**Pasos:**
1. En la lista de medicamentos, click en icono de editar
2. Modificar el precio a 30.00
3. Click en "Actualizar"

**Resultado Esperado:**
- ✅ Mensaje de éxito "Medicamento actualizado exitosamente"
- ✅ El precio se actualiza en la lista

---

### TEST 03: Eliminar Medicamento (Admin/Veterinario)
**Precondición:** Existe al menos un medicamento
**Pasos:**
1. Click en icono de eliminar
2. Confirmar eliminación

**Resultado Esperado:**
- ✅ Mensaje de confirmación aparece
- ✅ Mensaje de éxito "Medicamento eliminado exitosamente"
- ✅ El medicamento ya no aparece en la lista

---

### TEST 04: Búsqueda de Medicamentos
**Precondición:** Existen varios medicamentos
**Pasos:**
1. En el campo de búsqueda, escribir "Amoxi"
2. Verificar resultados

**Resultado Esperado:**
- ✅ Solo aparecen medicamentos que contienen "Amoxi"
- ✅ La búsqueda es instantánea
- ✅ Al borrar, vuelven a aparecer todos

---

### TEST 05: Filtro Stock Bajo
**Precondición:** Existe medicamento con stock <= stock mínimo
**Pasos:**
1. Click en pestaña "Stock Bajo"

**Resultado Esperado:**
- ✅ Solo aparecen medicamentos con stock bajo
- ✅ Aparece icono de advertencia
- ✅ Chip "Stock Bajo" visible

---

### TEST 06: Filtro Por Vencer
**Precondición:** Existe medicamento con vencimiento <= 30 días
**Pasos:**
1. Click en pestaña "Por Vencer"

**Resultado Esperado:**
- ✅ Solo aparecen medicamentos próximos a vencer
- ✅ Aparece icono de advertencia
- ✅ Chip "Por Vencer" o "Vencido" visible

---

### TEST 07: Validación Sin Permisos (Cliente)
**Precondición:** Iniciar sesión como cliente
**Pasos:**
1. Navegar a Inventario
2. Verificar interfaz

**Resultado Esperado:**
- ✅ NO aparece botón "Agregar Medicamento"
- ✅ NO aparecen iconos de editar/eliminar
- ✅ PUEDE buscar y filtrar
- ✅ PUEDE cambiar entre pestañas

---

## 🐛 BUGS CONOCIDOS (ARREGLADOS)

1. ✅ **BUG #001:** Solo ADMIN podía hacer CRUD
   - **Estado:** RESUELTO
   - **Solución:** Se agregó UserRole.VETERINARIAN a las rutas

2. ✅ **BUG #002:** updateStock buscaba body.stock en lugar de body.quantity
   - **Estado:** RESUELTO
   - **Solución:** Se acepta tanto body.quantity como body.stock

3. ✅ **BUG #003:** getLowStock y getExpiring devolvían arrays vacíos
   - **Estado:** RESUELTO
   - **Solución:** Se implementó la lógica de filtrado

---

## 📊 MATRIZ DE PRUEBAS

| Funcionalidad | Admin | Veterinario | Cliente |
|--------------|-------|-------------|---------|
| Ver Lista | ✅ | ✅ | ✅ |
| Buscar | ✅ | ✅ | ✅ |
| Crear | ✅ | ✅ | ❌ |
| Editar | ✅ | ✅ | ❌ |
| Eliminar | ✅ | ✅ | ❌ |
| Ver Stock Bajo | ✅ | ✅ | ✅ |
| Ver Por Vencer | ✅ | ✅ | ✅ |

---

## 🚀 COMANDOS DE PRUEBA RÁPIDA

### Backend - Verificar endpoints
```bash
# Como Admin
curl -X GET http://localhost:3001/api/medicines \
  -H "Authorization: Bearer [TOKEN_ADMIN]"

curl -X POST http://localhost:3001/api/medicines \
  -H "Authorization: Bearer [TOKEN_ADMIN]" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Med","category":"antibiotic","currentStock":50,"minimumStock":10,"unitPrice":20}'
```

### Frontend - Verificar consola
```javascript
// En la consola del navegador (F12)
localStorage.getItem('userRole') // Debe mostrar: admin, veterinarian o cliente
```

---

## ✅ CHECKLIST DE VALIDACIÓN FINAL

- [ ] Admin puede hacer CRUD completo
- [ ] Veterinario puede hacer CRUD completo  
- [ ] Cliente solo puede ver (sin editar/eliminar)
- [ ] Búsqueda funciona correctamente
- [ ] Filtros de Stock Bajo funcionan
- [ ] Filtros de Por Vencer funcionan
- [ ] Mensajes de éxito/error se muestran
- [ ] No hay errores en consola
- [ ] La UI es responsiva
- [ ] Los datos persisten después de recargar

---

## 📝 NOTAS DE IMPLEMENTACIÓN

- **Frontend:** `/frontend/src/pages/Inventory.tsx`
- **Backend Controller:** `/backend/src/controllers/MedicineController.ts`
- **Backend Routes:** `/backend/src/routes/medicine.routes.ts`
- **API Service:** `/frontend/src/services/api.ts`

---

**Última actualización:** ${new Date().toLocaleString('es-ES')}
**Versión:** 1.0.0
**Estado:** ✅ LISTO PARA PRUEBAS