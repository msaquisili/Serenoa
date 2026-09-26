/**
 * SERENOA - Nuevo / Editar Producto
 * Gestión exclusiva para el catálogo de pastelería Serenoa.
 * Campos: Nombre del postre, Categoría, Precio ($ USD), Stock disponible, Estado (Disponible/Agotado/Oculto) y Descripción.
 * Previsualización en vivo con dos opciones de carga (URL y Dispositivo).
 */

const DEFAULT_IMAGE_PLACEHOLDER = 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=600&auto=format&fit=crop';

const DEFAULT_CATEGORIES = [
    "Tartas",
    "Cheesecakes",
    "Macarons",
    "Postres Especiales"
];

const DEFAULT_PRODUCTS = [
    {
        id: "prod-1",
        nombre: "Tarta de Fresa Clásica",
        categoria: "Tartas",
        precio: 15.00,
        stock: 12,
        imagen: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=400&auto=format&fit=crop",
        desc: "Base crujiente de masa sableé, suave crema pastelera con vainilla de Madagascar y fresas frescas seleccionadas.",
        activo: true,
        estado: "Disponible"
    },
    {
        id: "prod-2",
        nombre: "Cheesecake New York con Frutos Rojos",
        categoria: "Cheesecakes",
        precio: 18.00,
        stock: 8,
        imagen: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=400&auto=format&fit=crop",
        desc: "Horneado lento tradicional con coulis artesanal de frambuesas y moras silvestres.",
        activo: true,
        estado: "Disponible"
    },
    {
        id: "prod-3",
        nombre: "Caja de Macarons Franceses (x6)",
        categoria: "Macarons",
        precio: 12.00,
        stock: 25,
        imagen: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=400&auto=format&fit=crop",
        desc: "Sabores surtidos de autor: Pistacho siciliano, Frambuesa, Chocolate belga 70%, Vainilla Bourbon y Café espresso.",
        activo: true,
        estado: "Disponible"
    },
    {
        id: "prod-4",
        nombre: "Tarta Selva Negra de Autor",
        categoria: "Tartas",
        precio: 22.00,
        stock: 6,
        imagen: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=400&auto=format&fit=crop",
        desc: "Bizcocho de cacao fino de aroma, cerezas maceradas en licor kirsch y crema chantilly artesanal.",
        activo: true,
        estado: "Disponible"
    }
];

