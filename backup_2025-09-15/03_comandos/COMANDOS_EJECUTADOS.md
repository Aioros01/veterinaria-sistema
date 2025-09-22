# COMANDOS EJECUTADOS DURANTE LA IMPLEMENTACIÓN

## 🖥️ COMANDOS DE SERVIDOR

### Iniciar Frontend
```bash
cd frontend && npm start
```

### Iniciar Backend
```bash
cd backend && npm run dev
```

## 📁 COMANDOS DE CREACIÓN DE ARCHIVOS

### Crear entidad ConsentDocumentHistory
```bash
# Archivo creado manualmente en:
backend/src/entities/ConsentDocumentHistory.ts
```

### Crear componente DocumentHistory
```bash
# Archivo creado manualmente en:
frontend/src/components/DocumentHistory.tsx
```

## 🗄️ COMANDOS DE BASE DE DATOS

### Crear tabla consent_document_history
```sql
CREATE TABLE IF NOT EXISTS consent_document_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consent_id UUID NOT NULL REFERENCES consents(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('signed_consent', 'id_document')),
    document_url VARCHAR(500) NOT NULL,
    original_file_name VARCHAR(255),
    mime_type VARCHAR(100),
    file_size BIGINT,
    uploaded_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consent_document_history_consent_id ON consent_document_history(consent_id);
CREATE INDEX idx_consent_document_history_document_type ON consent_document_history(document_type);
CREATE INDEX idx_consent_document_history_is_active ON consent_document_history(is_active);
CREATE INDEX idx_consent_document_history_uploaded_at ON consent_document_history(uploaded_at);
```

## 🔍 COMANDOS DE VERIFICACIÓN

### Verificar estado del Frontend
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

### Verificar estado del Backend
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health
```

## 💾 COMANDOS DE BACKUP

### Crear estructura de directorios de backup
```bash
mkdir -p "backup_2025-09-15/01_resumen" \
         "backup_2025-09-15/02_codigo_fuente/backend" \
         "backup_2025-09-15/02_codigo_fuente/frontend" \
         "backup_2025-09-15/03_comandos" \
         "backup_2025-09-15/04_errores_soluciones" \
         "backup_2025-09-15/05_logica_implementada" \
         "backup_2025-09-15/06_configuraciones"
```

### Copiar archivos del backend
```bash
cp backend/src/entities/ConsentDocumentHistory.ts backup_2025-09-15/02_codigo_fuente/backend/
cp backend/src/controllers/ConsentController.ts backup_2025-09-15/02_codigo_fuente/backend/
cp backend/src/entities/Consent.ts backup_2025-09-15/02_codigo_fuente/backend/
cp backend/src/config/database.ts backup_2025-09-15/02_codigo_fuente/backend/
cp backend/src/routes/consent.routes.ts backup_2025-09-15/02_codigo_fuente/backend/
```

### Copiar archivos del frontend
```bash
cp frontend/src/components/DocumentHistory.tsx backup_2025-09-15/02_codigo_fuente/frontend/
cp frontend/src/components/ConsentActions.tsx backup_2025-09-15/02_codigo_fuente/frontend/
```

## 📝 NOTAS
- Todos los comandos fueron ejecutados en Windows (PowerShell/CMD)
- Los servidores se ejecutan en modo desarrollo con hot-reload
- La base de datos es CockroachDB en la nube