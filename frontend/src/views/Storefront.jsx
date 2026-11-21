import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { fetchProducts, getAllCategories } from '../services/api';
import heroCookiesImg from '../assets/hero-cookies.jpg';
import logoSerenoa from '../assets/logo_serenoa_oficial.png';
import contactCakesImg from '../assets/contact-cheesecakes.jpg';

export default function Storefront({ 
  onNavigateToAdmin,
  currentView: controlledView,
  onNavigateTab
}) {
  const [products, setProducts] = useState([]);
  const [internalView, setInternalView] = useState('inicio'); // 'inicio' | 'catalogo' | 'contacto'
  const currentView = controlledView !== undefined ? controlledView : internalView;
  const setCurrentView = (val) => {
    if (onNavigateTab) {
      onNavigateTab(val);
    } else {
      setInternalView(val);
    }
  };
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [contactFeedback, setContactFeedback] = useState(null);
  const [contactForm, setContactForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [isSendingContact, setIsSendingContact] = useState(false);

  useEffect(() => {
    fetchProducts().then(prods => {
      setProducts(prods);
    });

    const handleProductsUpdated = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setProducts(e.detail);
      } else {
        fetchProducts().then(prods => setProducts(prods));
      }
    };

    window.addEventListener('serenoa_products_updated', handleProductsUpdated);
    return () => {
      window.removeEventListener('serenoa_products_updated', handleProductsUpdated);
    };
  }, []);

  // Categorías sincronizadas de forma reactiva (incluyendo las creadas en el panel de administrador)
  const [categories, setCategories] = useState(() => ['Todos', ...getAllCategories(products)]);

  useEffect(() => {
    setCategories(['Todos', ...getAllCategories(products)]);

    const handleCategoriesSync = () => {
      setCategories(['Todos', ...getAllCategories(products)]);
    };

    window.addEventListener('serenoa_categories_updated', handleCategoriesSync);
    return () => {
      window.removeEventListener('serenoa_categories_updated', handleCategoriesSync);
    };
  }, [products]);

  // Filtro de catálogo completo
  const filteredProducts = products.filter(product => {
    const prodCatLower = (product.categoria || '').trim().toLowerCase();
    const activeCatLower = activeCategory.trim().toLowerCase();
    const matchesCategory = activeCatLower === 'todos' || prodCatLower === activeCatLower;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (product.nombre && product.nombre.toLowerCase().includes(q)) ||
      (product.descripcion && product.descripcion.toLowerCase().includes(q)) ||
      (product.categoria && product.categoria.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.nombre || !contactForm.email || !contactForm.mensaje) return;

    setIsSendingContact(true);
    setTimeout(() => {
      try {
        const stored = JSON.parse(localStorage.getItem('serenoa_messages') || '[]');
        stored.unshift({
          id: `msg-${Date.now()}`,
          ...contactForm,
          fecha: 'Recién recibido',
          leido: false
        });
        localStorage.setItem('serenoa_messages', JSON.stringify(stored));
      } catch (err) {}

      setIsSendingContact(false);
      setContactFeedback('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo a la brevedad.');
      setContactForm({ nombre: '', email: '', mensaje: '' });

      setTimeout(() => setContactFeedback(null), 5000);
    }, 600);
  };

  const scrollToSection = (id) => {
    setCurrentView('inicio');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF6EF] flex flex-col justify-between">
      {/* NAVBAR NAVEGACIÓN PRINCIPAL */}
      <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-md border-b border-white/50 transition-all duration-300">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-1.5 sm:py-2 flex items-center justify-between">
          {/* Logo Oficial de Serenoa (Fondo transparente) */}
          <div 
            onClick={() => { setCurrentView('inicio'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center cursor-pointer select-none group transition-transform duration-300 hover:scale-[1.02]"
            title="Serenoa | Pastelería Artesanal"
          >
            <img 
              src={logoSerenoa} 
              alt="Serenoa Pastelería" 
              className="h-9 sm:h-11 md:h-12 w-auto object-contain drop-shadow-sm transition-opacity duration-300 group-hover:opacity-95"
            />
          </div>

          {/* Enlaces de Navegación Estilo Pastelería Artesanal */}
          <nav className="flex items-center gap-6 sm:gap-8 md:gap-10 text-xs sm:text-sm md:text-[15px] font-medium tracking-wide">
            <button 
              onClick={() => { setCurrentView('inicio'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="relative py-1.5 px-1 text-xs sm:text-sm md:text-[15px] font-medium tracking-wide transition-all duration-200 cursor-pointer group"
            >
              <span className={`transition-colors duration-200 ${currentView === 'inicio' ? 'text-[#CF7D65] font-bold' : 'text-[#565935] group-hover:text-[#CF7D65]'}`}>
                Inicio
              </span>
              {currentView === 'inicio' && (
                <span className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#CF7D65] to-[#D4AF37] rounded-full"></span>
              )}
            </button>

            <button 
              onClick={() => { setCurrentView('catalogo'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="relative py-1.5 px-1 text-xs sm:text-sm md:text-[15px] font-medium tracking-wide transition-all duration-200 cursor-pointer group"
            >
              <span className={`transition-colors duration-200 ${currentView === 'catalogo' ? 'text-[#CF7D65] font-bold' : 'text-[#565935] group-hover:text-[#CF7D65]'}`}>
                Catálogo
              </span>
              {currentView === 'catalogo' && (
                <span className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#CF7D65] to-[#D4AF37] rounded-full"></span>
              )}
            </button>

            <button 
              onClick={() => scrollToSection('contacto')}
              className="relative py-1.5 px-1 text-xs sm:text-sm md:text-[15px] font-medium tracking-wide transition-all duration-200 cursor-pointer group text-[#565935] hover:text-[#CF7D65]"
            >
              <span className="group-hover:text-[#CF7D65] transition-colors duration-200">
                Contacto
              </span>
            </button>
          </nav>
        </div>
      </header>

      {/* VISTA 1: INICIO */}
      {currentView === 'inicio' && (
        <main className="w-full">
          {/* HERO SECTION CON FONDO A PANTALLA COMPLETA Y TARJETA GLASSMORPHISM HORIZONTAL */}
          <section id="inicio" className="fade-in relative w-full overflow-hidden bg-[#ECE3D8] min-h-[540px] lg:min-h-[600px] flex items-center">
            {/* Luces ambientales suaves neutras (textura luminosa limpia sin manchas rojas) */}
            <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
              <div className="absolute rounded-full blur-3xl pointer-events-none bg-[#FBF7F0]/90 w-[420px] h-[420px] -top-20 -left-20"></div>
              <div className="absolute rounded-full blur-3xl pointer-events-none bg-[#DECBB6]/60 w-[380px] h-[380px] bottom-0 left-[18%]"></div>
              <div className="absolute rounded-full blur-3xl pointer-events-none bg-[#D7DEC9]/45 w-[320px] h-[320px] top-10 left-[22%]"></div>
            </div>

            {/* Foto principal nítida a la derecha con transición suave */}
            <div className="absolute inset-0 md:left-auto md:right-0 md:w-[65%] lg:w-[62%] h-full pointer-events-none select-none z-0 overflow-hidden hero-mask-desktop">
              <img 
                src={heroCookiesImg} 
                alt="Galletas artesanales Serenoa"
                className="w-full h-full object-cover object-center md:object-left"
              />
              {/* Overlay sutil para móvil */}
              <div className="absolute inset-0 bg-black/5 md:bg-transparent pointer-events-none"></div>
            </div>

            {/* Contenedor y Tarjeta Glassmorphism Equilibrada */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 flex items-center justify-center md:justify-start">
              <div className="w-full max-w-md md:max-w-[580px] mx-auto md:mx-0 md:ml-4 lg:ml-12 px-7 py-8 lg:px-10 lg:py-9 text-center md:text-left bg-[#FAF6F0]/55 backdrop-blur-xl border border-white/85 rounded-2xl shadow-[0_12px_35px_rgba(74,83,40,0.10)] transition-all">
                <span 
                  className="font-serif italic text-sm sm:text-base lg:text-lg mb-2.5 tracking-wide font-medium block !text-[#9A7422]"
                  style={{ color: '#9A7422' }}
                >
                  La vida es dulce, Serenoa ayuda
                </span>
                <h1 className="text-4xl lg:text-[44px] leading-[1.12] font-serif font-bold text-[#3E4622] mb-3.5 tracking-tight">
                  Dulces Momentos <br className="hidden md:block" />Empiezan Aquí.
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-[#3F3D38] mb-6 sm:mb-8 leading-relaxed font-normal max-w-lg">
                  Disfruta de pastelería artesanal y deliciosos postres hechos para alegrar tu día y calentar tu corazón.
                </p>
                <div className="flex justify-center md:justify-start">
                  <button 
                    onClick={() => { setCurrentView('catalogo'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="inline-flex items-center gap-2 px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#CF7D65] to-[#DE8B74] hover:from-[#BF6D55] hover:to-[#CF7D65] text-white font-semibold text-xs sm:text-sm tracking-wide shadow-[0_6px_20px_rgba(207,125,101,0.35)] border border-[#ECC979]/60 hover:brightness-95 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>EXPLORAR CATÁLOGO</span>
                    <span className="arrow text-lg leading-none text-[#FDF0CD]">&gt;</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* FRANJA DE CARACTERÍSTICAS EN VERDE OLIVA PASTEL CON DETALLES DORADOS BRILLANTES */}
          <div className="hero-features-bar w-full py-5 sm:py-7 px-4 sm:px-8 border-y border-[#ECC979]/35 shadow-sm" style={{ backgroundColor: '#6B6D43' }}>
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="feature flex items-center gap-4 justify-start md:justify-center">
                <div className="feature-icon w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(212,175,55,0.22)', border: '1.5px solid #ECC979', color: '#F5CE68' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div className="feature-text text-left">
                  <strong style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Mejores Ingredientes</strong>
                  <span style={{ color: '#F2DEC7', fontSize: '0.85rem', opacity: 0.95, display: 'block' }}>Seleccionados para ti.</span>
                </div>
              </div>

              <div className="feature flex items-center gap-4 justify-start md:justify-center">
                <div className="feature-icon w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(212,175,55,0.22)', border: '1.5px solid #ECC979', color: '#F5CE68' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                </div>
                <div className="feature-text text-left">
                  <strong style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Horneado Perfecto</strong>
                  <span style={{ color: '#F2DEC7', fontSize: '0.85rem', opacity: 0.95, display: 'block' }}>Textura y sabor ideal.</span>
                </div>
              </div>

              <div className="feature flex items-center gap-4 justify-start md:justify-center">
                <div className="feature-icon w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(212,175,55,0.22)', border: '1.5px solid #ECC979', color: '#F5CE68' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </div>
                <div className="feature-text text-left">
                  <strong style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Hecho con Amor</strong>
                  <span style={{ color: '#F2DEC7', fontSize: '0.85rem', opacity: 0.95, display: 'block' }}>Creaciones artesanales.</span>
                </div>
              </div>
            </div>
          </div>

          {/* CATÁLOGO DESTACADO (MÁXIMO 8 PRODUCTOS) */}
          <section id="destacados" className="py-12 sm:py-20 px-4 sm:px-8 w-full bg-white border-y border-[#ECC979]/25">
            <div className="max-w-7xl mx-auto">
              <div className="catalog-hero-header text-center px-2 mb-8 sm:mb-12">
                <span className="subtitle font-serif italic text-[#CF7D65] text-sm sm:text-base block mb-1 font-medium">
                  Nuestras Recomendaciones
                </span>
                <h2 className="section-title text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#2E2A27] mb-2">
                  Nuestro Catálogo
                </h2>
                <p className="text-xs sm:text-sm text-[#7A736B] max-w-lg mx-auto">
                  Una selección de nuestras creaciones más queridas para endulzar tus días.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 w-full">
                {products.slice(0, 8).map(producto => (
                  <ProductCard key={producto.id} producto={producto} />
                ))}
              </div>

              <div className="mt-8 sm:mt-12 flex justify-end px-2">
                <button 
                  onClick={() => { setCurrentView('catalogo'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="inline-flex items-center gap-2 font-bold text-xs sm:text-sm text-[#565935] hover:text-[#CF7D65] transition-colors py-2 px-4 rounded-full bg-[#FAF6EF] border border-[#ECC979]/50 shadow-sm hover:bg-[#F2DEC7]/50 cursor-pointer"
                >
                  <span>Ver más creaciones</span>
                  <span className="text-lg leading-none text-[#D4AF37]">&gt;</span>
                </button>
              </div>
            </div>
          </section>

          {/* SECCIÓN CONTACTO (LAYOUT EDITORIAL 2 COLUMNAS + TARJETA GLASSMORPHISM) */}
          <section id="contacto" className="relative overflow-hidden bg-[#F4EDE3] py-16 pb-24 lg:py-24">
            {/* Brillos ambientales neutros muy sutiles para dar profundidad al cristal */}
            <div className="pointer-events-none select-none">
              <div className="pointer-events-none absolute rounded-full blur-3xl bg-[#FFFDF9]/80 w-[420px] h-[420px] -top-24 -left-16"></div>
              <div className="pointer-events-none absolute rounded-full blur-3xl bg-[#E2D5C3]/55 w-[420px] h-[420px] -bottom-24 -right-16"></div>
            </div>

            {/* Contenedor centrado de 2 columnas */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
                
                {/* Columna Izquierda: Fotografía editorial + etiqueta flotante */}
                <div className="relative rounded-3xl overflow-hidden shadow-[0_14px_35px_rgba(74,83,40,0.12)] h-72 sm:h-96 lg:h-auto lg:min-h-[540px]">
                  <img 
                    src={contactCakesImg} 
                    alt="Pastelería y tortas artesanales Serenoa"
                    className="w-full h-full object-cover object-center"
                  />
                  {/* Degradado inferior sutil para contraste */}
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>

                  {/* Etiqueta flotante centrada abajo */}
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[88%] sm:w-auto px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-white/90 shadow-sm text-center">
                    <span className="text-[#3E4622] text-xs sm:text-sm font-medium sm:whitespace-nowrap">
                      Pedidos con mínimo 2 días de anticipación
                    </span>
                  </div>
                </div>

                {/* Columna Derecha: Tarjeta Glassmorphism con el formulario */}
                <div className="bg-white/65 backdrop-blur-xl border border-white/90 rounded-3xl p-7 sm:p-9 lg:p-10 shadow-[0_12px_35px_rgba(74,83,40,0.10)] flex flex-col justify-center">
                  {/* Encabezado centrado */}
                  <div className="text-center mb-6">
                    <span className="font-serif italic text-[#555E34] text-base sm:text-lg block">
                      Estamos para servirte
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#3E4622] mt-1 tracking-tight">
                      Contáctanos
                    </h2>
                    <p className="text-sm text-[#5A544C] mt-2 max-w-md mx-auto leading-relaxed">
                      Haz tus consultas, pedidos personalizados para eventos o déjanos un mensaje.
                    </p>
                  </div>

                  {/* Mensaje de feedback inline */}
                  {contactFeedback && (
                    <div className="mb-4 p-3.5 bg-[#E8EFE3] text-[#3E4622] text-xs sm:text-sm rounded-xl border border-[#C5D5BC] text-center font-medium shadow-xs">
                      {contactFeedback}
                    </div>
                  )}

                  {/* Formulario */}
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="text-[#3E4622] text-sm font-medium mb-1.5 block">
                        Nombre Completo
                      </label>
                      <input 
                        type="text" 
                        required
                        value={contactForm.nombre}
                        onChange={e => setContactForm({ ...contactForm, nombre: e.target.value })}
                        placeholder="Ej: Sofía Morales"
                        className="w-full rounded-xl bg-[#FAF6F0]/75 border border-[#D8CCBC] px-4 py-3 text-sm text-[#3E4622] placeholder:text-[#8E867B] focus:outline-none focus:border-[#D4826A] focus:ring-2 focus:ring-[#D4826A]/25 transition"
                      />
                    </div>

                    <div>
                      <label className="text-[#3E4622] text-sm font-medium mb-1.5 block">
                        Correo Electrónico
                      </label>
                      <input 
                        type="email" 
                        required
                        value={contactForm.email}
                        onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="tu@email.com"
                        className="w-full rounded-xl bg-[#FAF6F0]/75 border border-[#D8CCBC] px-4 py-3 text-sm text-[#3E4622] placeholder:text-[#8E867B] focus:outline-none focus:border-[#D4826A] focus:ring-2 focus:ring-[#D4826A]/25 transition"
                      />
                    </div>

                    <div>
                      <label className="text-[#3E4622] text-sm font-medium mb-1.5 block">
                        Mensaje o Pedido Especial
                      </label>
                      <textarea 
                        rows="4"
                        required
                        value={contactForm.mensaje}
                        onChange={e => setContactForm({ ...contactForm, mensaje: e.target.value })}
                        placeholder="¿En qué podemos consentir hoy?"
                        className="w-full rounded-xl bg-[#FAF6F0]/75 border border-[#D8CCBC] px-4 py-3 text-sm text-[#3E4622] placeholder:text-[#8E867B] focus:outline-none focus:border-[#D4826A] focus:ring-2 focus:ring-[#D4826A]/25 transition resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSendingContact}
                      className="w-full rounded-full bg-[#D4826A] hover:brightness-95 text-white font-medium py-3.5 mt-2 shadow-sm transition cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      {isSendingContact ? 'Enviando...' : 'Enviar Mensaje'}
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </section>
        </main>
      )}

      {/* VISTA 2: CATÁLOGO COMPLETO */}
      {currentView === 'catalogo' && (
        <main className="w-full min-h-[85vh] py-10 sm:py-16 px-4 sm:px-8 bg-[#FAF6EF] fade-in">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6 sm:mb-10 px-2">
              <span className="subtitle font-serif italic text-[#CF7D65] text-sm sm:text-base block mb-1 font-medium">
                Nuestras Creaciones
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#2E2A27] mb-2">
                Catálogo Completo
              </h1>
              <p className="text-xs sm:text-sm text-[#7A736B] max-w-lg mx-auto">
                Explora nuestra carta completa de repostería de autor y postres artesanales.
              </p>
            </div>

            {/* Barra de búsqueda y categorías */}
            <div className="w-full max-w-3xl mx-auto mb-8 sm:mb-12 flex flex-col gap-4">
              <div className="relative max-w-md w-full mx-auto">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ABA66F] pointer-events-none" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar postre, ingrediente o sabor..."
                  className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-full bg-white border border-[#ECC979]/45 text-xs sm:text-sm text-[#2E2A27] focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 focus:border-[#CF7D65] shadow-sm"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-[#CF7D65] hover:text-white flex items-center justify-center text-xs transition-colors"
                  >
                    &times;
                  </button>
                )}
              </div>

              {/* Píldoras de Categoría */}
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2.5 px-1">
                {categories.map(cat => {
                  const isActive = cat.toLowerCase() === activeCategory.toLowerCase();
                  return (
                    <button 
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${isActive ? 'bg-gradient-to-r from-[#CF7D65] to-[#DE8B74] text-white shadow-md border border-[#ECC979]/50' : 'bg-white border border-[#ECC979]/40 text-[#565935] hover:bg-[#F2DEC7]/50'}`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid de productos filtrados */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white rounded-2xl max-w-md mx-auto border border-dashed border-[#ECC979]/50 shadow-sm">
                <div className="text-4xl mb-3">🍰</div>
                <h3 className="text-base sm:text-lg font-bold text-[#2E2A27] mb-1 font-serif">
                  No encontramos postres coincidentes
                </h3>
                <p className="text-xs sm:text-sm text-[#7A736B] mb-4">
                  Intenta con otra palabra clave o selecciona otra categoría.
                </p>
                <button 
                  onClick={() => { setActiveCategory('Todos'); setSearchQuery(''); }}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#CF7D65] to-[#DE8B74] text-white text-xs sm:text-sm font-semibold shadow hover:from-[#BF6D55] hover:to-[#CF7D65] cursor-pointer"
                >
                  Mostrar todos los postres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 w-full">
                {filteredProducts.map(producto => (
                  <ProductCard key={producto.id} producto={producto} />
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* FOOTER */}
      <footer className="w-full bg-[#565935] text-white py-8 px-4 text-center text-xs text-[#F2DEC7]/80 border-t border-[#ECC979]/30">
        <p>© 2026 Serenoa Pastelería | Desarrollado por Megan Saquisili Fuentes</p>
      </footer>
    </div>
  );
}
