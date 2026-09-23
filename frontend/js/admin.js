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
        estado: "En preparación",
        metodoPago: "Transferencia Bancaria"
    },
    {
        id: "ORD-9020",
        cliente: "Diego Valdivieso",
        email: "diegoy@outlook.com",
        productos: "2x Cheesecake New York",
        fecha: "2026-09-17 09:15",
        total: 36.00,
        estado: "Pendiente",
        metodoPago: "Tarjeta de Crédito"
    },
    {
        id: "ORD-9019",
        cliente: "Valeria Gómez",
        email: "valeriag@gmail.com",
        productos: "1x Tarta Selva Negra",
        fecha: "2026-09-16 16:45",
        total: 22.00,
        estado: "Entregado",
        metodoPago: "Efectivo"
    },
    {
        id: "ORD-9018",
        cliente: "Andrés Silva",
        email: "andres.silva@epn.edu.ec",
        productos: "2x Caja de Macarons, 2x Éclair",
        fecha: "2026-09-16 14:10",
        total: 37.00,
        estado: "Entregado",
        metodoPago: "Transferencia Bancaria"
    },
    {
        id: "ORD-9017",
        cliente: "Sofía Noboa",
        email: "sofia_noboa@gmail.com",
        productos: "1x Tiramisú, 1x Tarta de Fresa",
        fecha: "2026-09-15 18:20",
        total: 23.50,
        estado: "Entregado",
        metodoPago: "Tarjeta de Crédito"
    },
    {
        id: "ORD-9016",
        cliente: "Mateo Carrasco",
        email: "mcarrasco@gmail.com",
        productos: "1x Tarta Selva Negra",
        fecha: "2026-09-15 12:05",
        total: 22.00,
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
        console.error("Error guardando en localStorage", e);
    }
};

// Inicializar almacenamiento si es primera vez
let products = getStoredData("products", DEFAULT_PRODUCTS);
let orders = getStoredData("orders", DEFAULT_ORDERS);
let messages = getStoredData("messages", DEFAULT_MESSAGES);

if (!localStorage.getItem("serenoa_products")) setStoredData("products", products);
if (!localStorage.getItem("serenoa_orders")) setStoredData("orders", orders);
if (!localStorage.getItem("serenoa_messages")) setStoredData("messages", messages);

// ==========================================================================
// 3. CONTROLADORES DE GRÁFICOS (CHART.JS)
// ==========================================================================

let revenueChartInstance = null;
let categoriesChartInstance = null;
let topProductsChartInstance = null;

