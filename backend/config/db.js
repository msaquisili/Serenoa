const mongoose = require('mongoose');
const dns = require('dns');

// Configurar servidores DNS públicos para resolución confiable de registros SRV en MongoDB Atlas
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    // Si no se pueden fijar servidores, continuar con los del sistema
}

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/serenoa_db';
        const conn = await mongoose.connect(uri);
        console.log(` Conexión exitosa a MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ Error al conectar a MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
