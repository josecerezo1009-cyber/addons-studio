import { AddonDefinition, StoreReviewItem, ReviewAIInsight } from '../types/addon';

export const INITIAL_ADDONS: AddonDefinition[] = [
  {
    id: 'addon_ai_product_reviews_pro',
    name: 'AI Product Reviews Pro',
    slug: 'ai-product-reviews-pro',
    tagline: 'SaaS de IA para analizar opiniones, detectar problemas recurrentes y generar respuestas automáticas inteligentes.',
    description: 'Conecta tus tiendas Shopify, WooCommerce, PrestaShop, Magento o BigCommerce para sincronizar opiniones de clientes en tiempo real. Utiliza modelos avanzados de procesamiento de lenguaje natural para categorizar el sentimiento, alertar sobre incidencias logísticas o de producto y responder automáticamente con la voz de tu marca.',
    logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&auto=format&fit=crop&q=80',
    icon: 'MessageSquareText',
    category: 'support',
    version: '2.4.1',
    status: 'active',
    author: 'Official Platform Core',
    isOfficial: true,
    supportedPlatforms: ['shopify', 'woocommerce', 'prestashop', 'magento', 'bigcommerce'],
    compatiblePlans: ['free', 'pro', 'enterprise'],
    pricing: {
      type: 'monthly',
      priceMonthly: 29,
      priceOneTime: 290,
      trialDays: 14
    },
    permissions: [
      'read_products',
      'read_orders',
      'read_customers',
      'write_reviews',
      'write_notifications'
    ],
    webhooks: [
      'orders/fulfilled',
      'reviews/create',
      'reviews/update'
    ],
    defaultConfig: {
      autoReplyPositive: false,
      alertNegativeImmediate: true,
      defaultTone: 'empathetic',
      delayDaysAfterDelivery: 5,
      courtesyDiscountCode: 'GRACIAS10',
      minRatingToFlag: 2
    },
    routeKey: 'addon-reviews-pro',
    stats: {
      installationsCount: 1420,
      activeUsersCount: 1190,
      avgRating: 4.95,
      reviewsCount: 384
    }
  },
  {
    id: 'addon_cart_recover_ai',
    name: 'CartRecover AI Pro',
    slug: 'cart-recover-ai-pro',
    tagline: 'Recuperación inteligente de carritos abandonados con WhatsApp y cupones dinámicos por IA.',
    description: 'Detecta la intención de salida y envía secuencias inteligentes multicanal con enlaces de pago directos y descuentos temporizados.',
    logo: 'https://images.unsplash.com/photo-1556742049-0a67e55722c0?w=200&auto=format&fit=crop&q=80',
    icon: 'ShoppingCart',
    category: 'conversion',
    version: '2.4.1',
    status: 'active',
    author: 'AppStack AI Labs',
    isOfficial: false,
    supportedPlatforms: ['shopify', 'woocommerce', 'prestashop', 'magento', 'bigcommerce'],
    compatiblePlans: ['pro', 'enterprise'],
    pricing: {
      type: 'monthly',
      priceMonthly: 29,
      priceOneTime: 290
    },
    permissions: ['read_orders', 'write_discounts', 'read_checkouts'],
    webhooks: ['checkouts/create', 'checkouts/update'],
    defaultConfig: {
      whatsappNumber: '+34600000000',
      discountPercentage: 10,
      countdownMinutes: 15
    },
    routeKey: 'installed-apps',
    stats: {
      installationsCount: 3840,
      activeUsersCount: 3100,
      avgRating: 4.9,
      reviewsCount: 142
    }
  },
  {
    id: 'addon_dynamic_upsell_ai',
    name: 'DynamicUpsell AI Post-Purchase',
    slug: 'dynamic-upsell-ai',
    tagline: 'Ofertas post-compra con 1 solo clic y recomendaciones cruzadas inteligentes sin fricción.',
    description: 'Multiplica el valor medio del pedido ofreciendo productos complementarios con cobro directo sin reintroducir datos de pago.',
    logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&auto=format&fit=crop&q=80',
    icon: 'TrendingUp',
    category: 'conversion',
    version: '1.9.0',
    status: 'active',
    author: 'AppStack AI Labs',
    isOfficial: false,
    supportedPlatforms: ['shopify', 'woocommerce', 'bigcommerce'],
    compatiblePlans: ['pro', 'enterprise'],
    pricing: {
      type: 'monthly',
      priceMonthly: 39,
      priceOneTime: 390
    },
    permissions: ['read_orders', 'write_orders', 'read_products'],
    webhooks: ['orders/create'],
    defaultConfig: {
      maxUpsellOffers: 2,
      discountTier: 15
    },
    routeKey: 'installed-apps',
    stats: {
      installationsCount: 2210,
      activeUsersCount: 1890,
      avgRating: 4.85,
      reviewsCount: 98
    }
  }
];

