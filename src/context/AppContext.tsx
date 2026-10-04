import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  EcommerceApp, 
  ConnectedStore, 
  AppInstallation, 
  Transaction, 
  Review, 
  AgencyClient, 
  UserProfile, 
  UserRole,
  AppPublicationStatus,
  EcommercePlatform,
  NotificationItem,
  SupportTicket
} from '../types';
import { 
  INITIAL_APPS, 
  INITIAL_CONNECTED_STORES, 
  INITIAL_INSTALLATIONS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_REVIEWS, 
  INITIAL_AGENCY_CLIENTS, 
  INITIAL_USER_PROFILES,
  INITIAL_NOTIFICATIONS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_COLLECTIONS,
  INITIAL_CREATORS,
  INITIAL_LICENSES
} from '../data/initialData';
import {
  CuratedCollection,
  CreatorPublicProfile,
  AppLicense
} from '../types';

interface AppContextType {
  // Current user & role & auth
  currentUser: UserProfile;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => boolean;
  register: (name: string, email: string, pass: string, role: UserRole) => boolean;
  logout: () => void;
  requestPasswordReset: (email: string) => boolean;
  changePassword: (currentPass: string, newPass: string) => boolean;
  verifyEmail: () => void;

  // Apps & Marketplace
  apps: EcommerceApp[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  addApp: (app: EcommerceApp) => void;
  updateApp: (id: string, updates: Partial<EcommerceApp>) => void;
  deleteApp: (id: string) => void;
  duplicateApp: (id: string) => void;
  archiveApp: (id: string) => void;
  pauseAppSales: (id: string) => void;
  createNewVersion: (id: string, version: string, changelog: string) => void;
  updateAppStatus: (id: string, status: AppPublicationStatus) => void;
  reportApp: (appId: string, reason: string) => void;

  // Collections & Creators & Licences
  curatedCollections: CuratedCollection[];
  creators: CreatorPublicProfile[];
  licenses: AppLicense[];
  followedCreators: string[];
  toggleFollowCreator: (creatorId: string) => void;
  isFollowingCreator: (creatorId: string) => boolean;
  selectedCreatorForModal: CreatorPublicProfile | null;
  setSelectedCreatorForModal: (creator: CreatorPublicProfile | null) => void;
  selectedCollectionForView: CuratedCollection | null;
  setSelectedCollectionForView: (col: CuratedCollection | null) => void;

  // Favorites (Wishlist)
  favorites: string[];
  toggleFavorite: (appId: string) => void;
  isFavorite: (appId: string) => boolean;

  // Connected Stores
  stores: ConnectedStore[];
  activeStoreId: string;
  setActiveStoreId: (id: string) => void;
  addStore: (store: ConnectedStore) => void;
  updateStore: (id: string, updates: Partial<ConnectedStore>) => void;
  removeStore: (id: string) => void;

  // Installations (Purchases & Licenses)
  installations: AppInstallation[];
  installAppToStore: (app: EcommerceApp, store: ConnectedStore, plan: 'free' | 'monthly' | 'one_time') => Promise<boolean>;
  uninstallApp: (installationId: string) => void;
  toggleInstallationStatus: (installationId: string) => void;
  updateInstallationConfig: (installationId: string, newConfig: Record<string, any>) => void;

  // Transactions & Creator Earnings
  transactions: Transaction[];
  requestPayout: (amount: number, method: string) => Promise<boolean>;
  creatorBalance: number;

  // Reviews
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Support & Help Center
  tickets: SupportTicket[];
  createSupportTicket: (subject: string, category: any, priority: any, message: string) => void;

  // Agency Clients
  agencyClients: AgencyClient[];
  addAgencyClient: (client: AgencyClient) => void;

  // Active View Navigation
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedAppForDetail: EcommerceApp | null;
  setSelectedAppForDetail: (app: EcommerceApp | null) => void;

  // Global Notification Banner
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Dynamic installation statistics updater
  updateInstallationStats: (installationId: string, stats: Record<string, any>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ai_ecom_auth_status') !== 'false';
  });

  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('ai_ecom_active_role');
    return (saved as UserRole) || 'merchant';
  });

  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(() => {
    const saved = localStorage.getItem('ai_ecom_user_profiles');
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILES;
  });

  const [apps, setApps] = useState<EcommerceApp[]>(() => {
    const saved = localStorage.getItem('ai_ecom_apps');
    return saved ? JSON.parse(saved) : INITIAL_APPS;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('ai_ecom_favorites');
    return saved ? JSON.parse(saved) : ['app_cart_recover_ai', 'app_dynamic_upsell_ai'];
  });

  const [curatedCollections, setCuratedCollections] = useState<CuratedCollection[]>(() => {
    const saved = localStorage.getItem('ai_ecom_collections');
    return saved ? JSON.parse(saved) : INITIAL_COLLECTIONS;
  });

  const [creators, setCreators] = useState<CreatorPublicProfile[]>(() => {
    const saved = localStorage.getItem('ai_ecom_creators');
    return saved ? JSON.parse(saved) : INITIAL_CREATORS;
  });

  const [licenses, setLicenses] = useState<AppLicense[]>(() => {
    const saved = localStorage.getItem('ai_ecom_licenses');
    return saved ? JSON.parse(saved) : INITIAL_LICENSES;
  });

  const [followedCreators, setFollowedCreators] = useState<string[]>(() => {
    const saved = localStorage.getItem('ai_ecom_followed_creators');
    return saved ? JSON.parse(saved) : ['usr_creator_01'];
  });

  const [selectedCreatorForModal, setSelectedCreatorForModal] = useState<CreatorPublicProfile | null>(null);
  const [selectedCollectionForView, setSelectedCollectionForView] = useState<CuratedCollection | null>(null);

  const [stores, setStores] = useState<ConnectedStore[]>(() => {
    const saved = localStorage.getItem('ai_ecom_stores');
    return saved ? JSON.parse(saved) : INITIAL_CONNECTED_STORES;
  });

  const [activeStoreId, setActiveStoreId] = useState<string>(() => {
    const saved = localStorage.getItem('ai_ecom_active_store_id');
    return saved || (INITIAL_CONNECTED_STORES[0]?.id || '');
  });

  const [installations, setInstallations] = useState<AppInstallation[]>(() => {
    const saved = localStorage.getItem('ai_ecom_installations');
    return saved ? JSON.parse(saved) : INITIAL_INSTALLATIONS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ai_ecom_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('ai_ecom_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('ai_ecom_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('ai_ecom_tickets');
    return saved ? JSON.parse(saved) : INITIAL_SUPPORT_TICKETS;
  });

  const [agencyClients, setAgencyClients] = useState<AgencyClient[]>(() => {
    const saved = localStorage.getItem('ai_ecom_agency_clients');
    return saved ? JSON.parse(saved) : INITIAL_AGENCY_CLIENTS;
  });

  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<EcommerceApp | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('ai_ecom_auth_status', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('ai_ecom_active_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('ai_ecom_user_profiles', JSON.stringify(userProfiles));
  }, [userProfiles]);

  useEffect(() => {
    localStorage.setItem('ai_ecom_apps', JSON.stringify(apps));
  }, [apps]);

  useEffect(() => {
    localStorage.setItem('ai_ecom_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('ai_ecom_stores', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem('ai_ecom_active_store_id', activeStoreId);
  }, [activeStoreId]);

  useEffect(() => {
    localStorage.setItem('ai_ecom_installations', JSON.stringify(installations));
  }, [installations]);

  useEffect(() => {
    localStorage.setItem('ai_ecom_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ai_ecom_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('ai_ecom_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('ai_ecom_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('ai_ecom_agency_clients', JSON.stringify(agencyClients));
  }, [agencyClients]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const currentUser = userProfiles[activeRole] || userProfiles.merchant;

  // Auth methods
  const login = (email: string, pass: string): boolean => {
    if (!email || !pass) {
      showNotification('Por favor introduce email y contraseña', 'error');
      return false;
    }
    setIsAuthenticated(true);
    showNotification(`Bienvenido de nuevo, ${currentUser.name}`, 'success');
    return true;
  };

  const register = (name: string, email: string, pass: string, role: UserRole): boolean => {
    if (!name || !email || !pass) {
      showNotification('Todos los campos son obligatorios', 'error');
      return false;
    }

    const newProfile: UserProfile = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      companyName: role === 'merchant' ? 'Mi Tienda Online' : 'App Studio',
      balance: 0,
      plan: 'pro',
      stripeConnected: role === 'creator',
      emailVerified: true,
      createdAt: new Date().toISOString()
    };

    setUserProfiles(prev => ({
      ...prev,
      [role]: newProfile
    }));

    setActiveRoleState(role);
    setIsAuthenticated(true);
    showNotification('Cuenta creada correctamente. ¡Bienvenido a NexusEcom AI!', 'success');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentView('landing');
    showNotification('Sesión cerrada correctamente', 'info');
  };

  const requestPasswordReset = (email: string): boolean => {
    if (!email) {
      showNotification('Introduce tu email', 'error');
      return false;
    }
    showNotification(`Enlace de restablecimiento enviado a ${email}`, 'success');
    return true;
  };

  const changePassword = (currentPass: string, newPass: string): boolean => {
    if (!currentPass || !newPass || newPass.length < 6) {
      showNotification('La nueva contraseña debe tener al menos 6 caracteres', 'error');
      return false;
    }
    showNotification('Contraseña actualizada con éxito', 'success');
    return true;
  };

  const verifyEmail = () => {
    updateUserProfile({ emailVerified: true });
    showNotification('Email verificado con éxito', 'success');
  };

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    showNotification(`Modo de cuenta cambiado a: ${role.toUpperCase()}`, 'info');
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfiles(prev => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        ...updates
      }
    }));
  };

  const addApp = (newApp: EcommerceApp) => {
    setApps(prev => [newApp, ...prev]);
    showNotification(`Aplicación "${newApp.name}" guardada con éxito`, 'success');
  };

  const updateApp = (id: string, updates: Partial<EcommerceApp>) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a));
    showNotification('Aplicación actualizada correctamente', 'success');
  };

  const deleteApp = (id: string) => {
    setApps(prev => prev.filter(a => a.id !== id));
    showNotification('Aplicación eliminada', 'info');
  };

  const duplicateApp = (id: string) => {
    const target = apps.find(a => a.id === id);
    if (!target) return;
    const duplicated: EcommerceApp = {
      ...target,
      id: `app_clone_${Date.now()}`,
      name: `${target.name} (Copia)`,
      slug: `${target.slug}-copia-${Date.now().toString().slice(-4)}`,
      status: 'draft',
      version: '1.0.0-draft',
      installsCount: 0,
      rating: 5.0,
      reviewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setApps(prev => [duplicated, ...prev]);
    showNotification(`Aplicación duplicada como "${duplicated.name}" (Borrador)`, 'success');
  };

  const archiveApp = (id: string) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status: 'suspended', updatedAt: new Date().toISOString() } : a));
    showNotification('Aplicación archivada y retirada temporalmente del catálogo público', 'info');
  };

  const pauseAppSales = (id: string) => {
    setApps(prev => prev.map(a => {
      if (a.id === id) {
        const nextStatus: AppPublicationStatus = a.status === 'published' ? 'suspended' : 'published';
        return { ...a, status: nextStatus, updatedAt: new Date().toISOString() };
      }
      return a;
    }));
    showNotification('Estado de comercialización actualizado', 'info');
  };

  const createNewVersion = (id: string, version: string, changelog: string) => {
    setApps(prev => prev.map(a => {
      if (a.id === id) {
        const newVerObj = {
          version,
          timestamp: new Date().toISOString(),
          changelog,
          snapshot: {}
        };
        return {
          ...a,
          version,
          versions: [...(a.versions || []), newVerObj],
          updatedAt: new Date().toISOString(),
          status: 'published'
        };
      }
      return a;
    }));
    showNotification(`¡Versión ${version} publicada con éxito en el Marketplace!`, 'success');
  };

  const updateAppStatus = (id: string, status: AppPublicationStatus) => {
    setApps(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status,
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    }));
    showNotification(`Estado de publicación actualizado a: ${status.replace('_', ' ').toUpperCase()}`, 'success');
  };

  const toggleFavorite = (appId: string) => {
    setFavorites(prev => {
      const exists = prev.includes(appId);
      if (exists) {
        showNotification('Aplicación eliminada de tus favoritos', 'info');
        return prev.filter(id => id !== appId);
      } else {
        showNotification('Aplicación guardada en tus favoritos', 'success');
        return [...prev, appId];
      }
    });
  };

  const isFavorite = (appId: string) => favorites.includes(appId);

  const addStore = (store: ConnectedStore) => {
    setStores(prev => [...prev, store]);
    if (!activeStoreId) {
      setActiveStoreId(store.id);
    }
    showNotification(`Tienda "${store.name}" conectada e indexada`, 'success');
  };

  const updateStore = (id: string, updates: Partial<ConnectedStore>) => {
    setStores(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeStore = (id: string) => {
    setStores(prev => prev.filter(s => s.id !== id));
    if (activeStoreId === id && stores.length > 1) {
      const remaining = stores.filter(s => s.id !== id);
      setActiveStoreId(remaining[0].id);
    }
    showNotification('Tienda desconectada', 'info');
  };

  const installAppToStore = async (app: EcommerceApp, store: ConnectedStore, plan: 'free' | 'monthly' | 'one_time'): Promise<boolean> => {
    const exists = installations.find(i => i.appId === app.id && i.storeId === store.id && i.status !== 'uninstalled');
    if (exists) {
      showNotification(`"${app.name}" ya se encuentra instalada en ${store.name}`, 'info');
      return false;
    }

    const price = plan === 'monthly' ? app.priceMonthly : (plan === 'one_time' ? app.priceOneTime : 0);
    const platformFee = price * 0.15;
    const netAmount = price - platformFee;
    const licenseKey = `LIC-${app.slug.toUpperCase().slice(0, 4)}-${Math.floor(10000 + Math.random() * 90000)}-NX`;

    const newInstallation: AppInstallation = {
      id: `inst_${Date.now()}`,
      appId: app.id,
      appName: app.name,
      storeId: store.id,
      storeName: store.name,
      storePlatform: store.platform,
      storeUrl: store.url,
      installedAt: new Date().toISOString(),
      status: 'active',
      activePlan: plan,
      monthlyCost: plan === 'monthly' ? app.priceMonthly : 0,
      licenseKey,
      config: app.defaultSettings || { enabled: true },
      stats: {
        recoveredRevenue: 0,
        eventsHandled: 0,
        conversionRate: 0,
        lastActive: 'Instalada ahora'
      }
    };

    setInstallations(prev => [newInstallation, ...prev]);

    // Generate Cryptographic App License
    const newLicense: AppLicense = {
      id: `lic_${Date.now()}`,
      licenseKey,
      appId: app.id,
      appName: app.name,
      merchantId: currentUser.id,
      storeUrl: store.url,
      storePlatform: store.platform,
      plan,
      status: 'active',
      issuedAt: new Date().toISOString(),
      renewalDate: plan === 'monthly' ? new Date(Date.now() + 30 * 86400000).toISOString() : undefined,
      lastValidatedAt: 'Recién validada',
      signatureHash: `sha256_${Math.random().toString(36).substring(2, 15)}`,
      monthlyCost: plan === 'monthly' ? app.priceMonthly : 0
    };
    setLicenses(prev => [newLicense, ...prev]);

    // Update app installs count
    setApps(prev => prev.map(a => a.id === app.id ? { ...a, installsCount: a.installsCount + 1 } : a));

    // Register transaction & add notification
    if (price > 0) {
      const newTxn: Transaction = {
        id: `txn_${Date.now()}`,
        type: 'sale',
        amount: price,
        platformFee,
        netAmount,
        currency: 'USD',
        creatorId: app.creatorId,
        appId: app.id,
        appName: app.name,
        storeName: store.name,
        createdAt: new Date().toISOString(),
        status: 'completed',
        invoiceUrl: `INV-${Date.now().toString().slice(-6)}.pdf`
      };
      setTransactions(prev => [newTxn, ...prev]);

      // Credit Creator Balance
      setUserProfiles(prev => {
        const creator = prev.creator;
        if (creator) {
          return {
            ...prev,
            creator: {
              ...creator,
              balance: creator.balance + netAmount
            }
          };
        }
        return prev;
      });

      // Add Notification
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          title: `Nueva compra de ${app.name}`,
          message: `La tienda ${store.name} ha contratado la licencia ${plan}. Se ha emitido la clave ${licenseKey}.`,
          type: 'financial',
          read: false,
          linkView: 'purchases',
          createdAt: 'Hace unos segundos'
        },
        ...prev
      ]);
    }

    showNotification(`¡"${app.name}" instalada con éxito en ${store.name}!`, 'success');
    return true;
  };

  const uninstallApp = (installationId: string) => {
    setInstallations(prev => prev.map(i => i.id === installationId ? { ...i, status: 'uninstalled' } : i));
    showNotification('Aplicación desinstalada de la tienda', 'info');
  };

  const toggleInstallationStatus = (installationId: string) => {
    setInstallations(prev => prev.map(i => {
      if (i.id === installationId) {
        const nextStatus = i.status === 'active' ? 'paused' : 'active';
        return { ...i, status: nextStatus };
      }
      return i;
    }));
    showNotification('Estado de la aplicación modificado', 'info');
  };

  const updateInstallationConfig = (installationId: string, newConfig: Record<string, any>) => {
    setInstallations(prev => prev.map(i => i.id === installationId ? { ...i, config: { ...i.config, ...newConfig } } : i));
    showNotification('Configuración de la tienda guardada', 'success');
  };

  const updateInstallationStats = (installationId: string, stats: Record<string, any>) => {
    setInstallations(prev => prev.map(i => i.id === installationId ? { ...i, stats: { ...i.stats, ...stats } } : i));
  };

  const requestPayout = async (amount: number, method: string): Promise<boolean> => {
    if (amount <= 0 || amount > currentUser.balance) {
      showNotification('Saldo insuficiente para retirar', 'error');
      return false;
    }

    const payoutTxn: Transaction = {
      id: `txn_payout_${Date.now()}`,
      type: 'payout',
      amount,
      platformFee: 0,
      netAmount: amount,
      currency: 'USD',
      creatorId: currentUser.id,
      createdAt: new Date().toISOString(),
      status: 'completed',
      payoutMethod: method
    };

    setTransactions(prev => [payoutTxn, ...prev]);
    updateUserProfile({ balance: currentUser.balance - amount });
    showNotification(`Transferencia de $${amount.toFixed(2)} procesada vía ${method}`, 'success');
    return true;
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'date'>) => {
    const newRev: Review = {
      ...reviewData,
      id: `rev_${Date.now()}`,
      date: 'Hace un momento'
    };
    setReviews(prev => [newRev, ...prev]);

    const appReviews = [...reviews.filter(r => r.appId === reviewData.appId), newRev];
    const avg = appReviews.reduce((acc, r) => acc + r.rating, 0) / appReviews.length;

    setApps(prev => prev.map(a => a.id === reviewData.appId ? {
      ...a,
      rating: Number(avg.toFixed(2)),
      reviewsCount: a.reviewsCount + 1
    } : a));

    showNotification('¡Gracias por tu reseña! Ha sido publicada.', 'success');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showNotification('Todas las notificaciones marcadas como leídas', 'info');
  };

  const clearNotifications = () => {
    setNotifications([]);
    showNotification('Bandeja de notificaciones vaciada', 'info');
  };

  const createSupportTicket = (subject: string, category: any, priority: any, message: string) => {
    const newTicket: SupportTicket = {
      id: `tkt_${Date.now()}`,
      userId: currentUser.id,
      userEmail: currentUser.email,
      subject,
      category,
      priority,
      status: 'open',
      messages: [
        {
          sender: 'user',
          text: message,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTickets(prev => [newTicket, ...prev]);
    showNotification(`Ticket de soporte #${newTicket.id.slice(-6)} creado. SLA de respuesta: <2h`, 'success');
  };

  const addAgencyClient = (client: AgencyClient) => {
    setAgencyClients(prev => [client, ...prev]);
    showNotification(`Cliente "${client.company}" agregado a la agencia`, 'success');
  };

  const toggleFollowCreator = (creatorId: string) => {
    setFollowedCreators(prev => {
      const isFollowed = prev.includes(creatorId);
      if (isFollowed) {
        showNotification('Has dejado de seguir a este creador', 'info');
        return prev.filter(id => id !== creatorId);
      } else {
        showNotification('¡Ahora sigues a este creador! Recibirás alertas de sus nuevas apps.', 'success');
        return [...prev, creatorId];
      }
    });
  };

  const isFollowingCreator = (creatorId: string) => followedCreators.includes(creatorId);

  const reportApp = (appId: string, reason: string) => {
    showNotification(`Reporte enviado al equipo de seguridad de AI Marketplace. Motivo: ${reason}`, 'info');
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeRole,
        setActiveRole,
        updateUserProfile,
        isAuthenticated,
        login,
        register,
        logout,
        requestPasswordReset,
        changePassword,
        verifyEmail,
        apps,
        searchQuery,
        setSearchQuery,
        addApp,
        updateApp,
        deleteApp,
        duplicateApp,
        archiveApp,
        pauseAppSales,
        createNewVersion,
        updateAppStatus,
        reportApp,
        curatedCollections,
        creators,
        licenses,
        followedCreators,
        toggleFollowCreator,
        isFollowingCreator,
        selectedCreatorForModal,
        setSelectedCreatorForModal,
        selectedCollectionForView,
        setSelectedCollectionForView,
        favorites,
        toggleFavorite,
        isFavorite,
        stores,
        activeStoreId,
        setActiveStoreId,
        addStore,
        updateStore,
        removeStore,
        installations,
        installAppToStore,
        uninstallApp,
        toggleInstallationStatus,
        updateInstallationConfig,
        updateInstallationStats,
        transactions,
        requestPayout,
        creatorBalance: userProfiles.creator?.balance || 0,
        reviews,
        addReview,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        tickets,
        createSupportTicket,
        agencyClients,
        addAgencyClient,
        currentView,
        setCurrentView,
        selectedAppForDetail,
        setSelectedAppForDetail,
        notification,
        showNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
