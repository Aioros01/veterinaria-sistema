import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { AppDataSource } from '../config/database';

const execAsync = promisify(exec);

export class BackupSystem {
  private backupDir = path.join(__dirname, '../../backups');

  constructor() {
    // Crear directorio de backups si no existe
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Crear backup de la base de datos
   */
  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${timestamp}.sql`;
    const filepath = path.join(this.backupDir, filename);

    try {
      // Obtener configuración de la base de datos
      const { host, port, username, password, database } = AppDataSource.options as any;

      // Crear backup usando pg_dump
      const command = `PGPASSWORD=${password} pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -f ${filepath}`;
      
      await execAsync(command);
      
      console.log(`✅ Backup creado: ${filename}`);
      
      // Comprimir el backup
      await this.compressBackup(filepath);
      
      // Subir a GitHub (opcional)
      await this.uploadToGitHub(filename);
      
      return filename;
    } catch (error) {
      console.error('❌ Error creando backup:', error);
      throw error;
    }
  }

  /**
   * Comprimir backup para ahorrar espacio
   */
  private async compressBackup(filepath: string): Promise<void> {
    const command = `gzip ${filepath}`;
    await execAsync(command);
    console.log('📦 Backup comprimido');
  }

  /**
   * Subir backup a GitHub (repositorio privado)
   */
  private async uploadToGitHub(filename: string): Promise<void> {
    try {
      const commands = [
        `cd ${this.backupDir}`,
        'git add .',
        `git commit -m "Backup automático: ${filename}"`,
        'git push origin main'
      ].join(' && ');

      await execAsync(commands);
      console.log('☁️ Backup subido a GitHub');
    } catch (error) {
      console.log('⚠️ No se pudo subir a GitHub (configurar repositorio)');
    }
  }

  /**
   * Restaurar backup
   */
  async restoreBackup(filename: string): Promise<void> {
    const filepath = path.join(this.backupDir, filename);

    if (!fs.existsSync(filepath)) {
      throw new Error('Archivo de backup no encontrado');
    }

    try {
      // Descomprimir si está comprimido
      if (filepath.endsWith('.gz')) {
        await execAsync(`gunzip ${filepath}`);
      }

      const { host, port, username, password, database } = AppDataSource.options as any;

      // Restaurar usando psql
      const command = `PGPASSWORD=${password} psql -h ${host} -p ${port} -U ${username} -d ${database} -f ${filepath.replace('.gz', '')}`;
      
      await execAsync(command);
      
      console.log('✅ Backup restaurado exitosamente');
    } catch (error) {
      console.error('❌ Error restaurando backup:', error);
      throw error;
    }
  }

  /**
   * Listar backups disponibles
   */
  listBackups(): string[] {
    return fs.readdirSync(this.backupDir)
      .filter(file => file.startsWith('backup_'))
      .sort()
      .reverse();
  }

  /**
   * Limpiar backups antiguos (mantener últimos 30)
   */
  async cleanOldBackups(): Promise<void> {
    const backups = this.listBackups();
    
    if (backups.length > 30) {
      const toDelete = backups.slice(30);
      
      for (const backup of toDelete) {
        const filepath = path.join(this.backupDir, backup);
        fs.unlinkSync(filepath);
        console.log(`🗑️ Backup eliminado: ${backup}`);
      }
    }
  }

  /**
   * Programar backups automáticos
   */
  scheduleAutoBackup(): void {
    // Backup cada 6 horas
    setInterval(async () => {
      console.log('⏰ Iniciando backup automático...');
      await this.createBackup();
      await this.cleanOldBackups();
    }, 6 * 60 * 60 * 1000);

    // Backup inicial
    this.createBackup();
  }
}

// Exportar instancia única
export const backupSystem = new BackupSystem();