export const INITIAL_STORE_REVIEWS: StoreReviewItem[] = [
  {
    id: 'rev_01',
    storeId: 'store_shp_01',
    storeName: 'Nordic Living Direct',
    storePlatform: 'shopify',
    customerName: 'Beatriz Soler',
    customerEmail: 'b.soler@gmail.com',
    productName: 'Lámpara Escandinava Roble Nórdico',
    productId: 'prod_lamp_01',
    rating: 5,
    title: '¡Diseño impecable y luz muy cálida!',
    content: 'La lámpara llegó en perfectas condiciones en solo 24 horas. Los acabados de madera de roble son espectaculares y combinan genial en mi salón. Totalmente recomendada.',
    createdAt: '2026-10-02T10:15:00Z',
    sentiment: 'positive',
    sentimentScore: 0.94,
    sentimentSummary: 'Cliente sumamente satisfecho con la calidad de acabados y la rapidez del envío.',
    detectedIssues: [],
    improvementOpportunities: ['Ofrecer bombillas de repuesto como cross-sell en la ficha'],
    smartReply: {
      text: '¡Muchísimas gracias por tu reseña, Beatriz! Nos alegra un montón que la madera de roble quede perfecta en tu salón. ¡Esperamos que disfrutes de su luz durante muchos años!',
      tone: 'empathetic',
      sentAt: '2026-10-02T11:00:00Z',
      author: 'AI Smart Auto-Reply'
    },
    status: 'replied',
    verifiedPurchase: true
  },
  {
    id: 'rev_02',
    storeId: 'store_shp_01',
    storeName: 'Nordic Living Direct',
    storePlatform: 'shopify',
    customerName: 'Marcos Benítez',
    customerEmail: 'marcos.b@empresa.com',
    productName: 'Mesa de Centro Minimalista Nogal',
    productId: 'prod_table_02',
    rating: 2,
    title: 'El producto es bonito pero el transporte golpeó una esquina',
    content: 'La mesa en sí tiene un diseño bonito, pero el embalaje venía roto por el lateral y una de las esquinas de nogal tiene una muesca visible. Además el transportista no avisó antes de llegar.',
    createdAt: '2026-10-03T14:30:00Z',
    sentiment: 'negative',
    sentimentScore: -0.68,
    sentimentSummary: 'Problema crítico de logística y protección de embalaje en muebles de madera.',
    detectedIssues: ['Embalaje insuficiente en esquinas', 'Falta de preaviso en empresa de transporte'],
    improvementOpportunities: ['Reforzar protectores cantoneras de espuma de alta densidad', 'Integrar SMS de seguimiento de ruta con la agencia de transportes'],
    status: 'pending',
    verifiedPurchase: true
  },
  {
    id: 'rev_03',
    storeId: 'store_shp_01',
    storeName: 'Nordic Living Direct',
    storePlatform: 'shopify',
    customerName: 'Clara Domínguez',
    customerEmail: 'clara.dom@outlook.es',
    productName: 'Cojín de Lino Natural 50x50',
    productId: 'prod_cushion_03',
    rating: 3,
    title: 'Buen tejido pero el color difiere de la foto web',
    content: 'El lino es de buena calidad y suave, pero en las fotos de la tienda parecía un tono beige cálido y al recibirlo en casa tira más a un gris verdoso apagado. Deberían ajustar la iluminación en las fotos de producto.',
    createdAt: '2026-10-01T16:20:00Z',
    sentiment: 'neutral',
    sentimentScore: -0.05,
    sentimentSummary: 'Discrepancia entre la fotografía de producto y el tono real bajo luz natural.',
    detectedIssues: ['Fidelidad cromática en fotografías de catálogo'],
    improvementOpportunities: ['Añadir fotos bajo luz natural diurna y un selector con descripción exacta del pantone'],
    status: 'pending',
    verifiedPurchase: true
  },
  {
    id: 'rev_04',
    storeId: 'store_woo_02',
    storeName: 'Gourmet Bio Foods',
    storePlatform: 'woocommerce',
    customerName: 'Alfonso Rivas',
    customerEmail: 'alfonso.rivas@yahoo.es',
    productName: 'Pack Aceite Oliva Virgen Extra Ecológico 5L',
    productId: 'prod_oil_04',
    rating: 5,
    title: 'Sabor excepcional, compraremos todos los meses',
    content: 'Un aceite virgen extra de primerísima extracción en frío. Se nota el cuidado en el envasado opaco para proteger el producto. Repetiremos sin duda.',
    createdAt: '2026-10-03T09:12:00Z',
    sentiment: 'positive',
    sentimentScore: 0.98,
    sentimentSummary: 'Cliente recurrente fidelizado por la calidad sensorial y el packaging.',
    detectedIssues: [],
    improvementOpportunities: ['Ofrecer suscripción recurrente con 10% de descuento mensual'],
    status: 'pending',
    verifiedPurchase: true
  },
  {
    id: 'rev_05',
    storeId: 'store_woo_02',
    storeName: 'Gourmet Bio Foods',
    storePlatform: 'woocommerce',
    customerName: 'Lucía Méndez',
    customerEmail: 'lucia.mendez@gmail.com',
    productName: 'Queso Artesano Curado de Oveja 1kg',
    productId: 'prod_cheese_05',
    rating: 1,
    title: 'Llegó con la cadena de frío rota',
    content: 'Compré este queso con envío refrigerado express. El paquete tardó 4 días en llegar por culpa de Seur y cuando lo abrí la bolsa de gel estaba totalmente caliente y el producto sudado y blando. Incomestible.',
    createdAt: '2026-10-04T08:45:00Z',
    sentiment: 'negative',
    sentimentScore: -0.92,
    sentimentSummary: 'Incidencia grave de rotura de cadena de frío por retraso del operador logístico en producto perecedero.',
    detectedIssues: ['Rotura de cadena de frío en perecederos', 'Retraso de 4 días en servicio refrigerado'],
    improvementOpportunities: ['Reclamar SLA con el operador logístico y activar envío de sustitución inmediato con cortesía'],
    status: 'flagged',
    verifiedPurchase: true
  },
  {
    id: 'rev_06',
    storeId: 'store_presta_03',
    storeName: 'Moda Urbana Paris',
    storePlatform: 'prestashop',
    customerName: 'Camille Dubois',
    customerEmail: 'camille.dubois@paris.fr',
    productName: 'Zapatillas Retro Canvas Unisex',
    productId: 'prod_sneakers_06',
    rating: 3,
    title: 'Preciosas pero el tallaje es muy pequeño',
    content: 'El diseño es genial y los materiales se notan resistentes, pero pedí mi número habitual (38) y me aprietan mucho en la puntera. Tuve que gestionar un cambio de talla por un 39.',
    createdAt: '2026-10-02T19:00:00Z',
    sentiment: 'neutral',
    sentimentScore: 0.1,
    sentimentSummary: 'Patrón repetitivo de tallaje ajustado en calzado que genera fricción y costes de logística inversa.',
    detectedIssues: ['Tallaje pequeño (1 número por debajo del estándar)'],
    improvementOpportunities: ['Añadir aviso visible en ficha: "Te recomendamos pedir una talla más de la habitual"'],
    status: 'pending',
    verifiedPurchase: true
  }
];

