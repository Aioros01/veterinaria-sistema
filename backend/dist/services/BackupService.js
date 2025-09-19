"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupService = exports.BackupService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const cron = __importStar(require("node-cron"));
const database_1 = require("../config/database");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class BackupService {
    constructor() {
        this.backupDir = path.join(process.cwd(), 'backups');
        this.maxBackups = 30;
        this.ensureBackupDirectory();
        this.scheduleAutoBackups();
    }
    ensureBackupDirectory() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
            console.log('📁 Directorio de backups creado');
        }
    }
    /**
     * Crear backup de la base de datos
     */
    async createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup_${timestamp}.sql`;
        const filepath = path.join(this.backupDir, filename);
        try {
            console.log('🔄 Creando backup...');
            // Opción 1: Usar pg_dump si está disponible
            const dbConfig = database_1.AppDataSource.options;
            const pgDumpCommand = `pg_dump ${dbConfig.url || `postgresql://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`} > "${filepath}"`;
            try {
                await execAsync(pgDumpCommand);
            }
            catch (pgError) {
                // Opción 2: Exportar usando TypeORM
                console.log('⚠️ pg_dump no disponible, usando método alternativo...');
                await this.exportUsingTypeORM(filepath);
            }
            // Comprimir backup
            if (fs.existsSync(filepath)) {
                await this.compressFile(filepath);
                console.log(`✅ Backup creado: ${filename}.gz`);
                // Limpiar backups antiguos
                await this.cleanOldBackups();
                return `${filename}.gz`;
            }
            throw new Error('No se pudo crear el backup');
        }
        catch (error) {
            console.error('❌ Error creando backup:', error);
            throw error;
        }
    }
    /**
     * Exportar datos usando TypeORM (alternativa a pg_dump)
     */
    async exportUsingTypeORM(filepath) {
        const entities = database_1.AppDataSource.entityMetadatas;
        let sqlContent = '-- Backup generado por TypeORM\n';
        sqlContent += `-- Fecha: ${new Date().toISOString()}\n\n`;
        for (const entity of entities) {
            const repository = database_1.AppDataSource.getRepository(entity.name);
            const records = await repository.find();
            if (records.length > 0) {
                sqlContent += `\n-- Tabla: ${entity.tableName}\n`;
                sqlContent += `DELETE FROM ${entity.tableName};\n`;
                for (const record of records) {
                    const columns = Object.keys(record).join(', ');
                    const values = Object.values(record).map(v => v === null ? 'NULL' :
                        typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` :
                            v).join(', ');
                    sqlContent += `INSERT INTO ${entity.tableName} (${columns}) VALUES (${values});\n`;
                }
            }
        }
        fs.writeFileSync(filepath, sqlContent);
    }
    /**
     * Comprimir archivo
     */
    async compressFile(filepath) {
        const gzip = require('zlib').createGzip();
        const source = fs.createReadStream(filepath);
        const destination = fs.createWriteStream(`${filepath}.gz`);
        return new Promise((resolve, reject) => {
            source.pipe(gzip).pipe(destination)
                .on('finish', () => {
                fs.unlinkSync(filepath); // Eliminar archivo sin comprimir
                resolve();
            })
                .on('error', reject);
        });
    }
    /**
     * Restaurar backup
     */
    async restoreBackup(filename) {
        const filepath = path.join(this.backupDir, filename);
        if (!fs.existsSync(filepath)) {
            throw new Error(`Backup no encontrado: ${filename}`);
        }
        try {
            console.log('🔄 Restaurando backup...');
            // Descomprimir si es necesario
            let sqlFile = filepath;
            if (filepath.endsWith('.gz')) {
                sqlFile = await this.decompressFile(filepath);
            }
            // Restaurar usando psql o método alternativo
            const dbConfig = database_1.AppDataSource.options;
            const psqlCommand = `psql ${dbConfig.url || `postgresql://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`} < "${sqlFile}"`;
            try {
                await execAsync(psqlCommand);
            }
            catch (psqlError) {
                // Alternativa: ejecutar SQL directamente
                console.log('⚠️ psql no disponible, usando método alternativo...');
                const sql = fs.readFileSync(sqlFile, 'utf8');
                await database_1.AppDataSource.query(sql);
            }
            // Limpiar archivo temporal
            if (filepath.endsWith('.gz') && fs.existsSync(sqlFile)) {
                fs.unlinkSync(sqlFile);
            }
            console.log('✅ Backup restaurado exitosamente');
        }
        catch (error) {
            console.error('❌ Error restaurando backup:', error);
            throw error;
        }
    }
    /**
     * Descomprimir archivo
     */
    async decompressFile(filepath) {
        const gunzip = require('zlib').createGunzip();
        const outputPath = filepath.replace('.gz', '');
        const source = fs.createReadStream(filepath);
        const destination = fs.createWriteStream(outputPath);
        return new Promise((resolve, reject) => {
            source.pipe(gunzip).pipe(destination)
                .on('finish', () => resolve(outputPath))
                .on('error', reject);
        });
    }
    /**
     * Listar backups disponibles
     */
    listBackups() {
        const files = fs.readdirSync(this.backupDir)
            .filter(file => file.startsWith('backup_'))
            .map(file => {
            const stats = fs.statSync(path.join(this.backupDir, file));
            return {
                name: file,
                size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
                date: stats.mtime
            };
        })
            .sort((a, b) => b.date.getTime() - a.date.getTime());
        return files;
    }
    /**
     * Limpiar backups antiguos
     */
    async cleanOldBackups() {
        const backups = this.listBackups();
        if (backups.length > this.maxBackups) {
            const toDelete = backups.slice(this.maxBackups);
            for (const backup of toDelete) {
                const filepath = path.join(this.backupDir, backup.name);
                fs.unlinkSync(filepath);
                console.log(`🗑️ Backup antiguo eliminado: ${backup.name}`);
            }
        }
    }
    /**
     * Programar backups automáticos
     */
    scheduleAutoBackups() {
        // Backup cada 6 horas
        cron.schedule('0 */6 * * *', async () => {
            console.log('⏰ Ejecutando backup automático...');
            try {
                await this.createBackup();
                // Si está configurado, subir a la nube
                if (process.env.ENABLE_CLOUD_BACKUP === 'true') {
                    await this.uploadToCloud();
                }
            }
            catch (error) {
                console.error('❌ Error en backup automático:', error);
            }
        });
        console.log('✅ Backups automáticos programados (cada 6 horas)');
    }
    /**
     * Subir backup a la nube (GitHub, Google Drive, etc.)
     */
    async uploadToCloud() {
        // Implementar según el servicio configurado
        console.log('☁️ Subiendo backup a la nube...');
        // Ejemplo: Subir a un repositorio Git
        if (process.env.GITHUB_BACKUP_REPO) {
            try {
                const commands = [
                    `cd ${this.backupDir}`,
                    'git add .',
                    `git commit -m "Backup automático ${new Date().toISOString()}"`,
                    'git push origin main'
                ].join(' && ');
                await execAsync(commands);
                console.log('✅ Backup subido a GitHub');
            }
            catch (error) {
                console.log('⚠️ No se pudo subir a GitHub');
            }
        }
    }
    /**
     * Obtener estado del sistema de backups
     */
    getStatus() {
        const backups = this.listBackups();
        const totalSize = backups.reduce((acc, b) => {
            const size = parseFloat(b.size.replace(' MB', ''));
            return acc + size;
        }, 0);
        return {
            totalBackups: backups.length,
            latestBackup: backups[0] || null,
            totalSize: `${totalSize.toFixed(2)} MB`,
            maxBackups: this.maxBackups,
            autoBackup: true,
            cloudBackup: process.env.ENABLE_CLOUD_BACKUP === 'true'
        };
    }
}
exports.BackupService = BackupService;
exports.backupService = new BackupService();
//# sourceMappingURL=BackupService.js.map