const initCharts = (period = "month") => {
    const data = ANALYTICS_DATA[period] || ANALYTICS_DATA.month;

    // Actualizar KPI Cards
    const kpiRev = document.getElementById("kpi-revenue");
    const kpiOrd = document.getElementById("kpi-orders");
    const kpiAvg = document.getElementById("kpi-avg-ticket");
    const kpiPending = document.getElementById("kpi-pending-orders");

    if (kpiRev) kpiRev.textContent = `$${data.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (kpiOrd) kpiOrd.textContent = data.orders.toLocaleString();
    if (kpiAvg) kpiAvg.textContent = `$${data.avgTicket.toFixed(2)}`;
    
    // Contar pendientes reales desde la lista de órdenes
    const actualPending = orders.filter(o => o.estado === "Pendiente" || o.estado === "En preparación").length;
    if (kpiPending) kpiPending.textContent = actualPending.toString();

    // 1. Gráfico de Ingresos y Ganancias
    const ctxRevenue = document.getElementById("chart-revenue-sales");
    if (ctxRevenue) {
        if (revenueChartInstance) revenueChartInstance.destroy();

        const ctx = ctxRevenue.getContext("2d");
        const gradientRevenue = ctx.createLinearGradient(0, 0, 0, 300);
        gradientRevenue.addColorStop(0, "rgba(26, 54, 40, 0.25)");
        gradientRevenue.addColorStop(1, "rgba(26, 54, 40, 0.0)");

        const gradientProfit = ctx.createLinearGradient(0, 0, 0, 300);
        gradientProfit.addColorStop(0, "rgba(168, 126, 80, 0.25)");
        gradientProfit.addColorStop(1, "rgba(168, 126, 80, 0.0)");

        revenueChartInstance = new Chart(ctxRevenue, {
            type: "line",
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: "Ingresos Totales ($)",
                        data: data.revenueSeries,
                        borderColor: "#1A3628",
                        backgroundColor: gradientRevenue,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.35,
                        pointBackgroundColor: "#1A3628",
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: "Ganancia Neta ($)",
                        data: data.profitSeries,
                        borderColor: "#A87E50",
                        backgroundColor: gradientProfit,
                        borderWidth: 2.5,
                        borderDash: [4, 4],
                        fill: true,
                        tension: 0.35,
                        pointBackgroundColor: "#A87E50",
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: "#1A3628",
                        titleFont: { family: "Plus Jakarta Sans", size: 13 },
                        bodyFont: { family: "Plus Jakarta Sans", size: 12 },
                        padding: 10,
                        callbacks: {
                            label: (context) => `${context.dataset.label}: $${context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: "Plus Jakarta Sans", size: 11 }, color: "#666" }
                    },
                    y: {
                        grid: { color: "rgba(0,0,0,0.05)" },
                        ticks: {
                            font: { family: "Plus Jakarta Sans", size: 11 },
                            color: "#666",
                            callback: (val) => `$${val}`
                        }
                    }
                }
            }
        });
    }

    // 2. Gráfico Donut de Categorías
    const ctxCat = document.getElementById("chart-categories");
    if (ctxCat) {
        if (categoriesChartInstance) categoriesChartInstance.destroy();

        categoriesChartInstance = new Chart(ctxCat, {
            type: "doughnut",
            data: {
                labels: ["Tartas", "Cheesecakes", "Macarons", "Especiales"],
                datasets: [{
                    data: [
                        data.categories.Tartas,
                        data.categories.Cheesecakes,
                        data.categories.Macarons,
                        data.categories.PostresEspeciales
                    ],
                    backgroundColor: ["#1A3628", "#A87E50", "#C49F6A", "#333333"],
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
                            label: (context) => ` ${context.label}: ${context.raw}% de ventas`
                        }
                    }
                },
                cutout: "68%"
            }
        });
    }

    // 3. Gráfico de Barras: Top 5 Productos
    const ctxTop = document.getElementById("chart-top-products");
    if (ctxTop) {
        if (topProductsChartInstance) topProductsChartInstance.destroy();

        topProductsChartInstance = new Chart(ctxTop, {
            type: "bar",
            data: {
                labels: data.topProducts.map(p => p.name),
                datasets: [{
                    label: "Unidades Vendidas",
                    data: data.topProducts.map(p => p.sales),
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
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: "rgba(0,0,0,0.05)" },
                        ticks: { font: { family: "Plus Jakarta Sans" } }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { font: { family: "Plus Jakarta Sans", weight: 600 } }
                    }
                }
            }
        });
    }

    // Renderizar lista mini de órdenes en el Dashboard
    renderMiniOrders();
};

const renderMiniOrders = () => {
    const miniContainer = document.getElementById("mini-orders-list");
    if (!miniContainer) return;

    const recent = orders.slice(0, 4);
    miniContainer.innerHTML = recent.map(o => `
        <div class="mini-order-row">
            <div class="mini-order-info">
                <strong>${o.cliente} <span style="color:var(--text-light); font-weight:normal; font-size:0.75rem;">(${o.id})</span></strong>
                <span>${o.productos}</span>
            </div>
            <div class="mini-order-meta">
                <span class="price">$${Number(o.total).toFixed(2)}</span>
                <span class="badge-status ${getStatusClass(o.estado)}">${o.estado}</span>
            </div>
        </div>
    `).join("");
};

const getStatusClass = (estado) => {
    switch (estado.toLowerCase()) {
        case "entregado": return "entregado";
        case "en preparación": return "en-preparacion";
        case "pendiente": return "pendiente";
        case "cancelado": return "cancelado";
        default: return "pendiente";
    }
};

// ==========================================================================
// 4. GESTIÓN DE CATÁLOGO (CRUD DE PRODUCTOS)
// ==========================================================================

