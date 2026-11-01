import React, { useState } from 'react';
import {
  Home, Scissors, PawPrint, CalendarDays, ClipboardList, Award,
  Bell, ChevronDown, Menu, X, UserRound, LogOut
} from 'lucide-react';
import { UserProfile } from '../../types';
import { NotificationDropdown } from '../common/NotificationDropdown';
import { ASSETS } from '../../constants/assets';

interface NavbarProps {
  currentUser: UserProfile;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  userPoints: number;
}

const navItems = [
  { id: 'landing', label: 'Trang chủ', short: 'Home', icon: Home },
  { id: 'services', label: 'Dịch vụ', short: 'Services', icon: Scissors },
  { id: 'pets', label: 'Thú cưng', short: 'My Pets', icon: PawPrint },
  { id: 'booking', label: 'Đặt lịch', short: 'Book Spa', icon: CalendarDays },
  { id: 'my-bookings', label: 'Lịch hẹn', short: 'Bookings', icon: ClipboardList },
  { id: 'points', label: 'Pet Point', short: 'Rewards', icon: Award }
];

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentTab,
  onTabChange,
  onLogout,
  userPoints
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = (tab: string) => {
    onTabChange(tab);
    setMobileOpen(false);
    setProfileOpen(false);
  };

  return (
    <header className="pet-navbar-wrap">
      <div className="pet-navbar">
        <button className="pet-brand" onClick={() => navigate('landing')} aria-label="Pet Phết - Trang chủ">
          <img className="pet-brand-logo" src={ASSETS.brandLogo} alt="Pet Phết – Pet First" />
        </button>

        <nav className="pet-nav-links" aria-label="Điều hướng chính">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                className={`pet-nav-item ${active ? 'is-active' : ''}`}
                onClick={() => navigate(item.id)}
                aria-current={active ? 'page' : undefined}
              >
                <span className="pet-nav-icon"><Icon size={22} strokeWidth={2.2} /></span>
                <span className="pet-nav-label">{item.short}</span>
                {item.id === 'points' && <span className="pet-nav-points">{userPoints.toLocaleString('vi-VN')}</span>}
              </button>
            );
          })}
        </nav>

        <div className="pet-nav-actions">
          <NotificationDropdown role={currentUser.role} userId={currentUser.id} />
          <div className="pet-profile-wrap">
            <button className="pet-profile-button" onClick={() => setProfileOpen((v) => !v)} aria-expanded={profileOpen}>
              {currentUser.avatar_url ? (
                <img src={currentUser.avatar_url} alt="Ảnh đại diện" />
              ) : (
                <span className="pet-profile-avatar"><UserRound size={22} /></span>
              )}
              <span className="pet-profile-name">{currentUser.full_name.split(' ').slice(-2).join(' ')}</span>
              <ChevronDown size={16} />
            </button>
            {profileOpen && (
              <div className="pet-profile-menu">
                <div className="pet-profile-summary">
                  <strong>{currentUser.full_name}</strong>
                  <span>{currentUser.email}</span>
                  <small>{userPoints.toLocaleString('vi-VN')} Pet Point</small>
                </div>
                <button onClick={() => navigate('account')}><UserRound size={16} /> Tài khoản của tôi</button>
                <button onClick={() => navigate('pets')}><PawPrint size={16} /> Hồ sơ thú cưng</button>
                <button onClick={() => navigate('my-bookings')}><CalendarDays size={16} /> Lịch sử đặt lịch</button>
                <button className="pet-logout-button" onClick={onLogout}><LogOut size={16} /> Đăng xuất</button>
              </div>
            )}
          </div>
          <button className="pet-mobile-toggle" onClick={() => setMobileOpen((v) => !v)} aria-label="Mở điều hướng">
            {mobileOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="pet-mobile-menu" aria-label="Điều hướng di động">
          {navItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} className={currentTab === item.id ? 'is-active' : ''} onClick={() => navigate(item.id)}><Icon size={18} />{item.label}</button>;
          })}
          <button onClick={() => navigate('account')}><UserRound size={18} /> Tài khoản của tôi</button>
          <button onClick={() => { onLogout(); setMobileOpen(false); }}><LogOut size={18} /> Đăng xuất</button>
        </nav>
      )}
    </header>
  );
};
