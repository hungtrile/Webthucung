import React from 'react';
import { CalendarDays, PawPrint, Scissors, LogIn, UserPlus } from 'lucide-react';
import { ASSETS } from '../../constants/assets';

interface PublicNavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ currentTab, onTabChange, onOpenLogin, onOpenRegister }) => (
  <header className="pet-public-navbar-wrap">
    <div className="pet-public-navbar">
      <button className="pet-brand" onClick={() => onTabChange('landing')} aria-label="Pet Phết - Trang chủ">
        <img className="pet-brand-logo" src={ASSETS.brandLogo} alt="Pet Phết – Pet First" />
      </button>
      <nav className="pet-public-nav" aria-label="Điều hướng website">
        <button className={currentTab === 'landing' ? 'is-active' : ''} onClick={() => onTabChange('landing')}><PawPrint size={18}/> Trang chủ</button>
        <button className={currentTab === 'services' ? 'is-active' : ''} onClick={() => onTabChange('services')}><Scissors size={18}/> Dịch vụ</button>
        <button onClick={() => { onTabChange('landing'); window.setTimeout(() => document.getElementById('pet-how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120); }}><CalendarDays size={18}/> Quy trình đặt lịch</button>
      </nav>
      <div className="pet-public-actions">
        <button className="pet-public-login" onClick={onOpenLogin}><LogIn size={17}/> Đăng nhập</button>
        <button className="pet-public-register" onClick={onOpenRegister}><UserPlus size={17}/> Đăng ký</button>
      </div>
    </div>
  </header>
);
