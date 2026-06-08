# 5.6 Estrategia de Respaldo: Política de Retención

Esta sección documenta las normativas establecidas para la generación, almacenamiento y depuración de las copias de seguridad de la base de datos `clinica_db`. El objetivo principal es garantizar la disponibilidad de los datos ante cualquier desastre, asegurando una recuperación rápida y optimizando el espacio de almacenamiento en el servidor.

## 1. Frecuencia de Respaldos (Scheduling)

La estrategia se divide en dos niveles de ejecución que trabajan en conjunto para proteger la información:

* **Backup Full (Completo):** Se ejecuta **1 vez por semana**, programado para todos los domingos a las 02:00 AM (horario de nula concurrencia). Este respaldo extrae la base de datos entera en formato binario comprimido (`-Fc`), guardando la estructura, catálogos estáticos y todo el historial de datos.
* **Backup Incremental (Lógico):** Se ejecuta **cada 6 horas** (00:00, 06:00, 12:00, 18:00). Captura de manera ágil únicamente la información nueva o modificada de las tablas transaccionales (`citas`, `facturas`, `pagos`, `detalles_factura`, `log_auditoria`) en formato de texto plano (`.sql`).

## 2. Tiempo de Retención y Volumen

Para evitar la saturación del disco duro del servidor, se aplica la siguiente política de depuración cíclica:

* **Retención de Backups Full:** Se conservan por **4 semanas (1 mes)**.
    * *Límite físico:* El servidor almacena un máximo de 4 archivos `.dump` simultáneos. Cuando se genera el respaldo de la quinta semana, el archivo más antiguo se elimina automáticamente.
* **Retención de Backups Incrementales:** Se conservan por **7 días (1 semana)**.
    * *Límite físico:* El servidor almacena un máximo de 28 archivos `.sql` simultáneos (4 diarios × 7 días). Al completarse la semana, los incrementales más viejos se purgan, ya que su información ha sido absorbida por el nuevo Backup Full dominical.

## 3. Justificación Técnica de la Política

Esta política fue diseñada considerando las siguientes métricas de recuperación (Disaster Recovery):
* **RPO (Recovery Point Objective):** Se garantiza una pérdida máxima de datos de **6 horas**. Si el servidor colapsa a las 11:50 AM, el sistema se restaura utilizando el Backup Full del domingo más el Incremental de las 06:00 AM de ese día. Las transacciones ocurridas en esa ventana de 5 horas y 50 minutos representan el único margen de pérdida, el cual es aceptable y puede reconstruirse mediante los registros físicos de recepción.
* **RTO (Recovery Time Objective):** Al tener una cantidad limitada y ordenada de archivos (1 Full base + un máximo de 28 scripts ligeros), el tiempo que el administrador invierte en inyectar los datos en un contenedor limpio es mínimo, permitiendo reanudar la operación de la clínica en cuestión de minutos.