const renderCatalogTable = () => {
    const tbody = document.getElementById("catalog-table-body");
    const searchVal = document.getElementById("catalog-search")?.value.toLowerCase().trim() || "";
    const catVal = document.getElementById("catalog-filter-category")?.value || "all";
    const badgeCount = document.getElementById("badge-products-count");

    if (badgeCount) badgeCount.textContent = products.length.toString();
    if (!tbody) return;

    const filtered = products.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchVal) || p.desc.toLowerCase().includes(searchVal);
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

    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td>
                <div class="product-cell">
                    <img src="${p.imagen || 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400'}" alt="${p.nombre}">
                    <div class="product-cell-info">
                        <strong>${p.nombre}</strong>
                        <span>${p.desc ? p.desc.slice(0, 45) + '...' : ''}</span>
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
                <span class="badge-status ${p.activo && p.stock > 0 ? 'available' : 'outofstock'}">
                    ${p.activo && p.stock > 0 ? 'Disponible' : 'Agotado'}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon btn-edit-product" data-id="${p.id}" title="Editar postre">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon btn-delete btn-delete-product" data-id="${p.id}" title="Eliminar postre">
                        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");

    // Conectar eventos de botones de acción
    document.querySelectorAll(".btn-edit-product").forEach(btn => {
        btn.addEventListener("click", () => openProductModal(btn.dataset.id));
    });

    document.querySelectorAll(".btn-delete-product").forEach(btn => {
        btn.addEventListener("click", () => deleteProduct(btn.dataset.id));
    });
};

const openProductModal = (id = null) => {
    const modal = document.getElementById("modal-product");
    const form = document.getElementById("product-form");
    const modalTitle = document.getElementById("modal-product-title");

    form.reset();
    document.getElementById("prod-id").value = "";

    if (id) {
        const prod = products.find(p => p.id === id);
        if (prod) {
            modalTitle.textContent = "Editar Producto";
            document.getElementById("prod-id").value = prod.id;
            document.getElementById("prod-name").value = prod.nombre;
            document.getElementById("prod-category").value = prod.categoria;
            document.getElementById("prod-price").value = prod.precio;
            document.getElementById("prod-stock").value = prod.stock;
            document.getElementById("prod-image").value = prod.imagen || "";
            document.getElementById("prod-desc").value = prod.desc || "";
        }
    } else {
        modalTitle.textContent = "Nuevo Producto";
    }

    modal.classList.remove("hidden");
};

const closeProductModal = () => {
    document.getElementById("modal-product")?.classList.add("hidden");
};

const saveProduct = (e) => {
    e.preventDefault();
    const id = document.getElementById("prod-id").value;
    const nombre = document.getElementById("prod-name").value.trim();
    const categoria = document.getElementById("prod-category").value;
    const precio = parseFloat(document.getElementById("prod-price").value) || 0;
    const stock = parseInt(document.getElementById("prod-stock").value, 10) || 0;
    const imagen = document.getElementById("prod-image").value.trim() || "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400";
    const desc = document.getElementById("prod-desc").value.trim();

    if (!nombre || precio <= 0) {
        showToast("Por favor completa los campos obligatorios.", "error");
        return;
    }

    if (id) {
        // Editar existente
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], nombre, categoria, precio, stock, imagen, desc, activo: stock > 0 };
            showToast(`Producto "${nombre}" actualizado correctamente.`);
        }
    } else {
        // Crear nuevo
        const newProduct = {
            id: `prod-${Date.now()}`,
            nombre,
            categoria,
            precio,
            stock,
            imagen,
            desc,
            activo: stock > 0
        };
        products.unshift(newProduct);
        showToast(`Producto "${nombre}" añadido al catálogo.`);
    }

    setStoredData("products", products);
    closeProductModal();
    renderCatalogTable();
};

