# Guía de Sincronización de Esquema de Base de Datos

## Problema Resuelto
Se implementó un sistema de migraciones y validación para prevenir errores de desincronización entre las entidades TypeORM y la base de datos CockroachDB.

### Errores que esto previene:
- Campos definidos en entidades pero no existentes en la BD
- Tipos de datos inconsistentes entre código y BD
- Campos faltantes que causan errores en runtime
- Pérdida de datos por sincronización automática

## Sistema Implementado

### 1. Configuración de Migraciones
- **Archivo:** `ormconfig.ts`
- **Ubicación de migraciones:** `src/migrations/`
- **synchronize:** false (NUNCA cambiar a true en producción)

### 2. Scripts NPM Disponibles

```bash
# Validar esquema actual
npm run schema:validate

# Generar migración automática
npm run migration:generate -- src/migrations/NombreDeMigracion

# Aplicar migraciones pendientes
npm run migration:run

# Revertir última migración
npm run migration:revert

# Ver migraciones aplicadas
npm run migration:show
```

## Flujo de Trabajo para Cambios en Entidades

### Paso 1: Modificar la Entidad
```typescript
// Ejemplo: Agregar nuevo campo a Prescription
@Column({ nullable: true })
newField: string;
```

### Paso 2: Validar Cambios
```bash
npm run schema:validate
```
Este comando mostrará:
- ❌ Campos faltantes en la BD
- ⚠️ Advertencias de inconsistencias
- ✅ Tablas sincronizadas correctamente

### Paso 3: Generar Migración
```bash
npm run migration:generate -- src/migrations/AddNewFieldToPrescription
```

### Paso 4: Revisar la Migración
- Verificar el archivo generado en `src/migrations/`
- Asegurar que solo contenga los cambios deseados
- Editar si es necesario para mayor claridad

### Paso 5: Aplicar Migración
```bash
npm run migration:run
```

### Paso 6: Verificar
```bash
npm run schema:validate
```

## Prevención de Errores Futuros

### ✅ SIEMPRE hacer:
1. Ejecutar `npm run schema:validate` antes de hacer cambios
2. Crear migraciones para TODOS los cambios en entidades
3. Revisar migraciones antes de aplicarlas
4. Mantener `synchronize: false` en producción
5. Hacer backup antes de migraciones grandes

### ❌ NUNCA hacer:
1. Cambiar `synchronize` a true en producción
2. Modificar tablas directamente en la BD sin migración
3. Ignorar advertencias del validador de esquema
4. Aplicar migraciones sin revisar
5. Eliminar migraciones ya aplicadas

## Ejemplo Real: Campos Faltantes en Prescription

### Problema Detectado:
```
❌ Campo 'quantity' definido en la entidad pero NO EXISTE en la tabla
❌ Campo 'externalPharmacy' definido en la entidad pero NO EXISTE en la tabla
❌ Campo 'purchaseDate' definido en la entidad pero NO EXISTE en la tabla
```

### Solución Aplicada:
1. Se ejecutó validación de esquema
2. Se generó migración automática
3. Se simplificó la migración para solo agregar campos faltantes
4. Se aplicó la migración
5. Se verificó corrección con validación

### Migración Resultante:
```typescript
export class AddMissingPrescriptionFields1758032063257 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "quantity" int8 NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "externalPharmacy" varchar`);
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD COLUMN IF NOT EXISTS "purchaseDate" timestamp`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP COLUMN IF EXISTS "purchaseDate"`);
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP COLUMN IF EXISTS "externalPharmacy"`);
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP COLUMN IF EXISTS "quantity"`);
    }
}
```

## Monitoreo Continuo

### Script de Validación
Ejecutar periódicamente (recomendado: antes de cada deploy):
```bash
npm run schema:validate
```

### Integración con CI/CD
Agregar al pipeline de deployment:
```yaml
- name: Validate Schema
  run: npm run schema:validate

- name: Run Migrations
  run: npm run migration:run
```

## Troubleshooting

### Error: "column X does not exist"
1. Ejecutar `npm run schema:validate`
2. Generar migración para campos faltantes
3. Aplicar migración

### Error: "type mismatch"
1. Verificar tipo en entidad vs BD
2. Crear migración con cambio de tipo
3. Considerar impacto en datos existentes

### Error: "foreign key constraint"
1. Verificar orden de migraciones
2. Asegurar que tablas referenciadas existan
3. Revisar cascadas de eliminación

## Contacto y Soporte
Para problemas con sincronización de esquema:
1. Ejecutar validación completa
2. Revisar este documento
3. Generar migración siguiendo el flujo
4. Documentar cambios realizados