const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs');

// Cargar variables de entorno desde .env (en entorno local)
dotenv.config();

// Inicializar la aplicación Express
const app = express();

// ============================================================================
// 1. MIDDLEWARES GLOBALES & SEGURIDAD
// ============================================================================

// Protección de cabeceras HTTP con Helmet
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Configuración dinámica y segura de CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5000'
];

if (process.env.FRONTEND_URL) {
    const customOrigins = process.env.FRONTEND_URL.split(',').map(u => u.trim().replace(/\/+$/, ''));
    allowedOrigins.push(...customOrigins);
}

app.use(cors({
    origin: (origin, callback) => {
        // Permitir peticiones sin origen (como Postman, curl o llamadas directas server-to-server)
        if (!origin) return callback(null, true);

        // Si FRONTEND_URL es '*', permitir todos los orígenes
        if (process.env.FRONTEND_URL === '*' || allowedOrigins.includes('*')) {
            return callback(null, true);
        }

        // Permitir orígenes configurados
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Permitir localhost / 127.0.0.1 en desarrollo
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }

        // Permitir cualquier subdominio de Cloudflare Pages (*.pages.dev)
        if (origin.endsWith('.pages.dev')) {
            return callback(null, true);
        }

        // Fallback permisivo para evitar que la tienda pública bloquee clientes
        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Soporte de Chrome Private Network Access (PNA) para Live Server (127.0.0.1 / localhost)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Private-Network', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Middleware de limitación de tasa (Rate Limiting) adaptado para Node y Cloudflare Workers
// En Workers la protección DDoS es nativa en la red Edge, y se evita crear timers en global scope
let rateLimitModule = null;
let generalLimiter = null;
let authLimiter = null;

const generalLimiterMiddleware = (req, res, next) => {
    // Si estamos en Cloudflare Workers (runtime serverless), delegamos la protección a Cloudflare
    if (typeof WebSocketPair !== 'undefined') {
        return next();
    }
    if (!generalLimiter) {
        try {
            if (!rateLimitModule) rateLimitModule = require('express-rate-limit');
            generalLimiter = rateLimitModule({
                windowMs: 15 * 60 * 1000,
                max: 200,
                standardHeaders: true,
                legacyHeaders: false,
                message: { success: false, message: 'Demasiadas peticiones desde esta IP. Intenta más tarde.' }
            });
        } catch (e) {
            generalLimiter = (r, s, n) => n();
        }
    }
    return generalLimiter(req, res, next);
};

const authLimiterMiddleware = (req, res, next) => {
    if (typeof WebSocketPair !== 'undefined') {
        return next();
    }
    if (!authLimiter) {
        try {
            if (!rateLimitModule) rateLimitModule = require('express-rate-limit');
            authLimiter = rateLimitModule({
                windowMs: 15 * 60 * 1000,
                max: 10,
                standardHeaders: true,
                legacyHeaders: false,
                message: { success: false, message: 'Demasiados intentos fallidos. Bloqueado temporalmente.' }
            });
        } catch (e) {
            authLimiter = (r, s, n) => n();
        }
    }
    return authLimiter(req, res, next);
};

app.use('/api', generalLimiterMiddleware);

// Parseo de cuerpos de petición en formato JSON con límite de tamaño
app.use(express.json({ limit: '10mb' }));

// Parseo de datos enviados por formularios url-encoded
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para asegurar conexión a MongoDB en cada petición serverless a /api
app.use(async (req, res, next) => {
    if (req.path.startsWith('/api')) {
        try {
            await connectDB();
        } catch (dbErr) {
            console.warn('⚠️ Base de datos no conectada para esta petición:', dbErr.message);
        }
    }
    next();
});

// Logger básico de peticiones en consola para desarrollo
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// ============================================================================
// 2. RUTAS ESTÁTICAS Y DE LA API
// ============================================================================

// Servir archivos estáticos del frontend únicamente en entorno Node.js tradicional
if (typeof __dirname !== 'undefined') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    app.use(express.static(path.join(__dirname, '../frontend/public')));
    app.use('/frontend', express.static(path.join(__dirname, '../frontend')));
    app.use(express.static(path.join(__dirname, '../frontend')));
    app.use(express.static(path.join(__dirname, '..')));

    // Rutas del frontend (React SPA fallback si corre junto con Node local)
    app.get(['/admin*', '/nuevo_producto*', '/nuevo-producto*'], (req, res) => {
        const distIndex = path.join(__dirname, '../frontend/dist/index.html');
        if (fs.existsSync(distIndex)) return res.sendFile(distIndex);
        return res.sendFile(path.join(__dirname, '../frontend/index.html'));
    });

    // Ruta raíz para servir la aplicación React en local
    app.get('/', (req, res) => {
        const distIndex = path.join(__dirname, '../frontend/dist/index.html');
        if (fs.existsSync(distIndex)) return res.sendFile(distIndex);
        const rootIndex = path.join(__dirname, '../index.html');
        if (fs.existsSync(rootIndex)) return res.sendFile(rootIndex);
        return res.sendFile(path.join(__dirname, '../frontend/index.html'));
    });
} else {
    // En Cloudflare Workers, la raíz responde con bienvenida y descripción de la API
    app.get('/', (req, res) => {
        res.status(200).json({
            success: true,
            message: '🍰 API REST de Serenoa Pastelería Artesanal en Cloudflare Workers',
            version: '1.0.0',
            endpoints: {
                productos: '/api/productos',
                pedidos: '/api/pedidos'
            }
        });
    });
}

// Ruta explícita para favicon.ico
app.get('/favicon.ico', (req, res) => {
    if (typeof __dirname !== 'undefined') {
        const icoInDist = path.join(__dirname, '../frontend/dist/favicon.ico');
        const icoInPublic = path.join(__dirname, '../frontend/public/favicon.ico');
        if (fs.existsSync(icoInDist)) return res.sendFile(icoInDist);
        if (fs.existsSync(icoInPublic)) return res.sendFile(icoInPublic);
    }
    res.status(204).end();
});

// Endpoint de autenticación segura de Administrador
app.post('/api/auth/login', authLimiterMiddleware, (req, res) => {
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

// Endpoint informativo de la API
app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🍰 Bienvenido a la API REST de Serenoa Pastelería Artesanal',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'production',
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
// 4. INICIALIZACIÓN DEL SERVIDOR (MODO LOCAL)
// ============================================================================

if (require.main === module) {
    connectDB().catch(err => console.error('Conexión inicial fallida:', err.message));
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor Serenoa Backend corriendo en http://localhost:${PORT}`);
        console.log(`📦 Endpoints listos:`);
        console.log(`   - GET/POST       http://localhost:${PORT}/api/productos`);
        console.log(`   - GET/POST       http://localhost:${PORT}/api/pedidos`);
    });
}

// Exportar app para Cloudflare Workers o pruebas
module.exports = app;
