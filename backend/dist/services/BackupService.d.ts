export declare class BackupService {
    private backupDir;
    private maxBackups;
    constructor();
    private ensureBackupDirectory;
    /**
     * Crear backup de la base de datos
     */
    createBackup(): Promise<string>;
    /**
     * Exportar datos usando TypeORM (alternativa a pg_dump)
     */
    private exportUsingTypeORM;
    /**
     * Comprimir archivo
     */
    private compressFile;
    /**
     * Restaurar backup
     */
    restoreBackup(filename: string): Promise<void>;
    /**
     * Descomprimir archivo
     */
    private decompressFile;
    /**
     * Listar backups disponibles
     */
    listBackups(): Array<{
        name: string;
        size: string;
        date: Date;
    }>;
    /**
     * Limpiar backups antiguos
     */
    private cleanOldBackups;
    /**
     * Programar backups automáticos
     */
    private scheduleAutoBackups;
    /**
     * Subir backup a la nube (GitHub, Google Drive, etc.)
     */
    private uploadToCloud;
    /**
     * Obtener estado del sistema de backups
     */
    getStatus(): any;
}
export declare const backupService: BackupService;
//# sourceMappingURL=BackupService.d.ts.map