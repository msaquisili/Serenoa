const mongooseRaw = require('mongoose');
const mongoose = mongooseRaw.default || mongooseRaw;

const orderItemSchema = new mongoose.Schema(
    {
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        nombre: {
            type: String,
            required: [true, 'El nombre del producto en el pedido es obligatorio']
        },
        cantidad: {
            type: Number,
            required: [true, 'La cantidad es obligatoria'],
            min: [1, 'La cantidad mínima es 1'],
            default: 1
        },
        precioUnitario: {
            type: Number,
            required: [true, 'El precio unitario es obligatorio'],
            min: [0, 'El precio no puede ser negativo']
        }
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        codigo: {
            type: String,
            trim: true
        },
        metodoPago: {
            type: String,
            enum: ['Transferencia', 'Efectivo'],
            default: 'Transferencia'
        },
        cliente: {
            nombre: {
                type: String,
                required: [true, 'El nombre del cliente es obligatorio'],
                trim: true
            },
            email: {
                type: String,
                trim: true,
                lowercase: true,
                default: ''
            },
            telefono: {
                type: String,
                trim: true,
                default: ''
            },
            direccion: {
                type: String,
                trim: true,
                default: 'Retiro en tienda'
            },
            metodoPago: {
                type: String,
                enum: ['Transferencia', 'Efectivo'],
                default: 'Transferencia'
            }
        },
        productos: {
            type: [orderItemSchema],
            validate: {
                validator: function (val) {
                    return Array.isArray(val) && val.length > 0;
                },
                message: 'El pedido debe contener al menos un producto'
            }
        },
        total: {
            type: Number,
            required: [true, 'El total a pagar es obligatorio'],
            min: [0, 'El total no puede ser negativo']
        },
        estado: {
            type: String,
            enum: ['Pendiente', 'Completado', 'Cancelado'],
            default: 'Pendiente'
        },
        estadoPago: {
            type: String,
            enum: ['Pendiente', 'Pagado', 'Cancelado'],
            default: 'Pendiente'
        },
        estadoLogistica: {
            type: String,
            enum: ['Por preparar', 'En preparación', 'Entregado'],
            default: 'Por preparar'
        },
        notas: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

// Normalización automática antes de validar para garantizar compatibilidad con pedidos heredados
orderSchema.pre('validate', function(next) {
    if (this.estado) {
        const s = String(this.estado).trim().toLowerCase();
        if (s === 'completado' || s === 'entregado' || s === 'pagado') {
            this.estado = 'Completado';
        } else if (s === 'cancelado') {
            this.estado = 'Cancelado';
        } else {
            this.estado = 'Pendiente';
        }
    }
    const rawPay = String(this.metodoPago || this.cliente?.metodoPago || '').trim().toLowerCase();
    const cleanPay = rawPay.includes('efectivo') ? 'Efectivo' : 'Transferencia';
    this.metodoPago = cleanPay;
    if (this.cliente) {
        this.cliente.metodoPago = cleanPay;
    }
    next();
});

const Order = (mongoose.models && mongoose.models.Order)
    ? mongoose.models.Order
    : mongoose.model('Order', orderSchema);

module.exports = Order;
module.exports.default = Order;
