# Clinica Medica BD

Sistema de gestion para clinica medica privada. Backend Node.js/Express con PostgreSQL y MongoDB, frontend React/Vite con Tailwind CSS.

## Requisitos

- **Node.js** 18+
- **PostgreSQL** (puerto por defecto: 5432, configurable)
- **MongoDB** (local o Atlas)

## Instalacion

```bash
# Backend (raiz del proyecto)
npm install

# Frontend
cd client && npm install
```

## Configuracion

Crear `.env` en la raiz a partir del ejemplo:

```bash
cp .env.example .env
```

Variables disponibles:

| Variable | Descripcion | Default |
|----------|-------------|---------|
| `PG_HOST` | Host de PostgreSQL | `localhost` |
| `PG_PORT` | Puerto de PostgreSQL | `5432` |
| `PG_DATABASE` | Nombre de la base de datos | `clinica_db` |
| `PG_USER` | Usuario de PostgreSQL | — |
| `PG_PASSWORD` | Contrasena de PostgreSQL | — |
| `MONGO_URI` | URI de conexion MongoDB | `mongodb://localhost:27017` |
| `MONGO_DB` | Nombre de la base MongoDB | `clinica_db_mongo` |
| `PORT` | Puerto del servidor Express | `3000` |

## Base de datos

La aplicacion **no crea las tablas** ni los objetos de base de datos. Estos deben existir previamente en PostgreSQL:

### Funciones y procedimientos almacenados

| Tipo | Nombre | Parametros | Usado por |
|------|--------|------------|-----------|
| Funcion | `calcular_disponibilidad` | `medico_id INT, fecha DATE, hora TIME` | Crear cita |
| Funcion | `get_horarios_libres` | `medico_id INT, fecha DATE` | Horarios libres |
| Procedimiento | `cancelar_cita` | `cita_id INT, motivo TEXT, usuario TEXT` | Cancelar cita |
| Procedimiento | `registrar_pago` | `factura_id INT, monto NUMERIC, usuario TEXT` | Registrar pago |
| Funcion | `get_saldo_paciente` | `paciente_id INT` | Saldo paciente |

### Vistas y vistas materializadas

| Tipo | Nombre | Usado por |
|------|--------|-----------|
| Vista | `v_agenda_diaria` | Reportes (definida, sin ruta activa) |
| Vista | `v_facturas_pendientes` | Reportes (definida, sin ruta activa) |
| Vista materializada | `vm_ranking_trimestral_medicos` | Ranking de medicos |
| Vista materializada | `vm_facturacion_mensual` | Facturacion mensual |

### Coleccion MongoDB

La aplicacion usa la coleccion `historiales_clinicos` en la base de datos MongoDB configurada. No requiere creacion manual (MongoDB la crea al insertar).

## Datos de prueba (seed)

Solo existe seed para MongoDB (150 historiales clinicos falsos):

```bash
node src/seed/seed_mongo.js
```

> **Nota:** El seed usa `@faker-js/faker`. Si falla con error de modulo no encontrado, instalar manualmente:
> ```bash
> npm install @faker-js/faker
> ```
> El seed ejecuta `process.exit(0)` al terminar, por lo que debe ejecutarse como script independiente, no con `npm run`.

**No existe seed para PostgreSQL** — los datos transaccionales (citas, facturas, pagos) deben insertarse via API o manualmente.

## Ejecucion

Ambos servidores deben ejecutarse simultaneamente:

```bash
# Terminal 1: Backend (puerto configurado en PORT, default 3000)
npm run dev          # modo desarrollo con recarga automatica (nodemon)
# npm start          # modo produccion

# Terminal 2: Frontend (http://localhost:5173)
cd client && npm run dev
```

El frontend en modo desarrollo proxy `/api/*` → `http://localhost:3001/*` (eliminando el prefijo `/api`). Si cambias `PORT` en el backend, ajusta `client/vite.config.js`.

## API Endpoints

Todos los endpoints responden con el formato:

```json
{
  "success": true,
  "data": { },
  "error": null
}
```

### Citas

| Metodo | Ruta | Body / Query | Descripcion |
|--------|------|-------------|-------------|
| `POST` | `/citas` | `{ paciente_id, medico_id, fecha, hora }` | Crear cita (valida disponibilidad) |
| `PUT` | `/citas/:id/cancelar` | `{ motivo, usuario }` | Cancelar cita |
| `GET` | `/citas/horarios-libres` | `?medico_id=&fecha=` | Horarios disponibles del medico |

