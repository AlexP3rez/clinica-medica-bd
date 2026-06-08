#!/bin/bash
# Script de Backup Full para Clínica Médica Privada
# Se ejecuta vía Cron todos los domingos a las 02:00 AM

FECHA=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/hidan/backups"
CONTENEDOR="postgres-db"
USUARIO="hidan"
DB="clinica_db"
ARCHIVO="$BACKUP_DIR/clinica_db_full_$FECHA.dump"

echo "Iniciando Backup Full de la base de datos $DB..."

# Ejecutar pg_dump dentro del contenedor Docker (SIN la bandera -t)
sudo docker exec $CONTENEDOR pg_dump -U $USUARIO -Fc $DB > $ARCHIVO

echo "Backup Full completado y guardado en: $ARCHIVO"