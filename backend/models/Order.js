const mongoose = require('mongoose');

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
                default: 'WhatsApp / Transferencia'
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
            enum: ['Pendiente', 'Pagado', 'En preparación', 'Entregado', 'Cancelado'],
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

module.exports = mongoose.model('Order', orderSchema);
