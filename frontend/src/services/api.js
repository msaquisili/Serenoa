/**
 * SERENOA - Capa de Servicio API y Datos
 * Conexión centralizada con el backend Node/Express y MongoDB Atlas
 * Con soporte para Stale-While-Revalidate y fallback a LocalStorage
 */

const isLocalEnvironment = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
};

export const getApiBaseUrl = () => {
  const envUrl = import.meta.env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    // Normalizar eliminando cualquier barra final para evitar duplicaciones
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Si estamos en entorno de desarrollo local (localhost / 127.0.0.1)
  if (isLocalEnvironment()) {
    if (typeof window !== 'undefined' && window.location.port === '5000') return '';
    return 'http://localhost:5000';
  }

  // En producción (Cloudflare Pages u otro dominio público):
  // NUNCA devolver localhost para evitar advertencias de Chrome Private Network Access (PNA)
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Genera la lista ordenada de URLs a probar para cada petición
 */
export const getEndpointsToTry = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBaseUrl();
  const list = [];

  if (base) {
    list.push(`${base}${cleanPath}`);
  }

  // Si no hay base configurada o si estamos en local, permitir ruta relativa
  if (!base || isLocalEnvironment()) {
    list.push(cleanPath);
  }

  // ÚNICAMENTE en desarrollo local permitimos fallback a localhost:5000
  if (isLocalEnvironment() && base !== 'http://localhost:5000') {
    list.push(`http://localhost:5000${cleanPath}`);
  }

  return [...new Set(list.filter(Boolean))];
};

export const DEFAULT_PRODUCTS = [
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
  },
  {
    id: "prod-7",
    nombre: "Galletas de mantequilla",
    categoria: "Galletas",
    precio: 5.00,
    stock: 10,
    imagen: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=400&auto=format&fit=crop",
    descripcion: "Pack x 10 galletas suaves de mantequilla con mermelada de fresa natural.",
    activo: true
  },
  {
    id: "prod-8",
    nombre: "Besos de Nuez",
    categoria: "Galletas",
    precio: 2.50,
    stock: 10,
    imagen: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=400&auto=format&fit=crop",
    descripcion: "Deliciosas galletas artesanales con nueces tostadas y una textura suave.",
    activo: true
  },
  {
    id: "prod-9",
    nombre: "Mousse de Chocolate",
    categoria: "Mousse",
    precio: 2.50,
    stock: 10,
    imagen: "https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=400&auto=format&fit=crop",
    descripcion: "Postre clásico francés, de textura irresistiblemente cremosa y esponjosa.",
    activo: true
  }
];

export const normalizeProduct = (p) => ({
  id: p._id ? p._id.toString() : (p.id || `prod-${Math.random().toString(36).substr(2, 9)}`),
  _id: p._id ? p._id.toString() : undefined,
  nombre: p.nombre || 'Postre Artesanal',
  categoria: p.categoria || 'Tartas',
  precio: Number(p.precio) || 0,
  costo: p.costo !== undefined ? Number(p.costo) : 0,
  stock: p.stock !== undefined ? Number(p.stock) : 10,
  imagen: p.imagen || 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400',
  descripcion: p.descripcion || p.desc || 'Creación artesanal Serenoa.',
  activo: p.disponibilidad !== undefined ? Boolean(p.disponibilidad) : (p.activo !== undefined ? Boolean(p.activo) : true)
});

// Cache en memoria para preservar imágenes en alta resolución sin límite de quota
let _memoryProductsCache = null;

/**
 * Obtiene los productos cacheados localmente sin alterar sus imágenes
 */
export const getCachedProducts = () => {
  if (_memoryProductsCache && Array.isArray(_memoryProductsCache) && _memoryProductsCache.length > 0) {
    return _memoryProductsCache.map(normalizeProduct);
  }
  try {
    const stored = localStorage.getItem('serenoa_catalog_cache_v2') || localStorage.getItem('serenoa_products');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeProduct);
      }
    }
  } catch (err) {
    console.warn('Error leyendo caché:', err);
  }
  return DEFAULT_PRODUCTS.map(normalizeProduct);
};

export const setCachedProducts = (products) => {
  if (!Array.isArray(products)) return;
  _memoryProductsCache = products;
  try {
    localStorage.setItem('serenoa_catalog_cache_v2', JSON.stringify(products));
    localStorage.setItem('serenoa_products', JSON.stringify(products));
  } catch (err) {
    console.warn('LocalStorage quota llena, se preservan las imágenes originales intactas en memoria:', err);
  }
};

/**
 * Petición de productos desde el backend con timeout y fallback
 */
export const fetchProducts = async () => {
  const uniqueUrls = getEndpointsToTry('/api/productos');

  for (const url of uniqueUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
      const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const normalized = json.data.map(normalizeProduct);
          setCachedProducts(normalized);
          return normalized;
        }
      }
    } catch (e) {
      // Intentar siguiente URL
    }
  }

  return getCachedProducts();
};

