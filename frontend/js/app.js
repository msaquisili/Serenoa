/**
 * SERENOA - Tienda Pública
 * Carga de catálogo dinámico y formulario de contacto conectado al panel de administración.
 */

const DEFAULT_PRODUCTS = [
    {
        id: "prod-1",
        nombre: "Tarta de Fresa Clásica",
        categoria: "Tartas",
        precio: 15.00,
        stock: 12,
        imagen: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=400&auto=format&fit=crop",
        desc: "Base crujiente de masa sableé, suave crema pastelera con vainilla de Madagascar y fresas.",
        activo: true
    },
    {
        id: "prod-2",
        nombre: "Cheesecake New York con Frutos Rojos",
        categoria: "Cheesecakes",
        precio: 18.00,
        stock: 8,
        imagen: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=400&auto=format&fit=crop",
        desc: "Horneado lento tradicional con coulis artesanal de frambuesas y moras silvestres.",
        activo: true
    },
    {
        id: "prod-3",
        nombre: "Caja de Macarons Franceses (x6)",
        categoria: "Macarons",
        precio: 12.00,
        stock: 25,
        imagen: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=400&auto=format&fit=crop",
        desc: "Sabores surtidos: Pistacho, Frambuesa, Chocolate belga 70%, Vainilla y Café espresso.",
        activo: true
    },
    {
        id: "prod-4",
        nombre: "Tarta Selva Negra de Autor",
        categoria: "Tartas",
        precio: 22.00,
        stock: 6,
        imagen: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=400&auto=format&fit=crop",
        desc: "Bizcocho de cacao fino de aroma, cerezas maceradas en licor kirsch y crema chantilly.",
        activo: true
    }
];

// Obtener productos desde almacenamiento compartido
const fetchProductos = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                const stored = localStorage.getItem('serenoa_products');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    resolve(parsed.filter(p => p.activo && p.stock > 0));
                    return;
                }
            } catch (e) {
                console.error(e);
            }
            resolve(DEFAULT_PRODUCTS);
        }, 600); // Latencia simulada realista
    });
};

// Componente reutilizable de tarjeta de producto con imagen
const crearTarjetaProducto = (producto) => {
    return `
        <div class="card fade-in" style="display:flex; flex-direction:column; justify-content:space-between; overflow:hidden;">
            <div>
                <div style="height: 200px; border-radius: 8px; overflow: hidden; margin-bottom: 1.2rem; background: #eee;">
                    <img src="${producto.imagen || 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400'}" 
                         alt="${producto.nombre}" 
                         style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;">
                </div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 0.5rem;">
                    <h3 style="font-size: 1.25rem; color: var(--dark-green); line-height: 1.2;">${producto.nombre}</h3>
                    <span style="font-size: 1.25rem; font-weight: 700; color: var(--gold); font-family: var(--font-serif);">$${Number(producto.precio).toFixed(2)}</span>
                </div>
                <p style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 1.2rem; line-height: 1.4;">${producto.desc}</p>
            </div>
            <button class="btn-dark btn-add-cart" data-id="${producto.id}" data-name="${producto.nombre}" style="width: 100%; justify-content: center; padding: 0.8rem;">
                Añadir al Carrito
            </button>
        </div>
    `;
};

// Inicialización de la tienda
document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('productos-grid');
    const loader = document.getElementById('loader');
    
    // 1. Cargar Catálogo
    if (loader) loader.classList.remove('hidden');
    try {
        const productos = await fetchProductos();
        if (grid) {
            if (productos.length === 0) {
                grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: var(--text-light);">No hay productos disponibles en este momento.</p>';
            } else {
                grid.innerHTML = productos.map(crearTarjetaProducto).join('');
            }
        }
    } catch (error) {
        if (grid) grid.innerHTML = '<p class="error-text">Error al cargar el catálogo de productos.</p>';
    } finally {
        if (loader) loader.classList.add('hidden');
    }

    // Eventos para botones de agregar al carrito
    document.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.btn-add-cart');
        if (targetBtn) {
            const prodName = targetBtn.dataset.name;
            const originalText = targetBtn.textContent;
            targetBtn.textContent = "✓ Añadido";
            targetBtn.style.background = "var(--gold)";
            setTimeout(() => {
                targetBtn.textContent = originalText;
                targetBtn.style.background = "var(--dark-green)";
            }, 1200);
        }
    });

    // 2. Formulario de Contacto sincronizado con el Panel de Administración
    const form = document.getElementById('contact-form');
    let feedbackTimeout = null;

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btnText = document.querySelector('.btn-text');
            const feedback = document.getElementById('form-feedback');
            const nombre = document.getElementById('nombre').value.trim();
            const email = document.getElementById('email').value.trim();
            const mensaje = document.getElementById('mensaje').value.trim();
            
            // Limpiar temporizador previo si existía
            if (feedbackTimeout) clearTimeout(feedbackTimeout);

            btnText.textContent = "Enviando...";
            form.querySelector('button').disabled = true;

            setTimeout(() => {
                // Guardar en el buzón compartido para el Admin Panel
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

                feedback.textContent = "¡Mensaje enviado con éxito! Nos pondremos en contacto contigo a la brevedad.";
                feedback.style.color = "var(--success)";
                feedback.style.opacity = "1";
                feedback.classList.remove('hidden');
                feedback.classList.add('fade-in');
                form.reset();
                
                btnText.textContent = "Enviar Mensaje";
                form.querySelector('button').disabled = false;

                // Ocultar el mensaje automáticamente tras un tiempo prudente (4.5 segundos)
                feedbackTimeout = setTimeout(() => {
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
                }, 4500);
            }, 1000);
        });
    }
});