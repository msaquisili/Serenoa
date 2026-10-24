/**
 * SERENOA - Tienda Pública & Carrito Interactivo
 * Catálogo Dinámico, Vistas SPA (Inicio / Catálogo Completo), Carrito Offcanvas y Checkout por WhatsApp.
 */

// ============================================================================
// 1. CONSTANTES & ESTADO GLOBAL
// ============================================================================

const WHATSAPP_PHONE = '593969879578'; // Contacto oficial Serenoa

/**
 * Obtiene la URL base correcta del API detectando el host de ejecución (Live Server vs Node directo)
 */
const getApiBaseUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:5000';
    if (window.location.origin && window.location.origin.includes(':5000')) return '';
    const host = window.location.hostname || 'localhost';
    return `${window.location.protocol}//${host}:5000`;
};

const API_BASE_URL = getApiBaseUrl();

const DEFAULT_PRODUCTS = [
    {
        id: "prod-1",
        nombre: "Tarta de Fresa Clásica",
        categoria: "Tartas",
        precio: 15.00,
        stock: 12,
        imagen: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=400&auto=format&fit=crop",
        descripcion: "Base crujiente de masa sableé, suave crema pastelera con vainilla de Madagascar y fresas.",
        activo: true
    },
    {
        id: "prod-2",
        nombre: "Cheesecake New York con Frutos Rojos",
        categoria: "Cheesecakes",
        precio: 18.00,
        stock: 8,
        imagen: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=400&auto=format&fit=crop",
        descripcion: "Horneado lento tradicional con coulis artesanal de frambuesas y moras silvestres.",
        activo: true
    },
    {
        id: "prod-3",
        nombre: "Caja de Macarons Franceses (x6)",
        categoria: "Macarons",
        precio: 12.00,
        stock: 25,
        imagen: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=400&auto=format&fit=crop",
        descripcion: "Sabores surtidos: Pistacho, Frambuesa, Chocolate belga 70%, Vainilla y Café espresso.",
        activo: true
    },
    {
        id: "prod-4",
        nombre: "Tarta Selva Negra de Autor",
        categoria: "Tartas",
        precio: 22.00,
        stock: 6,
        imagen: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=400&auto=format&fit=crop",
        descripcion: "Bizcocho de cacao fino de aroma, cerezas maceradas en licor kirsch y crema chantilly.",
        activo: true
    },
    {
        id: "prod-5",
        nombre: "Éclair de Chocolate Valrhona",
        categoria: "Postres Especiales",
        precio: 6.50,
        stock: 18,
        imagen: "https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=400&auto=format&fit=crop",
        descripcion: "Pasta choux rellena de crema pastelera de chocolate amargo 64% y glaseado brillante.",
        activo: true
    },
    {
        id: "prod-6",
        nombre: "Tiramisú Tradicional al Mascarpone",
        categoria: "Postres Especiales",
        precio: 8.50,
        stock: 14,
        imagen: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=400&auto=format&fit=crop",
        descripcion: "Bizcochos savoiardi bañados en café de especialidad y crema suave de queso mascarpone.",
        activo: true
    }
];

let allProducts = [];
let activeCategory = 'Todos';
let searchQuery = '';
let cart = [];

// ============================================================================
// 2. PERSISTENCIA Y CARGA DE PRODUCTOS
// ============================================================================

/**
 * Normaliza objetos de producto provenientes de API (MongoDB) o LocalStorage
 */
const normalizeProduct = (p) => ({
    id: p._id ? p._id.toString() : (p.id || `prod-${Math.random().toString(36).substr(2, 9)}`),
    nombre: p.nombre || 'Postre Artesanal',
    categoria: p.categoria || 'Tartas',
    precio: Number(p.precio) || 0,
    stock: p.stock !== undefined ? Number(p.stock) : 10,
    imagen: p.imagen || 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400',
    descripcion: p.descripcion || p.desc || 'Creación artesanal Serenoa.',
    activo: p.disponibilidad !== undefined ? Boolean(p.disponibilidad) : (p.activo !== undefined ? Boolean(p.activo) : true)
});

/**
 * Obtiene los productos desde el Backend (MongoDB Atlas) o fallback a LocalStorage
 */
