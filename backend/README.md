# 🍰 Serenoa Backend - API REST

API REST para la pastelería **Serenoa**, construida con **Node.js**, **Express.js** y **MongoDB (Mongoose)**.

---

## 📁 Estructura del Proyecto

```text
backend/
├── config/
│   └── db.js                 # Conexión a MongoDB con Mongoose
├── controllers/
│   ├── productController.js  # Lógica de negocio de Productos (CRUD)
│   └── orderController.js    # Lógica de negocio de Pedidos
├── models/
│   ├── Product.js            # Esquema Mongoose para Productos
│   └── Order.js              # Esquema Mongoose para Pedidos / Órdenes
├── routes/
│   ├── productRoutes.js      # Definición de rutas /api/productos
│   └── orderRoutes.js        # Definición de rutas /api/pedidos
├── .env                      # Variables de entorno locales
├── .env.example              # Plantilla de variables de entorno
├── package.json              # Dependencias y scripts de Node.js
├── seed.js                   # Script para insertar datos de prueba iniciales
└── server.js                 # Punto de entrada principal y servidor Express
```

---

## ⚙️ Requisitos Previos

1. **Node.js** (versión 16 o superior): [Descargar Node.js](https://nodejs.org/)
2. **MongoDB** (Local o MongoDB Atlas):
   - Local: MongoDB Community Server corriendo en `mongodb://127.0.0.1:27017/serenoa_db`
   - Opcional: MongoDB Compass para ver tus datos gráficamente.

---

## 🚀 Instalación y Puesta en Marcha

### 1. Instalar dependencias
Abre tu terminal en la carpeta `backend/` y ejecuta:
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno
Verifica que el archivo `.env` contenga los valores adecuados:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/serenoa_db
NODE_ENV=development
```

### 3. Poblar la base de datos con datos de prueba (Opcional pero recomendado)
Ejecuta el script seeder para insertar pasteles y pedidos de ejemplo:
```bash
npm run seed
```

### 4. Iniciar el servidor
- **Modo Producción / Normal:**
  ```bash
  npm start
  ```
- **Modo Desarrollo (con reinicio automático al guardar cambios):**
  ```bash
  npm run dev
  ```

El servidor quedará disponible en: `http://localhost:5000`

---

## 📡 Endpoints de la API REST

### 🍰 Productos (`/api/productos`)

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `GET` | `/api/productos` | Obtiene todos los productos (soporta filtros `?categoria=Tartas` o `?disponible=true`) | Público |
| `GET` | `/api/productos/:id` | Obtiene el detalle de un producto específico por ID | Público |
| `POST` | `/api/productos` | Agrega un nuevo pastel/producto al catálogo | Admin |
| `PUT` | `/api/productos/:id` | Edita/actualiza un producto existente | Admin |
| `DELETE` | `/api/productos/:id` | Elimina un producto del catálogo | Admin |

#### Ejemplo de cuerpo JSON para Crear Producto (`POST /api/productos`):
```json
{
  "nombre": "Tarta de Frutos Rojos y Crema",
  "descripcion": "Base crujiente de masa sableé con crema pastelera y mix de frutos rojos silvestres.",
  "precio": 16.50,
  "imagen": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=400&auto=format&fit=crop",
  "disponibilidad": true,
  "categoria": "Tartas",
  "stock": 10
}
```

---

### 📦 Pedidos (`/api/pedidos`)

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `GET` | `/api/pedidos` | Obtiene todos los pedidos (soporta filtros `?estado=Pendiente`) | Admin |
| `GET` | `/api/pedidos/:id` | Obtiene el detalle de un pedido por ID | Admin |
| `POST` | `/api/pedidos` | Registra un nuevo pedido desde el catálogo web | Cliente / Público |
| `PUT` | `/api/pedidos/:id` | Actualiza el estado del pedido (ej. estado de pago o logística) | Admin |
| `DELETE` | `/api/pedidos/:id` | Elimina o cancela un pedido | Admin |

#### Ejemplo de cuerpo JSON para Crear Pedido (`POST /api/pedidos`):
```json
{
  "cliente": {
    "nombre": "María Fernanda López",
    "email": "mafer.lopez@gmail.com",
    "telefono": "0991234567",
    "direccion": "Av. Samborondón Km 2.5",
    "metodoPago": "WhatsApp / Transferencia"
  },
  "productos": [
    {
      "nombre": "Tarta de Fresa Clásica",
      "cantidad": 1,
      "precioUnitario": 15.00
    },
    {
      "nombre": "Caja de Macarons Franceses (x6)",
      "cantidad": 2,
      "precioUnitario": 12.00
    }
  ],
  "total": 39.00,
  "notas": "Por favor enviar vela de cumpleaños."
}
```

#### Ejemplo de cuerpo JSON para Actualizar Estado (`PUT /api/pedidos/:id`):
```json
{
  "estado": "Pagado",
  "estadoPago": "Pagado",
  "estadoLogistica": "Entregado"
}
```
