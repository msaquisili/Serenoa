// --- BASE DE DATOS Y ESTADO ---
const productsData = {
    1: { title: "Blusa Rosa Cuarzo", price: "$25.00", desc: "Hermosa blusa de seda sintética en tono rosa cuarzo. Perfecta para un look casual y elegante.", features: ["100% Poliéster", "Cuello en V", "Mangas ligeras"], images: ["#ffb6b9", "#ffc2c5", "#ffa3a7"] },
    2: { title: "Pantalón Menta Suave", price: "$35.00", desc: "Pantalón de corte alto en un relajante color menta. Cuenta con bolsillos profundos y un ajuste cómodo.", features: ["Algodón y Spandex", "Corte recto", "Incluye cinturón"], images: ["#bbded6", "#c9e6e0", "#a6d4cb"] },
    3: { title: "Bolso Melocotón", price: "$18.00", desc: "Accesorio compacto pero espacioso. El tono melocotón suave combina a la perfección con nuestra línea pastel.", features: ["Cuero vegano", "Correa ajustable", "Bolsillo interno"], images: ["#fae3d9", "#fcede6", "#f2d3c7"] }
};

// Variable para rastrear el ID del producto abierto en el Modal
let currentModalProductId = null;

// ¡NUEVO!: El carrito ahora es una lista real de productos
let cartItems = [];


// --- FUNCIONES DEL CARRITO ---

// Actualiza el número de la burbuja roja
function updateCartBadge() {
    document.getElementById('cart-count').innerText = cartItems.length;
}

// Añadir producto (Recibe el ID del producto y el botón clicado)
function addToCart(productId, buttonElement) {
    const product = productsData[productId];
    cartItems.push(product); // Guardamos el producto entero en la lista
    updateCartBadge();
    
    // Animación del botón
    const originalText = buttonElement.innerText;
    buttonElement.innerText = "¡Añadido! ✨";
    buttonElement.style.backgroundColor = "var(--secondary)";
    buttonElement.style.color = "#333";
    
    setTimeout(() => {
        buttonElement.innerText = originalText;
        buttonElement.style.backgroundColor = "var(--primary)";
        buttonElement.style.color = "white";
    }, 1500);
}

// Añadir desde el modal del producto
function addToCartFromModal(buttonElement) {
    if(currentModalProductId) {
        addToCart(currentModalProductId, buttonElement);
    }
}

// ¡NUEVO!: Eliminar producto del carrito
function removeFromCart(index) {
    cartItems.splice(index, 1); // Elimina 1 elemento en la posición "index"
    updateCartBadge(); // Actualiza el número de arriba
    openCartModal(); // Recarga la vista del carrito para que desaparezca visualmente
}

// ¡NUEVO!: Abrir la vista del Carrito
function openCartModal() {
    const cartList = document.getElementById('cart-items-list');
    const cartTotal = document.getElementById('cart-total-price');
    
    cartList.innerHTML = ''; // Limpiamos la lista visual
    let total = 0;

    if (cartItems.length === 0) {
        cartList.innerHTML = '<p style="text-align: center; color: #999;">Tu carrito está vacío.</p>';
    } else {
        // Recorremos la lista de productos y los dibujamos
        cartItems.forEach((item, index) => {
            // Convertimos el precio de texto ($25.00) a número (25.00)
            const priceNum = parseFloat(item.price.replace('$', ''));
            total += priceNum;

            cartList.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.title}</h4>
                        <p>${item.price}</p>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${index})">🗑️ Quitar</button>
                </div>
            `;
        });
    }

    // Actualizamos el precio final
    cartTotal.innerText = `$${total.toFixed(2)}`;
    document.getElementById('cart-modal').style.display = 'flex';
}

function closeCartModal() {
    document.getElementById('cart-modal').style.display = 'none';
}


// --- FUNCIONES DEL MODAL DE PRODUCTO ---

function openProductModal(productId) {
    currentModalProductId = productId; // Guardamos qué producto estamos viendo
    const product = productsData[productId];
    
    document.getElementById('modal-title').innerText = product.title;
    document.getElementById('modal-price').innerText = product.price;
    document.getElementById('modal-desc').innerText = product.desc;
    
    const featuresList = document.getElementById('modal-features');
    featuresList.innerHTML = ''; 
    product.features.forEach(feature => {
        const li = document.createElement('li');
        li.innerText = feature;
        featuresList.appendChild(li);
    });

    document.getElementById('modal-main-img').style.backgroundColor = product.images[0];
    document.getElementById('thumb1').style.backgroundColor = product.images[0];
    document.getElementById('thumb2').style.backgroundColor = product.images[1];
    document.getElementById('thumb3').style.backgroundColor = product.images[2];

    document.getElementById('product-modal').style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

function changeModalImage(colorOrUrl) {
    document.getElementById('modal-main-img').style.backgroundColor = colorOrUrl;
}


// --- LÓGICA DE NAVEGACIÓN Y ADMIN ---

function switchTab(tabId) {
    document.querySelectorAll('.container').forEach(el => el.classList.remove('active-section'));
    document.getElementById(tabId).classList.add('active-section');
}

function openLoginModal() {
    document.getElementById('login-modal').style.display = 'flex';
    document.getElementById('login-error').style.display = 'none';
    document.getElementById('admin-password').value = '';
}

function closeLoginModal() {
    document.getElementById('login-modal').style.display = 'none';
}

function verifyAdmin() {
    const passwordInput = document.getElementById('admin-password').value;
    if (passwordInput === 'yorus2026') {
        closeLoginModal();
        switchTab('admin');
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

function logoutAdmin() {
    switchTab('store');
    alert("Sesión cerrada correctamente.");
}

// CERRAR TODOS LOS MODALES AL HACER CLIC FUERA DE ELLOS
window.onclick = function(event) {
    const productModal = document.getElementById('product-modal');
    const loginModal = document.getElementById('login-modal');
    const cartModal = document.getElementById('cart-modal');
    
    if (event.target == productModal) closeProductModal();
    if (event.target == loginModal) closeLoginModal();
    if (event.target == cartModal) closeCartModal();
}
