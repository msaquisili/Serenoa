import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { fetchProducts } from '../services/api';
import serenaAvatar from '../assets/serena-avatar.png';

const WHATSAPP_PHONE = '5939698799578';
const WHATSAPP_URL = 'https://wa.me/5939698799578';

export default function Chatbot({ onExploreCatalog }) {
  const { addToCart, setIsCartOpen } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnreadNotice, setHasUnreadNotice] = useState(true);
  const messagesEndRef = useRef(null);

  // Sincronización en vivo con el catálogo de productos
  useEffect(() => {
    fetchProducts().then(prods => setProducts(prods || []));

    const handleSync = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setProducts(e.detail);
      } else {
        fetchProducts().then(prods => setProducts(prods || []));
      }
    };

    window.addEventListener('serenoa_products_updated', handleSync);
    return () => window.removeEventListener('serenoa_products_updated', handleSync);
  }, []);

  // Mensaje de bienvenida inicial conversacional y fluido
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: '¡Hola! 🍰 Te doy la bienvenida a Serenoa Pastelería Artesanal.\n\nSoy Serena, tu asistente virtual. ¿Qué postre o antojo te gustaría disfrutar hoy?',
      options: [
        '🍰 Ver tortas y postres',
        '📅 ¿Con cuánta anticipación pido?',
        '🛵 ¿Cómo funcionan las entregas?',
        '💳 Métodos de pago y abonos',
        '🎨 Personalizar una torta',
        '📲 Contactar por WhatsApp'
      ],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      setHasUnreadNotice(false);
      scrollToBottom();
    }
  }, [isOpen, messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Motor de Respuestas Inteligente, Contextual y con Derivación a WhatsApp
   */
  const generateBotResponse = (query, currentMessages = []) => {
    const q = query.toLowerCase().trim();
    // Colapsar repetición de letras (ej: "graciasss" -> "gracias", "holaaa" -> "hola", "siii" -> "si")
    const collapsedQ = q.replace(/(.)\1{2,}/g, '$1');

    // Contexto del mensaje anterior del bot
    const lastBotMsg = [...currentMessages].reverse().find(m => m.sender === 'bot');
    const lastBotText = (lastBotMsg?.text || '').toLowerCase();

    // 1. AGRADECIMIENTOS Y CORTESÍA (evaluar prioritariamente para responder con calidez)
    const isGratitude = 
      /gracia|agradezc|grax|grx|thanks|thank you/i.test(q) ||
      /gracia/i.test(collapsedQ);

    if (isGratitude) {
      return {
        text: '¡Con muchísimo gusto! 🥰 Para mí es un encanto ayudarte. Si necesitas algo más, ya sea revisar la carta de postres, cotizar o hacer tu pedido, aquí estoy lista para consentirte. ¡Que tengas un día super dulce!',
        options: ['🍰 Ver tortas y postres', '📲 Escribir a WhatsApp', '🛍️ Ver mi carrito']
      };
    }

    // 2. CONFIRMACIONES Y AFIRMACIONES (ej: "ok", "listo", "perfecto", "chévere")
    const isAffirmation = 
      /^(ok|okay|oki|okis|vale|listo|perfecto|excelente|entendido|chevere|chévere|genial|bueno|dale|de una|bacan|bacán|super|súper)$/i.test(collapsedQ) ||
      /^(de acuerdo|muy bien|esta bien|está bien|comprendido)$/i.test(q);

    if (isAffirmation) {
      return {
        text: '¡Excelente! Quedo a tu total disposición. ¿Te gustaría ver nuestras tortas disponibles o prefieres consultar algo específico por WhatsApp?',
        options: ['🍰 Ver tortas disponibles', '📲 Escribir a WhatsApp', '📅 Tiempos de anticipación']
      };
    }

    // 3. DESPEDIDAS (ej: "chao", "adiós", "hasta luego")
    const isFarewell = /^(adios|adiós|chao|chau|hasta luego|hasta pronto|nos vemos|bye|bye bye|buenas noches)$/i.test(collapsedQ);
    if (isFarewell) {
      return {
        text: '¡Hasta pronto! 🍰 Fue un gusto atenderte. Cuando tengas un antojito dulce o quieras celebrar una ocasión especial, en Serenoa estaremos felices de consentirte. ¡Lindo día!',
        options: ['🍰 Ver catálogo de postres', '📲 WhatsApp oficial']
      };
    }

    // 4. SALUDOS
    if (['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'que tal', 'saludos'].includes(q) || /^hola+$/i.test(collapsedQ)) {
      return {
        text: '¡Hola! Qué gusto saludarte. En Serenoa preparamos repostería fina de autor con ingredientes de primera calidad para endulzar cada momento.\n\n¿Buscas algún postre en especial, deseas conocer sobre nuestras entregas en Guayaquil o te gustaría cotizar una torta personalizada?',
        options: ['🍰 Ver tortas disponibles', '📅 Tiempos de anticipación', '🛵 Entregas a domicilio', '🎨 Personalizar torta']
      };
    }

    // 5. RESPUESTA A SECTORES DE GUAYAQUIL (O SI EL BOT PREGUNTÓ EL SECTOR)
    const knownSectors = [
      'centro', 'norte', 'sur', 'urdesa', 'ceibos', 'los ceibos', 'alborada', 'sauces', 
      'garzota', 'kennedy', 'samborondon', 'samborondón', 'la puntilla', 'entre rios', 'entre ríos',
      'daule', 'la aurora', 'via a la costa', 'vía a la costa', 'puerto azul', 'puerto santa ana', 
      'las peñas', 'samanes', 'guayacanes', 'mapasingue', 'prosperina', 'guasmo', 'suburbio', 
      'duran', 'durán', 'chongon', 'chongón', 'salitre', 'ciudad celeste', 'la joya', 'villa del rey', 
      'villa club', 'mucho lote', 'bastion', 'bastión', 'polaris', 'orquideas', 'orquídeas',
      'bellavista', 'miraflores', 'centenario', 'pradera', 'floresta'
    ];

    const matchedSector = knownSectors.find(s => q.includes(s));

    // El bot estuvo preguntando explícitamente por el sector SOLO si su último mensaje contenía esa pregunta directa
    const wasExplicitlyAskingForSector = 
      lastBotText.includes('en qué sector') || 
      lastBotText.includes('qué sector') || 
      lastBotText.includes('en que zona') || 
      lastBotText.includes('te encuentras?');

    const isSectorAnswer = 
      matchedSector || 
      (wasExplicitlyAskingForSector && !isGratitude && !isAffirmation && !isFarewell && q.length < 50);

    if (isSectorAnswer) {
      const sectorName = matchedSector 
        ? matchedSector.charAt(0).toUpperCase() + matchedSector.slice(1)
        : query.trim();

      return {
        text: `¡Excelente! Para entregas en el sector de ${sectorName} en Guayaquil, contamos con tarifas fijas de envío según la distancia 🛵.\n\nPara confirmarte el valor exacto de la tarifa fija y coordinar la entrega con nuestro motorizado de confianza, por favor escríbenos a nuestro WhatsApp oficial con tu dirección o referencia.`,
        options: [
          `📲 Coordinar envío a ${sectorName} por WhatsApp`,
          '🍰 Ver tortas y postres',
          '📅 Anticipación de 2 días',
          '💳 Métodos de pago y abonos'
        ]
      };
    }

    // 4. IDENTIDAD, UBICACIÓN, LOCAL FÍSICO Y RETIRO
    if (
      q.includes('donde estan') || q.includes('donde estan ubicados') || q.includes('ubicacion') || 
      q.includes('direccion') || q.includes('local') || q.includes('tienda fisica') || 
      q.includes('establecimiento') || q.includes('retiro') || q.includes('retirar') || 
      q.includes('recoger') || q.includes('pasar a ver')
    ) {
      return {
        text: 'Serenoa es una pastelería 100% virtual en Guayaquil, Ecuador 🧁.\n\nNo contamos con local físico ni servicio de retiro presencial; por eso realizamos todas las entregas exclusivamente a domicilio en la ciudad. Cada postre se hornea fresco y artesanalmente para llevártelo directo a tu puerta.',
        options: ['🛵 ¿Cómo es el envío a domicilio?', '📅 Tiempos de anticipación', '🍰 Ver tortas y postres']
      };
    }

    // 5. PEDIDOS Y ANTICIPACIÓN
    if (
      q.includes('anticipacion') || q.includes('tiempo') || q.includes('cuando pedir') || 
      q.includes('urgente') || q.includes('para hoy') || q.includes('para mañana') || 
      q.includes('dias de anticipacion') || q.includes('viernes') || q.includes('lunes') || q.includes('plazo')
    ) {
      return {
        text: 'Elaboramos todo bajo pedido de forma artesanal, por lo que te pedimos realizar tu solicitud con un mínimo de 2 días de anticipación 📅.\n\nTen en cuenta que los pedidos que confirmamos los viernes se entregan a partir del día lunes, respetando siempre los 2 días mínimos. No realizamos entregas de un día para otro para poder garantizarte la mayor frescura.',
        options: ['💳 ¿Cómo confirmar mi pedido?', '🛵 Zonas de entrega', '🍰 Ver tortas y postres']
      };
    }

    // 6. MÉTODOS DE PAGO
    if (
      (q.includes('metodo') && q.includes('pago')) || q.includes('formas de pago') || 
      q.includes('como pagar') || q.includes('tarjeta') || q.includes('pago con') || 
      q.includes('transferencia') || q.includes('efectivo')
    ) {
      return {
        text: 'Aceptamos dos métodos de pago oficiales: transferencia bancaria y efectivo 💳.\n\nPara confirmar tu pedido solicitamos un abono inicial del 50%, lo que nos permite reservar tu fecha e iniciar la producción. El 50% restante lo cancelas al momento de recibir tu entrega.',
        options: ['💰 ¿Cómo se confirma el abono?', '📲 Enviar comprobante por WhatsApp', '🍰 Ver catálogo']
      };
    }

    // 7. CONFIRMACIÓN DE PEDIDOS, ABONOS Y COMPROBANTES
    if (
      q.includes('abono') || q.includes('anticipo') || q.includes('adelanto') || 
      q.includes('50%') || q.includes('confirmar pedido') || q.includes('comprobante') || 
      q.includes('verificar pago') || q.includes('reserva')
    ) {
      return {
        text: 'Para confirmar tu pedido solicitamos un abono del 50% del total de tus postres 📋. Este abono asegura tu cupo en nuestro taller e inicia la elaboración, y el 50% restante lo pagas al recibir tu pedido.\n\nEs importante tener presente que el pedido se confirma una vez que nuestro equipo verifique el abono. Los comprobantes de transferencia se reciben y validan a través de nuestro WhatsApp oficial (+593 96 987 99578).',
        options: ['📲 WhatsApp oficial', '🛵 Costos de entrega', '🍰 Ver catálogo']
      };
    }

    // 8. ENTREGAS A DOMICILIO Y COSTOS DE ENVÍO
    if (
      q.includes('envio') || q.includes('domicilio') || q.includes('entrega') || 
      q.includes('delivery') || q.includes('costo de envio') || q.includes('cuanto cuesta el envio') || 
      q.includes('cobertura') || q.includes('zona') || q.includes('guayaquil') || 
      q.includes('quito') || q.includes('samborondon') || q.includes('duran')
    ) {
      return {
        text: 'Realizamos entregas a domicilio en toda la ciudad de Guayaquil 🛵.\n\nEl costo de envío se cancela por separado del valor de los postres y contamos con tarifas fijas según la zona. ¿En qué sector de Guayaquil te encuentras? Indícamelo para orientarte o puedes escribirnos a WhatsApp para coordinar la tarifa exacta de tu sector.',
        options: ['📲 Consultar tarifa por WhatsApp', '📅 Anticipación de 2 días', '🍰 Ver tortas y postres']
      };
    }

    // 9. PERSONALIZACIÓN DE TORTAS Y COSTOS ADICIONALES
    const isCustomizationQuery = 
      q.includes('personaliz') || q.includes('tematica') || q.includes('decoracion') || 
      q.includes('dedicatoria') || q.includes('diseño') || q.includes('costo adicional') || 
      q.includes('cuanto cuesta personalizar') || q.includes('cotizar torta') || 
      (q.includes('evento') && !q.includes('ver'));

    if (isCustomizationQuery) {
      return {
        text: '¡Con mucho gusto! En Serenoa preparamos tortas enteras personalizadas para tus eventos y fechas especiales 🎂.\n\nPodemos adaptar colores, temática, decoración, dedicatorias, sabores de bizcocho y rellenos. Toda personalización tiene un costo adicional que depende de la complejidad del diseño.\n\nCuéntanos la temática, fecha y número de porciones que deseas por WhatsApp para que nuestro equipo evalúe la viabilidad y te envíe una cotización detallada.',
        options: ['📲 Cotizar torta en WhatsApp', '📅 Mínimo 2 días de anticipación', '🍰 Ver tortas disponibles']
      };
    }

    // 10. POLÍTICA DE CANCELACIONES Y REEMBOLSOS
    if (
      q.includes('cancel') || q.includes('reembolso') || q.includes('devolucion') || 
      q.includes('anular') || q.includes('devolver')
    ) {
      return {
        text: 'Nuestra política de cancelaciones es muy clara y justa 🛡️:\n\nSi cancelas antes de que comience la producción de tus postres, te devolvemos el 100% del abono realizado.\n\nSi cancelas después de haber iniciado la producción artesanal, el abono no es reembolsable debido a los insumos y elaboración personalizada ya comprometidos. Para cualquier consulta o gestión, comunícate con nosotros por WhatsApp.',
        options: ['📲 Contactar por WhatsApp', '📅 Anticipación mínima', '💳 Métodos de pago']
      };
    }

    // 11. MODIFICACIONES DE PEDIDOS
    if (
      q.includes('modific') || q.includes('cambiar fecha') || q.includes('cambiar sabor') || 
      q.includes('cambiar pedido') || q.includes('editar pedido') || q.includes('agregar algo')
    ) {
      return {
        text: 'Si ya cuentas con un pedido confirmado y necesitas realizar una modificación, cada caso lo evaluamos individualmente ✏️.\n\nPor favor comunícate a nuestro WhatsApp indicando tu código de pedido y los cambios requeridos. Te recordamos con cariño que cualquier cambio está sujeto a la disponibilidad del taller.',
        options: ['📲 Solicitar modificación en WhatsApp', '🛡️ Política de cancelaciones']
      };
    }

    // 12. HORARIOS DE ATENCIÓN
    if (
      q.includes('horario') || q.includes('hora') || q.includes('atencion') || 
      q.includes('a que hora abren') || q.includes('a que hora cierran') || q.includes('domingo')
    ) {
      return {
        text: 'El horario de atención de nuestro equipo es de 9:00 AM a 6:00 PM ⏰.\n\nYo estoy disponible en todo momento para responder tus dudas aquí en la tienda, pero la validación de pagos, confirmación de pedidos y atención humana se realiza dentro de esa franja horaria.',
        options: ['📅 ¿Con cuánta anticipación pido?', '📲 Escribir a WhatsApp', '🍰 Ver catálogo']
      };
    }

    // 13. CONTACTO Y WHATSAPP OFICIAL
    if (
      q.includes('whatsapp') || q.includes('telefono') || q.includes('contacto') || 
      q.includes('numero') || q.includes('humano') || q.includes('asesor') || q.includes('hablar con alguien')
    ) {
      return {
        text: 'Puedes escribirnos directamente a nuestro WhatsApp oficial: +593 96 987 99578 📲.\n\nPor este medio nuestro equipo atiende consultas personalizadas, recibe comprobantes de transferencia, cotiza tortas y coordina entregas en Guayaquil.',
        options: ['📲 Abrir WhatsApp ahora', '🍰 Ver tortas y postres', '💳 Métodos de pago']
      };
    }

    // 14. GESTIÓN Y RECOPILACIÓN DE SOLICITUD DE PEDIDO
    if (
      q.includes('hacer pedido') || q.includes('solicitar') || q.includes('como pedir') || 
      q.includes('quiero pedir') || q.includes('ordenar')
    ) {
      return {
        text: 'Hacer tu pedido es muy sencillo y rápido ✨:\n\n1. Elige tus postres favoritos en nuestra carta y agrégalos al carrito.\n2. Para tu solicitud necesitaremos tu nombre completo, fecha deseada (mínimo 2 días de anticipación) y sector de entrega en Guayaquil.\n3. Una vez confirmada la disponibilidad, se reserva tu fecha mediante el abono del 50%.',
        options: ['🍰 Ver postres del catálogo', '🎨 Personalizar torta', '📲 Pedir por WhatsApp']
      };
    }

    // 15. BÚSQUEDA INTELIGENTE Y PRECISA EN EL CATÁLOGO VIVO
    let matchedProducts = [];
    let searchCategoryLabel = '';

    // A. Tortas, Tartas y Pasteles
    if (
      q.includes('torta') || q.includes('tortas') || 
      q.includes('tarta') || q.includes('tartas') || 
      q.includes('pastel') || q.includes('pasteles') || 
      q.includes('cake') || q.includes('cakes') ||
      q.includes('bizcocho')
    ) {
      searchCategoryLabel = 'nuestras tortas y tartas artesanales';
      matchedProducts = products.filter(p => {
        const cat = (p.categoria || '').toLowerCase();
        const nom = (p.nombre || '').toLowerCase();
        return cat.includes('tarta') || cat.includes('cheesecake') || 
               nom.includes('tarta') || nom.includes('torta') || 
               nom.includes('selva negra') || nom.includes('cheesecake');
      });
    }
    // B. Cheesecakes
    else if (q.includes('cheesecake') || q.includes('queso') || q.includes('pay') || q.includes('pie')) {
      searchCategoryLabel = 'nuestros cheesecakes artesanales';
      matchedProducts = products.filter(p => {
        const cat = (p.categoria || '').toLowerCase();
        const nom = (p.nombre || '').toLowerCase();
        return cat.includes('cheesecake') || nom.includes('cheesecake');
      });
    }
    // C. Galletas / Cookies
    else if (q.includes('galleta') || q.includes('galletas') || q.includes('cookie') || q.includes('cookies')) {
      searchCategoryLabel = 'nuestras galletas artesanales';
      matchedProducts = products.filter(p => {
        const cat = (p.categoria || '').toLowerCase();
        const nom = (p.nombre || '').toLowerCase();
        return cat.includes('galleta') || nom.includes('galleta') || nom.includes('besos');
      });
    }
    // D. Macarons
    else if (q.includes('macaron') || q.includes('macarons') || q.includes('macarron') || q.includes('macarrones')) {
      searchCategoryLabel = 'nuestros macarons franceses';
      matchedProducts = products.filter(p => {
        const cat = (p.categoria || '').toLowerCase();
        const nom = (p.nombre || '').toLowerCase();
        return cat.includes('macaron') || nom.includes('macaron');
      });
    }
    // E. Chocolate / Cacao
    else if (q.includes('chocolate') || q.includes('cacao')) {
      searchCategoryLabel = 'nuestras delicias de chocolate';
      matchedProducts = products.filter(p => {
        const nom = (p.nombre || '').toLowerCase();
        const cat = (p.categoria || '').toLowerCase();
        const desc = (p.descripcion || '').toLowerCase();
        return nom.includes('chocolate') || nom.includes('valrhona') || nom.includes('selva negra') || 
               cat.includes('chocolate') || cat.includes('mousse') ||
               desc.includes('chocolate') || desc.includes('cacao');
      });
    }
    // F. Frutilla / Fresa / Frutos Rojos
    else if (q.includes('fresa') || q.includes('fresas') || q.includes('frutilla') || q.includes('frutos rojos') || q.includes('mora')) {
      searchCategoryLabel = 'postres con fresas y frutos rojos';
      matchedProducts = products.filter(p => {
        const nom = (p.nombre || '').toLowerCase();
        const desc = (p.descripcion || '').toLowerCase();
        return nom.includes('fresa') || nom.includes('frutos') || desc.includes('fresa') || desc.includes('frutos');
      });
    }
    // G. Tiramisú / Café
    else if (q.includes('tiramisu') || q.includes('tiramisú') || q.includes('cafe') || q.includes('café') || q.includes('mascarpone')) {
      searchCategoryLabel = 'nuestro tiramisú tradicional';
      matchedProducts = products.filter(p => {
        const nom = (p.nombre || '').toLowerCase();
        return nom.includes('tiramis');
      });
    }
    // H. Éclairs
    else if (q.includes('eclair') || q.includes('éclair')) {
      searchCategoryLabel = 'nuestros éclairs franceses';
      matchedProducts = products.filter(p => {
        const nom = (p.nombre || '').toLowerCase();
        return nom.includes('clair');
      });
    }
    // I. Mousse
    else if (q.includes('mousse')) {
      searchCategoryLabel = 'nuestro mousse artesanal';
      matchedProducts = products.filter(p => {
        const cat = (p.categoria || '').toLowerCase();
        const nom = (p.nombre || '').toLowerCase();
        return cat.includes('mousse') || nom.includes('mousse');
      });
    }
    // J. Panes / Panadería
    else if (q.includes('pan ') || q.includes('panes') || q.includes('croissant') || q.endsWith('pan')) {
      searchCategoryLabel = 'nuestras opciones de panadería fina';
      matchedProducts = products.filter(p => {
        const cat = (p.categoria || '').toLowerCase();
        const nom = (p.nombre || '').toLowerCase();
        return cat.includes('pan') || nom.includes('pan ');
      });
    }
    // K. Nueces / Frutos secos
    else if (q.includes('nuez') || q.includes('nueces') || q.includes('almendra') || q.includes('pistacho')) {
      searchCategoryLabel = 'postres con nueces selectas';
      matchedProducts = products.filter(p => {
        const nom = (p.nombre || '').toLowerCase();
        const desc = (p.descripcion || '').toLowerCase();
        return nom.includes('nuez') || desc.includes('nuez') || desc.includes('almendra') || desc.includes('pistacho');
      });
    }
    // L. Catálogo general / destacados
    else if (
      q.includes('postres') || q.includes('recomiend') || q.includes('destacad') || 
      q.includes('popular') || q.includes('mejor') || q.includes('mas vendido') || 
      q.includes('que tienen') || q.includes('carta') || q.includes('menu') || q.includes('catálogo') || q.includes('catalogo')
    ) {
      searchCategoryLabel = 'nuestros postres más queridos';
      matchedProducts = products.slice(0, 4);
    }
    // M. Búsqueda específica filtrando stop words para evitar falsos positivos
    else {
      const stopWords = new Set([
        'muestrame', 'muestreme', 'muestra', 'tienen', 'venden', 'quiero', 'quisiera', 'ver',
        'alguna', 'algun', 'algunas', 'algunos', 'los', 'las', 'del', 'para', 'con', 'sin',
        'favor', 'por', 'hola', 'buenas', 'buenos', 'dias', 'tardes', 'noches', 'postre', 'postres',
        'dulce', 'dulces', 'opciones', 'algo', 'precio', 'costo', 'cuanto', 'cuesta', 'hay'
      ]);
      const keywords = q
        .replace(/[¿?¡!.,]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w));

      if (keywords.length > 0) {
        matchedProducts = products.filter(p => {
          const name = (p.nombre || '').toLowerCase();
          const cat = (p.categoria || '').toLowerCase();
          return keywords.some(k => name.includes(k) || cat.includes(k));
        });
        if (matchedProducts.length > 0) {
          searchCategoryLabel = `resultados para "${keywords.join(' ')}"`;
        }
      }
    }

    if (matchedProducts.length > 0) {
      const topProds = matchedProducts.slice(0, 4);
      return {
        text: `✨ Aquí tienes ${searchCategoryLabel || 'nuestras delicias artesanales'}:\n\nRecuerda que horneamos a pedido con mínimo 2 días de anticipación para entregas a domicilio en Guayaquil.`,
        products: topProds,
        options: ['🎨 Personalizar torta', '🍰 Ver todo el catálogo', '📅 Consultar anticipación', '💳 Métodos de pago']
      };
    }

    // N. Si preguntó por un alimento o postre que no tenemos (ej: helado, cupcakes, tres leches)
    const foodKeywords = ['helado', 'cupcake', 'donas', 'dona', 'tres leches', 'gelatina', 'churros', 'crepas', 'flan'];
    const askedForFood = foodKeywords.find(f => q.includes(f));
    if (askedForFood) {
      return {
        text: `Por el momento no contamos con ${askedForFood} en nuestra carta regular.\n\nNos especializamos en repostería fina como tortas y tartas de autor, cheesecakes, macarons franceses, galletas y postres especiales. También preparamos tortas personalizadas para eventos.\n\n¿Te gustaría ver nuestras tortas disponibles o consultar un pedido especial por WhatsApp?`,
        options: ['🍰 Ver tortas y tartas', '🎨 Personalizar una torta', '📲 Consultar por WhatsApp']
      };
    }

    // 16. DERIVACIÓN DIRECTA A WHATSAPP (SI NO SABE QUÉ RESPONDER - REGLA 10 Y 12)
    return {
      text: 'Para darte una respuesta detallada y personalizada a tu consulta, te invito a comunicarte directamente con nuestro personal en nuestro WhatsApp oficial: +593 96 987 99578 📲.\n\nAllí nuestro equipo te atenderá con gusto para resolver cualquier duda o tomar tu pedido directamente.',
      options: [
        '📲 Escribir a WhatsApp',
        '🍰 Ver tortas y postres',
        '📅 Tiempos de anticipación',
        '💳 Métodos de pago y abonos'
      ]
    };
  };

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateBotResponse(text, messages);
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponse.text,
        products: botResponse.products || null,
        options: botResponse.options || null,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 500);
  };

  const handleProductAddToCart = (prod) => {
    addToCart(prod, 1);
    const confirmationMsg = {
      id: `bot-cart-${Date.now()}`,
      sender: 'bot',
      text: `¡Listo! Ya agregué ${prod.nombre} ($${Number(prod.precio).toFixed(2)}) a tu carrito de compras 🛍️.\n\nRecuerda que programamos las entregas en Guayaquil con al menos 2 días de anticipación y se reservan con el 50% de abono.`,
      action: 'view-cart',
      options: ['🛍️ Ver mi carrito', '🍰 Ver más postres', '📲 Consultar por WhatsApp'],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, confirmationMsg]);
  };

  const handleQuickOptionClick = (opt) => {
    if (opt.includes('WhatsApp')) {
      let defaultMsg = '¡Hola Serenoa! Quisiera consultar sobre sus postres y pedidos a domicilio.';
      if (opt.includes('envío') || opt.includes('tarifa') || opt.includes('sector')) {
        defaultMsg = '¡Hola Serenoa! Quisiera consultar la tarifa fija de envío a mi sector en Guayaquil.';
      } else if (opt.includes('torta') || opt.includes('Personalizar')) {
        defaultMsg = '¡Hola Serenoa! Quisiera cotizar una torta personalizada para un evento especial.';
      } else if (opt.includes('comprobante')) {
        defaultMsg = '¡Hola Serenoa! Adjunto el comprobante de transferencia de mi pedido.';
      }

      const queryParam = encodeURIComponent(defaultMsg);
      window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${queryParam}`, '_blank');
      return;
    }
    if (opt.includes('Ver catálogo') || opt.includes('Ver todo el catálogo')) {
      if (onExploreCatalog) onExploreCatalog();
      return;
    }
    if (opt.includes('carrito')) {
      setIsCartOpen(true);
      return;
    }
    handleSendMessage(opt);
  };

  // Función de limpieza de texto para garantizar que nunca aparezcan asteriscos crudos
  const formatText = (raw) => {
    if (!raw) return '';
    return raw.replace(/\*\*/g, '').replace(/\*/g, '');
  };

  return (
    <>
      {/* BOTÓN FLOTANTE DEL CHATBOT - Colocado exactamente arriba del botón del carrito de compras */}
      <div className="fixed bottom-[84px] right-5 sm:bottom-[108px] sm:right-8 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center p-0 text-white shadow-[0_8px_25px_rgba(86,89,53,0.45)] border-2 border-[#ECC979] hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer ${
            isOpen 
              ? 'bg-[#CF7D65]' 
              : 'bg-gradient-to-r from-[#565935] to-[#6B6D43] hover:from-[#484B2C] hover:to-[#565935]'
          }`}
          aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat con Serena'}
          title="Serena - Asistente virtual de Serenoa"
        >
          {isOpen ? (
            <svg className="w-6 h-6 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          ) : (
            <img 
              src={serenaAvatar} 
              alt="Serena" 
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain mx-auto my-auto block select-none filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110" 
            />
          )}

          {/* Indicador de estado en línea */}
          {!isOpen && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-xs"></span>
          )}
        </button>

        {/* Notificación flotante de bienvenida cuando el chat está cerrado */}
        {!isOpen && hasUnreadNotice && (
          <div 
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex absolute right-18 sm:right-20 top-2 bg-white text-[#2E2A27] text-xs font-semibold px-3.5 py-2 rounded-2xl shadow-xl border border-[#ECC979]/60 items-center gap-2 whitespace-nowrap animate-bounce cursor-pointer"
          >
            <span>¿En qué postre te ayudo hoy? ✨</span>
            <button 
              onClick={(e) => { e.stopPropagation(); setHasUnreadNotice(false); }}
              className="text-gray-400 hover:text-gray-600 text-[11px] ml-1"
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {/* VENTANA DEL CHATBOT */}
      {isOpen && (
        <div 
          className="fixed bottom-[150px] right-3 sm:bottom-[180px] sm:right-8 z-50 w-[94vw] sm:w-[390px] md:w-[410px] h-[520px] max-h-[72vh] bg-white rounded-3xl shadow-[0_12px_45px_rgba(46,42,39,0.25)] border border-[#ECC979]/50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* HEADER DEL CHAT */}
          <div className="bg-gradient-to-r from-[#565935] to-[#6B6D43] p-4 text-white flex items-center justify-between border-b border-[#ECC979]/30">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full bg-white flex items-center justify-center p-0.5 shadow-md border-2 border-[#ECC979]/80 flex-shrink-0">
                <img 
                  src={serenaAvatar} 
                  alt="Serena" 
                  className="w-full h-full object-contain rounded-full" 
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#565935]"></span>
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm tracking-wide text-[#FAF6EF]">
                  Serena
                </h4>
                <p className="text-[11px] text-[#ECC979]">
                  Serenoa Pastelería Virtual · Guayaquil
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Botón simple de reiniciar conversación */}
              <button
                type="button"
                onClick={() => setMessages([
                  {
                    id: `welcome-${Date.now()}`,
                    sender: 'bot',
                    text: '¡Conversación reiniciada! 🍰 Soy Serena, tu asistente virtual. ¿En qué duda o pedido puedo orientarte hoy?',
                    options: [
                      '🍰 Ver tortas y postres',
                      '📅 ¿Con cuánta anticipación pido?',
                      '🛵 Entregas a domicilio',
                      '💳 Métodos de pago y abonos',
                      '🎨 Personalizar una torta',
                      '📲 Contactar por WhatsApp'
                    ],
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ])}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Reiniciar conversación"
                aria-label="Reiniciar conversación"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* Botón de cerrar */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-lg text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Minimizar chat"
                aria-label="Cerrar chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* LISTA DE MENSAJES */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FAF6EF]/30 text-xs sm:text-sm">
            {messages.map(msg => (
              <div 
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start items-end'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-white border border-[#ECC979]/70 p-0.5 shadow-2xs flex-shrink-0 mb-1">
                    <img src={serenaAvatar} alt="Serena" className="w-full h-full object-contain rounded-full" />
                  </div>
                )}
                <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                  <div 
                    className={`w-full rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-line shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-[#CF7D65] to-[#DE8B74] text-white rounded-br-none'
                        : 'bg-white text-[#2E2A27] border border-[#ECC979]/40 rounded-bl-none'
                    }`}
                  >
                    {formatText(msg.text)}

                    {/* Tarjetas interactivas de postres recomendados */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-3 space-y-2 pt-2 border-t border-gray-100">
                        {msg.products.map(prod => (
                          <div 
                            key={prod.id || prod._id}
                            className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-[#FAF6EF] border border-[#ECC979]/40"
                          >
                            <img 
                              src={prod.imagen} 
                              alt={prod.nombre} 
                              className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-xs text-[#2E2A27] truncate">
                                {prod.nombre}
                              </h5>
                              <span className="text-xs font-extrabold text-[#D4AF37]">
                                ${Number(prod.precio || 0).toFixed(2)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleProductAddToCart(prod)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#565935] hover:bg-[#484B2C] text-white text-[11px] font-bold shadow-xs transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                              title="Agregar al carrito"
                            >
                              + Agregar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Botón de acción tras agregar al carrito */}
                    {msg.action === 'view-cart' && (
                      <div className="mt-2.5 pt-2 border-t border-gray-100 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCartOpen(true)}
                          className="w-full py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#BF9B30] text-white font-bold text-xs shadow-xs text-center cursor-pointer transition-colors"
                        >
                          🛍️ Abrir Carrito de Compras
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Opciones o botones de respuesta rápida */}
                  {msg.options && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[92%]">
                      {msg.options.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleQuickOptionClick(opt)}
                          className="px-2.5 py-1 rounded-full bg-white hover:bg-[#565935] text-[#565935] hover:text-white border border-[#ECC979]/50 text-[11px] font-semibold transition-all shadow-xs cursor-pointer active:scale-95 text-left"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {/* Animación de "Serena está escribiendo..." */}
            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white border border-[#ECC979]/70 p-0.5 shadow-2xs flex-shrink-0">
                  <img src={serenaAvatar} alt="Serena" className="w-full h-full object-contain rounded-full" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#7A736B] p-2 bg-white rounded-2xl border border-[#ECC979]/30 w-24">
                  <span className="w-1.5 h-1.5 bg-[#565935] rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-[#565935] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#565935] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT FORM DE MENSAJES */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-[#ECC979]/30 flex items-center gap-2"
          >
            <input 
              type="text" 
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Pregúntale a Serena sobre los postres o pedidos..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#ECC979]/40 text-xs sm:text-sm text-[#2E2A27] focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 focus:border-[#CF7D65] bg-[#FAF6EF]/40"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#CF7D65] to-[#DE8B74] hover:from-[#BF6D55] hover:to-[#CF7D65] text-white flex items-center justify-center font-bold transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 flex-shrink-0"
              aria-label="Enviar mensaje"
              title="Enviar mensaje"
            >
              <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
