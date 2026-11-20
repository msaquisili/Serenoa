import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function AnalyticsDashboard({ orders = [], products = [] }) {
  // Estados para filtros en cascada
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedProduct, setSelectedProduct] = useState('Todos');

  const barChartRef = useRef(null);
  const donutChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const donutChartInstance = useRef(null);

  // 1. Métricas Generales (3 KPIs principales, sin Ticket Promedio)
  const completedOrders = orders.filter(o => (o.estado || '').toLowerCase() === 'completado');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const activeProductsCount = products.filter(p => p.activo).length;

  // 2. Mapeo de ventas agregadas por producto (pedidos no cancelados)
  const productSalesMap = {};
  orders.forEach(order => {
    if ((order.estado || '').toLowerCase() !== 'cancelado' && Array.isArray(order.productos)) {
      order.productos.forEach(item => {
        const name = item.nombre || 'Desconocido';
        const qty = Number(item.cantidad) || 0;
        const sub = Number(item.precioUnitario || item.precio || 0) * qty;
        if (!productSalesMap[name]) {
          productSalesMap[name] = { unidades: 0, revenue: 0 };
        }
        productSalesMap[name].unidades += qty;
        productSalesMap[name].revenue += sub;
      });
    }
  });

  // Opciones fijas de categorías requeridas más cualquier otra existente
  const baseCategories = ['Todas', 'Galletas', 'Tartas', 'Macarons', 'Postres Especiales', 'Cheesecakes'];
  const productCats = products.map(p => p.categoria).filter(Boolean);
  const allCategoryOptions = ['Todas', ...new Set([...baseCategories.slice(1), ...productCats])];

  // Postres filtrados por la categoría seleccionada
  const categoryProducts = selectedCategory === 'Todas'
    ? products
    : products.filter(p => (p.categoria || '').toLowerCase() === selectedCategory.toLowerCase());

  // Manejar cambio en Selector 1 (Categoría)
  const handleCategoryChange = (newCat) => {
    setSelectedCategory(newCat);
    setSelectedProduct('Todos'); // Resetea el producto al cambiar categoría
  };

  // Recálculo dinámico de las 3 tarjetas según filtros en cascada
  let displayUnits = 0;
  let displayVariety = 0;
  let displayRevenue = 0;

  if (selectedProduct !== 'Todos') {
    // Postre individual específico
    const targetProd = products.find(p => (p._id || p.id) === selectedProduct);
    const prodName = targetProd ? targetProd.nombre : '';
    const sales = productSalesMap[prodName] || { unidades: 0, revenue: 0 };
    displayUnits = sales.unidades;
    displayVariety = sales.unidades > 0 ? 1 : 0;
    displayRevenue = sales.revenue;
  } else if (selectedCategory !== 'Todas') {
    // Todos los postres de la categoría seleccionada
    const catProdNames = new Set(categoryProducts.map(p => p.nombre));
    catProdNames.forEach(name => {
      const sales = productSalesMap[name];
      if (sales) {
        displayUnits += sales.unidades;
        if (sales.unidades > 0) displayVariety += 1;
        displayRevenue += sales.revenue;
      }
    });
  } else {
    // Total general (Todas las categorías y Todos los productos)
    Object.values(productSalesMap).forEach(sales => {
      displayUnits += sales.unidades;
      if (sales.unidades > 0) displayVariety += 1;
      displayRevenue += sales.revenue;
    });
  }

  // 3. Renderizado de Gráficos con Chart.js
  useEffect(() => {
    // Bar chart: Top 5 Postres Más Vendidos
    if (barChartRef.current) {
      if (barChartInstance.current) barChartInstance.current.destroy();

      const topProducts = Object.entries(productSalesMap)
        .sort((a, b) => b[1].unidades - a[1].unidades)
        .slice(0, 5);

      const labels = topProducts.map(p => p[0]);
      const data = topProducts.map(p => p[1].unidades);

      barChartInstance.current = new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: labels.length > 0 ? labels : ['Sin ventas registradas'],
          datasets: [{
            label: 'Unidades Vendidas',
            data: data.length > 0 ? data : [0],
            backgroundColor: '#6B6D43',
            hoverBackgroundColor: '#CF7D65',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, ticks: { precision: 0 } }
          }
        }
      });
    }

    // Donut chart: Ventas por Categoría
    if (donutChartRef.current) {
      if (donutChartInstance.current) donutChartInstance.current.destroy();

      const categoryMap = {};
      orders.forEach(order => {
        if ((order.estado || '').toLowerCase() !== 'cancelado' && Array.isArray(order.productos)) {
          order.productos.forEach(item => {
            const prod = products.find(p => p.nombre === item.nombre);
            const cat = (prod && prod.categoria) ? prod.categoria : 'Otras';
            const qty = Number(item.cantidad) || 0;
            categoryMap[cat] = (categoryMap[cat] || 0) + qty;
          });
        }
      });

      const catLabels = Object.keys(categoryMap);
      const catData = Object.values(categoryMap);

      donutChartInstance.current = new Chart(donutChartRef.current, {
        type: 'doughnut',
        data: {
          labels: catLabels.length > 0 ? catLabels : ['Tartas', 'Cheesecakes', 'Galletas'],
          datasets: [{
            data: catData.length > 0 ? catData : [10, 5, 8],
            backgroundColor: ['#99B4AA', '#6B6D43', '#ABA66F', '#CF7D65', '#E1B8A2', '#D4AF37'],
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }

    return () => {
      if (barChartInstance.current) barChartInstance.current.destroy();
      if (donutChartInstance.current) donutChartInstance.current.destroy();
    };
  }, [orders, products]);

  return (
    <div className="space-y-6">
      {/* 3 KPIs Principales (Ticket Promedio eliminado) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#ECC979]/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#7A736B] block mb-1">Ventas Totales</span>
            <span className="text-2xl font-bold font-sans text-[#D4AF37] tabular-nums">
              ${totalRevenue.toFixed(2)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#FAF6EF] text-[#D4AF37] border border-[#ECC979]/60 flex items-center justify-center font-bold text-lg shadow-inner">
            💰
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ECC979]/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#7A736B] block mb-1">Pedidos Completados</span>
            <span className="text-2xl font-bold font-sans text-[#565935] tabular-nums">
              {completedOrders.length}
            </span>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#99B4AA]/20 text-[#565935] border border-[#99B4AA]/40 flex items-center justify-center font-bold text-lg">
            📦
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ECC979]/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#7A736B] block mb-1">Catálogo Activo</span>
            <span className="text-2xl font-bold font-sans text-[#CF7D65] tabular-nums">
              {activeProductsCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#E1B8A2]/25 text-[#CF7D65] border border-[#CF7D65]/40 flex items-center justify-center font-bold text-lg">
            🍰
          </div>
        </div>
      </div>

      {/* BLOQUE REFACTORIZADO: Rendimiento por Categoría y Producto con Filtros en Cascada */}
      <div className="bg-white p-6 rounded-2xl border border-[#ECC979]/40 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-[#ECC979]/20 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-serif text-[#2E2A27]">
              Rendimiento por Categoría y Producto
            </h3>
            <p className="text-xs text-[#7A736B]">
              Filtra por categoría o selecciona un postre específico para analizar sus ventas.
            </p>
          </div>

          {/* Dos selectores dependientes alineados horizontalmente */}
          <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
            {/* Selector 1: Categoría */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#565935] whitespace-nowrap">Categoría:</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#ECC979]/40 text-xs sm:text-sm font-medium text-[#2E2A27] focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 focus:border-[#CF7D65] bg-[#FAF6EF] cursor-pointer"
              >
                {allCategoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Selector 2: Producto (Dependiente) */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#565935] whitespace-nowrap">Producto:</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#ECC979]/40 text-xs sm:text-sm font-medium text-[#2E2A27] focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 focus:border-[#CF7D65] bg-[#FAF6EF] cursor-pointer max-w-[220px] sm:max-w-[260px]"
              >
                <option value="Todos">
                  {selectedCategory === 'Todas' ? 'Todos los productos' : `Todos (${selectedCategory})`}
                </option>
                {categoryProducts.map(p => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.nombre} (${Number(p.precio).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Las 3 Tarjetas recalculadas dinámicamente según filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FAF6EF] p-5 rounded-xl border border-[#ECC979]/30">
          <div>
            <span className="text-xs text-[#7A736B] font-medium block mb-1">
              Total General de Unidades Vendidas
            </span>
            <span className="text-3xl font-extrabold text-[#565935] font-sans tabular-nums">
              {displayUnits} <span className="text-sm font-normal text-[#7A736B]">unidades</span>
            </span>
          </div>

          <div>
            <span className="text-xs text-[#7A736B] font-medium block mb-1">
              Variedad de Postres con Ventas
            </span>
            <span className="text-3xl font-extrabold text-[#CF7D65] font-sans tabular-nums">
              {displayVariety} <span className="text-sm font-normal text-[#7A736B]">{displayVariety === 1 ? 'receta' : 'recetas'}</span>
            </span>
          </div>

          <div>
            <span className="text-xs text-[#7A736B] font-medium block mb-1">
              Total Facturado en Productos
            </span>
            <span className="text-3xl font-extrabold text-[#D4AF37] font-sans tabular-nums">
              ${displayRevenue.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#ECC979]/40 shadow-sm">
          <h4 className="text-sm font-bold text-[#2E2A27] mb-1 font-serif">
            Top 5 Postres Más Vendidos
          </h4>
          <p className="text-xs text-[#7A736B] mb-4">Demanda acumulada por unidades</p>
          <div className="h-64">
            <canvas ref={barChartRef}></canvas>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#ECC979]/40 shadow-sm">
          <h4 className="text-sm font-bold text-[#2E2A27] mb-1 font-serif">
            Ventas por Familia de Postres
          </h4>
          <p className="text-xs text-[#7A736B] mb-4">Distribución porcentual por categoría</p>
          <div className="h-64">
            <canvas ref={donutChartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}
