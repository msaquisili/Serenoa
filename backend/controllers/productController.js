const Product = require('../models/Product');

/**
 * @desc    Obtener todos los productos / pasteles
 * @route   GET /api/productos
 * @access  Público
 */
const getProducts = async (req, res) => {
    try {
        const { categoria, disponible } = req.query;
        let filtro = {};

        if (categoria && categoria !== 'all') {
            filtro.categoria = categoria;
        }

        if (disponible !== undefined) {
            filtro.disponibilidad = disponible === 'true';
        }

        const products = await Product.find(filtro).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los productos',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener un solo producto por ID
 * @route   GET /api/productos/:id
 * @access  Público
 */
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar el producto',
            error: error.message
        });
    }
};

/**
 * @desc    Crear / Agregar un nuevo producto (pastel/postre)
 * @route   POST /api/productos
 * @access  Privado (Admin)
 */
const createProduct = async (req, res) => {
    try {
        const { nombre, precio, imagen, disponibilidad, categoria, stock } = req.body;
        const descripcion = req.body.descripcion || req.body.desc;

        if (!nombre || !descripcion || precio === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Por favor complete todos los campos obligatorios: nombre, descripcion y precio'
            });
        }

        const newProduct = await Product.create({
            nombre,
            descripcion,
            precio: Number(precio),
            imagen: imagen || 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=400&auto=format&fit=crop',
            disponibilidad: disponibilidad !== undefined ? disponibilidad : (Number(stock) > 0),
            categoria: categoria || 'Tartas',
            stock: stock !== undefined ? Number(stock) : 10
        });

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: newProduct
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el producto',
            error: error.message
        });
    }
};

/**
 * @desc    Actualizar / Editar un producto existente
 * @route   PUT /api/productos/:id
 * @access  Privado (Admin)
 */
const updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado para actualizar'
            });
        }

        const updateData = { ...req.body };
        if (updateData.desc && !updateData.descripcion) {
            updateData.descripcion = updateData.desc;
        }

        // Si se actualiza el stock a 0, ajustar disponibilidad automáticamente si aplica
        if (updateData.stock !== undefined && updateData.disponibilidad === undefined) {
            updateData.disponibilidad = Number(updateData.stock) > 0;
        }

        product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el producto',
            error: error.message
        });
    }
};

/**
 * @desc    Eliminar un producto del catálogo
 * @route   DELETE /api/productos/:id
 * @access  Privado (Admin)
 */
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado para eliminar'
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: `Producto "${product.nombre}" eliminado correctamente`,
            data: { id: req.params.id }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el producto',
            error: error.message
        });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
