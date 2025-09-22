-- =====================================================
-- SCRIPT SQL - SISTEMA DE HISTORIAL DE DOCUMENTOS
-- Base de datos: CockroachDB (PostgreSQL-compatible)
-- Fecha: 2025-09-15
-- =====================================================

-- Crear tabla de historial de documentos de consentimiento
CREATE TABLE IF NOT EXISTS consent_document_history (
    -- Identificador único
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relación con el consentimiento principal
    consent_id UUID NOT NULL REFERENCES consents(id) ON DELETE CASCADE,
    
    -- Tipo de documento (consentimiento firmado o documento de identidad)
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('signed_consent', 'id_document')),
    
    -- URL/ruta del documento almacenado
    document_url VARCHAR(500) NOT NULL,
    
    -- Metadatos del archivo
    original_file_name VARCHAR(255),
    mime_type VARCHAR(100),
    file_size BIGINT,
    
    -- Información de auditoría
    uploaded_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Estado del documento
    is_active BOOLEAN DEFAULT true,
    
    -- Notas adicionales
    notes TEXT,
    
    -- Timestamps de auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_consent_document_history_consent_id 
    ON consent_document_history(consent_id);

CREATE INDEX IF NOT EXISTS idx_consent_document_history_document_type 
    ON consent_document_history(document_type);

CREATE INDEX IF NOT EXISTS idx_consent_document_history_is_active 
    ON consent_document_history(is_active);

CREATE INDEX IF NOT EXISTS idx_consent_document_history_uploaded_at 
    ON consent_document_history(uploaded_at);

-- Índice compuesto para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_consent_document_history_consent_active 
    ON consent_document_history(consent_id, is_active);

-- Comentarios de tabla
COMMENT ON TABLE consent_document_history IS 'Historial completo de documentos cargados para cada consentimiento, con versionado y trazabilidad';

-- Comentarios de columnas
COMMENT ON COLUMN consent_document_history.id IS 'Identificador único del registro de historial';
COMMENT ON COLUMN consent_document_history.consent_id IS 'ID del consentimiento al que pertenece este documento';
COMMENT ON COLUMN consent_document_history.document_type IS 'Tipo de documento: signed_consent (consentimiento firmado) o id_document (documento de identidad)';
COMMENT ON COLUMN consent_document_history.document_url IS 'Ruta relativa o URL donde está almacenado el documento';
COMMENT ON COLUMN consent_document_history.original_file_name IS 'Nombre original del archivo subido por el usuario';
COMMENT ON COLUMN consent_document_history.mime_type IS 'Tipo MIME del archivo (application/pdf, image/jpeg, etc.)';
COMMENT ON COLUMN consent_document_history.file_size IS 'Tamaño del archivo en bytes';
COMMENT ON COLUMN consent_document_history.uploaded_by_id IS 'ID del usuario que subió el documento';
COMMENT ON COLUMN consent_document_history.uploaded_at IS 'Fecha y hora de carga del documento';
COMMENT ON COLUMN consent_document_history.is_active IS 'Indica si este es el documento activo actual (true) o una versión anterior (false)';
COMMENT ON COLUMN consent_document_history.notes IS 'Notas adicionales sobre el documento o la carga';

-- =====================================================
-- CONSULTAS DE EJEMPLO
-- =====================================================

-- Obtener el documento activo actual para un consentimiento
/*
SELECT * FROM consent_document_history 
WHERE consent_id = '[consent_id]' 
  AND is_active = true
ORDER BY uploaded_at DESC;
*/

-- Obtener todo el historial de un consentimiento
/*
SELECT 
    cdh.*,
    u.first_name || ' ' || u.last_name AS uploaded_by_name
FROM consent_document_history cdh
LEFT JOIN users u ON cdh.uploaded_by_id = u.id
WHERE cdh.consent_id = '[consent_id]'
ORDER BY cdh.uploaded_at DESC;
*/

-- Marcar documentos anteriores como inactivos antes de insertar uno nuevo
/*
UPDATE consent_document_history 
SET is_active = false, 
    updated_at = CURRENT_TIMESTAMP 
WHERE consent_id = '[consent_id]' 
  AND is_active = true;
*/

-- Estadísticas de uso del sistema
/*
SELECT 
    document_type,
    COUNT(*) as total_documents,
    COUNT(DISTINCT consent_id) as unique_consents,
    AVG(file_size) as avg_file_size,
    MAX(file_size) as max_file_size
FROM consent_document_history
GROUP BY document_type;
*/