### Pagos

| Metodo | Ruta | Body / Query | Descripcion |
|--------|------|-------------|-------------|
| `POST` | `/pagos` | `{ factura_id, monto, usuario }` | Registrar pago |
| `GET` | `/pagos/saldo/:paciente_id` | — | Saldo pendiente del paciente |

### Historiales Clinicos (MongoDB)

| Metodo | Ruta | Body | Descripcion |
|--------|------|------|-------------|
| `POST` | `/historiales` | Documento completo (ver seccion abajo) | Crear historial clinico |
| `GET` | `/historiales/paciente/:id` | — | Historial cronologico del paciente |

### Reportes

| Metodo | Ruta | Query | Descripcion |
|--------|------|-------|-------------|
| `GET` | `/reportes/ranking-medicos` | — | Ranking trimestral de medicos (PostgreSQL) |
| `GET` | `/reportes/facturacion-mensual` | — | Facturacion mensual (PostgreSQL) |
| `GET` | `/reportes/top-diagnosticos` | `?fecha_inicio=` | Top 5 diagnosticos por especialidad (MongoDB) |
| `GET` | `/reportes/medicamentos-por-especialidad` | — | Medicamentos por especialidad con % (MongoDB) |
| `GET` | `/reportes/analisis-avanzado` | — | Signos vitales por edad + intervalos entre consultas (MongoDB) |

### Health

```
GET /health → { success: true, data: { status: "ok" }, error: null }
```

### Ejemplo: crear historial clinico

```json
{
  "cita_id": 1001,
  "paciente_id": 5,
  "medico_id": 3,
  "especialidad": "Cardiologia",
  "fecha_consulta": "2025-06-01T10:30:00Z",
  "fecha_nacimiento_paciente": "1980-03-15",
  "datos_base": {
    "motivo_consulta": "Dolor en el pecho",
    "signos_vitales": {
      "presion_arterial_sistolica": 135,
      "presion_arterial_diastolica": 85,
      "frecuencia_cardiaca": 72,
      "temperatura": 36.5,
      "peso_kg": 70.5
    },
    "notas_adicionales": "Paciente refiere dolor intermitente"
  },
  "diagnosticos": [
    { "codigo_cie10": "I25", "descripcion": "Enfermedad cardiaca isquemica cronica", "tipo": "Presuntivo" }
  ],
  "medicamentos_recetados": [
    { "nombre": "Atorvastatina", "dosis": "20mg", "frecuencia": "cada 24 horas", "duracion_dias": 30 }
  ],
  "examenes_solicitados": ["Electrocardiograma", "Perfil lipidico"],
  "datos_especificos_especialidad": {
    "antecedentes_cardiovasculares": "hipertension",
    "dolor_escala_1_a_10": 5,
    "ritmo_cardiaco_regular": true
  }
}
```

## Estructura del proyecto

```
.
├── src/
│   ├── app.js                    # Entrada del servidor Express
│   ├── config/
│   │   ├── mongodb.js            # Conexion MongoDB (MongoClient nativo)
│   │   └── postgres.js           # Pool PostgreSQL (pg)
│   ├── controllers/              # Manejo de requests, validacion, respuestas
│   ├── routes/                   # Definicion de rutas
│   ├── services/
│   │   ├── mongo.service.js      # CRUD y aggregations para historiales
│   │   └── postgres.service.js   # Queries SQL y llamadas a funciones/SP
│   └── seed/
│       └── seed_mongo.js         # Generacion de datos MongoDB
├── client/
│   ├── src/
│   │   ├── main.jsx              # Entrada React (BrowserRouter + ThemeProvider)
│   │   ├── api/                  # Cliente Axios y funciones por recurso
│   │   ├── pages/                # Vistas organizadas por modulo
│   │   ├── components/           # Layout, Alert, EmptyState, Loading
│   │   └── context/              # ThemeContext (dark/light mode)
│   └── vite.config.js            # Proxy /api → backend
├── .env.example
├── package.json
└── README.md
```

## Stack tecnologico

- **Backend:** Node.js, Express v5, `pg` (driver nativo, sin ORM), `mongodb` (driver nativo)
- **Frontend:** React 18, Vite 5, Tailwind CSS 3, React Router 6, Axios
- **Bases de datos:** PostgreSQL (transaccional) + MongoDB (historiales clinicos)