const fetchProductsFromBackend = async () => {
    const urlsToTry = [
        `${getApiBaseUrl()}/api/productos`,
        'http://127.0.0.1:5000/api/productos',
        'http://localhost:5000/api/productos'
    ];
    const uniqueUrls = [...new Set(urlsToTry)];

    for (const url of uniqueUrls) {
        try {
            const response = await fetch(url, { cache: 'no-store' });
            if (response.ok) {
                const resData = await response.json();
                if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
                    const normalized = resData.data.map(normalizeProduct).filter(p => p.activo && p.stock > 0);
                    
                    // Sincronizar copia local de forma aislada para que QuotaExceededError nunca interrumpa la carga
                    try {
                        localStorage.setItem('serenoa_products', JSON.stringify(normalized));
                    } catch (storageErr) {
                        console.warn('Aviso de almacenamiento: localStorage excedió su cuota. Guardando versión ligera:', storageErr);
                        try {
                            const lightweight = normalized.map(p => ({
                                ...p,
                                imagen: (p.imagen && p.imagen.startsWith('data:') && p.imagen.length > 50000)
                                    ? 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400'
                                    : p.imagen
                            }));
                            localStorage.setItem('serenoa_products', JSON.stringify(lightweight));
                        } catch (ignore) {}
                    }

                    return normalized;
                }
            }
        } catch (e) {
            console.warn(`Intento de conexión a ${url} no disponible:`, e.message);
        }
    }

    // Fallback a LocalStorage o Mock inicial si ningún endpoint respondió
    try {
        const stored = localStorage.getItem('serenoa_products');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map(normalizeProduct).filter(p => p.activo && p.stock > 0);
            }
        }
    } catch (err) {
        console.error('Error leyendo LocalStorage:', err);
    }

    return DEFAULT_PRODUCTS.map(normalizeProduct);
};

// ============================================================================
// 3. GESTIÓN DEL CARRITO DE COMPRAS
// ============================================================================

const loadCartFromStorage = () => {
    try {
        const stored = localStorage.getItem('serenoa_cart');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
};

const saveCartToStorage = () => {
    try {
        localStorage.setItem('serenoa_cart', JSON.stringify(cart));
    } catch (e) {
        console.error('Error guardando carrito:', e);
    }
};

const getProductCartQty = (productId) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.cantidad : 0;
};

const addToCart = (productId, delta = 1) => {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = cart.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
        cart[existingIndex].cantidad += delta;
        if (cart[existingIndex].cantidad <= 0) {
            cart.splice(existingIndex, 1);
        }
    } else if (delta > 0) {
        cart.push({
            id: product.id,
            nombre: product.nombre,
            precio: product.precio,
            imagen: product.imagen,
            cantidad: delta,
            categoria: product.categoria
        });
    }

    saveCartToStorage();
    renderCartUI();
    syncAllCardQuantityControls();
    bumpCartBadge();
};

const updateCartItemQty = (productId, newQty) => {
    if (newQty <= 0) {
        removeFromCart(productId);
        return;
    }

    const item = cart.find(i => i.id === productId);
    if (item) {
        item.cantidad = newQty;
        saveCartToStorage();
        renderCartUI();
        syncAllCardQuantityControls();
    }
};

const removeFromCart = (productId) => {
    cart = cart.filter(i => i.id !== productId);
    saveCartToStorage();
    renderCartUI();
    syncAllCardQuantityControls();
};

const getCartTotalCount = () => {
    return cart.reduce((acc, item) => acc + item.cantidad, 0);
};

const getCartTotalPrice = () => {
    return cart.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);
};

const bumpCartBadge = () => {
    const badge = document.getElementById('cart-count-badge');
    if (badge) {
        badge.classList.remove('bump');
        void badge.offsetWidth; // Trigger reflow
        badge.classList.add('bump');
    }
};

/**
 * Renderiza el Offcanvas Drawer del Carrito
 */