const deleteProduct = (id) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;

    if (confirm(`¿Estás seguro de que deseas eliminar "${prod.nombre}" del catálogo?`)) {
        products = products.filter(p => p.id !== id);
        setStoredData("products", products);
        renderCatalogTable();
        showToast(`Producto "${prod.nombre}" eliminado.`, "error");
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

    const pendingCount = orders.filter(o => o.estado === "Pendiente" || o.estado === "En preparación").length;
    if (badgeOrders) badgeOrders.textContent = pendingCount.toString();

    if (!tbody) return;

    const filtered = orders.filter(o => {
        const matchesSearch = o.id.toLowerCase().includes(searchVal) || o.cliente.toLowerCase().includes(searchVal) || o.productos.toLowerCase().includes(searchVal);
        const matchesStatus = statusVal === "all" || o.estado === statusVal;
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

    tbody.innerHTML = filtered.map(o => `
        <tr>
            <td><strong>${o.id}</strong></td>
            <td>
                <div>
                    <strong>${o.cliente}</strong>
                    <span style="font-size:0.75rem; color:var(--text-light); display:block;">${o.email || o.metodoPago}</span>
                </div>
            </td>
            <td><span style="font-size:0.85rem;">${o.productos}</span></td>
            <td><span style="font-size:0.8rem; color:var(--text-light);">${o.fecha}</span></td>
            <td><strong>$${Number(o.total).toFixed(2)}</strong></td>
            <td>
                <span class="badge-status ${getStatusClass(o.estado)}">${o.estado}</span>
            </td>
            <td>
                <select class="status-select-table" data-id="${o.id}">
                    <option value="Pendiente" ${o.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="En preparación" ${o.estado === 'En preparación' ? 'selected' : ''}>En preparación</option>
                    <option value="Entregado" ${o.estado === 'Entregado' ? 'selected' : ''}>Entregado</option>
                    <option value="Cancelado" ${o.estado === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                </select>
            </td>
        </tr>
    `).join("");

    document.querySelectorAll(".status-select-table").forEach(select => {
        select.addEventListener("change", (e) => {
            const orderId = select.dataset.id;
            const newStatus = e.target.value;
            const order = orders.find(o => o.id === orderId);
            if (order) {
                order.estado = newStatus;
                setStoredData("orders", orders);
                renderOrdersTable();
                renderMiniOrders();
                showToast(`Pedido ${orderId} actualizado a "${newStatus}".`);
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
            initCharts(periodFilter?.value || 'month');
            renderCatalogTable();
            renderOrdersTable();
            renderMessages();
        } else {
            loginView.classList.remove('hidden');
            dashboardView.classList.add('hidden');
        }
    };

    // Procesar Login Privado
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('admin-user').value.trim();
            const pass = document.getElementById('admin-pass').value.trim();
            const remember = document.getElementById('remember-me').checked;
            const btnSubmit = document.getElementById('btn-login-submit');

            // Simulación de carga
            btnSubmit.querySelector('.btn-login-text').textContent = 'Validando...';

            setTimeout(() => {
                if (user === 'admin' && pass === 'serenoa2026') {
                    const token = 'serenoa_jwt_secure_' + Date.now();
                    if (remember) {
                        localStorage.setItem('admin_token', token);
                    } else {
                        sessionStorage.setItem('admin_token', token);
                    }
                    errorMsg.classList.add('hidden');
                    btnSubmit.querySelector('.btn-login-text').textContent = 'Acceder al Panel';
                    checkSession();
                    showToast('¡Bienvenido al panel de administración de Serenoa!');
                } else {
                    errorMsg.classList.remove('hidden');
                    btnSubmit.querySelector('.btn-login-text').textContent = 'Acceder al Panel';
                }
            }, 500);
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

    // Navegación de pestañas en Sidebar
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-nav .nav-item').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-view-section').forEach(sec => sec.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.dataset.target;
            const targetSec = document.getElementById(targetId);
            if (targetSec) targetSec.classList.add('active');

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

    // Filtros de Catálogo
    document.getElementById("catalog-search")?.addEventListener("input", renderCatalogTable);
    document.getElementById("catalog-filter-category")?.addEventListener("change", renderCatalogTable);

    // Modal de Productos
    document.getElementById("btn-open-add-product")?.addEventListener("click", () => openProductModal());
    document.getElementById("btn-close-modal")?.addEventListener("click", closeProductModal);
    document.getElementById("btn-cancel-modal")?.addEventListener("click", closeProductModal);
    document.getElementById("product-form")?.addEventListener("submit", saveProduct);

    // Filtros de Pedidos
    document.getElementById("orders-search")?.addEventListener("input", renderOrdersTable);
    document.getElementById("orders-filter-status")?.addEventListener("change", renderOrdersTable);

    // Botón de ver todos los pedidos desde el dashboard
    document.getElementById("btn-view-all-orders")?.addEventListener("click", () => {
        const navOrdersBtn = document.querySelector('[data-target="section-pedidos"]');
        if (navOrdersBtn) navOrdersBtn.click();
    });

    // Comprobar sesión al inicio
    checkSession();
});