export const INITIAL_REVIEWS_INSIGHTS: ReviewAIInsight = {
  totalAnalyzed: 142,
  npsScore: 68,
  csatPercentage: 84.5,
  positivePercentage: 74,
  neutralPercentage: 14,
  negativePercentage: 12,
  topRecurringIssues: [
    {
      category: 'Logística & Transporte',
      issue: 'Golpes en esquinas de muebles y rotura de cadena de frío en envíos de más de 48h',
      frequency: 9,
      severity: 'high',
      trend: 'down',
      recommendation: 'Reforzar cantoneras de poliestireno y cambiar a operador de frío garantizado 24h.'
    },
    {
      category: 'Ficha de Producto & Tallas',
      issue: 'Tallaje reducido en calzado y discrepancia de tonos en textiles bajo luz natural',
      frequency: 7,
      severity: 'medium',
      trend: 'stable',
      recommendation: 'Incluir advertencia automática en checkout: "Pide una talla superior" y fotos sin filtros de estudio.'
    },
    {
      category: 'Embalaje & Presentación',
      issue: 'Manuales de montaje con instrucciones poco claras o solo en inglés',
      frequency: 4,
      severity: 'low',
      trend: 'down',
      recommendation: 'Añadir código QR impreso en la caja con video-tutorial interactivo de montaje.'
    }
  ],
  improvementOpportunities: [
    {
      area: 'Cross-selling en Reseñas 5 Estrellas',
      action: 'Ofrecer cupón automático del 10% para consumibles o accesorios en el Smart Reply a clientes felices.',
      estimatedImpact: '+16.4% de compras repetidas a los 30 días'
    },
    {
      area: 'Recuperación de Reseñas Negativas',
      action: 'Notificar en menos de 15 minutos al equipo de soporte ante valoraciones <= 2 estrellas para resolver antes del contracargo.',
      estimatedImpact: 'Reducción del 70% en devoluciones definitivas'
    },
    {
      area: 'Guías de Talla Dinámicas por IA',
      action: 'Mostrar recomendador de talla basado en peso y altura en la ficha de producto.',
      estimatedImpact: '-32% en solicitudes de cambio de talla'
    }
  ],
  executiveSummary: 'La percepción global de marca se mantiene en un nivel muy alto (CSAT 84.5% y NPS +68). Los principales puntos de fricción se concentran en la protección de paquetes durante el transporte y en advertencias de tallaje en calzado. Solventando estos dos puntos operativos, el ratio de devoluciones descenderá drásticamente y la tasa de conversión global aumentará en un estimado de +3.8%.'
};