const renderCartUI = () => {
    const cartBody = document.getElementById('cart-body');
    const cartFooter = document.getElementById('cart-footer');
    const cartCountBadge = document.getElementById('cart-count-badge');
    const cartItemsCountText = document.getElementById('cart-items-count-text');
    const cartSubtotalPrice = document.getElementById('cart-subtotal-price');
    const cartTotalPrice = document.getElementById('cart-total-price');

    const totalCount = getCartTotalCount();
    const totalPrice = getCartTotalPrice();

    // Actualizar Badge en Navbar
    if (cartCountBadge) {
        cartCountBadge.textContent = totalCount.toString();
        if (totalCount > 0) {
            cartCountBadge.classList.remove('hidden');
        } else {
            cartCountBadge.classList.add('hidden');
        }
    }

    // Actualizar Subtítulo del Header del Carrito
    if (cartItemsCountText) {
        cartItemsCountText.textContent = `${totalCount} ${totalCount === 1 ? 'producto' : 'productos'}`;
    }

    if (!cartBody) return;

    if (cart.length === 0) {
        cartBody.innerHTML = `
            <div class="cart-empty-state">
                <div class="cart-empty-icon">🍰</div>
                <h4>Tu carrito está vacío</h4>
                <p>Explora nuestro catálogo para agregar deliciosas creaciones artesanales.</p>
                <button class="btn-dark" onclick="window.serenoaApp.navigateTo('catalogo'); window.serenoaApp.closeCart();">
                    Ver Catálogo
                </button>
            </div>
        `;
        if (cartFooter) cartFooter.classList.add('hidden');
        return;
    }

    if (cartFooter) cartFooter.classList.remove('hidden');

    if (cartSubtotalPrice) cartSubtotalPrice.textContent = `$${totalPrice.toFixed(2)}`;
    if (cartTotalPrice) cartTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;

    cartBody.innerHTML = cart.map(item => {
        const itemSubtotal = (item.cantidad * item.precio).toFixed(2);
        return `
            <div class="cart-item-card fade-in">
                <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-img">
                <div class="cart-item-details">
                    <div class="cart-item-title" title="${item.nombre}">${item.nombre}</div>
                    <div class="cart-item-unit-price">$${Number(item.precio).toFixed(2)} c/u</div>
                    <div class="cart-item-actions">
                        <div class="cart-qty-pill">
                            <button class="cart-qty-btn btn-cart-item-minus" data-id="${item.id}" aria-label="Disminuir">-</button>
                            <span class="cart-qty-num">${item.cantidad}</span>
                            <button class="cart-qty-btn btn-cart-item-plus" data-id="${item.id}" aria-label="Aumentar">+</button>
                        </div>
                        <span class="cart-item-subtotal">$${itemSubtotal}</span>
                    </div>
                </div>
                <button class="btn-remove-item btn-cart-item-delete" data-id="${item.id}" title="Eliminar producto" aria-label="Eliminar">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
    }).join('');
};

// ============================================================================
// 4. CHECKOUT POR WHATSAPP
// ============================================================================

const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    const total = getCartTotalPrice().toFixed(2);
    let message = `🍰 *¡Hola Serenoa! Deseo realizar el siguiente pedido:*\n\n`;
    message += `------------------------------------\n`;

    cart.forEach(item => {
        const sub = (item.cantidad * item.precio).toFixed(2);
        message += `• *${item.cantidad}x* ${item.nombre}\n  ($${Number(item.precio).toFixed(2)} c/u) = *$${sub}*\n`;
    });

    message += `------------------------------------\n`;
    message += `*TOTAL A PAGAR: $${total}*\n\n`;
    message += `📍 _Por favor confírmame los datos para la reserva. ¡Muchas gracias!_`;

    const encodedUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

    // Registrar pedido en segundo plano en la API de MongoDB si está disponible
    try {
        fetch(`${API_BASE_URL}/api/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cliente: {
                    nombre: 'Cliente Web / WhatsApp',
                    telefono: `+${WHATSAPP_PHONE}`,
                    metodoPago: 'WhatsApp / Transferencia'
                },
                productos: cart.map(i => ({
                    producto: i.id.startsWith('prod-') ? null : i.id,
                    nombre: i.nombre,
                    cantidad: i.cantidad,
                    precioUnitario: i.precio
                })),
                total: Number(total),
                notas: 'Pedido originado desde el carrito web con botón de WhatsApp.'
            })
        }).catch(err => console.log('Registro asíncrono:', err));
    } catch (e) {}

    // Abrir WhatsApp en nueva pestaña
    window.open(encodedUrl, '_blank');
};

