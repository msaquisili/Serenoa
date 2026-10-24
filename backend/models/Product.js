const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre del producto es obligatorio'],
            trim: true
        },
        descripcion: {
            type: String,
            required: [true, 'La descripción del producto es obligatoria'],
            trim: true
        },
        precio: {
            type: Number,
            required: [true, 'El precio es obligatorio'],
            min: [0, 'El precio no puede ser negativo']
        },
        imagen: {
            type: String,
            required: [true, 'La URL de la imagen es obligatoria'],
            default: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=400&auto=format&fit=crop'
        },
        disponibilidad: {
            type: Boolean,
            default: true
        },
        categoria: {
            type: String,
            required: [true, 'La categoría es obligatoria'],
            trim: true,
            default: 'Tartas'
        },
        stock: {
            type: Number,
            default: 10,
            min: [0, 'El stock no puede ser negativo']
        }
    },
    {
        timestamps: true
    }
);

// Virtuals para compatibilidad con campos de frontend (ej. 'desc' o 'activo')
productSchema.virtual('activo').get(function () {
    return this.disponibilidad;
});

productSchema.virtual('desc').get(function () {
    return this.descripcion;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
