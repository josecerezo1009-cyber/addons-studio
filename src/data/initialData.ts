import { 
  EcommerceApp, 
  ConnectedStore, 
  AppInstallation, 
  Transaction, 
  Review, 
  AgencyClient, 
  UserProfile, 
  NotificationItem, 
  SupportTicket,
  CuratedCollection,
  CreatorPublicProfile,
  AppLicense
} from '../types';

export const INITIAL_USER_PROFILES: Record<string, UserProfile> = {
  merchant: {
    id: 'usr_merchant_01',
    email: 'merchant@store.com',
    name: 'Comerciante',
    role: 'merchant',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    companyName: 'Mi Tienda Ecommerce',
    balance: 0,
    plan: 'pro',
    stripeConnected: false,
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
  },
  creator: {
    id: 'usr_creator_01',
    email: 'creator@appstack.io',
    name: 'Desarrollador',
    role: 'creator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    companyName: 'Estudio de Apps',
    balance: 0,
    plan: 'pro',
    stripeConnected: false,
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
  },
  agency: {
    id: 'usr_agency_01',
    email: 'agency@partner.com',
    name: 'Agencia Partner',
    role: 'agency',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    companyName: 'Agencia Ecommerce',
    balance: 0,
    plan: 'pro',
    stripeConnected: false,
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
  },
  admin: {
    id: 'usr_admin_01',
    email: 'admin@platform.com',
    name: 'Administrador',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    companyName: 'Plataforma Global',
    balance: 0,
    plan: 'enterprise',
    stripeConnected: false,
    emailVerified: true,
    twoFactorEnabled: true,
    createdAt: new Date().toISOString(),
  },
};

