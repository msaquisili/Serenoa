/**
 * SERENOA - Admin Dashboard & Analytics Module
 * Manejo de autenticación privada, analíticas con Chart.js y CRUD de tienda.
 */

// ==========================================================================
// 1. CONSTANTES & DATOS INICIALES (MOCK & LOCALSTORAGE SEEDING)
// ==========================================================================

const DEFAULT_PRODUCTS = [
    {
        id: "prod-1",
        nombre: "Tarta de Fresa Clásica",
        categoria: "Tartas",
        precio: 15.00,
        stock: 12,
        imagen: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=400&auto=format&fit=crop",
        desc: "Base crujiente de masa sableé, suave crema pastelera infusionada con vainilla de Madagascar y fresas frescas.",
        activo: true
    },
    {
        id: "prod-2",
        nombre: "Cheesecake New York con Frutos Rojos",
        categoria: "Cheesecakes",
        precio: 18.00,
        stock: 8,
        imagen: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=400&auto=format&fit=crop",
        desc: "Horneado lento al estilo tradicional con coulis artesanal de frambuesas y moras silvestres.",
        activo: true
    },
    {
        id: "prod-3",
        nombre: "Caja de Macarons Franceses (x6)",
        categoria: "Macarons",
        precio: 12.00,
        stock: 25,
        imagen: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=400&auto=format&fit=crop",
        desc: "Selección de sabores: Pistacho, Frambuesa, Chocolate belga 70%, Vainilla y Café espresso.",
        activo: true
    },
    {
        id: "prod-4",
        nombre: "Tarta Selva Negra de Autor",
        categoria: "Tartas",
        precio: 22.00,
        stock: 6,
        imagen: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=400&auto=format&fit=crop",
        desc: "Bizcocho de cacao fino de aroma, cerezas maceradas en licor kirsch y crema chantilly ligera.",
        activo: true
    },
    {
        id: "prod-5",
        nombre: "Éclair de Chocolate Valrhona",
        categoria: "Postres Especiales",
        precio: 6.50,
        stock: 18,
        imagen: "https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=400&auto=format&fit=crop",
        desc: "Pasta choux rellena de crema pastelera de chocolate amargo 64% y glaseado brillante.",
        activo: true
    },
    {
        id: "prod-6",
        nombre: "Tiramisú Tradicional al Mascarpone",
        categoria: "Postres Especiales",
        precio: 8.50,
        stock: 14,
        imagen: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=400&auto=format&fit=crop",
        desc: "Bizcochos savoiardi bañados en café de especialidad y crema suave de queso mascarpone.",
        activo: true
    }
];

const DEFAULT_ORDERS = [
    {
        id: "ORD-9021",
        cliente: "Camila Morales",
        email: "camila.m@gmail.com",
        productos: "1x Tarta de Fresa Clásica, 1x Caja Macarons",
        fecha: "2026-09-17 11:30",
        total: 27.00,
        estadoPago: "Pagado",
        estadoLogistica: "Entregado",
        estado: "Pagado",
        metodoPago: "WhatsApp / Transferencia"
    },
    {
        id: "ORD-9020",
        cliente: "Diego Valdivieso",
        email: "diegoy@outlook.com",
        productos: "2x Cheesecake New York",
        fecha: "2026-09-17 09:15",
        total: 36.00,
        estadoPago: "Pendiente",
        estadoLogistica: "Por preparar",
        estado: "Pendiente",
        metodoPago: "Instagram / Reserva Directa"
    },
    {
        id: "ORD-9019",
        cliente: "Valeria Gómez",
        email: "valeriag@gmail.com",
        productos: "1x Tarta Selva Negra",
        fecha: "2026-09-16 16:45",
        total: 22.00,
        estadoPago: "Pagado",
        estadoLogistica: "Entregado",
        estado: "Pagado",
        metodoPago: "Efectivo al Retiro"
    },
    {
        id: "ORD-9018",
        cliente: "Andrés Silva",
        email: "andres.silva@epn.edu.ec",
        productos: "2x Caja de Macarons, 2x Éclair",
        fecha: "2026-09-16 14:10",
        total: 37.00,
        estadoPago: "Pagado",
        estadoLogistica: "Entregado",
        estado: "Pagado",
        metodoPago: "Transferencia Bancaria"
    },
    {
        id: "ORD-9017",
        cliente: "Sofía Noboa",
        email: "sofia_noboa@gmail.com",
        productos: "1x Tiramisú, 1x Tarta de Fresa",
        fecha: "2026-09-15 18:20",
        total: 23.50,
        estadoPago: "Pendiente",
        estadoLogistica: "Por preparar",
        estado: "Pendiente",
        metodoPago: "Instagram / WhatsApp"
    },
    {
        id: "ORD-9016",
        cliente: "Mateo Carrasco",
        email: "mcarrasco@gmail.com",
        productos: "1x Tarta Selva Negra",
        fecha: "2026-09-15 12:05",
        total: 22.00,
        estadoPago: "Cancelado",
        estadoLogistica: "Por preparar",
        estado: "Cancelado",
        metodoPago: "Efectivo"
    }
];

const DEFAULT_MESSAGES = [
    {
        id: "msg-1",
        nombre: "Mariana Alvear",
        email: "mariana.alvear@gmail.com",
        mensaje: "¿Hacen tartas personalizadas para bodas con 2 semanas de anticipación? Me gustaría cotizar para 80 personas.",
        fecha: "Hoy a las 10:40",
        leido: false
    },
    {
        id: "msg-2",
        nombre: "Roberto Zambrano",
        email: "rzambrano@empresa.ec",
        mensaje: "Hola Serenoa, deseamos encargar 30 cajas de macarons para regalos corporativos de fin de mes. ¿Tienen factura electrónica?",
        fecha: "Ayer a las 15:10",
        leido: false
    },
    {
        id: "msg-3",
        nombre: "Estefanía Cevallos",
        email: "estefy.cevallos@gmail.com",
        mensaje: "Excelente servicio, el cheesecake de frutos rojos estuvo insuperable. ¡Muchas gracias por la atención tan detallista!",
        fecha: "15 Sep 2026",
        leido: true
    }
];

