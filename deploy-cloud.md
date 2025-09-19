# 🚀 Guía de Despliegue en la Nube (GRATIS)

## Opción 1: Despliegue Rápido con Render (100% Gratis) ⭐

### Paso 1: Preparar el código
1. Sube tu código a GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/veterinaria.git
git push -u origin main
```

### Paso 2: Base de Datos PostgreSQL Gratis
1. Ve a [ElephantSQL](https://www.elephantsql.com/)
2. Crea una cuenta gratuita
3. Create New Instance → Selecciona "Tiny Turtle (Free)"
4. Copia la URL de conexión

### Paso 3: Redis Gratis
1. Ve a [Upstash](https://upstash.com/)
2. Crea cuenta gratuita
3. Create Database → Selecciona región más cercana
4. Copia las credenciales Redis

### Paso 4: Backend en Render
1. Ve a [Render.com](https://render.com)
2. New → Web Service
3. Conecta tu repositorio de GitHub
4. Configuración:
   - Name: veterinaria-backend
   - Environment: Node
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
5. Agrega variables de entorno:
   ```
   DB_HOST=(de ElephantSQL)
   DB_PORT=5432
   DB_USERNAME=(de ElephantSQL)
   DB_PASSWORD=(de ElephantSQL)
   DB_DATABASE=(de ElephantSQL)
   REDIS_HOST=(de Upstash)
   REDIS_PORT=(de Upstash)
   REDIS_PASSWORD=(de Upstash)
   JWT_SECRET=tu_secret_key_segura
   ```
6. Create Web Service

### Paso 5: Frontend en Netlify
1. Ve a [Netlify](https://www.netlify.com/)
2. Arrastra la carpeta `frontend/build` (después de hacer `npm run build`)
   O conecta con GitHub
3. Variables de entorno:
   ```
   REACT_APP_API_URL=https://veterinaria-backend.onrender.com/api
   ```

## Opción 2: Usando Railway (Más simple pero con límites)

1. Ve a [Railway](https://railway.app/)
2. Start a New Project → Deploy from GitHub repo
3. Railway detectará automáticamente los servicios
4. Agrega PostgreSQL y Redis desde "New Service"
5. Las URLs se generan automáticamente

## Opción 3: Exposición Temporal con Ngrok

### Para mostrar rápidamente (2 horas gratis)
1. Descarga [ngrok](https://ngrok.com/download)
2. Ejecuta tu app localmente
3. En terminal 1:
```bash
ngrok http 3000
```
4. En terminal 2:
```bash
ngrok http 3001
```
5. Comparte las URLs generadas

## Opción 4: Localhost.run (Sin instalación)

```bash
# Exponer frontend
ssh -R 80:localhost:3000 nokey@localhost.run

# En otra terminal, exponer backend
ssh -R 80:localhost:3001 nokey@localhost.run
```

## 📱 Configuración para Acceso Móvil

### En la misma red WiFi:
1. Encuentra tu IP local:
   - Windows: `ipconfig` → IPv4 Address
   - Mac/Linux: `ifconfig` → inet
2. Accede desde el móvil: `http://TU_IP:3000`

### Desde cualquier lugar (Tailscale):
1. Instala [Tailscale](https://tailscale.com/) en tu PC
2. Instala Tailscale en el móvil
3. Accede usando: `http://tu-pc-name:3000`

## ⚡ Scripts de Despliegue Automático

### deploy.sh (Linux/Mac)
```bash
#!/bin/bash
echo "Construyendo Backend..."
cd backend
npm run build

echo "Construyendo Frontend..."
cd ../frontend
npm run build

echo "Desplegando..."
# Agrega aquí comandos de despliegue específicos

echo "✅ Despliegue completado!"
```

### deploy.bat (Windows)
```batch
@echo off
echo Construyendo Backend...
cd backend
call npm run build

echo Construyendo Frontend...
cd ..\frontend
call npm run build

echo Desplegando...
REM Agrega aqui comandos de despliegue

echo Despliegue completado!
pause
```

## 🔗 URLs Finales

Después del despliegue tendrás:
- Frontend: `https://tu-app.netlify.app`
- Backend: `https://tu-api.onrender.com`
- Base de datos: ElephantSQL dashboard
- Redis: Upstash dashboard

## 🎯 Checklist de Despliegue

- [ ] Código subido a GitHub
- [ ] Base de datos PostgreSQL configurada
- [ ] Redis configurado
- [ ] Backend desplegado y funcionando
- [ ] Frontend desplegado y conectado al backend
- [ ] Variables de entorno configuradas
- [ ] Usuario admin creado (`npm run seed`)
- [ ] Probado en móvil
- [ ] URLs compartidas con el cliente

## 🆘 Troubleshooting

### Error: CORS
Agrega en `backend/src/app.ts`:
```javascript
app.use(cors({
  origin: ['https://tu-frontend.netlify.app', 'http://localhost:3000']
}));
```

### Error: Base de datos no conecta
- Verifica que la URL de conexión sea correcta
- Revisa los logs en Render/Railway
- Prueba la conexión con un cliente PostgreSQL

### Error: Build failed
- Revisa que `package.json` tenga todos los scripts necesarios
- Verifica las versiones de Node especificadas
- Revisa los logs de compilación

## 📝 Notas Importantes

1. **Límites Gratuitos:**
   - Render: 750 horas/mes
   - ElephantSQL: 20MB almacenamiento
   - Upstash: 10,000 comandos/día
   - Netlify: 100GB bandwidth/mes

2. **Seguridad:**
   - Cambia TODAS las contraseñas por defecto
   - Usa variables de entorno para datos sensibles
   - Habilita HTTPS en producción

3. **Monitoreo:**
   - Activa alertas en Render/Railway
   - Revisa logs regularmente
   - Configura backups de la base de datos