// Clean Real Initial States (No Demos or Fictional Records)
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [];
export const INITIAL_CONNECTED_STORES: ConnectedStore[] = [];
export const INITIAL_INSTALLATIONS: AppInstallation[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_REVIEWS: Review[] = [];
export const INITIAL_AGENCY_CLIENTS: AgencyClient[] = [];
export const INITIAL_CREATORS: CreatorPublicProfile[] = [];
export const INITIAL_LICENSES: AppLicense[] = [];

export const INITIAL_COLLECTIONS: CuratedCollection[] = [
  {
    id: 'col_shopify_power',
    title: 'Imprescindibles para Shopify 2.0',
    slug: 'shopify-powerhouse',
    subtitle: 'Aumenta la conversión sin tocar una sola línea de código',
    description: 'Colección verificada de aplicaciones diseñadas específicamente para temas Online Store 2.0 y Shopify Checkout Extensibility.',
    iconName: 'ShoppingBag',
    bannerGradient: 'from-emerald-600/30 via-teal-900/40 to-slate-900',
    appIds: ['app_ai_seo_pro', 'app_cart_recover_ai', 'app_dynamic_upsell_ai'],
    targetPlatform: 'shopify',
    featured: true
  },
  {
    id: 'col_checkout_boost',
    title: 'Potencia tu Checkout y AOV',
    slug: 'checkout-aov-boost',
    subtitle: 'Multiplica el valor medio del pedido en cada venta',
    description: 'Soluciones de 1-click upsell, paquetes dinámicos con descuento e incentivos en el proceso de pago.',
    iconName: 'Zap',
    bannerGradient: 'from-blue-600/30 via-indigo-900/40 to-slate-900',
    appIds: ['app_dynamic_upsell_ai', 'app_cart_recover_ai'],
    featured: true
  },
  {
    id: 'col_inventory_automation',
    title: 'Automatización & Logística Cero Fricción',
    slug: 'inventory-automation',
    subtitle: 'Control de stock predictivo y prevención de quiebres',
    description: 'Sistemas inteligentes de reserva de pedidos, preventa y sincronización con almacenes.',
    iconName: 'Layers',
    bannerGradient: 'from-amber-600/30 via-orange-900/40 to-slate-900',
    appIds: ['app_stock_alert_flow'],
    featured: false
  }
];

// Production Marketplace Catalog Apps
export const INITIAL_APPS: EcommerceApp[] = [
  {
    id: 'app_ai_seo_pro',
    name: 'AI SEO Pro',
    slug: 'ai-seo-pro',
    tagline: 'Auditoría SEO técnica, optimización de catálogo con IA y sincronización en tiempo real para tiendas ecommerce.',
    description: `### El Motor SEO Comercial Definitivo para Ecommerce
**AI SEO Pro** se conecta mediante API u OAuth a tiendas Shopify, WooCommerce y PrestaShop. Audita metadatos técnicos, optimiza títulos y descripciones con Gemini IA y sincroniza los cambios aprobados directamente en la tienda.`,
    icon: 'Globe',
    banner: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&auto=format&fit=crop&q=80',
    category: 'marketing',
    platforms: ['shopify', 'woocommerce', 'prestashop'],
    pricingType: 'monthly',
    priceMonthly: 39,
    priceOneTime: 390,
    rating: 0,
    reviewsCount: 0,
    installsCount: 0,
    creatorId: 'usr_creator_01',
    creatorName: 'AI App Factory',
    status: 'published',
    version: '2.1.0',
    verified: true,
    highlightBadge: 'staff_pick',
    features: [
      {
        title: 'SEO Scanner Service',
        description: 'Auditoría profunda de títulos, meta descripciones, etiquetas ALT y densidad de keywords.',
        impact: 'Optimización Orgánica'
      },
      {
        title: 'AI Optimization Service',
        description: 'Generación de metadatos de alto CTR calibrados con precisión de caracteres mediante Gemini.',
        impact: 'Mayor visibilidad SERP'
      },
      {
        title: 'Sync Service en Tiempo Real',
        description: 'Envía los cambios aprobados a la API oficial de Shopify, WooCommerce o PrestaShop con un solo clic.',
        impact: 'Sincronización instantánea'
      }
    ],
    permissionsRequired: ['read_products', 'write_products', 'read_product_listings'],
    webhooks: ['products/create', 'products/update'],
    defaultSettings: {
      targetLanguage: 'es',
      minTitleLength: 35,
      maxTitleLength: 60,
      autoSyncApproved: false
    },
    securityAudit: {
      passed: true,
      score: 98,
      vulnerabilityCount: 0,
      gdprCompliance: 'Compliant',
      performanceRating: 'A+',
      checks: [
        { name: 'API Key & Token Encryption', status: 'passed', details: 'Cifrado seguro de tokens en reposo (AES-256-GCM).' },
        { name: 'XSS & Meta Tag Sanitization', status: 'passed', details: 'Sanitización estricta de tags HTML.' }
      ],
      recommendations: []
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'app_ai_product_reviews_pro',
    name: 'AI Product Reviews Pro',
    slug: 'ai-product-reviews-pro',
    tagline: 'SaaS de IA para analizar opiniones, detectar problemas repetitivos y generar respuestas inteligentes.',
    description: `### El estándar empresarial para análisis de opiniones en Ecommerce

**AI Product Reviews Pro** es la plataforma SaaS integral para tiendas Shopify, WooCommerce, PrestaShop, Magento y BigCommerce diseñada para convertir el feedback de clientes en ingresos y retención.

#### Módulos de Inteligencia Artificial Incluidos:
* **Sentiment Analysis en Tiempo Real**: Califica automáticamente el sentimiento (Positivo, Neutro, Negativo) con puntuación de confianza y análisis emocional.
* **Detección de Problemas Repetitivos**: Agrupa quejas por causa raíz (retrasos de transporte, rotura de packaging, tallaje erróneo) para que tomes decisiones operativas antes de recibir más devoluciones.
* **Oportunidades de Mejora de Catálogo**: Sugiere acciones de alto impacto para marketing, producto y logística.
* **Smart Replies Personalizables**: Redacta respuestas contextuales con un clic adaptadas al tono de tu marca (Empático, Profesional o Enérgico) e incluye cupones de fidelización.
* **Analítica & NPS Predictivo**: Métricas precisas de CSAT, satisfacción por categoría y ratio de respuesta.`,
    icon: 'MessageSquareText',
    banner: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1000&auto=format&fit=crop&q=80',
    category: 'support',
    platforms: ['shopify', 'woocommerce', 'prestashop', 'magento', 'bigcommerce'],
    pricingType: 'monthly',
    priceMonthly: 29,
    priceOneTime: 290,
    rating: 0,
    reviewsCount: 0,
    installsCount: 0,
    creatorId: 'usr_creator_01',
    creatorName: 'AppStack AI Labs',
    status: 'published',
    version: '2.4.1',
    verified: true,
    highlightBadge: 'trending',
    features: [
      {
        title: 'Sentiment Analysis Pipeline Multimodelo',
        description: 'Procesamiento de lenguaje natural mediante Gemini para clasificar opiniones en tiempo real.',
        impact: 'Análisis de sentimiento'
      },
      {
        title: 'Detección Automática de Cuellos de Botella',
        description: 'Agrupación semántica de problemas recurrentes en transportistas, tallas o calidad de tejido.',
        impact: 'Reducción de incidencias'
      },
      {
        title: 'Smart Replies con Auto-Pilot',
        description: 'Generación instantánea de respuestas adaptadas al tono corporativo con inserción dinámica de cupones.',
        impact: 'Automatización de soporte'
      }
    ],
    permissionsRequired: ['read_products', 'read_orders', 'read_customers', 'write_reviews'],
    webhooks: ['orders/fulfilled', 'reviews/create', 'reviews/update'],
    defaultSettings: {
      autoReplyPositive: false,
      alertNegativeImmediate: true,
      defaultTone: 'empathetic',
      delayDaysAfterDelivery: 5,
      courtesyDiscountCode: 'GRACIAS10'
    },
    securityAudit: {
      passed: true,
      score: 99,
      vulnerabilityCount: 0,
      gdprCompliance: 'Compliant',
      performanceRating: 'A+',
      checks: [
        { name: 'XSS & Text Sanitization', status: 'passed', details: 'Filtro DOMPurify en textos de clientes.' },
        { name: 'GDPR / PII Privacy Shield', status: 'passed', details: 'Anonimización de datos personales en logs de inferencia.' },
        { name: 'HMAC Webhook Authentication', status: 'passed', details: 'Firma digital en cada payload de sincronización.' }
      ],
      recommendations: []
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'app_cart_recover_ai',
    name: 'CartRecover AI Pro',
    slug: 'cart-recover-ai-pro',
    tagline: 'Recuperación inteligente de carritos abandonados mediante WhatsApp y cupones dinámicos por IA.',
    description: `### Recupera carritos abandonados sin esfuerzo

**CartRecover AI Pro** es la herramienta para tiendas Shopify, WooCommerce y PrestaShop que buscan cerrar ventas perdidas. 

#### Características Principales:
* **Disparador Predictivo por IA**: Detecta el momento exacto en que un usuario duda y muestra ofertas personalizadas.
* **Integración Nativa de WhatsApp Business**: Mensajes transaccionales automáticos con enlace directo al checkout seguro.
* **Descuentos Dinámicos con Cuenta Atrás**: Genera cupones únicos de un solo uso con caducidad en minutos.
* **Sincronización de Inventario en Tiempo Real**: Evita ofertar productos agotados.`,
    icon: 'ShoppingCart',
    banner: 'https://images.unsplash.com/photo-1556742049-0a67e55722c0?w=1000&auto=format&fit=crop&q=80',
    category: 'conversion',
    platforms: ['shopify', 'woocommerce', 'prestashop', 'magento', 'bigcommerce'],
    pricingType: 'monthly',
    priceMonthly: 29,
    priceOneTime: 290,
    rating: 0,
    reviewsCount: 0,
    installsCount: 0,
    creatorId: 'usr_creator_01',
    creatorName: 'AppStack AI Labs',
    status: 'published',
    version: '2.4.1',
    verified: true,
    features: [
      {
        title: 'Algoritmo de Detección de Abandono',
        description: 'Monitorea el cursor, el scroll y el tiempo de inactividad para activar el pop-up de rescate.',
        impact: 'Recuperación proactiva'
      },
      {
        title: 'Mensajes de WhatsApp con 1 Clic',
        description: 'Plantillas verificadas con botones interactivos que dirigen al carrito prellenado.',
        impact: 'Alta apertura'
      },
      {
        title: 'Descuentos Dinámicos por Valor de Carrito',
        description: 'Ofrece cupones adaptados al importe del carrito.',
        impact: 'Mejora del ticket medio'
      }
    ],
    permissionsRequired: ['read_orders', 'write_discounts', 'read_checkouts', 'read_customers'],
    webhooks: ['checkouts/create', 'checkouts/update', 'orders/paid'],
    defaultSettings: {
      enabled: true,
      whatsappNumber: '',
      discountPercentage: 10,
      countdownMinutes: 15,
      soundEffect: false
    },
    securityAudit: {
      passed: true,
      score: 99,
      vulnerabilityCount: 0,
      gdprCompliance: 'Compliant',
      performanceRating: 'A+',
      checks: [
        { name: 'XSS & Sanitization', status: 'passed', details: 'Entradas de texto saneadas con DOMPurify.' },
        { name: 'GDPR Opt-in Consent', status: 'passed', details: 'Check de consentimiento en checkout.' },
        { name: 'Payload HMAC Signatures', status: 'passed', details: 'Validación de webhook con HMAC-SHA256.' }
      ],
      recommendations: []
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'app_dynamic_upsell_ai',
    name: 'DynamicUpsell AI Post-Purchase',
    slug: 'dynamic-upsell-ai',
    tagline: 'Ofertas post-compra con 1-click upsell y bundles generados con IA según el historial del comprador.',
    description: `### Multiplica el valor de cada pedido inmediatamente tras la compra
**DynamicUpsell AI** analiza el carrito finalizado del cliente y presenta ofertas complementarias en la página de agradecimiento antes de que el cliente cierre la pestaña.`,
    icon: 'Zap',
    banner: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1000&auto=format&fit=crop&q=80',
    category: 'conversion',
    platforms: ['shopify', 'woocommerce', 'prestashop'],
    pricingType: 'monthly',
    priceMonthly: 39,
    priceOneTime: 390,
    rating: 0,
    reviewsCount: 0,
    installsCount: 0,
    creatorId: 'usr_creator_01',
    creatorName: 'AppStack AI Labs',
    status: 'published',
    version: '1.9.0',
    verified: true,
    features: [
      {
        title: 'Motor de Cross-Selling por Gemini',
        description: 'Analiza la categoría del producto comprado y sugiere complementos de alta afinidad.',
        impact: 'Aumento de AOV'
      },
      {
        title: 'Checkout Transparente en 1 Clic',
        description: 'Añade el producto al pedido original sin necesidad de reintroducir tarjeta.',
        impact: 'Cero fricción'
      }
    ],
    permissionsRequired: ['read_orders', 'write_orders', 'read_products'],
    webhooks: ['orders/create', 'orders/paid'],
    defaultSettings: {
      maxOffersCount: 2,
      discountRate: 15,
      enableCountdown: true
    },
    securityAudit: {
      passed: true,
      score: 97,
      vulnerabilityCount: 0,
      gdprCompliance: 'Compliant',
      performanceRating: 'A+',
      checks: [
        { name: 'PCI-DSS Compliance', status: 'passed', details: 'Procesamiento conforme a estándares de pago.' }
      ],
      recommendations: []
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'app_stock_alert_flow',
    name: 'StockAlert & Backorder Flow',
    slug: 'stock-alert-flow',
    tagline: 'Gestión inteligente de roturas de stock, preventas y alertas automáticas de reposición.',
    description: `### Nunca pierdas una venta por falta de stock
Permite a los clientes suscribirse para recibir alertas instantáneas por SMS o Email en cuanto el producto vuelva a estar disponible.`,
    icon: 'Layers',
    banner: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000&auto=format&fit=crop&q=80',
    category: 'operations',
    platforms: ['shopify', 'woocommerce', 'prestashop'],
    pricingType: 'monthly',
    priceMonthly: 19,
    priceOneTime: 190,
    rating: 0,
    reviewsCount: 0,
    installsCount: 0,
    creatorId: 'usr_creator_01',
    creatorName: 'AppStack AI Labs',
    status: 'published',
    version: '1.2.0',
    verified: true,
    features: [
      {
        title: 'Botón de "Avisarme cuando haya stock"',
        description: 'Incrustación automática en fichas de producto agotadas.',
        impact: 'Captura de demanda'
      }
    ],
    permissionsRequired: ['read_inventory', 'read_products', 'write_customers'],
    webhooks: ['inventory_levels/update'],
    defaultSettings: {
      autoNotify: true,
      collectPhone: false
    },
    securityAudit: {
      passed: true,
      score: 98,
      vulnerabilityCount: 0,
      gdprCompliance: 'Compliant',
      performanceRating: 'A+',
      checks: [
        { name: 'GDPR Data Processing', status: 'passed', details: 'Tratamiento lícito de emails de clientes.' }
      ],
      recommendations: []
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
