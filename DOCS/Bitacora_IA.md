# Bitácora de Uso de IA (Sección 7)

**Proyecto Final — Bases de Datos III**
**Autores:** Carlos Rodrigo Díaz Camposeco, Bryan Alexander Pérez Santos

El presente documento detalla el uso estratégico de asistentes de Inteligencia Artificial (Gemini / Claude Code) durante el desarrollo de este proyecto, cumpliendo con los lineamientos de transparencia y uso responsable establecidos en la rúbrica. El código core de bases de datos (vistas, funciones, stored procedures y triggers) fue desarrollado y comprendido por nosotros, utilizando la IA principalmente como herramienta de apoyo, depuración y simulación.

## 1. Estrategia de Respaldo y Disaster Recovery (PostgreSQL & Docker)

* **¿Qué le pedimos a la IA?**
    Solicitamos asesoría para diseñar una "herramienta equivalente" al WAL Archiving que funcionara de manera segura dentro de un entorno de Docker, así como la estructura base para los scripts `.sh` de Backup Full y Backup Incremental usando `pg_dump`.
* **Modificaciones manuales realizadas:**
    Adaptamos las rutas de salida a los directorios locales del servidor (`/home/hidan/backups`), inyectamos nuestras credenciales y ajustamos las sentencias de ejecución para que el servicio de Docker procesara los comandos con privilegios de administrador (`sudo`). También implementamos el comando `TRUNCATE CASCADE` manualmente durante las pruebas para evitar choques de llaves primarias al restaurar el incremental.
* **Errores de la IA que tuvimos que corregir:**
    * **Corrupción del archivo `.dump`:** La IA sugirió inicialmente incluir la bandera `-t` (pseudo-TTY) en el comando `docker exec`. Al ejecutar esto, Docker inyectó saltos de línea incompatibles que corrompieron el archivo binario. Cuando intentamos hacer el `pg_restore`, la base de datos quedó vacía y obtuvimos el error `input file is too short (read 0, expected 5)`. Diagnosticamos el problema y eliminamos el parámetro `-t` del script para garantizar la integridad del archivo.

## 2. Análisis de Performance y Optimización (EXPLAIN ANALYZE)

* **¿Qué le pedimos a la IA?**
    Pedimos asistencia para comprender cómo extraer y comparar las métricas empíricas del motor de PostgreSQL para validar la creación de nuestros 5 índices (B-Tree y Bitmap). 
* **Modificaciones manuales realizadas:**
    Personalizamos absolutamente todos los queries de prueba para que encajaran con las reglas de negocio de nuestra clínica (filtrando por IDs específicos de médicos, fechas simuladas y estados financieros reales de la capa de datos).
* **Errores de la IA que tuvimos que corregir:**
    * **Ocultamiento de resultados en pgAdmin:** La IA nos proporcionó scripts de prueba encapsulados en bloques transaccionales (`BEGIN; ... COMMIT;`). Al ejecutar esto en pgAdmin, la interfaz ocultaba la salida del plan de ejecución (Data Output) y solo mostraba el mensaje genérico del `COMMIT`. Tuvimos que reestructurar la metodología para ejecutar las variables de sesión paso a paso.
    * **Falso Negativo con Índices (Seq Scan forzado):** Al intentar obtener las métricas de optimización ("El Después"), la IA sugirió apagar los índices (`SET enable_indexscan = off;`) para el antes, y encenderlos para el después. Sin embargo, debido al volumen moderado de nuestros datos de prueba (ej. 200 filas), el motor de Postgres insistía en hacer un *Seq Scan* por considerarlo más económico, arrojando la advertencia `Disabled: true`. Tuvimos que investigar y aplicar un control más estricto usando `SET enable_seqscan = off;` para forzar al planificador a evaluar el árbol B-Tree y así obtener las verdaderas métricas de impacto que se verían en producción.

## 3. Capa de Aplicación (API Express) y Generación de Datos de Prueba

* **¿Qué le pedimos a la IA?**
    Generación de scripts automatizados (seeders) utilizando librerías como Faker para poblar la base de datos con historiales médicos, citas y facturas masivas. También pedimos ejemplos de estructuración de rutas y validaciones HTTP básicas en Node.js.
* **Modificaciones manuales realizadas:**
    Filtramos y adaptamos los tipos de datos generados para que respetaran nuestras restricciones `CHECK` y enums de la base de datos (por ejemplo, asegurar que los estados de factura solo fueran 'pendiente', 'pagada_parcial' o 'pagada').
* **Errores de la IA que tuvimos que corregir:**
    La IA ocasionalmente generaba datos que violaban nuestras reglas de integridad referencial (asignando pagos a IDs de facturas inexistentes). Tuvimos que intervenir los scripts de seed para garantizar que el orden de inserción respetara las llaves foráneas creadas en nuestra arquitectura.