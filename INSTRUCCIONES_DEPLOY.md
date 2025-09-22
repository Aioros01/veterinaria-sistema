# 🚀 INSTRUCCIONES DE DEPLOY - SISTEMA VETERINARIA

## Opción 1: RENDER (GRATIS Y FÁCIL) - RECOMENDADO

### Paso 1: Crear cuenta en Render
1. Ve a https://render.com
2. Regístrate con tu cuenta de GitHub (Aioros01)
3. Autoriza Render para acceder a tus repositorios

### Paso 2: Deploy del Backend
1. En Render Dashboard, click en **"New +"** → **"Web Service"**
2. Conecta tu repositorio: **Aioros01/veterinaria-sistema**
3. Configura:
   - **Name**: veterinaria-backend
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run migration:run && npm start`
   - **Plan**: Free

4. Agrega las variables de entorno (Environment Variables):
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=(tu URL de CockroachDB)
   JWT_SECRET=(genera una clave secreta aleatoria)
   JWT_EXPIRES_IN=7d
   ```

5. Click **"Create Web Service"**

### Paso 3: Deploy del Frontend
1. En Render Dashboard, click en **"New +"** → **"Static Site"**
2. Conecta el mismo repositorio: **Aioros01/veterinaria-sistema**
3. Configura:
   - **Name**: veterinaria-frontend
   - **Root Directory**: frontend
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: build

4. Agrega variable de entorno:
   ```
   REACT_APP_API_URL=https://veterinaria-backend.onrender.com
   ```
   (Usa la URL real de tu backend después del deploy)

5. Click **"Create Static Site"**

### Paso 4: Esperar el Deploy
- Backend tardará ~5-10 minutos
- Frontend tardará ~3-5 minutos
- Las URLs serán:
  - Backend: https://veterinaria-backend.onrender.com
  - Frontend: https://veterinaria-frontend.onrender.com

## Opción 2: VERCEL + RENDER

### Frontend en Vercel (más rápido para React)
1. Ve a https://vercel.com
2. Importa el proyecto desde GitHub
3. Configura:
   - Root Directory: frontend
   - Framework Preset: Create React App
   - Environment Variable: `REACT_APP_API_URL=tu-backend-url`

### Backend en Render
(Mismo proceso que Opción 1, Paso 2)

## Opción 3: RAILWAY (Todo en uno, $5 gratis/mes)

1. Ve a https://railway.app
2. Login con GitHub
3. New Project → Deploy from GitHub repo
4. Selecciona **veterinaria-sistema**
5. Railway detectará automáticamente frontend y backend
6. Agrega las variables de entorno
7. Deploy!

## 📝 NOTAS IMPORTANTES

### Variables de Entorno Necesarias

**Backend (.env)**:
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://tu-usuario:tu-password@tu-cluster.cockroachlabs.cloud:26257/defaultdb?sslmode=require
JWT_SECRET=genera-una-clave-secreta-super-larga-y-aleatoria
JWT_EXPIRES_IN=7d
```

**Frontend (.env)**:
```env
REACT_APP_API_URL=https://tu-backend.onrender.com
```

### Después del Deploy

1. **Prueba el backend**:
   ```
   https://tu-backend.onrender.com/health
   ```
   Deberías ver: `{"status":"ok"}`

2. **Prueba el frontend**:
   ```
   https://tu-frontend.onrender.com
   ```

3. **Primer usuario admin**:
   - Email: admin@veterinaria.com
   - Password: admin123
   - Cámbialo inmediatamente después del primer login

### Solución de Problemas

**Si el backend no conecta a la BD:**
- Verifica que DATABASE_URL esté correcta
- Asegúrate que CockroachDB permite conexiones desde cualquier IP

**Si el frontend no conecta al backend:**
- Verifica REACT_APP_API_URL
- Revisa CORS en el backend

**Si Render tarda mucho:**
- Los servicios gratuitos "duermen" después de 15 min de inactividad
- El primer request puede tardar ~30 segundos en despertar

## 🎯 RECOMENDACIÓN FINAL

Para producción real:
1. Usa Render para empezar (gratis)
2. Si necesitas mejor performance, actualiza a plan pagado ($7/mes)
3. O migra a AWS/Google Cloud cuando crezcas

## 🔒 SEGURIDAD POST-DEPLOY

1. Cambia todas las contraseñas default
2. Configura backups automáticos en CockroachDB
3. Activa 2FA en GitHub y servicios de hosting
4. Monitorea logs regularmente
5. Configura alertas para errores

## URLs DE TU SISTEMA

Una vez desplegado, tendrás:
- **GitHub**: https://github.com/Aioros01/veterinaria-sistema
- **Backend API**: https://veterinaria-backend.onrender.com
- **Frontend App**: https://veterinaria-frontend.onrender.com
- **Base de Datos**: CockroachDB Cloud (ya configurada)