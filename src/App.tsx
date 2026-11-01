import React, { useEffect, useState } from 'react';
import { store } from './services/store';
import { Booking, PaymentTransaction, UserProfile } from './types';
import { Navbar } from './components/layout/Navbar';
import { PublicNavbar } from './components/layout/PublicNavbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/customer/LandingPage';
import { ServicesPage } from './components/customer/ServicesPage';
import { PetManagementPage } from './components/customer/PetManagementPage';
import { AccountPage } from './components/customer/AccountPage';
import { BookingWizard } from './components/booking/BookingWizard';
import { PaymentView } from './components/booking/PaymentView';
import { BookingHistoryPage } from './components/customer/BookingHistoryPage';
import { PetPointPage } from './components/customer/PetPointPage';
import { AdminPortal } from './components/admin/AdminPortal';
import { AuthModal } from './components/auth/AuthModal';
import { ChatbotDrawer } from './components/common/ChatbotDrawer';
import { ToastViewport } from './components/common/ToastViewport';

export function App() {
  const [, setStoreRevision] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTab, setCurrentTab] = useState('landing');
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<string | undefined>();
  const [selectedPetForBooking, setSelectedPetForBooking] = useState<string | undefined>();
  const [activePaymentBooking, setActivePaymentBooking] = useState<{ booking: Booking; payment?: PaymentTransaction } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<'login' | 'register'>('login');
  const [postLoginTab, setPostLoginTab] = useState<string | null>(null);

  useEffect(() => store.subscribe(() => setStoreRevision((revision) => revision + 1)), []);

  // The public landing page is always the first screen on a new browser visit.
  // A role becomes active only after the credentials are checked by AuthModal.
  const currentUser: UserProfile = store.getCurrentUser();
  const userPoints = store.getUserPetPoints(currentUser?.id || '');

  const handleNavigate = (tab: string) => {
    const protectedTabs = ['pets', 'booking', 'payment', 'my-bookings', 'points', 'account'];
    if (!isAuthenticated && protectedTabs.includes(tab)) {
      setPostLoginTab(tab);
      setAuthDefaultMode('login');
      setIsAuthOpen(true);
      return;
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToBooking = (serviceId?: string, petId?: string) => {
    setSelectedServiceForBooking(serviceId);
    setSelectedPetForBooking(petId);
    if (!isAuthenticated) {
      setPostLoginTab('booking');
      setAuthDefaultMode('login');
      setIsAuthOpen(true);
      return;
    }
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingCompleted = (booking: Booking, payment?: PaymentTransaction) => {
    setActivePaymentBooking({ booking, payment });
    setCurrentTab('payment');
  };

  const handleOpenPaymentForBooking = (booking: Booking) => {
    const payment = store.getPayments().find((item) => item.booking_id === booking.id);
    setActivePaymentBooking({ booking, payment });
    setCurrentTab('payment');
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setIsAuthenticated(true);
    setIsAuthOpen(false);
    if (user.role === 'admin') {
      setCurrentTab('admin-dashboard');
    } else {
      setCurrentTab(postLoginTab || 'landing');
    }
    setPostLoginTab(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentTab('landing');
    setSelectedServiceForBooking(undefined);
    setSelectedPetForBooking(undefined);
    setActivePaymentBooking(null);
    setPostLoginTab(null);
    setAuthDefaultMode('login');
    setIsAuthOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthDefaultMode(mode);
    setPostLoginTab(null);
    setIsAuthOpen(true);
  };

  const renderLandingOrServices = () => (
    <>
      {currentTab === 'landing' && (
        <LandingPage
          onNavigateToBooking={handleNavigateToBooking}
          onNavigateToServices={() => handleNavigate('services')}
          onNavigateToPets={() => handleNavigate('pets')}
        />
      )}
      {currentTab === 'services' && <ServicesPage onSelectServiceToBook={(serviceId) => handleNavigateToBooking(serviceId)} />}
    </>
  );

  return (
    <div className="pet-app-shell">
      {!isAuthenticated ? (
        <div className="pet-public-shell">
          <PublicNavbar
            currentTab={currentTab === 'services' ? 'services' : 'landing'}
            onTabChange={handleNavigate}
            onOpenLogin={() => openAuth('login')}
            onOpenRegister={() => openAuth('register')}
          />
          <main className="pet-main-content">{renderLandingOrServices()}</main>
          <Footer />
          <ChatbotDrawer />
        </div>
      ) : currentUser.role === 'admin' ? (
        <div className="pet-admin-app-shell">
          <AdminPortal currentUser={currentUser} onLogout={handleLogout} />
          <Footer />
          <ChatbotDrawer />
        </div>
      ) : (
        <div className="pet-customer-shell">
          <Navbar
            currentUser={currentUser}
            currentTab={currentTab}
            onTabChange={handleNavigate}
            onLogout={handleLogout}
            userPoints={userPoints}
          />
          <main className="pet-main-content">
            {currentTab === 'landing' && (
              <LandingPage
                onNavigateToBooking={handleNavigateToBooking}
                onNavigateToServices={() => handleNavigate('services')}
                onNavigateToPets={() => handleNavigate('pets')}
              />
            )}
            {currentTab === 'services' && <ServicesPage onSelectServiceToBook={(serviceId) => handleNavigateToBooking(serviceId)} />}
            {currentTab === 'pets' && (
              <PetManagementPage
                currentUser={currentUser}
                onNavigateToBookingWithPet={(petId) => handleNavigateToBooking(undefined, petId)}
              />
            )}
            {currentTab === 'booking' && (
              <BookingWizard
                currentUser={currentUser}
                preselectedServiceId={selectedServiceForBooking}
                preselectedPetId={selectedPetForBooking}
                onBookingCompleted={handleBookingCompleted}
                onNavigateToPetManagement={() => handleNavigate('pets')}
              />
            )}
            {currentTab === 'payment' && activePaymentBooking && (
              <PaymentView
                booking={activePaymentBooking.booking}
                payment={activePaymentBooking.payment}
                onViewBookingHistory={() => handleNavigate('my-bookings')}
              />
            )}
            {currentTab === 'my-bookings' && (
              <BookingHistoryPage
                currentUser={currentUser}
                onNavigateToBooking={() => handleNavigateToBooking()}
                onOpenPaymentForBooking={handleOpenPaymentForBooking}
              />
            )}
            {currentTab === 'points' && (
              <PetPointPage
                currentUser={currentUser}
                onNavigateToBooking={() => handleNavigateToBooking()}
                onNavigateToHistory={() => handleNavigate('my-bookings')}
              />
            )}
            {currentTab === 'account' && <AccountPage currentUser={currentUser} />}
          </main>
          <Footer />
          <ChatbotDrawer />
        </div>
      )}

      <AuthModal
        isOpen={isAuthOpen}
        defaultMode={authDefaultMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
      <ToastViewport />
    </div>
  );
}

export default App;
