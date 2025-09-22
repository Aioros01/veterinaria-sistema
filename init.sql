-- Script de inicialización de la base de datos veterinaria
-- Este script crea las tablas necesarias y agrega datos de ejemplo

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear esquema si no existe
CREATE SCHEMA IF NOT EXISTS public;

-- Datos de ejemplo (se insertarán después de que TypeORM cree las tablas)
-- Nota: TypeORM creará las tablas automáticamente con synchronize: true

-- Usuario admin por defecto (password: admin123)
-- Se insertará después del primer arranque