// ============================================================================
// 5. COMPONENTES Y TARJETAS DE PRODUCTOS CON CONTROL DE CANTIDAD
// ============================================================================

/**
 * Genera el HTML de la acción en la tarjeta (Botón "Añadir" o Control de Cantidad "+ -")
 */
const renderCardActionHtml = (product) => {
    const qty = getProductCartQty(product.id);

    if (qty > 0) {
        return `
            <div class="card-qty-control" data-product-id="${product.id}">
                <button class="btn-card-qty btn-card-minus" data-id="${product.id}" title="Disminuir" aria-label="Disminuir cantidad">-</button>
                <span class="card-qty-value">${qty}</span>
                <button class="btn-card-qty btn-card-plus" data-id="${product.id}" title="Aumentar" aria-label="Aumentar cantidad">+</button>
            </div>
        `;
    }

    return `
        <button class="btn-dark btn-add-cart" data-id="${product.id}" data-name="${product.nombre}" style="width: 100%; justify-content: center; padding: 0.8rem;">
            Añadir al Carrito
        </button>
    `;
};

/**
 * Plantilla de tarjeta de producto Serenoa
 */
const crearTarjetaProducto = (producto) => {
    return `
        <div class="card fade-in" id="card-prod-${producto.id}" style="display:flex; flex-direction:column; justify-content:space-between; overflow:hidden;">
            <div>
                <div style="height: 200px; border-radius: 8px; overflow: hidden; margin-bottom: 1.2rem; background: #eee; position:relative;">
                    <img src="${producto.imagen}" 
                         alt="${producto.nombre}" 
                         loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400'"
                         style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;">
                    <span style="position:absolute; top:10px; left:10px; background:rgba(26,54,40,0.85); color:white; font-size:0.75rem; font-weight:600; padding:0.25rem 0.7rem; border-radius:50px; backdrop-filter:blur(4px);">
                        ${producto.categoria}
                    </span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 0.5rem; gap:0.5rem;">
                    <h3 style="font-size: 1.2rem; color: var(--dark-green); line-height: 1.2;">${producto.nombre}</h3>
                    <span style="font-size: 1.25rem; font-weight: 700; color: var(--gold); font-family: var(--font-serif); white-space:nowrap;">$${Number(producto.precio).toFixed(2)}</span>
                </div>
                <p style="color: var(--text-light); font-size: 0.88rem; margin-bottom: 1.2rem; line-height: 1.4;">${producto.descripcion}</p>
            </div>
            <div class="card-action-container" id="card-action-${producto.id}">
                ${renderCardActionHtml(producto)}
            </div>
        </div>
    `;
};

/**
 * Sincroniza todos los contenedores de acción de tarjetas en pantalla con el estado actual del carrito
 */
const syncAllCardQuantityControls = () => {
    allProducts.forEach(product => {
        const containers = document.querySelectorAll(`[id="card-action-${product.id}"]`);
        containers.forEach(container => {
            container.innerHTML = renderCardActionHtml(product);
        });
    });
};

// ============================================================================
// 6. RENDERIZADO DE CATÁLOGO DESTACADO (INICIO) & CATÁLOGO COMPLETO
// ============================================================================

/**
 * Renderiza la sección destacada del inicio (máximo 8 productos)
 */
const renderDestacadosGrid = () => {
    const grid = document.getElementById('productos-destacados-grid');
    const loader = document.getElementById('loader-destacados');

    if (loader) loader.classList.add('hidden');
    if (!grid) return;

    const featuredProducts = allProducts.slice(0, 8);

    if (featuredProducts.length === 0) {
        grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: var(--text-light); padding:2rem;">No hay productos disponibles por el momento.</p>';
        return;
    }

    grid.innerHTML = featuredProducts.map(crearTarjetaProducto).join('');
};

/**
 * Renderiza los botones de categorías dinámicas en la vista de Catálogo Completo
 */
