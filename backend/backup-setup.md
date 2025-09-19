# 🔐 CONFIGURACIÓN DE BACKUPS AUTOMÁTICOS

## Opción 1: Backup Automático a Google Drive (GRATIS)
1. Instalar rclone: https://rclone.org/downloads/
2. Configurar Google Drive:
```bash
rclone config
# Seguir pasos para Google Drive
```

3. Script de backup automático:
```bash
# backup.bat (Windows)
@echo off
set BACKUP_NAME=veterinary_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%.sql
pg_dump postgresql://usuario:password@db.supabase.co:5432/postgres > %BACKUP_NAME%
rclone copy %BACKUP_NAME% gdrive:VeterinaryBackups/
del %BACKUP_NAME%
echo Backup completado!
```

## Opción 2: Backup a GitHub (Privado y Gratis)
```bash
# Crear repositorio privado en GitHub para backups
git init veterinary-backups
git remote add origin https://github.com/tu-usuario/veterinary-backups.git

# Script de backup
pg_dump tu_database_url > backup.sql
git add backup.sql
git commit -m "Backup $(date)"
git push origin main
```

## Opción 3: Backup Local + Nube
- Dropbox: 2GB gratis
- OneDrive: 5GB gratis
- MEGA: 20GB gratis

## Programar Backups Automáticos (Windows)
1. Abrir Task Scheduler
2. Create Basic Task
3. Trigger: Daily
4. Action: Start backup.bat

## Restaurar desde Backup
```bash
# Desde archivo SQL
psql tu_database_url < backup.sql

# Desde Supabase Dashboard
# Settings > Database > Backups > Restore
```