const mongooseRaw = require('mongoose');
const mongoose = mongooseRaw.default || mongooseRaw;

// Configurar servidores DNS públicos si la plataforma lo permite (útil para registros SRV de Atlas en Node local)
try {
    const dns = require('dns');
    if (dns && typeof dns.setServers === 'function') {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
    }
} catch (e) {
    // Entornos como Workers o sandbox donde setServers no está disponible
}

// Variable en memoria para cachear la promesa de conexión en entornos serverless (Cloudflare Workers)
let cachedPromise = null;

/**
 * Conexión a MongoDB Atlas optimizada para entornos tradicionales y serverless
 */
const connectDB = async (customUri = null) => {
    // Si la conexión ya está establecida (readyState === 1: connected), reutilizarla inmediatamente
    if (mongoose.connection && mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    // Si ya hay una promesa de conexión en progreso (readyState === 2: connecting), esperar a que culmine
    if (cachedPromise && mongoose.connection.readyState === 2) {
        return await cachedPromise;
    }

    const uri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/serenoa_db';

    if (!uri) {
        console.warn('⚠️ MONGODB_URI no está definido en las variables de entorno.');
    }

    const options = {
        serverSelectionTimeoutMS: 8000, // Timeout para selección de réplica en Atlas
        connectTimeoutMS: 10000,        // Timeout de conexión inicial
        socketTimeoutMS: 45000,         // Timeout de inactividad de socket
        maxPoolSize: 10                 // Mantener pool ligero para entornos serverless
    };

    try {
        cachedPromise = mongoose.connect(uri, options);
        const conn = await cachedPromise;
        console.log(` Conexión exitosa a MongoDB: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
    } catch (error) {
        cachedPromise = null;
        console.error(`❌ Error al conectar a MongoDB: ${error.message}`);
        // En entorno serverless nunca debemos llamar a process.exit() para no tumbar el Worker
        const isServerless = Boolean(process.env.CF_PAGES || process.env.WORKERS || process.env.CLOUDFLARE_WORKER || !process.env.PORT);
        if (!isServerless && process.env.NODE_ENV === 'test') {
            process.exit(1);
        }
        throw error;
    }
};

module.exports = connectDB;