// Métricas simuladas por período para gráficos dinámicos
const ANALYTICS_DATA = {
    today: {
        revenue: 345.50,
        orders: 14,
        avgTicket: 24.67,
        pending: 2,
        labels: ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00"],
        revenueSeries: [45, 95, 140, 210, 265, 310, 345.5],
        profitSeries: [25, 55, 80, 125, 160, 190, 215],
        categories: { Tartas: 45, Cheesecakes: 30, Macarons: 15, PostresEspeciales: 10 },
        topProducts: [
            { name: "Tarta de Fresa", sales: 6 },
            { name: "Cheesecake NY", sales: 4 },
            { name: "Macarons (x6)", sales: 3 },
            { name: "Éclair Valrhona", sales: 2 },
            { name: "Tiramisú", sales: 1 }
        ]
    },
    week: {
        revenue: 2180.00,
        orders: 88,
        avgTicket: 24.77,
        pending: 4,
        labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
        revenueSeries: [280, 310, 290, 350, 420, 560, 480],
        profitSeries: [160, 185, 170, 210, 260, 350, 300],
        categories: { Tartas: 40, Cheesecakes: 32, Macarons: 18, PostresEspeciales: 10 },
        topProducts: [
            { name: "Cheesecake NY", sales: 28 },
            { name: "Tarta de Fresa", sales: 26 },
            { name: "Macarons (x6)", sales: 22 },
            { name: "Selva Negra", sales: 15 },
            { name: "Tiramisú", sales: 12 }
        ]
    },
    month: {
        revenue: 8420.50,
        orders: 342,
        avgTicket: 24.62,
        pending: 6,
        labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
        revenueSeries: [1950, 2240, 2080, 2150.50],
        profitSeries: [1180, 1390, 1260, 1310.00],
        categories: { Tartas: 38, Cheesecakes: 34, Macarons: 16, PostresEspeciales: 12 },
        topProducts: [
            { name: "Tarta de Fresa", sales: 104 },
            { name: "Cheesecake NY", sales: 98 },
            { name: "Macarons (x6)", sales: 76 },
            { name: "Selva Negra", sales: 52 },
            { name: "Éclair Valrhona", sales: 40 }
        ]
    },
    year: {
        revenue: 72600.00,
        orders: 2940,
        avgTicket: 24.69,
        pending: 6,
        labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        revenueSeries: [4800, 5200, 5600, 6100, 7400, 6300, 6800, 7100, 8420, 6500, 7800, 9500],
        profitSeries: [2900, 3150, 3400, 3750, 4600, 3900, 4200, 4400, 5140, 4000, 4800, 6100],
        categories: { Tartas: 36, Cheesecakes: 35, Macarons: 17, PostresEspeciales: 12 },
        topProducts: [
            { name: "Tarta de Fresa", sales: 890 },
            { name: "Cheesecake NY", sales: 840 },
            { name: "Macarons (x6)", sales: 620 },
            { name: "Selva Negra", sales: 410 },
            { name: "Tiramisú", sales: 360 }
        ]
    }
};

// ==========================================================================
// 2. GESTIÓN DE PERSISTENCIA (LOCALSTORAGE)
// ==========================================================================

const getApiBaseUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:5000';
    if (window.location.origin && window.location.origin.includes(':5000')) return '';
    const host = window.location.hostname || 'localhost';
    return `${window.location.protocol}//${host}:5000`;
};

const getStoredData = (key, defaultVal) => {
    try {
        const item = localStorage.getItem(`serenoa_${key}`);
        return item ? JSON.parse(item) : defaultVal;
    } catch (e) {
        return defaultVal;
    }
};

const setStoredData = (key, val) => {
    try {
        localStorage.setItem(`serenoa_${key}`, JSON.stringify(val));
    } catch (e) {
        console.warn(`Aviso de almacenamiento en serenoa_${key} (cuota excedida):`, e);
        if (key === 'products' && Array.isArray(val)) {
            try {
                const lightweight = val.map(p => ({
                    ...p,
                    imagen: (p.imagen && p.imagen.startsWith('data:') && p.imagen.length > 50000)
                        ? 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400'
                        : p.imagen
                }));
                localStorage.setItem(`serenoa_${key}`, JSON.stringify(lightweight));
            } catch (ignore) {}
        }
    }
};

// Inicializar almacenamiento si es primera vez
let products = getStoredData("products", DEFAULT_PRODUCTS);
let orders = getStoredData("orders", DEFAULT_ORDERS);
let messages = getStoredData("messages", DEFAULT_MESSAGES);

// Normalización y migración retrocompatible de pedidos existentes en localStorage
let ordersNeedMigration = false;
orders = orders.map(o => {
    let changed = false;
    let estadoPago = o.estadoPago;
    let estadoLogistica = o.estadoLogistica;

    if (!estadoPago) {
        const legacySt = (o.estado || "").toLowerCase().trim();
        if (legacySt === "pagado" || legacySt === "entregado" || legacySt === "en preparación" || legacySt === "en preparacion" || legacySt === "confirmado") {
            estadoPago = "Pagado";
        } else if (legacySt === "cancelado") {
            estadoPago = "Cancelado";
        } else {
            estadoPago = "Pendiente";
        }
        changed = true;
    }

    if (!estadoLogistica) {
        const legacySt = (o.estado || "").toLowerCase().trim();
        if (legacySt === "entregado") {
            estadoLogistica = "Entregado";
        } else if (legacySt === "en preparación" || legacySt === "en preparacion") {
            estadoLogistica = "En preparación";
        } else if (estadoPago === "Pagado") {
            // Asignar por defecto a entregado para pedidos pagados del histórico
            estadoLogistica = "Entregado";
        } else {
            estadoLogistica = "Por preparar";
        }
        changed = true;
    }

    if (changed || o.estadoPago !== estadoPago || o.estadoLogistica !== estadoLogistica) {
        ordersNeedMigration = true;
        return {
            ...o,
            estadoPago,
            estadoLogistica,
            estado: estadoPago
        };
    }
    return o;
});

