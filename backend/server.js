const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Cargar variables de entorno desde .env
dotenv.config();

// Inicializar la aplicación Express
const app = express();

// Conectar a la base de datos MongoDB
connectDB();

// ============================================================================
// 1. MIDDLEWARES GLOBALES & SEGURIDAD
// ============================================================================

// Protección de cabeceras HTTP con Helmet
app.use(helmet({
    contentSecurityPolicy: false, // Permitir CDNs externos como Chart.js y Google Fonts
    crossOriginEmbedderPolicy: false
}));

// Limitador de peticiones generales (Previene ataques DoS / scraping abusivo)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 200, // Límite de 200 peticiones por ventana por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Demasiadas peticiones desde esta dirección IP. Por favor inténtalo más tarde.'
    }
});
app.use('/api', generalLimiter);

// Limitador estricto para autenticación de administrador (Previene ataques de fuerza bruta)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // Máximo 10 intentos fallidos
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Demasiados intentos de acceso fallidos. Bloqueado temporalmente por 15 minutos.'
    }
});

// Habilitar CORS para permitir peticiones controladas
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Soporte de Chrome Private Network Access (PNA) para Live Server (127.0.0.1 / localhost)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Private-Network', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Parseo de cuerpos de petición en formato JSON con límite de tamaño
app.use(express.json({ limit: '10mb' }));

// Parseo de datos enviados por formularios url-encoded
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger básico de peticiones en consola para desarrollo
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
    next();
});

const path = require('path');
const fs = require('fs');

// Servir archivos estáticos del frontend (React Vite build en dist, public y frontend general)
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '..')));

// Ruta explícita para favicon.ico
app.get('/favicon.ico', (req, res) => {
    const icoInDist = path.join(__dirname, '../frontend/dist/favicon.ico');
    const icoInPublic = path.join(__dirname, '../frontend/public/favicon.ico');
    if (fs.existsSync(icoInDist)) return res.sendFile(icoInDist);
    if (fs.existsSync(icoInPublic)) return res.sendFile(icoInPublic);
    res.status(204).end();
});

// ============================================================================
// 2. RUTAS DE LA API Y VISTAS
// ============================================================================

// Endpoint de autenticación segura de Administrador
app.post('/api/auth/login', authLimiter, (req, res) => {
    const { username, password } = req.body;
    const validUser = process.env.ADMIN_USER || 'admin';
    const validPass = process.env.ADMIN_PASS || 'serenoa2026';

    if (username === validUser && password === validPass) {
        const token = 'serenoa_secure_token_' + Date.now() + '_' + Math.random().toString(36).substring(2);
        return res.status(200).json({
            success: true,
            message: 'Autenticación exitosa',
            token,
            user: { username: validUser, role: 'admin' }
        });
    }

    return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Usuario o contraseña incorrectos.'
    });
});

// Rutas de la API REST
app.use('/api/productos', require('./routes/productRoutes'));
app.use('/api/pedidos', require('./routes/orderRoutes'));

// Rutas del frontend (React SPA fallback)
app.get(['/admin*', '/nuevo_producto*', '/nuevo-producto*'], (req, res) => {
    const distIndex = path.join(__dirname, '../frontend/dist/index.html');
    if (fs.existsSync(distIndex)) {
        return res.sendFile(distIndex);
    }
    const legacyAdmin = path.join(__dirname, '../frontend_legacy/admin.html');
    if (fs.existsSync(legacyAdmin)) {
        return res.sendFile(legacyAdmin);
    }
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Ruta raíz para servir la aplicación React
app.get('/', (req, res) => {
    const distIndex = path.join(__dirname, '../frontend/dist/index.html');
    if (fs.existsSync(distIndex)) {
        return res.sendFile(distIndex);
    }
    const rootIndex = path.join(__dirname, '../index.html');
    if (fs.existsSync(rootIndex)) {
        return res.sendFile(rootIndex);
    }
    return res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Endpoint informativo de la API
app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🍰 Bienvenido a la API REST de Serenoa Pastelería Artesanal',
        version: '1.0.0',
        endpoints: {
            productos: '/api/productos',
            pedidos: '/api/pedidos'
        }
    });
});

// ============================================================================
// 3. MANEJO DE ERRORES Y RUTAS NO ENCONTRADAS (404)
// ============================================================================

// Captura de rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
});

// Middleware centralizado de control de errores
app.use((err, req, res, next) => {
    console.error('❌ Error no controlado:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// ============================================================================
// 4. INICIALIZACIÓN DEL SERVIDOR
// ============================================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor Serenoa Backend corriendo en http://localhost:${PORT}`);
    console.log(`📦 Endpoints listos:`);
    console.log(`   - GET/POST       http://localhost:${PORT}/api/productos`);
    console.log(`   - GET/POST       http://localhost:${PORT}/api/pedidos`);
});
