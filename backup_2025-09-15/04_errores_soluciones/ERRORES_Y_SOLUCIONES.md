# ERRORES ENCONTRADOS Y SOLUCIONES APLICADAS

## ❌ ERROR 1: ENOENT al cargar archivos
### Descripción
```
ENOENT: no such file or directory, open 'C:\Users\chios\Proyectos\Veterinaria\backend\uploads\consents\consent-xxx.pdf'
```

### Causa
El directorio de uploads no existía cuando Multer intentaba guardar los archivos.

### Solución
```typescript
// En ConsentController.ts
import * as fs from 'fs';
import * as path from 'path';

// Asegurar que existe la carpeta de uploads
const uploadDir = path.join(__dirname, '../../uploads/consents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
```

---

## ❌ ERROR 2: Solo aceptaba archivos PDF
### Descripción
```
Error: Solo se permiten archivos PDF
```

### Causa
El filtro de Multer solo permitía 'application/pdf'

### Solución
```typescript
// En ConsentController.ts
export const uploadConsent = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF o imágenes (JPG, PNG, GIF, WEBP)'));
    }
  }
});
```

---

## ❌ ERROR 3: Import incorrecto en DocumentHistory
### Descripción
```
Module '"../services/api"' has no exported member 'api'
```

### Causa
El módulo api exporta por defecto, no como export nombrado.

### Solución
```typescript
// INCORRECTO
import { api } from '../services/api';

// CORRECTO
import api from '../services/api';
```

---

## ❌ ERROR 4: Entity metadata not found
### Descripción
```
TypeORMError: Entity metadata for Consent#documentHistory was not found. 
Check if you specified a correct entity object and if it's connected in the connection options.
```

### Causa
La entidad ConsentDocumentHistory no estaba registrada en la configuración de TypeORM.

### Solución
```typescript
// En database.ts
import { ConsentDocumentHistory } from '../entities/ConsentDocumentHistory';

const config: DataSourceOptions = {
  // ...
  entities: [
    User,
    Pet,
    MedicalHistory,
    Appointment,
    Vaccination,
    Prescription,
    Medicine,
    Hospitalization,
    HospitalizationMedication,
    HospitalizationNote,
    Consent,
    ConsentDocumentHistory  // ← Agregar esta línea
  ],
  // ...
};
```

---

## ❌ ERROR 5: Relación inversa no definida
### Descripción
TypeORM no podía establecer la relación bidireccional entre Consent y ConsentDocumentHistory.

### Causa
Faltaba definir la relación ManyToOne en ConsentDocumentHistory.

### Solución
```typescript
// En ConsentDocumentHistory.ts
@ManyToOne(() => Consent, consent => consent.documentHistory)
@JoinColumn({ name: 'consent_id' })
consent!: Consent;
```

---

## 🛠️ MEJORES PRÁCTICAS APLICADAS

1. **Validación de directorios**: Siempre verificar que existan antes de escribir archivos
2. **Manejo de tipos MIME**: Usar listas explícitas de tipos permitidos
3. **Imports correctos**: Diferenciar entre default exports y named exports
4. **Registro de entidades**: Todas las entidades deben estar en la configuración de TypeORM
5. **Relaciones bidireccionales**: Definir ambos lados de las relaciones en TypeORM

---

## 📝 LECCIONES APRENDIDAS

1. **Siempre verificar la existencia de directorios** antes de operaciones de archivo
2. **Documentar tipos MIME aceptados** para evitar confusiones
3. **Revisar exports/imports** cuidadosamente en TypeScript
4. **Mantener sincronizada** la configuración de base de datos con las entidades
5. **Implementar logging detallado** para facilitar el debugging