/**
 * Guardar o actualizar producto
 */
export const saveProduct = async (productData, id = null) => {
  const path = id ? `/api/productos/${id}` : '/api/productos';
  const urlsToTry = getEndpointsToTry(path);
  
  const method = id ? 'PUT' : 'POST';

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch (err) {}
  }

  // Fallback a LocalStorage si el backend no responde
  const local = JSON.parse(localStorage.getItem('serenoa_products') || '[]');
  if (id) {
    const idx = local.findIndex(p => p.id === id || p._id === id);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...productData };
    }
  } else {
    const newProd = {
      ...productData,
      id: `prod-${Date.now()}`
    };
    local.unshift(newProd);
  }
  setCachedProducts(local);
  return { success: true, message: 'Guardado localmente' };
};

/**
 * Eliminar producto
 */
export const deleteProduct = async (id) => {
  const urlsToTry = getEndpointsToTry(`/api/productos/${id}`);

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (err) {}
  }

  // Fallback local
  const local = JSON.parse(localStorage.getItem('serenoa_products') || '[]');
  const filtered = local.filter(p => p.id !== id && p._id !== id);
  setCachedProducts(filtered);
  return { success: true };
};

/**
 * Crear un nuevo pedido (Admin / Tienda)
 */
export const createOrder = async (orderData) => {
  const urlsToTry = getEndpointsToTry('/api/pedidos');

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch (err) {}
  }

  // Fallback local
  const orders = JSON.parse(localStorage.getItem('serenoa_orders') || '[]');
  const newOrder = {
    _id: `ord-${Date.now()}`,
    codigo: orderData.codigo || `SER-${Math.floor(1000 + Math.random() * 9000)}`,
    ...orderData,
    createdAt: new Date().toISOString()
  };
  orders.unshift(newOrder);
  localStorage.setItem('serenoa_orders', JSON.stringify(orders));
  return { success: true, data: newOrder };
};

/**
 * Obtener pedidos
 */
export const fetchOrders = async () => {
  const urlsToTry = getEndpointsToTry('/api/pedidos');

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          localStorage.setItem('serenoa_orders', JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch (err) {}
  }

  // Fallback a LocalStorage o Mock Orders iniciales
  try {
    const local = localStorage.getItem('serenoa_orders');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  return [
    {
      _id: "ord-101",
      codigo: "SER-8492",
      cliente: { nombre: "Valeria Montero", telefono: "+593987654321", metodoPago: "WhatsApp / Transferencia" },
      productos: [
        { nombre: "Tarta de Fresa Clásica", cantidad: 2, precioUnitario: 15.00 },
        { nombre: "Caja de Macarons Franceses (x6)", cantidad: 1, precioUnitario: 12.00 }
      ],
      total: 42.00,
      estado: "Completado",
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      _id: "ord-102",
      codigo: "SER-8493",
      cliente: { nombre: "Carlos Mendoza", telefono: "+593991234567", metodoPago: "Efectivo" },
      productos: [
        { nombre: "Cheesecake New York con Frutos Rojos", cantidad: 1, precioUnitario: 18.00 }
      ],
      total: 18.00,
      estado: "Pendiente",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      _id: "ord-103",
      codigo: "SER-8494",
      cliente: { nombre: "Ana Sofía Rivas", telefono: "+593984561230", metodoPago: "Transferencia Bancaria" },
      productos: [
        { nombre: "Tarta Selva Negra de Autor", cantidad: 1, precioUnitario: 22.00 },
        { nombre: "Galletas de mantequilla", cantidad: 2, precioUnitario: 5.00 }
      ],
      total: 32.00,
      estado: "Completado",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ];
};

/**
 * Actualizar estado de pedido
 */
export const updateOrderStatus = async (orderId, nuevoEstado) => {
  const urlsToTry = getEndpointsToTry(`/api/pedidos/${orderId}`);

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) return await res.json();
    } catch (err) {}
  }

  // Fallback local
  const orders = JSON.parse(localStorage.getItem('serenoa_orders') || '[]');
  const idx = orders.findIndex(o => o._id === orderId || o.codigo === orderId);
  if (idx !== -1) {
    orders[idx].estado = nuevoEstado;
    localStorage.setItem('serenoa_orders', JSON.stringify(orders));
  }
  return { success: true };
};

/**
 * Login de Administrador
 */
export const loginAdmin = async (username, password) => {
  const urlsToTry = getEndpointsToTry('/api/auth/login');

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch (err) {}
  }

  // Fallback offline / sin red directa con backend
  if (username === 'admin' && password === 'serenoa2026') {
    return {
      success: true,
      token: 'serenoa_local_token_' + Date.now(),
      user: { username: 'admin', role: 'admin' }
    };
  }

  throw new Error('Credenciales inválidas. Usuario o contraseña incorrectos.');
};
