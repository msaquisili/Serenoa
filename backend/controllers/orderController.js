const mongoose = require('mongoose');
const OrderRaw = require('../models/Order');
const ProductRaw = require('../models/Product');

const Order = (OrderRaw && typeof OrderRaw.find === 'function') ? OrderRaw : (OrderRaw.default || OrderRaw);
const Product = (ProductRaw && typeof ProductRaw.find === 'function') ? ProductRaw : (ProductRaw.default || ProductRaw);

/**
 * @desc    Crear un nuevo pedido desde el catálogo / cliente
 * @route   POST /api/pedidos
 * @access  Público
 */
const createOrder = async (req, res) => {
    try {
        const { cliente, productos, total, notas, metodoPago } = req.body;

        if (!cliente || !cliente.nombre) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere la información del cliente (nombre obligatorio)'
            });
        }

        if (!productos || !Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El pedido debe contener al menos un producto'
            });
        }

        // Calcular o validar el total si no viene especificado
        let calculatedTotal = 0;
        const normalizedItems = productos.map(item => {
            const qty = Number(item.cantidad) || 1;
            const price = Number(item.precioUnitario || item.precio) || 0;
            calculatedTotal += qty * price;
            const rawId = item.producto || item.id;
            const validProdId = (rawId && mongoose.Types.ObjectId.isValid(rawId)) ? rawId : null;
            return {
                producto: validProdId,
                nombre: item.nombre || 'Postre Serenoa',
                cantidad: qty,
                precioUnitario: price
            };
        });

        const finalTotal = total !== undefined ? Number(total) : calculatedTotal;
        const finalCodigo = req.body.codigo || `SER-${Math.floor(1000 + Math.random() * 9000)}`;

        const newOrder = await Order.create({
            codigo: finalCodigo,
            cliente: {
                nombre: cliente.nombre,
                email: cliente.email || '',
                telefono: cliente.telefono || '',
                direccion: cliente.direccion || 'Retiro en pastelería',
                metodoPago: metodoPago || cliente.metodoPago || 'WhatsApp / Transferencia'
            },
            productos: normalizedItems,
            total: finalTotal,
            estado: req.body.estado || 'Pendiente',
            estadoPago: req.body.estadoPago || 'Pendiente',
            estadoLogistica: 'Por preparar',
            notas: notas || ''
        });

        res.status(201).json({
            success: true,
            message: 'Pedido registrado con éxito',
            data: newOrder
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al procesar el pedido',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener todos los pedidos para el panel de administración
 * @route   GET /api/pedidos
 * @access  Privado (Admin)
 */
const getOrders = async (req, res) => {
    try {
        const { estado, estadoPago, estadoLogistica } = req.query;
        let filtro = {};

        if (estado && estado !== 'all') {
            filtro.estado = estado;
        }

        if (estadoPago && estadoPago !== 'all') {
            filtro.estadoPago = estadoPago;
        }

        if (estadoLogistica && estadoLogistica !== 'all') {
            filtro.estadoLogistica = estadoLogistica;
        }

        const orders = await Order.find(filtro).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los pedidos',
            error: error.message
        });
    }
};

/**
 * @desc    Obtener un pedido por ID o Código
 * @route   GET /api/pedidos/:id
 * @access  Privado (Admin)
 */
const getOrderById = async (req, res) => {
    try {
        let order = null;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            order = await Order.findById(req.params.id);
        }
        if (!order) {
            order = await Order.findOne({ codigo: req.params.id });
        }

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar el pedido',
            error: error.message
        });
    }
};

/**
 * @desc    Actualizar un pedido (Estado general, Método de Pago, Cliente, Total, etc.)
 * @route   PUT /api/pedidos/:id
 * @access  Privado (Admin)
 */
const updateOrderStatus = async (req, res) => {
    try {
        let order = null;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            order = await Order.findById(req.params.id);
        }
        if (!order) {
            order = await Order.findOne({ codigo: req.params.id });
        }

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado para actualizar'
            });
        }

        const { estado, estadoPago, estadoLogistica, cliente, notas, metodoPago, total, productos } = req.body;

        // Normalizar y actualizar estado
        if (estado) {
            const st = String(estado).trim();
            const lower = st.toLowerCase();
            if (lower === 'pendiente') order.estado = 'Pendiente';
            else if (lower === 'completado') order.estado = 'Completado';
            else if (lower === 'cancelado') order.estado = 'Cancelado';
            else if (lower === 'pagado') order.estado = 'Pagado';
            else if (lower === 'en preparación' || lower === 'en preparacion') order.estado = 'En preparación';
            else if (lower === 'entregado') order.estado = 'Entregado';
            else order.estado = st;
        }

        if (estadoPago) {
            order.estadoPago = estadoPago;
            if (!estado) order.estado = estadoPago;
        }

        if (estadoLogistica) {
            order.estadoLogistica = estadoLogistica;
        }

        // Actualizar información del cliente
        if (cliente && typeof cliente === 'object') {
            order.cliente = {
                nombre: cliente.nombre !== undefined ? cliente.nombre : (order.cliente?.nombre || ''),
                email: cliente.email !== undefined ? cliente.email : (order.cliente?.email || ''),
                telefono: cliente.telefono !== undefined ? cliente.telefono : (order.cliente?.telefono || ''),
                direccion: cliente.direccion !== undefined ? cliente.direccion : (order.cliente?.direccion || ''),
                metodoPago: cliente.metodoPago !== undefined ? cliente.metodoPago : (order.cliente?.metodoPago || 'WhatsApp / Transferencia')
            };
        }

        // Actualizar método de pago explícito (a nivel de cliente y/o raíz)
        const newPaymentMethod = metodoPago || cliente?.metodoPago;
        if (newPaymentMethod) {
            if (!order.cliente) order.cliente = {};
            order.cliente.metodoPago = newPaymentMethod;
        }

        if (total !== undefined && !isNaN(Number(total))) {
            order.total = Number(total);
        }

        if (productos && Array.isArray(productos) && productos.length > 0) {
            order.productos = productos.map(item => ({
                producto: (item.producto && mongoose.Types.ObjectId.isValid(item.producto)) ? item.producto : null,
                nombre: item.nombre || 'Postre Serenoa',
                cantidad: Number(item.cantidad) || 1,
                precioUnitario: Number(item.precioUnitario || item.precio) || 0
            }));
        }

        if (notas !== undefined) {
            order.notas = String(notas).trim();
        }

        const updatedOrder = await order.save();

        res.status(200).json({
            success: true,
            message: 'Pedido actualizado exitosamente',
            data: updatedOrder
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el pedido',
            error: error.message
        });
    }
};

/**
 * @desc    Eliminar / Cancelar un pedido
 * @route   DELETE /api/pedidos/:id
 * @access  Privado (Admin)
 */
const deleteOrder = async (req, res) => {
    try {
        let order = null;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            order = await Order.findById(req.params.id);
        }
        if (!order) {
            order = await Order.findOne({ codigo: req.params.id });
        }

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado para eliminar'
            });
        }

        await Order.findByIdAndDelete(order._id);

        res.status(200).json({
            success: true,
            message: 'Pedido eliminado exitosamente',
            data: { id: order._id, codigo: order.codigo }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el pedido',
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
};