const renderCategoryPills = () => {
    const pillsContainer = document.getElementById('category-pills');
    if (!pillsContainer) return;

    let storedCategories = [];
    try {
        storedCategories = JSON.parse(localStorage.getItem('serenoa_categories') || '[]');
    } catch (e) {}

    const categoriesSet = new Set(['Todos']);
    // Categorías de productos cargados
    allProducts.forEach(p => {
        if (p.categoria && p.categoria.trim()) categoriesSet.add(p.categoria.trim());
    });
    // Categorías adicionales creadas por el usuario
    if (Array.isArray(storedCategories)) {
        storedCategories.forEach(cat => {
            if (cat && cat.trim() && cat !== '__add_new_category__') categoriesSet.add(cat.trim());
        });
    }

    const categories = Array.from(categoriesSet);
    const activeCatLower = (activeCategory || 'Todos').trim().toLowerCase();

    pillsContainer.innerHTML = categories.map(cat => {
        const isActive = (cat || '').trim().toLowerCase() === activeCatLower;
        return `
            <button class="category-pill ${isActive ? 'active' : ''}" data-category="${cat}">
                ${cat}
            </button>
        `;
    }).join('');

    // Eventos de selección de categoría
    pillsContainer.querySelectorAll('.category-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            activeCategory = btn.dataset.category;
            renderCategoryPills();
            renderCompletoGrid();
        });
    });
};

/**
 * Recarga y sincroniza los productos y categorías en tiempo real
 */
const refreshCatalogData = async () => {
    allProducts = await fetchProductsFromBackend();
    renderDestacadosGrid();
    renderCategoryPills();
    renderCompletoGrid();
    syncAllCardQuantityControls();
};

/**
 * Renderiza el Catálogo Completo con filtros de búsqueda y categoría
 */
