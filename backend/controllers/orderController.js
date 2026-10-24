const Order = require('../models/Order');
const Product = require('../models/Product');

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
            return {
                producto: item.producto || item.id || null,
                nombre: item.nombre || 'Postre Serenoa',
                cantidad: qty,
                precioUnitario: price
            };
        });

        const finalTotal = total !== undefined ? Number(total) : calculatedTotal;

        const newOrder = await Order.create({
            cliente: {
                nombre: cliente.nombre,
                email: cliente.email || '',
                telefono: cliente.telefono || '',
                direccion: cliente.direccion || 'Retiro en pastelería',
                metodoPago: metodoPago || cliente.metodoPago || 'WhatsApp / Transferencia'
            },
            productos: normalizedItems,
            total: finalTotal,
            estado: 'Pendiente',
            estadoPago: 'Pendiente',
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
 * @desc    Obtener un pedido por ID
 * @route   GET /api/pedidos/:id
 * @access  Privado (Admin)
 */
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

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
 * @desc    Actualizar el estado de un pedido (Estado general, Estado de Pago o Estado de Logística)
 * @route   PUT /api/pedidos/:id
 * @access  Privado (Admin)
 */
const updateOrderStatus = async (req, res) => {
    try {
        let order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado para actualizar'
            });
        }

        const { estado, estadoPago, estadoLogistica, cliente, notas } = req.body;

        // Actualizaciones dinámicas
        if (estado) order.estado = estado;
        if (estadoPago) {
            order.estadoPago = estadoPago;
            // Sincronizar estado general si se actualiza el pago
            if (!estado) order.estado = estadoPago;
        }
        if (estadoLogistica) order.estadoLogistica = estadoLogistica;
        if (cliente) order.cliente = { ...order.cliente, ...cliente };
        if (notas !== undefined) order.notas = notas;

        const updatedOrder = await order.save();

        res.status(200).json({
            success: true,
            message: 'Estado del pedido actualizado exitosamente',
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
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado para eliminar'
            });
        }

        await Order.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Pedido eliminado exitosamente',
            data: { id: req.params.id }
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
