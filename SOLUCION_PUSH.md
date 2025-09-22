# SOLUCIÓN PARA SUBIR A GITHUB

## Problema
El token Fine-grained tiene problemas con Git push. Necesitas crear un token **Classic**.

## Solución Paso a Paso

### 1. Revoca el token actual (por seguridad)
- Ve a: https://github.com/settings/tokens
- Encuentra el token actual y elimínalo

### 2. Crea un nuevo token CLASSIC
- Ve a: https://github.com/settings/tokens
- Click en **"Generate new token"** → **"Generate new token (classic)"**
- Nombre: `veterinaria-push`
- Expiration: 30 días (o lo que prefieras)
- Scopes: Marca SOLO **☑ repo** (esto marcará automáticamente todos los sub-permisos)
- Click en **"Generate token"**
- **COPIA EL TOKEN** (empieza con `ghp_...`)

### 3. Ejecuta estos comandos en PowerShell o CMD

```bash
# Configura el remote con tu usuario
git remote set-url origin https://Aioros01@github.com/Aioros01/veterinaria-sistema.git

# Haz push
git push -u origin main
```

Cuando te pida:
- **Username:** Aioros01
- **Password:** [PEGA TU TOKEN CLASSIC AQUÍ]

### 4. Alternativa si lo anterior no funciona

Si Windows no te deja pegar el token, usa este formato:

```bash
git push https://Aioros01:TU_TOKEN_AQUI@github.com/Aioros01/veterinaria-sistema.git main
```

Reemplaza `TU_TOKEN_AQUI` con el token que copiaste.

## Estado Actual del Proyecto

✅ **Ya está listo para subir:**
- Git inicializado
- 357 archivos en el commit
- Rama renombrada a "main"
- Remote configurado
- Repositorio creado en GitHub

❌ **Solo falta:**
- Crear un token Classic (no Fine-grained)
- Hacer el push

## Para tu laptop personal

Una vez subido, en tu laptop:

```bash
git clone https://github.com/Aioros01/veterinaria-sistema.git
cd veterinaria-sistema
cd backend && npm install
cd ../frontend && npm install
```

## IMPORTANTE
- **NO compartas el token** con nadie
- **Revoca tokens viejos** que no uses
- El token Classic funciona mejor que Fine-grained para push