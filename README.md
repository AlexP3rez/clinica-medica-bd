# Clinica API

API REST para sistema de clinica medica privada. Utiliza Node.js + Express con PostgreSQL (via `pg`) y MongoDB (driver nativo).

## Instalacion

```bash
cd clinica-api
npm install
```

## Configuracion

Editar el archivo `.env` con los datos de conexion:

```env
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=clinica_db
PG_USER=hidan
PG_PASSWORD=TU_PASSWORD
MONGO_URI=mongodb://localhost:27017
MONGO_DB=clinica_db_mongo
PORT=3000
```

## Seeds

Poblar la base de datos con datos de prueba:

```bash
# PostgreSQL: citas, facturas, pagos, log_auditoria
node src/seed/seed_postgres.js

# MongoDB: historiales clinicos
node src/seed/seed_mongo.js
```

O ejecutar ambos seeds:

```bash
npm run seed
```

## Iniciar servidor

```bash
node src/app.js
# o
npm start
```

Modo desarrollo con reinicio automatico:

```bash
npm run dev
```

## Endpoints

### Citas

| Metodo | Ruta                        | Body / Query Params                            | Respuesta                                    |
|--------|-----------------------------|------------------------------------------------|----------------------------------------------|
| POST   | /citas                      | `{ paciente_id, medico_id, fecha, hora }`      | 201: cita creada / 409: horario no disponible |
| PUT    | /citas/:id/cancelar         | `{ motivo, usuario }`                          | 200: cita cancelada / 400: error del SP       |
| GET    | /citas/horarios-libres      | `?medico_id=&fecha=`                           | 200: array de horarios libres                 |

### Pagos

| Metodo | Ruta                        | Body / Query Params                            | Respuesta                                    |
|--------|-----------------------------|------------------------------------------------|----------------------------------------------|
| POST   | /pagos                      | `{ factura_id, monto, usuario }`               | 201: pago registrado / 400: error del SP      |
| GET    | /pagos/saldo/:paciente_id   | -                                              | 200: saldo del paciente / 404: no encontrado  |

### Historiales (MongoDB)

| Metodo | Ruta                        | Body                                            | Respuesta                                    |
|--------|-----------------------------|-------------------------------------------------|----------------------------------------------|
| POST   | /historiales                | Documento historial clinico completo             | 201: documento insertado / 400: error validacion |
| GET    | /historiales/paciente/:id   | -                                               | 200: historial cronologico / 404: sin datos   |

### Reportes

| Metodo | Ruta                                  | Query Params          | Respuesta                                    |
|--------|---------------------------------------|-----------------------|----------------------------------------------|
| GET    | /reportes/ranking-medicos             | -                     | Array con ranking trimestral de medicos       |
| GET    | /reportes/facturacion-mensual         | -                     | Array con facturacion mensual                 |
| GET    | /reportes/top-diagnosticos            | `?fecha_inicio=`      | Top 5 diagnosticos por especialidad           |
| GET    | /reportes/medicamentos-por-especialidad | -                   | Medicamentos por especialidad con porcentajes |
| GET    | /reportes/analisis-avanzado           | -                     | Signos vitales por edad + tiempos entre consultas |

## Formato de respuesta

Todos los endpoints responden con:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

## Health check

```
GET /health → { "success": true, "data": { "status": "ok" }, "error": null }
```