if (!localStorage.getItem("serenoa_products")) setStoredData("products", products);
if (!localStorage.getItem("serenoa_orders") || ordersNeedMigration) setStoredData("orders", orders);
if (!localStorage.getItem("serenoa_messages")) setStoredData("messages", messages);

// ==========================================================================
// 3. CONTROLADORES DE MÉTRICAS & GRÁFICOS OPERATIVOS
// ==========================================================================

let categoriesChartInstance = null;
let topProductsChartInstance = null;

/**
 * Colores institucionales Serenoa para distribución dinámica de categorías
 */
const PALETTE_COLORS = [
    "#1A3628", "#A87E50", "#C49F6A", "#2A9D8F", "#8C2D2D",
    "#4A6B5B", "#E76F51", "#264653", "#E9C46A", "#DDA15E", "#6D597A"
];

/**
 * Normaliza cadenas de texto eliminando tildes y caracteres especiales
 */
const normalizeText = (str) => {
    return (str || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};

/**
 * Busca un producto en el catálogo con coincidencia flexible por nombre o palabras clave
 */
const findProductMatch = (itemName, catalog) => {
    const cleanItem = normalizeText(itemName);
    if (!cleanItem) return null;

    // 1. Coincidencia exacta limpia
    for (const p of catalog) {
        const cleanProd = normalizeText(p.nombre);
        if (cleanProd === cleanItem) return p;
    }

    // 2. Coincidencia de subcadena
    for (const p of catalog) {
        const cleanProd = normalizeText(p.nombre);
        if (cleanProd.includes(cleanItem) || cleanItem.includes(cleanProd)) return p;
    }

    // 3. Coincidencia por palabras clave representativas
    const itemWords = cleanItem.split(" ").filter(w => w.length > 2);
    for (const p of catalog) {
        const cleanProd = normalizeText(p.nombre);
        const prodWords = cleanProd.split(" ").filter(w => w.length > 2);
        const hasOverlap = itemWords.some(w => prodWords.includes(w) || cleanProd.includes(w));
        if (hasOverlap) return p;
    }

    return null;
};

// Estado de visualización seleccionado para la tarjeta de Productos Vendidos ('all' o ID/Nombre del producto)
let selectedProductSalesView = 'all';

/**
 * Actualiza las métricas principales del Dashboard:
 * - Ingresos Totales: Solo suma pedidos cuyo Estado de Pago sea "Pagado" o "Confirmado".
 * - Número de Ventas: Conteo de pedidos pagados/confirmados.
 * - Productos Vendidos: Conteo total general de unidades vendidas y opción de visualización por producto.
 * - Pedidos Pendientes: Conteo de reservas cuyo Estado de Pago sea "Pendiente".
 */
const updateDashboardMetrics = () => {
    const paidOrders = orders.filter(o => {
        const st = (o.estadoPago || o.estado || "").toLowerCase().trim();
        return st === "pagado" || st === "confirmado";
    });

    const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const totalSales = paidOrders.length;
    
    const pendingOrders = orders.filter(o => {
        const st = (o.estadoPago || o.estado || "").toLowerCase().trim();
        return st === "pendiente" || st === "reservado";
    });

    // Calcular desglose de productos vendidos de pedidos efectivamente entregados y pagados
    const { productSalesMap } = calculateInventoryAnalytics();

    // Total general de unidades vendidas
    const grandTotalItemsSold = Object.values(productSalesMap).reduce((sum, qty) => sum + qty, 0);

    const kpiRev = document.getElementById("kpi-revenue");
    const kpiOrd = document.getElementById("kpi-orders");
    const kpiPending = document.getElementById("kpi-pending-orders");
    const kpiTotalItems = document.getElementById("kpi-total-items-sold");
    const kpiItemsUnitLabel = document.getElementById("kpi-items-unit-label");
    const kpiProductsSub = document.getElementById("kpi-products-sold-sub");
    const selectProductView = document.getElementById("select-kpi-product-view");

    if (kpiRev) kpiRev.textContent = `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (kpiOrd) kpiOrd.textContent = totalSales.toString();
    if (kpiPending) kpiPending.textContent = pendingOrders.length.toString();

    // Poblar / refrescar el dropdown de productos en la tarjeta KPI
    if (selectProductView) {
        const currentSelected = selectedProductSalesView;
        
        let selectOptionsHtml = `<option value="all" ${currentSelected === 'all' ? 'selected' : ''}>📊 Total General (${grandTotalItemsSold} un. vendidas)</option>`;
        
        // Agregar cada producto existente en el catálogo
        products.forEach(prod => {
            const soldQty = productSalesMap[prod.nombre] || 0;
            const isSelected = currentSelected === prod.id || currentSelected === prod.nombre;
            selectOptionsHtml += `<option value="${prod.id}" ${isSelected ? 'selected' : ''}>🍰 ${prod.nombre} (${soldQty} un. vendidas)</option>`;
        });

        selectProductView.innerHTML = selectOptionsHtml;
        selectProductView.value = currentSelected;

        // Renderizar el valor según el modo seleccionado
        if (currentSelected === 'all') {
            if (kpiTotalItems) kpiTotalItems.textContent = grandTotalItemsSold.toString();
            if (kpiItemsUnitLabel) kpiItemsUnitLabel.textContent = "unidades totales vendidas";
            if (kpiProductsSub) kpiProductsSub.textContent = "Suma total de todos los postres";
        } else {
            const foundProd = products.find(p => p.id === currentSelected || p.nombre === currentSelected);
            if (foundProd) {
                const itemQty = productSalesMap[foundProd.nombre] || 0;
                if (kpiTotalItems) kpiTotalItems.textContent = itemQty.toString();
                if (kpiItemsUnitLabel) kpiItemsUnitLabel.textContent = `unidades de "${foundProd.nombre}"`;
                if (kpiProductsSub) kpiProductsSub.textContent = `Precio: $${Number(foundProd.precio).toFixed(2)} | Stock act: ${foundProd.stock}`;
            }
        }
    }
};

/**
 * Calcula las métricas de inventario (Top 5 postres y Ventas por Categoría)
 * Condición estricta: Solo pedidos donde Estado de Pago sea "Pagado" Y Estado de Logística sea "Entregado".
 */
const calculateInventoryAnalytics = () => {
    const qualifyingOrders = orders.filter(o => {
        const pago = (o.estadoPago || "").toLowerCase().trim();
        const logistica = (o.estadoLogistica || "").toLowerCase().trim();
        const isPaid = pago === "pagado" || pago === "confirmado";
        const isDelivered = logistica === "entregado";
        return isPaid && isDelivered;
    });

    const productSalesMap = {};
    const categorySalesMap = {};

    // Inicializar mapa de ventas para todos los productos existentes del catálogo en 0
    products.forEach(p => {
        productSalesMap[p.nombre] = 0;
    });

    // Obtener dinámicamente todas las categorías existentes del sistema
    const storedCats = getStoredData("categories", ["Tartas", "Cheesecakes", "Macarons", "Postres Especiales"]);
    const allCategories = Array.from(new Set([...storedCats, ...products.map(p => p.categoria).filter(Boolean)]));
    allCategories.forEach(cat => {
        categorySalesMap[cat] = 0;
    });

    qualifyingOrders.forEach(order => {
        if (!order.productos) return;
        const items = order.productos.split(",");
        items.forEach(rawItem => {
            const trimmed = rawItem.trim();
            if (!trimmed) return;
            const match = trimmed.match(/^(\d+)\s*x\s*(.+)$/i);
            const qty = match ? parseInt(match[1], 10) : 1;
            const itemName = match ? match[2].trim() : trimmed;

            // Asociar con el producto del catálogo para conocer su categoría exacta
            const foundProduct = findProductMatch(itemName, products);

            const productName = foundProduct ? foundProduct.nombre : itemName;
            const categoryName = foundProduct ? foundProduct.categoria : (allCategories[0] || "Postres Especiales");

            productSalesMap[productName] = (productSalesMap[productName] || 0) + qty;
            if (categorySalesMap[categoryName] !== undefined) {
                categorySalesMap[categoryName] += qty;
            } else {
                categorySalesMap[categoryName] = qty;
                if (!allCategories.includes(categoryName)) allCategories.push(categoryName);
            }
        });
    });

    // Top 5 Productos más vendidos
    let sortedProducts = Object.keys(productSalesMap)
        .map(name => ({ name, sales: productSalesMap[name] }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

    // Si hay menos de 5 con ventas registradas, completar con postres del catálogo
    if (sortedProducts.length < 5) {
        const existingNames = new Set(sortedProducts.map(p => p.name));
        for (const p of products) {
            if (sortedProducts.length >= 5) break;
            if (!existingNames.has(p.nombre)) {
                sortedProducts.push({ name: p.nombre, sales: 0 });
                existingNames.add(p.nombre);
            }
        }
    }

    return {
        topProducts: sortedProducts,
        categorySales: categorySalesMap,
        productSalesMap,
        allCategories
    };
};

const getPaymentStatusClass = (estado) => {
    const st = (estado || "").toLowerCase().trim();
    if (st === "pagado" || st === "confirmado") return "pagado";
    if (st === "cancelado") return "cancelado";
    return "pendiente";
};

const getLogisticsStatusClass = (estado) => {
    const st = (estado || "").toLowerCase().trim();
    if (st === "entregado") return "entregado";
    if (st === "en preparación" || st === "en preparacion") return "en-preparacion";
    return "pendiente";
};

const renderDashboardOrdersTable = () => {
    const tbody = document.getElementById("dashboard-orders-table-body");
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding: 2.5rem; color: var(--text-light);">
                    No hay reservas ni pedidos registrados por el momento.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = orders.map(o => {
        const estadoPago = o.estadoPago || "Pendiente";
        const estadoLogistica = o.estadoLogistica || "Por preparar";

        return `
        <tr>
            <td><strong style="color:var(--dark-green);">${o.id}</strong></td>
            <td>
                <div>
                    <strong>${o.cliente}</strong>
                    <span style="font-size:0.75rem; color:var(--text-light); display:block;">
                        ${o.email || o.metodoPago || 'WhatsApp / Direct'}
                    </span>
                </div>
            </td>
            <td><span style="font-size:0.85rem; color:var(--text-dark);">${o.productos}</span></td>
            <td><span style="font-size:0.8rem; color:var(--text-light);">${o.fecha}</span></td>
            <td><strong style="color:var(--dark-green); font-size:0.95rem;">$${Number(o.total).toFixed(2)}</strong></td>
            <td>
                <div class="status-cell-flex">
                    <span class="badge-status ${getPaymentStatusClass(estadoPago)}">${estadoPago}</span>
                    <select class="status-quick-select select-payment-status" data-id="${o.id}" title="Cambiar Estado de Pago">
                        <option value="Pendiente" ${estadoPago === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="Pagado" ${estadoPago === 'Pagado' ? 'selected' : ''}>Pagado</option>
                        <option value="Cancelado" ${estadoPago === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </div>
            </td>
            <td>
                <div class="status-cell-flex">
                    <span class="badge-status ${getLogisticsStatusClass(estadoLogistica)}">${estadoLogistica}</span>
                    <select class="status-quick-select select-logistics-status" data-id="${o.id}" title="Cambiar Estado de Logística">
                        <option value="Por preparar" ${estadoLogistica === 'Por preparar' ? 'selected' : ''}>Por preparar</option>
                        <option value="En preparación" ${estadoLogistica === 'En preparación' ? 'selected' : ''}>En preparación</option>
                        <option value="Entregado" ${estadoLogistica === 'Entregado' ? 'selected' : ''}>Entregado</option>
                    </select>
                </div>
            </td>
        </tr>
        `;
    }).join("");

    // Conectar cambios de Estado de Pago
    tbody.querySelectorAll(".select-payment-status").forEach(select => {
        select.addEventListener("change", (e) => {
            const orderId = select.dataset.id;
            const newPaymentStatus = e.target.value;
            const order = orders.find(ord => ord.id === orderId);
            if (order) {
                order.estadoPago = newPaymentStatus;
                order.estado = newPaymentStatus;
                if (!order.estadoLogistica) order.estadoLogistica = "Por preparar";
                setStoredData("orders", orders);
                updateDashboardMetrics();
                initCharts();
                renderDashboardOrdersTable();
                renderOrdersTable();
                showToast(`Pago de ${orderId} actualizado a "${newPaymentStatus}".`);
            }
        });
    });

    // Conectar cambios de Estado de Logística
    tbody.querySelectorAll(".select-logistics-status").forEach(select => {
        select.addEventListener("change", (e) => {
            const orderId = select.dataset.id;
            const newLogisticsStatus = e.target.value;
            const order = orders.find(ord => ord.id === orderId);
            if (order) {
                order.estadoLogistica = newLogisticsStatus;
                if (!order.estadoPago) order.estadoPago = "Pendiente";
                setStoredData("orders", orders);
                initCharts();
                renderDashboardOrdersTable();
                renderOrdersTable();
                showToast(`Logística de ${orderId} actualizada a "${newLogisticsStatus}".`);
            }
        });
    });
};

const initCharts = (period = "month") => {
    // 1. Actualizar Métricas Operativas en Vivo
    updateDashboardMetrics();

    // 2. Calcular analíticas de inventario estrictas (Pagado Y Entregado)
    const { topProducts, categorySales, allCategories } = calculateInventoryAnalytics();

    // 3. Gráfico Donut Dinámico de Todas las Categorías
    const ctxCat = document.getElementById("chart-categories");
    if (ctxCat) {
        if (categoriesChartInstance) {
            categoriesChartInstance.destroy();
            categoriesChartInstance = null;
        }

        const categoryData = allCategories.map(cat => categorySales[cat] || 0);
        const totalDeliveredUnits = categoryData.reduce((acc, v) => acc + v, 0);
        const bgColors = allCategories.map((_, idx) => PALETTE_COLORS[idx % PALETTE_COLORS.length]);

        // Si no hay ventas entregadas todavía, mostrar gráfico con fondo suave
        const displayData = totalDeliveredUnits > 0 ? categoryData : allCategories.map(() => 1);
        const displayBg = totalDeliveredUnits > 0 ? bgColors : allCategories.map(() => "rgba(220, 220, 220, 0.45)");

        categoriesChartInstance = new Chart(ctxCat, {
            type: "doughnut",
            data: {
                labels: allCategories,
                datasets: [{
                    data: displayData,
                    backgroundColor: displayBg,
                    borderWidth: 3,
                    borderColor: "#FFFFFF"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            font: { family: "Plus Jakarta Sans", size: 12 },
                            padding: 14,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const realVal = totalDeliveredUnits > 0 ? context.raw : 0;
                                return ` ${context.label}: ${realVal} un. entregadas`;
                            }
                        }
                    }
                },
                cutout: "68%"
            }
        });
    }

    // 4. Gráfico de Barras: Top 5 Productos Más Vendidos & Entregados
    const ctxTop = document.getElementById("chart-top-products");
    if (ctxTop) {
        if (topProductsChartInstance) {
            topProductsChartInstance.destroy();
            topProductsChartInstance = null;
        }

        topProductsChartInstance = new Chart(ctxTop, {
            type: "bar",
            data: {
                labels: topProducts.map(p => p.name),
                datasets: [{
                    label: "Unidades Pagadas y Entregadas",
                    data: topProducts.map(p => p.sales),
                    backgroundColor: "rgba(26, 54, 40, 0.85)",
                    borderRadius: 8,
                    hoverBackgroundColor: "#A87E50"
                }]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => ` ${context.parsed.x} unidades entregadas`
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: { color: "rgba(0,0,0,0.05)" },
                        ticks: { font: { family: "Plus Jakarta Sans" }, precision: 0 }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { font: { family: "Plus Jakarta Sans", weight: 600 } }
                    }
                }
            }
        });
    }

    // 5. Renderizar tabla de control operativo en el Dashboard
    renderDashboardOrdersTable();
};

const getStatusClass = (estado) => {
    const st = (estado || "").toLowerCase().trim();
    if (st === "entregado" || st === "pagado" || st === "confirmado") return "pagado";
    if (st === "en preparación" || st === "en preparacion") return "en-preparacion";
    if (st === "cancelado") return "cancelado";
    return "pendiente";
};

// ==========================================================================
// 4. GESTIÓN DE CATÁLOGO (CRUD DE PRODUCTOS)
// ==========================================================================

/**
 * Carga dinámica de productos desde el backend (MongoDB Atlas) o fallback a LocalStorage
 */
const loadProducts = async () => {
    const apiBase = getApiBaseUrl();
    try {
        const res = await fetch(`${apiBase}/api/productos`);
        if (res.ok) {
            const resData = await res.json();
            if (resData.success && Array.isArray(resData.data)) {
                products = resData.data.map(p => ({
                    id: p._id?.toString() || p.id,
                    _id: p._id?.toString() || p.id,
                    nombre: p.nombre,
                    categoria: p.categoria || 'Tartas',
                    precio: Number(p.precio) || 0,
                    stock: p.stock !== undefined ? Number(p.stock) : 10,
                    imagen: p.imagen || 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400',
                    desc: p.descripcion || p.desc || '',
                    descripcion: p.descripcion || p.desc || '',
                    activo: p.disponibilidad !== undefined ? p.disponibilidad : (p.activo !== undefined ? p.activo : true),
                    disponibilidad: p.disponibilidad !== undefined ? p.disponibilidad : (p.activo !== undefined ? p.activo : true),
                    estado: p.estado || (Number(p.stock) > 0 && p.disponibilidad !== false ? 'Disponible' : 'Agotado')
                }));
                setStoredData("products", products);
                renderCatalogTable();
                updateDashboardMetrics();
                return products;
            }
        }
    } catch (e) {
        console.warn("Backend no disponible para cargar catálogo, usando almacenamiento local:", e);
    }

    products = getStoredData("products", DEFAULT_PRODUCTS);
    renderCatalogTable();
    updateDashboardMetrics();
    return products;
};

const updateAdminCategoryFilter = () => {
    const catSelect = document.getElementById("catalog-filter-category");
    if (!catSelect) return;
    const currentVal = catSelect.value || "all";
    const storedCats = getStoredData("categories", ["Tartas", "Cheesecakes", "Macarons", "Postres Especiales"]);
    
    const allCats = Array.from(new Set([...storedCats, ...products.map(p => p.categoria).filter(Boolean)]));

    catSelect.innerHTML = `<option value="all">Todas las categorías</option>` + 
        allCats.map(c => `<option value="${c}" ${c === currentVal ? 'selected' : ''}>${c}</option>`).join('');
};

const renderCatalogTable = () => {
    updateAdminCategoryFilter();
    const tbody = document.getElementById("catalog-table-body");
    const searchVal = document.getElementById("catalog-search")?.value.toLowerCase().trim() || "";
    const catVal = document.getElementById("catalog-filter-category")?.value || "all";
    const badgeCount = document.getElementById("badge-products-count");

    if (badgeCount) badgeCount.textContent = products.length.toString();
    if (!tbody) return;

    const filtered = products.filter(p => {
        const descText = (p.desc || p.descripcion || "").toLowerCase();
        const matchesSearch = p.nombre.toLowerCase().includes(searchVal) || descText.includes(searchVal);
        const matchesCat = catVal === "all" || p.categoria === catVal;
        return matchesSearch && matchesCat;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding: 2.5rem; color: var(--text-light);">
                    No se encontraron postres con los criterios seleccionados.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(p => {
        const prodId = p.id || p._id;
        const prodDesc = p.desc || p.descripcion || "";
        const isAvail = (p.activo !== false && p.disponibilidad !== false) && p.stock > 0;

        return `
        <tr>
            <td>
                <div class="product-cell">
                    <img src="${p.imagen || 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400'}" alt="${p.nombre}">
                    <div class="product-cell-info">
                        <strong>${p.nombre}</strong>
                        <span>${prodDesc ? prodDesc.slice(0, 45) + '...' : ''}</span>
                    </div>
                </div>
            </td>
            <td><strong>${p.categoria}</strong></td>
            <td><strong>$${Number(p.precio).toFixed(2)}</strong></td>
            <td>
                <span style="font-weight: 600; color: ${p.stock < 5 ? 'var(--error)' : 'inherit'};">
                    ${p.stock} un. ${p.stock < 5 ? '(Bajo stock)' : ''}
                </span>
            </td>
            <td>
                <span class="badge-status ${isAvail ? 'available' : 'outofstock'}">
                    ${isAvail ? 'Disponible' : 'Agotado'}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <a href="nuevo_producto.html?id=${prodId}" class="btn-icon btn-edit-product" title="Editar postre">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </a>
                    <button class="btn-icon btn-delete btn-delete-product" data-id="${prodId}" title="Eliminar postre">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
        `;
    }).join("");

    // Conectar eventos para eliminar productos
    tbody.querySelectorAll(".btn-delete-product").forEach(btn => {
        btn.addEventListener("click", () => deleteProduct(btn.dataset.id));
    });
};

const deleteProduct = async (id) => {
    const prod = products.find(p => p.id === id || p._id === id);
    if (!prod) return;

    if (confirm(`¿Estás seguro de que deseas eliminar "${prod.nombre}" del catálogo?`)) {
        const targetId = prod._id || prod.id || id;
        const apiBase = getApiBaseUrl();

        // 1. Eliminar en el Backend (MongoDB Atlas)
        try {
            const res = await fetch(`${apiBase}/api/productos/${targetId}`, {
                method: 'DELETE'
            });
            if (!res.ok) {
                console.warn("Backend no respondió OK al eliminar producto");
            }
        } catch (e) {
            console.warn("No se pudo conectar al backend para eliminar producto:", e);
        }

        // 2. Sincronizar en memoria y LocalStorage
        products = products.filter(p => p.id !== id && p._id !== id && p.id !== targetId && p._id !== targetId);
        setStoredData("products", products);
        renderCatalogTable();
        initCharts();
        showToast(`Producto "${prod.nombre}" eliminado con éxito.`, "error");
    }
};

// ==========================================================================
// 5. GESTIÓN DE PEDIDOS Y VENTAS
// ==========================================================================

const renderOrdersTable = () => {
    const tbody = document.getElementById("orders-table-body");
    const searchVal = document.getElementById("orders-search")?.value.toLowerCase().trim() || "";
    const statusVal = document.getElementById("orders-filter-status")?.value || "all";
    const badgeOrders = document.getElementById("badge-orders-count");

    const pendingCount = orders.filter(o => {
        const st = (o.estadoPago || o.estado || "").toLowerCase().trim();
        return st === "pendiente" || st === "reservado";
    }).length;

    if (badgeOrders) badgeOrders.textContent = pendingCount.toString();

    if (!tbody) return;

    const filtered = orders.filter(o => {
        const matchesSearch = o.id.toLowerCase().includes(searchVal) || o.cliente.toLowerCase().includes(searchVal) || (o.productos && o.productos.toLowerCase().includes(searchVal));
        const paymentSt = o.estadoPago || o.estado || "Pendiente";
        const matchesStatus = statusVal === "all" || paymentSt === statusVal;
        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding: 2.5rem; color: var(--text-light);">
                    No hay pedidos que coincidan con la búsqueda.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(o => {
        const estadoPago = o.estadoPago || (o.estado === "Pagado" ? "Pagado" : (o.estado === "Cancelado" ? "Cancelado" : "Pendiente"));
        const estadoLogistica = o.estadoLogistica || (o.estado === "Entregado" ? "Entregado" : (o.estado === "En preparación" ? "En preparación" : "Por preparar"));

        return `
        <tr>
            <td><strong style="color:var(--dark-green);">${o.id}</strong></td>
            <td>
                <div>
                    <strong>${o.cliente}</strong>
                    <span style="font-size:0.75rem; color:var(--text-light); display:block;">${o.email || o.metodoPago || 'WhatsApp / Direct'}</span>
                </div>
            </td>
            <td><span style="font-size:0.85rem;">${o.productos}</span></td>
            <td><span style="font-size:0.8rem; color:var(--text-light);">${o.fecha}</span></td>
            <td><strong style="color:var(--dark-green); font-size:0.95rem;">$${Number(o.total).toFixed(2)}</strong></td>
            <td>
                <div class="status-cell-flex">
                    <span class="badge-status ${getPaymentStatusClass(estadoPago)}">${estadoPago}</span>
                    <select class="status-select-table select-payment-table" data-id="${o.id}">
                        <option value="Pendiente" ${estadoPago === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="Pagado" ${estadoPago === 'Pagado' ? 'selected' : ''}>Pagado</option>
                        <option value="Cancelado" ${estadoPago === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </div>
            </td>
            <td>
                <div class="status-cell-flex">
                    <span class="badge-status ${getLogisticsStatusClass(estadoLogistica)}">${estadoLogistica}</span>
                    <select class="status-select-table select-logistics-table" data-id="${o.id}">
                        <option value="Por preparar" ${estadoLogistica === 'Por preparar' ? 'selected' : ''}>Por preparar</option>
                        <option value="En preparación" ${estadoLogistica === 'En preparación' ? 'selected' : ''}>En preparación</option>
                        <option value="Entregado" ${estadoLogistica === 'Entregado' ? 'selected' : ''}>Entregado</option>
                    </select>
                </div>
            </td>
        </tr>
        `;
    }).join("");

    tbody.querySelectorAll(".select-payment-table").forEach(select => {
        select.addEventListener("change", (e) => {
            const orderId = select.dataset.id;
            const newPaymentStatus = e.target.value;
            const order = orders.find(o => o.id === orderId);
            if (order) {
                order.estadoPago = newPaymentStatus;
                order.estado = newPaymentStatus;
                if (!order.estadoLogistica) order.estadoLogistica = "Por preparar";
                setStoredData("orders", orders);
                updateDashboardMetrics();
                initCharts();
                renderDashboardOrdersTable();
                renderOrdersTable();
                showToast(`Pago de ${orderId} actualizado a "${newPaymentStatus}".`);
            }
        });
    });

    tbody.querySelectorAll(".select-logistics-table").forEach(select => {
        select.addEventListener("change", (e) => {
            const orderId = select.dataset.id;
            const newLogisticsStatus = e.target.value;
            const order = orders.find(o => o.id === orderId);
            if (order) {
                order.estadoLogistica = newLogisticsStatus;
                if (!order.estadoPago) order.estadoPago = "Pendiente";
                setStoredData("orders", orders);
                initCharts();
                renderDashboardOrdersTable();
                renderOrdersTable();
                showToast(`Logística de ${orderId} actualizada a "${newLogisticsStatus}".`);
            }
        });
    });
};

// ==========================================================================
// 6. GESTIÓN DE MENSAJES DE CONTACTO
// ==========================================================================

const renderMessages = () => {
    const container = document.getElementById("messages-container");
    const badgeMsg = document.getElementById("badge-messages-count");
    const indicator = document.getElementById("messages-unread-indicator");

    const unreadCount = messages.filter(m => !m.leido).length;
    if (badgeMsg) badgeMsg.textContent = unreadCount.toString();
    if (indicator) indicator.textContent = `${unreadCount} no leídos`;

    if (!container) return;

    if (messages.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-light); background: var(--white); border-radius: 16px;">
                No tienes mensajes de clientes por el momento.
            </div>
        `;
        return;
    }

    container.innerHTML = messages.map(m => `
        <div class="message-card ${!m.leido ? 'unread' : ''}">
            <div>
                <div class="message-header">
                    <div class="message-sender">
                        <strong>${m.nombre}</strong>
                        <span>${m.email}</span>
                    </div>
                    <span class="message-date">${m.fecha}</span>
                </div>
                <div class="message-body">
                    "${m.mensaje}"
                </div>
            </div>
            <div class="message-actions">
                ${!m.leido ? `
                    <button class="btn-secondary btn-sm btn-mark-read" data-id="${m.id}">
                        Marcar como leído
                    </button>
                ` : `
                    <span style="font-size:0.75rem; color: var(--success); font-weight: 600; align-self: center;">Leído ✓</span>
                `}
                <button class="btn-icon btn-delete btn-delete-msg" data-id="${m.id}" title="Eliminar consulta">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join("");

    document.querySelectorAll(".btn-mark-read").forEach(btn => {
        btn.addEventListener("click", () => {
            const msg = messages.find(m => m.id === btn.dataset.id);
            if (msg) {
                msg.leido = true;
                setStoredData("messages", messages);
                renderMessages();
                showToast("Mensaje marcado como leído.");
            }
        });
    });

    document.querySelectorAll(".btn-delete-msg").forEach(btn => {
        btn.addEventListener("click", () => {
            messages = messages.filter(m => m.id !== btn.dataset.id);
            setStoredData("messages", messages);
            renderMessages();
            showToast("Mensaje eliminado.", "error");
        });
    });
};

// ==========================================================================
// 7. TOAST NOTIFICATIONS
// ==========================================================================

const showToast = (message, type = "success") => {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            ${type === "success" 
                ? '<polyline points="20 6 9 17 4 12"></polyline>' 
                : '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'}
        </svg>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        toast.style.transition = "0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3200);
};

// ==========================================================================
// 8. AUTENTICACIÓN & CONTROL DE VISTAS
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('login-form');
    const errorMsg = document.getElementById('login-error');
    const btnLogout = document.getElementById('btn-logout');
    const periodFilter = document.getElementById('period-filter');
    const pageTitle = document.getElementById('page-current-title');

    // Comprobar estado de sesión
    const checkSession = () => {
        const token = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');
        if (token) {
            loginView.classList.add('hidden');
            dashboardView.classList.remove('hidden');
            
            // Inicializar vistas y datos
            loadProducts(); // Sincroniza productos en vivo desde MongoDB Atlas
            initCharts(periodFilter?.value || 'month');
            renderOrdersTable();
            renderMessages();
        } else {
            loginView.classList.remove('hidden');
            dashboardView.classList.add('hidden');
        }
    };

    // Procesar Login Privado
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = document.getElementById('admin-user').value.trim();
            const pass = document.getElementById('admin-pass').value.trim();
            const remember = document.getElementById('remember-me').checked;
            const btnSubmit = document.getElementById('btn-login-submit');
            const errorSpan = errorMsg.querySelector('span');

            // Estado de validación
            btnSubmit.querySelector('.btn-login-text').textContent = 'Validando seguridad...';
            btnSubmit.disabled = true;

            try {
                // Determinar URL de la API (soporta Live Server en :5500 y Express en :5000)
                const apiBase = getApiBaseUrl();
                const apiUrl = `${apiBase}/api/auth/login`;

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user, password: pass })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    const token = data.token || ('serenoa_secure_' + Date.now());
                    if (remember) {
                        localStorage.setItem('admin_token', token);
                    } else {
                        sessionStorage.setItem('admin_token', token);
                    }
                    errorMsg.classList.add('hidden');
                    checkSession();
                    showToast('¡Bienvenido al panel de administración de Serenoa!');
                } else {
                    if (errorSpan) errorSpan.textContent = data.message || 'Credenciales inválidas. Usuario o contraseña incorrectos.';
                    errorMsg.classList.remove('hidden');
                }
            } catch (err) {
                console.warn('Backend API no disponible directamente, verificando credenciales locales...', err);
                // Fallback seguro local en caso de abrirse como archivo estático o sin servidor encendido
                if (user === 'admin' && pass === 'serenoa2026') {
                    const token = 'serenoa_jwt_secure_' + Date.now();
                    if (remember) {
                        localStorage.setItem('admin_token', token);
                    } else {
                        sessionStorage.setItem('admin_token', token);
                    }
                    errorMsg.classList.add('hidden');
                    checkSession();
                    showToast('¡Bienvenido al panel de administración de Serenoa! (Modo Local)');
                } else {
                    if (errorSpan) errorSpan.textContent = 'Credenciales inválidas. Verifica usuario y contraseña.';
                    errorMsg.classList.remove('hidden');
                }
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.querySelector('.btn-login-text').textContent = 'Acceder al Panel';
            }
        });
    }

    // Procesar Logout
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            sessionStorage.removeItem('admin_token');
            localStorage.removeItem('admin_token');
            if (loginForm) loginForm.reset();
            checkSession();
        });
    }

    // Control del Menú Hamburguesa (Contraer / Esconder Sidebar)
    const initSidebarToggle = () => {
        const btnToggle = document.getElementById('btn-sidebar-toggle');
        const overlay = document.getElementById('sidebar-overlay');
        
        // Restaurar estado guardado en localStorage
        const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
        if (isCollapsed && window.innerWidth > 992) {
            document.body.classList.add('sidebar-collapsed');
        }

        btnToggle?.addEventListener('click', () => {
            if (window.innerWidth <= 992) {
                document.body.classList.toggle('sidebar-open-mobile');
            } else {
                document.body.classList.toggle('sidebar-collapsed');
                const collapsedNow = document.body.classList.contains('sidebar-collapsed');
                localStorage.setItem('sidebar_collapsed', collapsedNow);
            }
        });

        overlay?.addEventListener('click', () => {
            document.body.classList.remove('sidebar-open-mobile');
        });

        // Cerrar menú en móvil al hacer clic en un enlace del sidebar
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 992) {
                    document.body.classList.remove('sidebar-open-mobile');
                }
            });
        });
    };

    // Navegación de pestañas en Sidebar
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-nav .nav-item').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-view-section').forEach(sec => sec.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.dataset.target;
            const targetSec = document.getElementById(targetId);
            if (targetSec) targetSec.classList.add('active');

            // Recargar catálogo si se cambia a la pestaña del catálogo o dashboard
            if (targetId === "section-catalogo" || targetId === "section-dashboard") {
                loadProducts();
            }

            // Actualizar título
            if (pageTitle) {
                switch (targetId) {
                    case "section-dashboard": pageTitle.textContent = "Panel de Control & Analíticas"; break;
                    case "section-catalogo": pageTitle.textContent = "Catálogo de Postres"; break;
                    case "section-pedidos": pageTitle.textContent = "Historial de Pedidos y Ventas"; break;
                    case "section-mensajes": pageTitle.textContent = "Bandeja de Consultas de Clientes"; break;
                }
            }
        });
    });

    // Filtro de períodos (Hoy / Semana / Mes / Año)
    if (periodFilter) {
        periodFilter.addEventListener('change', (e) => {
            initCharts(e.target.value);
            showToast(`Métricas actualizadas a: ${periodFilter.options[periodFilter.selectedIndex].text}`);
        });
    }

    // Selector interactivo de productos vendidos (Total General vs Por Producto Específico)
    const selectProductKpi = document.getElementById("select-kpi-product-view");
    if (selectProductKpi) {
        selectProductKpi.addEventListener("change", (e) => {
            selectedProductSalesView = e.target.value;
            updateDashboardMetrics();
        });
    }

    // Filtros de Catálogo
    document.getElementById("catalog-search")?.addEventListener("input", renderCatalogTable);
    document.getElementById("catalog-filter-category")?.addEventListener("change", renderCatalogTable);

    // Filtros de Pedidos
    document.getElementById("orders-search")?.addEventListener("input", renderOrdersTable);
    document.getElementById("orders-filter-status")?.addEventListener("change", renderOrdersTable);

    // Botón de ver todos los pedidos desde el dashboard
    document.getElementById("btn-view-all-orders")?.addEventListener("click", () => {
        const navOrdersBtn = document.querySelector('[data-target="section-pedidos"]');
        if (navOrdersBtn) navOrdersBtn.click();
    });

    // Activar pestaña según hash de URL (#catalogo, #pedidos, etc.)
    const activateTabFromHash = () => {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            const targetBtn = document.querySelector(`.sidebar-nav .nav-item[data-target="section-${hash}"]`);
            if (targetBtn) {
                targetBtn.click();
            }
        }
    };

    // Comprobar sesión e inicializar controles al inicio
    checkSession();
    initSidebarToggle();
    activateTabFromHash();

    // Sincronizar catálogo automáticamente cuando la ventana vuelve a tener foco (ej: al volver de nuevo_producto.html)
    window.addEventListener('focus', () => {
        const token = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');
        if (token && !dashboardView.classList.contains('hidden')) {
            loadProducts();
        }
    });
});