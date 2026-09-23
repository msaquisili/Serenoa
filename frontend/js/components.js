/**
 * SERENOA - UI Components Library
 * Componentes de renderizado visual para la tienda y panel.
 */

export const UI = {
    // Formateador de moneda en USD
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Badge de estado de pedido o disponibilidad
    createStatusBadge(status, type = 'order') {
        const span = document.createElement('span');
        span.className = `badge-status ${status.toLowerCase().replace(/\s+/g, '-')}`;
        span.textContent = status;
        return span;
    }
};