const renderCompletoGrid = () => {
    const grid = document.getElementById('productos-completo-grid');
    const loader = document.getElementById('loader-completo');
    const emptyState = document.getElementById('empty-search-state');

    if (loader) loader.classList.add('hidden');
    if (!grid) return;

    const query = searchQuery.toLowerCase().trim();
    const activeCatLower = (activeCategory || 'Todos').trim().toLowerCase();

    const filtered = allProducts.filter(product => {
        const prodCatLower = (product.categoria || '').trim().toLowerCase();
        const matchesCategory = activeCatLower === 'todos' || prodCatLower === activeCatLower;
        const matchesSearch = !query || 
            (product.nombre && product.nombre.toLowerCase().includes(query)) || 
            (product.descripcion && product.descripcion.toLowerCase().includes(query)) ||
            (product.categoria && product.categoria.toLowerCase().includes(query));

        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
    } else {
        if (emptyState) emptyState.classList.add('hidden');
        grid.innerHTML = filtered.map(crearTarjetaProducto).join('');
    }
};

// ============================================================================
// 7. CONTROL DE NAVEGACIÓN Y VISTAS SPA
// ============================================================================

const navigateToView = (viewName, scrollTarget = null) => {
    const viewInicio = document.getElementById('view-inicio');
    const viewCatalogo = document.getElementById('view-catalogo');
    const navLinks = document.querySelectorAll('.nav-links .nav-link');

    navLinks.forEach(link => {
        if (link.dataset.view === viewName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    if (viewName === 'catalogo') {
        if (viewInicio) viewInicio.classList.add('hidden');
        if (viewCatalogo) {
            viewCatalogo.classList.remove('hidden');
            renderCategoryPills();
            renderCompletoGrid();
            refreshCatalogData(); // Sincroniza productos en vivo
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        history.pushState(null, '', '#catalogo');
    } else if (viewName === 'contacto') {
        if (viewCatalogo) viewCatalogo.classList.add('hidden');
        if (viewInicio) viewInicio.classList.remove('hidden');
        
        const contactoSection = document.getElementById('contacto');
        if (contactoSection) {
            contactoSection.scrollIntoView({ behavior: 'smooth' });
        }
        history.pushState(null, '', '#contacto');
    } else {
        // Vista Inicio
        if (viewCatalogo) viewCatalogo.classList.add('hidden');
        if (viewInicio) viewInicio.classList.remove('hidden');

        if (scrollTarget) {
            const targetEl = document.querySelector(scrollTarget);
            if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        history.pushState(null, '', '#inicio');
    }
};

// ============================================================================
// 8. CONTROL DEL MODAL / OFFCANVAS
// ============================================================================

const openCartDrawer = () => {
    const drawer = document.getElementById('cart-offcanvas');
    const overlay = document.getElementById('cart-overlay');
    if (drawer) {
        drawer.classList.add('active');
        drawer.setAttribute('aria-hidden', 'false');
    }
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
};

const closeCartDrawer = () => {
    const drawer = document.getElementById('cart-offcanvas');
    const overlay = document.getElementById('cart-overlay');
    if (drawer) {
        drawer.classList.remove('active');
        drawer.setAttribute('aria-hidden', 'true');
    }
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
};

// Exponer métodos globales en objeto namespace para navegación
window.serenoaApp = {
    navigateTo: navigateToView,
    openCart: openCartDrawer,
    closeCart: closeCartDrawer
};

// ============================================================================
// 9. INICIALIZACIÓN PRINCIPAL & LISTENERS
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    cart = loadCartFromStorage();

    // 1. Cargar productos desde API
    const loaderDestacados = document.getElementById('loader-destacados');
    if (loaderDestacados) loaderDestacados.classList.remove('hidden');

    allProducts = await fetchProductsFromBackend();

    renderDestacadosGrid();
    renderCategoryPills();
    renderCompletoGrid();
    renderCartUI();

    // 2. Escuchadores de apertura y cierre del carrito
    const btnCartToggle = document.getElementById('btn-cart-toggle');
    const btnCloseCart = document.getElementById('btn-close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    const btnWhatsappCheckout = document.getElementById('btn-whatsapp-checkout');

    btnCartToggle?.addEventListener('click', openCartDrawer);
    btnCloseCart?.addEventListener('click', closeCartDrawer);
    cartOverlay?.addEventListener('click', closeCartDrawer);
    btnWhatsappCheckout?.addEventListener('click', handleWhatsAppCheckout);

    // 3. Delegación de eventos para botones de cantidad y agregar al carrito
    document.addEventListener('click', (e) => {
        // Clic en botón "Añadir al Carrito"
        const btnAdd = e.target.closest('.btn-add-cart');
        if (btnAdd) {
            const prodId = btnAdd.dataset.id;
            addToCart(prodId, 1);
            return;
        }

        // Clic en botón '+' de la tarjeta
        const btnCardPlus = e.target.closest('.btn-card-plus');
        if (btnCardPlus) {
            const prodId = btnCardPlus.dataset.id;
            addToCart(prodId, 1);
            return;
        }

        // Clic en botón '-' de la tarjeta
        const btnCardMinus = e.target.closest('.btn-card-minus');
        if (btnCardMinus) {
            const prodId = btnCardMinus.dataset.id;
            addToCart(prodId, -1);
            return;
        }

        // Clic en botón '+' dentro del offcanvas
        const btnCartPlus = e.target.closest('.btn-cart-item-plus');
        if (btnCartPlus) {
            const prodId = btnCartPlus.dataset.id;
            addToCart(prodId, 1);
            return;
        }

        // Clic en botón '-' dentro del offcanvas
        const btnCartMinus = e.target.closest('.btn-cart-item-minus');
        if (btnCartMinus) {
            const prodId = btnCartMinus.dataset.id;
            addToCart(prodId, -1);
            return;
        }

        // Clic en botón de eliminar producto dentro del offcanvas
        const btnCartDelete = e.target.closest('.btn-cart-item-delete');
        if (btnCartDelete) {
            const prodId = btnCartDelete.dataset.id;
            removeFromCart(prodId);
            return;
        }
    });

    // 4. Navegación en Navbar & Logo
    document.querySelectorAll('.nav-links .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.dataset.view;
            navigateToView(view);
        });
    });

    document.getElementById('brand-logo')?.addEventListener('click', () => {
        navigateToView('inicio');
    });

    // 5. Botón 'Ver más' y Botón 'Explorar' del Hero
    document.getElementById('btn-ver-mas')?.addEventListener('click', () => {
        navigateToView('catalogo');
    });

    document.getElementById('btn-hero-explore')?.addEventListener('click', () => {
        navigateToView('catalogo');
    });

    // 6. Buscador de productos interactivo en tiempo real
    const searchInput = document.getElementById('catalog-search-input');
    const btnClearSearch = document.getElementById('btn-clear-search');
    const btnResetFilters = document.getElementById('btn-reset-filters');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            if (btnClearSearch) {
                if (searchQuery.length > 0) {
                    btnClearSearch.classList.remove('hidden');
                } else {
                    btnClearSearch.classList.add('hidden');
                }
            }
            renderCompletoGrid();
        });
    }

    if (btnClearSearch) {
        btnClearSearch.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                searchQuery = '';
                btnClearSearch.classList.add('hidden');
                searchInput.focus();
                renderCompletoGrid();
            }
        });
    }

    if (btnResetFilters) {
        btnResetFilters.addEventListener('click', () => {
            activeCategory = 'Todos';
            searchQuery = '';
            if (searchInput) searchInput.value = '';
            if (btnClearSearch) btnClearSearch.classList.add('hidden');
            renderCategoryPills();
            renderCompletoGrid();
        });
    }

    // 7. Manejo de Hash inicial de URL (ej: #catalogo, #contacto)
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash === 'catalogo') {
        navigateToView('catalogo');
    } else if (initialHash === 'contacto') {
        navigateToView('contacto');
    }

    // 8. Formulario de Contacto
    const form = document.getElementById('contact-form');
    let feedbackTimeout = null;

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btnText = form.querySelector('.btn-text');
            const feedback = document.getElementById('form-feedback');
            const nombre = document.getElementById('nombre').value.trim();
            const email = document.getElementById('email').value.trim();
            const mensaje = document.getElementById('mensaje').value.trim();
            
            if (feedbackTimeout) clearTimeout(feedbackTimeout);

            if (btnText) btnText.textContent = "Enviando...";
            form.querySelector('button').disabled = true;

            setTimeout(() => {
                try {
                    const storedMsgs = JSON.parse(localStorage.getItem('serenoa_messages') || '[]');
                    const nuevoMensaje = {
                        id: `msg-${Date.now()}`,
                        nombre,
                        email,
                        mensaje,
                        fecha: "Recién recibido",
                        leido: false
                    };
                    storedMsgs.unshift(nuevoMensaje);
                    localStorage.setItem('serenoa_messages', JSON.stringify(storedMsgs));
                } catch (err) {
                    console.error("Error guardando consulta:", err);
                }

                if (feedback) {
                    feedback.textContent = "¡Mensaje enviado con éxito! Nos pondremos en contacto contigo a la brevedad.";
                    feedback.style.color = "var(--success)";
                    feedback.style.opacity = "1";
                    feedback.classList.remove('hidden');
                    feedback.classList.add('fade-in');
                }
                
                form.reset();
                if (btnText) btnText.textContent = "Enviar Mensaje";
                form.querySelector('button').disabled = false;

                feedbackTimeout = setTimeout(() => {
                    if (feedback) {
                        feedback.style.transition = "opacity 0.6s ease, transform 0.6s ease";
                        feedback.style.opacity = "0";
                        feedback.style.transform = "translateY(-5px)";
                        setTimeout(() => {
                            feedback.classList.add('hidden');
                            feedback.textContent = "";
                            feedback.style.opacity = "1";
                            feedback.style.transform = "none";
                            feedback.style.transition = "";
                        }, 600);
                    }
                }, 4500);
            }, 800);
        });
    }

    // Sincronizar catálogo automáticamente cuando la ventana vuelve a tener foco (ej: al volver del panel de administración)
    window.addEventListener('focus', () => {
        refreshCatalogData();
    });

    // Sincronizar cuando otra pestaña modifica datos del catálogo
    window.addEventListener('storage', (e) => {
        if (e.key === 'serenoa_products' || e.key === 'serenoa_categories') {
            refreshCatalogData();
        }
    });
});