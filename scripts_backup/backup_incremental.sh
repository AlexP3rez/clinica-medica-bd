#!/bin/bash
# Script de Backup Incremental (Equivalente lógico)
# Se ejecuta vía Cron cada 6 horas

FECHA=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/hidan/backups"
CONTENEDOR="postgres-db"
USUARIO="hidan"
DB="clinica_db"
ARCHIVO="$BACKUP_DIR/clinica_db_inc_$FECHA.sql"

echo "Iniciando Backup Incremental (Solo datos transaccionales)..."

# Volcar solo los datos (--data-only) de las tablas transaccionales
sudo docker exec $CONTENEDOR pg_dump -U $USUARIO --data-only -t citas -t facturas -t detalles_factura -t pagos -t log_auditoria -Fp $DB > $ARCHIVO

echo "Backup Incremental completado en: $ARCHIVO"