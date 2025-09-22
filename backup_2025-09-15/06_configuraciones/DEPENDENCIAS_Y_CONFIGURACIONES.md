# DEPENDENCIAS Y CONFIGURACIONES

## 📦 DEPENDENCIAS DEL BACKEND

### Dependencias Principales
```json
{
  "dependencies": {
    "express": "^4.x",
    "typeorm": "^0.3.x",
    "multer": "^1.4.x",
    "jsonwebtoken": "^9.x",
    "bcryptjs": "^2.x",
    "dotenv": "^16.x",
    "cors": "^2.x",
    "pg": "^8.x"
  }
}
```

### Dependencias de Desarrollo
```json
{
  "devDependencies": {
    "@types/express": "^4.x",
    "@types/multer": "^1.x",
    "@types/node": "^20.x",
    "typescript": "^5.x",
    "ts-node-dev": "^2.x"
  }
}
```

### Configuración de TypeORM
```typescript
// database.ts
const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '26257'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    User, Pet, MedicalHistory, Appointment,
    Vaccination, Prescription, Medicine,
    Hospitalization, HospitalizationMedication,
    HospitalizationNote, Consent,
    ConsentDocumentHistory // ← Entidad agregada
  ],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development'
};
```

### Configuración de Multer
```typescript
// ConsentController.ts
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'consent-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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
    // Validación de tipos
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});
```

---

## 📦 DEPENDENCIAS DEL FRONTEND

### Dependencias Principales
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "@mui/material": "^5.x",
    "@mui/icons-material": "^5.x",
    "@emotion/react": "^11.x",
    "@emotion/styled": "^11.x",
    "axios": "^1.x",
    "react-router-dom": "^6.x"
  }
}
```

### Configuración de API
```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 🗄️ CONFIGURACIÓN DE BASE DE DATOS

### CockroachDB Cloud
```env
# .env
DB_HOST=veterinaria-15765.j77.aws-us-east-1.cockroachlabs.cloud
DB_PORT=26257
DB_USERNAME=cris_mena0228
DB_PASSWORD=[REDACTED]
DB_DATABASE=defaultdb
DATABASE_URL=postgresql://[usuario]:[password]@[host]:[puerto]/[database]?sslmode=require
```

### Estructura de Tablas
```sql
-- Tabla principal de consentimientos
CREATE TABLE consents (
  id UUID PRIMARY KEY,
  type VARCHAR(50),
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50),
  pet_id UUID REFERENCES pets(id),
  owner_id UUID REFERENCES users(id),
  -- ... otros campos
);

-- Tabla de historial de documentos
CREATE TABLE consent_document_history (
  id UUID PRIMARY KEY,
  consent_id UUID REFERENCES consents(id),
  document_type VARCHAR(50),
  document_url VARCHAR(500),
  original_file_name VARCHAR(255),
  mime_type VARCHAR(100),
  file_size BIGINT,
  uploaded_by_id UUID REFERENCES users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT
);
```

---

## ⚙️ VARIABLES DE ENTORNO

### Backend (.env)
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=veterinaria-15765.j77.aws-us-east-1.cockroachlabs.cloud
DB_PORT=26257
DB_USERNAME=cris_mena0228
DB_PASSWORD=[REDACTED]
DB_DATABASE=defaultdb

# JWT
JWT_SECRET=[REDACTED]
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development
```

---

## 🚀 SCRIPTS DE NPM

### Backend
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "typeorm": "typeorm-ts-node-commonjs"
  }
}
```

### Frontend
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

---

## 🔒 CONFIGURACIÓN DE SEGURIDAD

### CORS
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### Autenticación JWT
```typescript
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Token inválido' });
    req.user = decoded;
    next();
  });
};
```

### Control de Acceso por Roles
```typescript
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  };
};
```

---

## 📁 ESTRUCTURA DE DIRECTORIOS

```
veterinaria/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── controllers/
│   │   │   └── ConsentController.ts
│   │   ├── entities/
│   │   │   ├── Consent.ts
│   │   │   └── ConsentDocumentHistory.ts
│   │   ├── routes/
│   │   │   └── consent.routes.ts
│   │   └── middleware/
│   │       └── auth.ts
│   └── uploads/
│       └── consents/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ConsentActions.tsx
│       │   └── DocumentHistory.tsx
│       └── services/
│           └── api.ts
└── backup_2025-09-15/
    └── [estructura de backup]
```