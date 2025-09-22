# 🚀 DEPLOY CON RENDER (BACKEND) + NETLIFY (FRONTEND)

## ✅ PASO 1: DEPLOY BACKEND EN RENDER

### 1.1 Crear cuenta en Render
- Ve a: https://render.com
- Regístrate con GitHub (Aioros01)
- Autoriza acceso a tus repositorios

### 1.2 Crear nuevo Web Service
1. Click en **"New +"** → **"Web Service"**
2. Busca y selecciona: **Aioros01/veterinaria-sistema**
3. Configura estos valores:

```
Name: veterinaria-backend
Region: Oregon (US West)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
Instance Type: Free
```

### 1.3 Variables de Entorno (Environment)
Click en "Advanced" y agrega:

```
NODE_ENV = production
PORT = 3001
DATABASE_URL = (tu URL completa de CockroachDB)
JWT_SECRET = genera_una_clave_super_secreta_aqui_123456789
JWT_EXPIRES_IN = 7d
```

### 1.4 Deploy
- Click **"Create Web Service"**
- Espera ~10 minutos para el primer deploy
- Tu backend estará en: `https://veterinaria-backend.onrender.com`

## 🎨 PASO 2: DEPLOY FRONTEND EN NETLIFY

### 2.1 Crear cuenta en Netlify
- Ve a: https://netlify.com
- Regístrate con GitHub (misma cuenta)
- Autoriza acceso

### 2.2 Importar proyecto
1. Click en **"Add new site"** → **"Import an existing project"**
2. Selecciona **GitHub**
3. Busca: **Aioros01/veterinaria-sistema**
4. Configura:

```
Branch to deploy: main
Base directory: frontend
Build command: npm run build
Publish directory: frontend/build
```

### 2.3 Variables de Entorno
En "Environment variables" agrega:

```
REACT_APP_API_URL = https://veterinaria-backend.onrender.com
```

### 2.4 Deploy
- Click **"Deploy site"**
- Espera ~3 minutos
- Netlify te dará una URL tipo: `https://amazing-curie-123456.netlify.app`

### 2.5 Cambiar nombre del sitio (Opcional)
1. Ve a **Site settings** → **Site details**
2. Click **"Change site name"**
3. Ponle: `veterinaria-sistema`
4. Tu URL será: `https://veterinaria-sistema.netlify.app`

## 🔧 PASO 3: VERIFICAR TODO FUNCIONA

### Test Backend (Render):
```bash
curl https://veterinaria-backend.onrender.com/health
# Deberías ver: {"status":"ok"}
```

### Test Frontend (Netlify):
1. Abre: https://veterinaria-sistema.netlify.app
2. Deberías ver la página de login
3. Prueba con:
   - Email: admin@veterinaria.com
   - Password: admin123

## ⚠️ IMPORTANTE - PRIMEROS PASOS

### 1. Espera inicial
- **Render**: Primera vez tarda ~10-15 min
- **Netlify**: Primera vez tarda ~3-5 min
- Render "duerme" después de 15 min sin uso (tarda 30s en despertar)

### 2. Configurar CORS en Backend
El backend ya tiene CORS configurado, pero si hay problemas, verifica en `backend/src/app.ts`:
```typescript
this.app.use(cors({
  origin: ['https://veterinaria-sistema.netlify.app', 'http://localhost:3000'],
  credentials: true
}));
```

### 3. Variables de Entorno CockroachDB
Asegúrate que tu DATABASE_URL tenga el formato:
```
postgresql://usuario:password@cluster.cockroachlabs.cloud:26257/defaultdb?sslmode=require
```

## 📊 MONITOREO

### Render Dashboard:
- Logs en tiempo real
- Métricas de uso
- Estado del servicio
- https://dashboard.render.com

### Netlify Dashboard:
- Analytics de visitas
- Bandwidth usado
- Deploy history
- https://app.netlify.com

## 🚨 TROUBLESHOOTING

### Error: "Backend no responde"
1. Ve a Render dashboard
2. Click en tu servicio
3. Ve a "Logs"
4. Busca errores de conexión a BD

### Error: "Cannot connect to API"
1. Verifica REACT_APP_API_URL en Netlify
2. Debe ser EXACTAMENTE: https://veterinaria-backend.onrender.com
3. Re-deploy si cambias variables

### Error: "Database connection failed"
1. Verifica DATABASE_URL en Render
2. Prueba la conexión desde CockroachDB dashboard
3. Asegúrate que permites todas las IPs (0.0.0.0/0)

## 🎯 URLS FINALES DE TU SISTEMA

- **Frontend**: https://veterinaria-sistema.netlify.app
- **Backend API**: https://veterinaria-backend.onrender.com
- **API Health**: https://veterinaria-backend.onrender.com/health
- **GitHub**: https://github.com/Aioros01/veterinaria-sistema

## 💡 PRÓXIMOS PASOS

1. **Dominio personalizado** (opcional):
   - Compra dominio en Namecheap/GoDaddy
   - Configúralo en Netlify (gratis con SSL)

2. **Backups automáticos**:
   - CockroachDB ya hace backups
   - Configura alertas en Render

3. **Monitoreo**:
   - UptimeRobot (gratis) para alertas si se cae
   - Sentry (gratis) para tracking de errores

## 🔐 SEGURIDAD POST-DEPLOY

✅ **Inmediatamente después del deploy:**
1. Cambia la contraseña de admin
2. Crea tu usuario personal
3. Desactiva el usuario admin default
4. Configura 2FA en GitHub, Render y Netlify

## 📈 LÍMITES GRATUITOS

**Netlify Free:**
- 100GB bandwidth/mes
- 300 minutos build/mes
- Sitios ilimitados

**Render Free:**
- 750 horas/mes
- Duerme después de 15 min inactividad
- 512MB RAM
- Deploy automático desde GitHub

**Si necesitas más:**
- Netlify Pro: $19/mes
- Render Starter: $7/mes