const getStoredCategories = () => {
    try {
        const item = localStorage.getItem('serenoa_categories');
        if (item) {
            const parsed = JSON.parse(item);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
        return DEFAULT_CATEGORIES;
    } catch (e) {
        return DEFAULT_CATEGORIES;
    }
};

const setStoredCategories = (val) => {
    try {
        localStorage.setItem('serenoa_categories', JSON.stringify(val));
    } catch (e) {
        console.error("Error guardando categorías en localStorage", e);
    }
};

const getStoredProducts = () => {
    try {
        const item = localStorage.getItem('serenoa_products');
        return item ? JSON.parse(item) : DEFAULT_PRODUCTS;
    } catch (e) {
        return DEFAULT_PRODUCTS;
    }
};

const setStoredProducts = (val) => {
    try {
        localStorage.setItem('serenoa_products', JSON.stringify(val));
    } catch (e) {
        console.error("Error guardando en localStorage", e);
    }
};

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

document.addEventListener('DOMContentLoaded', () => {
    // 1. Control de Autenticación
    const token = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');
    if (!token) {
        window.location.href = 'admin.html';
        return;
    }

    // 2. Control del Menú Hamburguesa (Contraer / Esconder Sidebar)
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

        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 992) {
                    document.body.classList.remove('sidebar-open-mobile');
                }
            });
        });
    };

    initSidebarToggle();

    // 3. Cerrar Sesión
    document.getElementById('btn-logout')?.addEventListener('click', () => {
        sessionStorage.removeItem('admin_token');
        localStorage.removeItem('admin_token');
        window.location.href = 'admin.html';
    });

    // 3. Referencias del Formulario
    const form = document.getElementById('product-page-form');
    const inputId = document.getElementById('prod-id');
    const inputName = document.getElementById('prod-name');
    const inputCategory = document.getElementById('prod-category');
    const inputPrice = document.getElementById('prod-price');
    const inputStock = document.getElementById('prod-stock');
    const inputStatus = document.getElementById('prod-status');
    const inputDesc = document.getElementById('prod-desc');
    
    // Referencias para agregar nueva categoría inline (sin alertas)
    const inlineCatBox = document.getElementById('new-category-inline-box');
    const inlineCatInput = document.getElementById('new-category-input');
    const btnConfirmCat = document.getElementById('btn-confirm-category');
    const btnCancelCat = document.getElementById('btn-cancel-category');
    const inlineCatMsg = document.getElementById('new-category-msg');

    // Elementos de Imagen y Preview
    const fileInput = document.getElementById('prod-file-input');
    const fileChosenText = document.getElementById('file-chosen-text');
    const inputImageUrl = document.getElementById('prod-image-url');
    const previewImg = document.getElementById('preview-img');
    const btnClearImage = document.getElementById('btn-clear-image');
    
    // Live preview meta text
    const previewDisplayName = document.getElementById('preview-display-name');
    const previewDisplayCat = document.getElementById('preview-display-cat');
    const previewDisplayPrice = document.getElementById('preview-display-price');

    const pageTitle = document.getElementById('page-title');
    const btnSubmitText = document.getElementById('btn-submit-text');

    let currentImageData = DEFAULT_IMAGE_PLACEHOLDER;
    let previousCategoryValue = "Tartas";

    // 4. Gestión Dinámica de Categorías
    const populateCategorySelect = (selectedCategory = null) => {
        const categories = getStoredCategories();
        inputCategory.innerHTML = "";

        categories.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat;
            opt.textContent = cat;
            inputCategory.appendChild(opt);
        });

        // Opción especial para agregar nueva categoría
        const addNewOpt = document.createElement("option");
        addNewOpt.value = "__add_new_category__";
        addNewOpt.textContent = "+ Agregar nueva categoría";
        addNewOpt.style.fontWeight = "bold";
        addNewOpt.style.color = "var(--gold)";
        inputCategory.appendChild(addNewOpt);

        if (selectedCategory && categories.includes(selectedCategory)) {
            inputCategory.value = selectedCategory;
            previousCategoryValue = selectedCategory;
        } else if (categories.length > 0) {
            inputCategory.value = categories[0];
            previousCategoryValue = categories[0];
        }
    };

    populateCategorySelect();

    // Evento al cambiar de categoría
    inputCategory?.addEventListener('focus', () => {
        if (inputCategory.value !== "__add_new_category__") {
            previousCategoryValue = inputCategory.value;
        }
    });

    inputCategory?.addEventListener('change', () => {
        if (inputCategory.value === "__add_new_category__") {
            // Habilitar espacio inline para escribir la categoría sin alertas
            if (inlineCatBox) {
                inlineCatBox.classList.remove('hidden');
                if (inlineCatInput) {
                    inlineCatInput.value = "";
                    inlineCatInput.focus();
                }
                if (inlineCatMsg) {
                    inlineCatMsg.textContent = "";
                    inlineCatMsg.className = "category-feedback-msg hidden";
                }
            }
        } else {
            previousCategoryValue = inputCategory.value;
            if (inlineCatBox) inlineCatBox.classList.add('hidden');
            updatePreviewMeta();
        }
    });

    // Validar y confirmar nueva categoría inline
    const handleConfirmCategory = () => {
        if (!inlineCatInput || !inlineCatMsg) return;

        const cleanName = inlineCatInput.value.trim();
        const categories = getStoredCategories();

        // Validación: No vacía
        if (!cleanName) {
            inlineCatMsg.textContent = "No se pudo agregar la categoría";
            inlineCatMsg.className = "category-feedback-msg error";
            inlineCatMsg.classList.remove("hidden");
            return;
        }

        // Validación: No debe repetirse con una existente
        const isDuplicate = categories.some(c => c.toLowerCase() === cleanName.toLowerCase());

        if (isDuplicate) {
            inlineCatMsg.textContent = "No se pudo agregar la categoría";
            inlineCatMsg.className = "category-feedback-msg error";
            inlineCatMsg.classList.remove("hidden");
            return;
        }

        // Categoría válida y nueva
        categories.push(cleanName);
        setStoredCategories(categories);
        populateCategorySelect(cleanName);

        inlineCatMsg.textContent = "Categoría agregada con éxito.";
        inlineCatMsg.className = "category-feedback-msg success";
        inlineCatMsg.classList.remove("hidden");
        updatePreviewMeta();

        // Ocultar espacio después de un breve momento
        setTimeout(() => {
            if (inlineCatBox) inlineCatBox.classList.add("hidden");
            inlineCatInput.value = "";
            inlineCatMsg.className = "category-feedback-msg hidden";
            inlineCatMsg.textContent = "";
        }, 1100);
    };

    btnConfirmCat?.addEventListener('click', handleConfirmCategory);

    inlineCatInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleConfirmCategory();
        } else if (e.key === 'Escape') {
            handleCancelCategory();
        }
    });

    // Cancelar agregar nueva categoría
    const handleCancelCategory = () => {
        if (inlineCatBox) inlineCatBox.classList.add('hidden');
        if (inlineCatInput) inlineCatInput.value = "";
        if (inlineCatMsg) {
            inlineCatMsg.className = "category-feedback-msg hidden";
            inlineCatMsg.textContent = "";
        }
        inputCategory.value = previousCategoryValue;
        updatePreviewMeta();
    };

    btnCancelCat?.addEventListener('click', handleCancelCategory);

    // 5. Automatización de Estado según el Stock
    const syncStatusWithStock = () => {
        const stockRaw = inputStock.value.trim();
        if (stockRaw === "") return;

        const stockVal = parseInt(stockRaw, 10);
        if (!isNaN(stockVal)) {
            if (stockVal === 0) {
                inputStatus.value = "Agotado";
            } else if (stockVal > 0) {
                inputStatus.value = "Disponible";
            }
        }
    };

    inputStock?.addEventListener('input', syncStatusWithStock);
    inputStock?.addEventListener('change', syncStatusWithStock);

    // 6. Actualizar vista previa de imagen y metadatos
    const updatePreviewImage = (src) => {
        currentImageData = src || DEFAULT_IMAGE_PLACEHOLDER;
        previewImg.src = currentImageData;
        previewImg.onerror = () => {
            previewImg.src = DEFAULT_IMAGE_PLACEHOLDER;
        };
    };

    const updatePreviewMeta = () => {
        const nameVal = inputName.value.trim() || "Nombre del Postre";
        const catVal = inputCategory.value !== "__add_new_category__" ? inputCategory.value : (previousCategoryValue || "Tartas");
        const priceVal = parseFloat(inputPrice.value);

        if (previewDisplayName) previewDisplayName.textContent = nameVal;
        if (previewDisplayCat) previewDisplayCat.textContent = `Categoría: ${catVal}`;
        if (previewDisplayPrice) {
            previewDisplayPrice.textContent = isNaN(priceVal) || priceVal <= 0 ? "$0.00" : `$${priceVal.toFixed(2)}`;
        }
    };

    // Listeners para reflejar cambios en tiempo real
    inputName?.addEventListener('input', updatePreviewMeta);
    inputPrice?.addEventListener('input', updatePreviewMeta);

    // OPCIÓN 1: Cargar desde dispositivo (Local File)
    fileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileChosenText.textContent = file.name;
            inputImageUrl.value = ""; // Limpiar campo URL si se cargó archivo local

            const reader = new FileReader();
            reader.onload = (event) => {
                updatePreviewImage(event.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            fileChosenText.textContent = "Ningún archivo seleccionado";
        }
    });

    // OPCIÓN 2: URL de imagen en vivo
    inputImageUrl?.addEventListener('input', () => {
        const url = inputImageUrl.value.trim();
        if (url) {
            fileChosenText.textContent = "Ningún archivo seleccionado";
            fileInput.value = ""; // Limpiar selector de archivo
            updatePreviewImage(url);
        } else {
            updatePreviewImage(DEFAULT_IMAGE_PLACEHOLDER);
        }
    });

    // Botón para limpiar / restablecer imagen
    btnClearImage?.addEventListener('click', () => {
        fileInput.value = "";
        inputImageUrl.value = "";
        fileChosenText.textContent = "Ningún archivo seleccionado";
        updatePreviewImage(DEFAULT_IMAGE_PLACEHOLDER);
        showToast("Imagen restablecida a la vista previa por defecto.");
    });

    // 7. Modo Edición (?id=...)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const products = getStoredProducts();

    if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            document.title = `Serenoa | Editar "${product.nombre}"`;
            pageTitle.textContent = `Editar Producto`;
            btnSubmitText.textContent = "Actualizar Producto";

            inputId.value = product.id;
            inputName.value = product.nombre || "";
            
            // Comprobar si la categoría existe en la lista guardada
            const categories = getStoredCategories();
            if (product.categoria && !categories.includes(product.categoria)) {
                categories.push(product.categoria);
                setStoredCategories(categories);
            }
            populateCategorySelect(product.categoria || "Tartas");

            inputPrice.value = product.precio !== undefined ? product.precio : "";
            inputStock.value = product.stock !== undefined ? product.stock : 10;
            
            // Determinar estado
            if (product.estado) {
                inputStatus.value = product.estado;
            } else if (product.stock === 0) {
                inputStatus.value = "Agotado";
            } else if (product.activo === false) {
                inputStatus.value = "Oculto";
            } else {
                inputStatus.value = "Disponible";
            }

            inputDesc.value = product.desc || "";

            if (product.imagen) {
                if (product.imagen.startsWith("data:")) {
                    fileChosenText.textContent = "Imagen guardada en el postre";
                } else {
                    inputImageUrl.value = product.imagen;
                }
                updatePreviewImage(product.imagen);
            }
            updatePreviewMeta();
        }
    }

    // 8. Procesar Envío del Formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = inputId.value;
        const nombre = inputName.value.trim();
        let categoria = inputCategory.value;
        if (categoria === "__add_new_category__") {
            categoria = previousCategoryValue || "Tartas";
        }

        const precio = parseFloat(inputPrice.value);
        const stock = parseInt(inputStock.value, 10);
        const estado = inputStatus.value;
        const activo = estado === "Disponible";
        const desc = inputDesc.value.trim();
        const imagen = currentImageData || DEFAULT_IMAGE_PLACEHOLDER;

        if (!nombre) {
            showToast("Por favor ingresa el nombre del postre.", "error");
            inputName.focus();
            return;
        }

        if (isNaN(precio) || precio <= 0) {
            showToast("Por favor ingresa un precio válido mayor a 0.", "error");
            inputPrice.focus();
            return;
        }

        if (isNaN(stock) || stock < 0) {
            showToast("Por favor ingresa una cantidad de stock válida.", "error");
            inputStock.focus();
            return;
        }

        if (!desc) {
            showToast("Por favor ingresa la descripción de ingredientes y notas de sabor.", "error");
            inputDesc.focus();
            return;
        }

        let currentProducts = getStoredProducts();

        if (id) {
            // Actualizar existente
            const index = currentProducts.findIndex(p => p.id === id);
            if (index !== -1) {
                currentProducts[index] = {
                    id,
                    nombre,
                    categoria,
                    precio,
                    stock,
                    estado,
                    activo,
                    desc,
                    imagen
                };
                setStoredProducts(currentProducts);
                showToast(`"${nombre}" actualizado con éxito.`);
            }
        } else {
            // Crear nuevo postre
            const newProduct = {
                id: `prod-${Date.now()}`,
                nombre,
                categoria,
                precio,
                stock,
                estado,
                activo,
                desc,
                imagen
            };
            currentProducts.unshift(newProduct);
            setStoredProducts(currentProducts);
            showToast(`¡Postre "${nombre}" guardado con éxito!`);
        }

        // Redirección suave al catálogo del panel administrativo
        setTimeout(() => {
            window.location.href = 'admin.html#catalogo';
        }, 700);
    });
});
