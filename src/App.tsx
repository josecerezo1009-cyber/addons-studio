import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { NotificationToast } from './components/common/NotificationToast';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { AIAppBuilder } from './components/builder/AIAppBuilder';
import { AIProductStudio } from './components/studio/AIProductStudio';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { InstalledAppsView } from './components/merchant/InstalledAppsView';
import { CreatorStudioView } from './components/creator/CreatorStudioView';
import { StoreConnectorsView } from './components/connectors/StoreConnectorsView';
import { AgencyView } from './components/agency/AgencyView';
import { FinanceView } from './components/finance/FinanceView';
import { AdminView } from './components/admin/AdminView';
import { SettingsView } from './components/settings/SettingsView';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { BrandSystemShowroom } from './components/brand/BrandSystemShowroom';
import { PurchasesView } from './components/purchases/PurchasesView';
import { FavoritesView } from './components/favorites/FavoritesView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { HelpCenterView } from './components/help/HelpCenterView';
import { AIProductReviewsProDashboard } from './components/addons/reviews-pro/AIProductReviewsProDashboard';
import { AISEOProDashboard } from './components/addons/seo-pro/AISEOProDashboard';

const AppContent: React.FC = () => {
  const { currentView } = useApp();
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'dashboard':
        return <DashboardOverview />;
      case 'builder':
      case 'studio':
        return <AIProductStudio />;
      case 'marketplace':
        return <MarketplaceView />;
      case 'my-apps':
      case 'installed-apps':
      case 'installations':
        return <InstalledAppsView />;
      case 'addon-reviews-pro':
        return <AIProductReviewsProDashboard />;
      case 'addon-seo-pro':
        return <AISEOProDashboard />;
      case 'purchases':
        return <PurchasesView />;
      case 'favorites':
        return <FavoritesView />;
      case 'notifications':
        return <NotificationsView />;
      case 'help':
        return <HelpCenterView />;
      case 'creator-studio':
        return <CreatorStudioView />;
      case 'connectors':
      case 'integrations':
        return <StoreConnectorsView />;
      case 'agency':
        return <AgencyView />;
      case 'finance':
      case 'subscription':
        return <FinanceView />;
      case 'admin':
        return <AdminView />;
      case 'design-system':
        return <BrandSystemShowroom />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased">
      {/* Universal Top Header */}
      <Header 
        onOpenAuthModal={() => setOnboardingOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main App Layout */}
      {currentView === 'landing' ? (
        <main className="flex-1">
          <LandingPage />
        </main>
      ) : (
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Permanent Desktop Sidebar + Mobile Drawer */}
          <Sidebar 
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />

          {/* Primary View Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
            {renderActiveView()}
          </main>
        </div>
      )}

      {/* Global Notification Toast */}
      <NotificationToast />

      {/* Auth & Guided Onboarding Wizard */}
      {onboardingOpen && (
        <OnboardingWizard
          onClose={() => setOnboardingOpen(false)}
          onComplete={() => setOnboardingOpen(false)}
        />
      )}

      {/* Auth Modal */}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
