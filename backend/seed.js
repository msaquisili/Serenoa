const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const Product = require('./models/Product');
const Order = require('./models/Order');

dotenv.config();

// Configurar servidores DNS públicos para resolución confiable de registros SRV en MongoDB Atlas
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/serenoa_db';

const initialProducts = [
    {
        nombre: "Tarta de Fresa Clásica",
        descripcion: "Base crujiente de masa sableé, suave crema pastelera infusionada con vainilla de Madagascar y fresas frescas.",
        precio: 15.00,
        categoria: "Tartas",
        stock: 12,
        disponibilidad: true,
        imagen: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=400&auto=format&fit=crop"
    },
    {
        nombre: "Cheesecake New York con Frutos Rojos",
        descripcion: "Horneado lento al estilo tradicional con coulis artesanal de frambuesas y moras silvestres.",
        precio: 18.00,
        categoria: "Cheesecakes",
        stock: 8,
        disponibilidad: true,
        imagen: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=400&auto=format&fit=crop"
    },
    {
        nombre: "Caja de Macarons Franceses (x6)",
        descripcion: "Selección de sabores: Pistacho, Frambuesa, Chocolate belga 70%, Vainilla y Café espresso.",
        precio: 12.00,
        categoria: "Macarons",
        stock: 25,
        disponibilidad: true,
        imagen: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=400&auto=format&fit=crop"
    },
    {
        nombre: "Tarta Selva Negra de Autor",
        descripcion: "Bizcocho de cacao fino de aroma, cerezas maceradas en licor kirsch y crema chantilly ligera.",
        precio: 22.00,
        categoria: "Tartas",
        stock: 6,
        disponibilidad: true,
        imagen: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=400&auto=format&fit=crop"
    },
    {
        nombre: "Éclair de Chocolate Valrhona",
        descripcion: "Pasta choux rellena de crema pastelera de chocolate amargo 64% y glaseado brillante.",
        precio: 6.50,
        categoria: "Postres Especiales",
        stock: 18,
        disponibilidad: true,
        imagen: "https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=400&auto=format&fit=crop"
    },
    {
        nombre: "Tiramisú Tradicional al Mascarpone",
        descripcion: "Bizcochos savoiardi bañados en café de especialidad y crema suave de queso mascarpone.",
        precio: 8.50,
        categoria: "Postres Especiales",
        stock: 14,
        disponibilidad: true,
        imagen: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=400&auto=format&fit=crop"
    }
];

const seedDatabase = async () => {
    try {
        console.log(`📡 Conectando a MongoDB en: ${uri}`);
        await mongoose.connect(uri);
        console.log('✅ Conexión establecida.');

        // Limpiar colecciones anteriores para insertar datos frescos
        await Product.deleteMany({});
        await Order.deleteMany({});
        console.log('🗑️  Colecciones previas limpiadas.');

        // Insertar productos
        const createdProducts = await Product.insertMany(initialProducts);
        console.log(`🍰 ${createdProducts.length} productos insertados en la base de datos.`);

        // Insertar pedidos de prueba
        const initialOrders = [
            {
                cliente: {
                    nombre: "Camila Morales",
                    email: "camila.m@gmail.com",
                    telefono: "0998765432",
                    direccion: "Av. Principal 123",
                    metodoPago: "WhatsApp / Transferencia"
                },
                productos: [
                    {
                        producto: createdProducts[0]._id,
                        nombre: createdProducts[0].nombre,
                        cantidad: 1,
                        precioUnitario: createdProducts[0].precio
                    },
                    {
                        producto: createdProducts[2]._id,
                        nombre: createdProducts[2].nombre,
                        cantidad: 1,
                        precioUnitario: createdProducts[2].precio
                    }
                ],
                total: 27.00,
                estado: "Pagado",
                estadoPago: "Pagado",
                estadoLogistica: "Entregado",
                notas: "Entregar con tarjeta de dedicatoria."
            },
            {
                cliente: {
                    nombre: "Diego Valdivieso",
                    email: "diegoy@outlook.com",
                    telefono: "0987654321",
                    direccion: "Retiro en pastelería",
                    metodoPago: "Instagram / Reserva Directa"
                },
                productos: [
                    {
                        producto: createdProducts[1]._id,
                        nombre: createdProducts[1].nombre,
                        cantidad: 2,
                        precioUnitario: createdProducts[1].precio
                    }
                ],
                total: 36.00,
                estado: "Pendiente",
                estadoPago: "Pendiente",
                estadoLogistica: "Por preparar",
                notas: "Retiro a las 4:00 PM."
            },
            {
                cliente: {
                    nombre: "Valeria Gómez",
                    email: "valeriag@gmail.com",
                    telefono: "0976543210",
                    direccion: "Calle Las Flores 456",
                    metodoPago: "Efectivo al Retiro"
                },
                productos: [
                    {
                        producto: createdProducts[3]._id,
                        nombre: createdProducts[3].nombre,
                        cantidad: 1,
                        precioUnitario: createdProducts[3].precio
                    }
                ],
                total: 22.00,
                estado: "Pagado",
                estadoPago: "Pagado",
                estadoLogistica: "Entregado",
                notas: "Listo para llevar."
            }
        ];

        const createdOrders = await Order.insertMany(initialOrders);
        console.log(`📦 ${createdOrders.length} pedidos de prueba insertados con éxito.`);

        console.log('✨ ¡Base de datos de prueba inicializada correctamente!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al poblar la base de datos:', error);
        process.exit(1);
    }
};

seedDatabase();
