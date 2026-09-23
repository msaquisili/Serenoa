/**
 * SERENOA - API & Data Service Module
 * Capa de abstracción para consumo de datos locales o servicios backend (FastAPI / REST).
 */

const API_BASE_URL = window.location.origin;

export const ApiService = {
    // Obtener productos
    async getProducts() {
        const local = localStorage.getItem('serenoa_products');
        return local ? JSON.parse(local) : [];
    },

    // Guardar nuevo producto
    async saveProduct(product) {
        const products = await this.getProducts();
        products.push(product);
        localStorage.setItem('serenoa_products', JSON.stringify(products));
        return product;
    },

    // Obtener pedidos
    async getOrders() {
        const local = localStorage.getItem('serenoa_orders');
        return local ? JSON.parse(local) : [];
    },

    // Enviar mensaje de contacto
    async sendContactMessage(payload) {
        const messages = JSON.parse(localStorage.getItem('serenoa_messages') || '[]');
        messages.unshift(payload);
        localStorage.setItem('serenoa_messages', JSON.stringify(messages));
        return { success: true };
    }
};
