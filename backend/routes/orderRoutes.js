const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
} = require('../controllers/orderController');

// Rutas para /api/pedidos
router.route('/')
    .get(getOrders)
    .post(createOrder);

router.route('/:id')
    .get(getOrderById)
    .put(updateOrderStatus)
    .delete(deleteOrder);

module.exports = router;
