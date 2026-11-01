import React, { useEffect, useState } from 'react';
import {
  X, Lock, Mail, Phone, UserRound, CheckCircle2, ArrowRight,
  ShieldCheck, Eye, EyeOff, PawPrint, UserRoundPlus
} from 'lucide-react';
import { store } from '../../services/store';
import { notifyToast } from '../../utils/toast';
import { UserProfile } from '../../types';
import { ASSETS } from '../../constants/assets';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register' | 'forgot';
  onSuccess?: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(defaultMode);
  const [identity, setIdentity] = useState('');
  const [loginRole, setLoginRole] = useState<'customer' | 'admin'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const reportError = (message: string) => { setError(message); notifyToast('error', message); };
  const reportSuccess = (message: string) => { setSuccessMsg(message); notifyToast('success', message); };

  useEffect(() => {
    if (!isOpen) return;
    setMode(defaultMode);
    setLoginRole('customer');
    setError('');
    setSuccessMsg('');
    setOtpSent(false);
  }, [isOpen, defaultMode]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const switchMode = (next: 'login' | 'register' | 'forgot') => {
    setMode(next);
    setError('');
    setSuccessMsg('');
    setOtpSent(false);
  };

  const finishAuth = (user: UserProfile) => {
    onSuccess?.(user);
    onClose();
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!identity.trim() || !password) {
      reportError('Vui lòng nhập email hoặc số điện thoại và mật khẩu.');
      return;
    }
    setBusy(true);
    try {
      const matched = store.getUserByIdentity(identity);
      if (!matched || !(await store.verifyDemoPassword(identity, password))) {
        reportError('Thông tin đăng nhập chưa chính xác. Vui lòng kiểm tra lại.');
        return;
      }
      if (matched.role !== loginRole) {
        reportError(loginRole === 'admin'
          ? 'Tài khoản này không có quyền Quản trị viên. Hãy chọn khu vực Khách hàng hoặc dùng tài khoản Admin hợp lệ.'
          : 'Đây là tài khoản Quản trị viên. Hãy chọn khu vực Quản trị viên để đăng nhập.');
        return;
      }
      store.setCurrentUser(matched);
      reportSuccess(`Đăng nhập thành công. Xin chào ${matched.full_name}!`);
      window.setTimeout(() => finishAuth(matched), 450);
    } catch (e) {
      reportError(e instanceof Error ? e.message : 'Không thể xác thực tài khoản.');
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMsg('');
    if (fullName.trim().length < 2) return reportError('Vui lòng nhập họ tên hợp lệ.');
    if (!email.includes('@')) return reportError('Vui lòng nhập địa chỉ email hợp lệ.');
    if (phone.replace(/\D/g, '').length < 9) return reportError('Vui lòng nhập số điện thoại hợp lệ.');
    if (password.length < 6) return reportError('Mật khẩu phải có ít nhất 6 ký tự.');
    if (password !== confirmPassword) return reportError('Mật khẩu xác nhận không trùng khớp.');
    if (store.getUserByIdentity(email)) return reportError('Email đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.');
    if (store.getUserByIdentity(phone)) return reportError('Số điện thoại đã được liên kết với tài khoản khác.');

    setBusy(true);
    try {
      const result = store.registerCustomer(fullName.trim(), email.trim(), phone.trim());
      if (!result.success || !result.user) {
        reportError(result.message);
        return;
      }
      await store.setDemoPassword(email, password);
      reportSuccess('Tạo tài khoản thành công. Pet Phết chào mừng bạn!');
      window.setTimeout(() => finishAuth(result.user!), 500);
    } catch (e) {
      reportError(e instanceof Error ? e.message : 'Không thể tạo tài khoản. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };

  const handleSendOtp = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const user = store.getUserByIdentity(email);
    if (!email.includes('@') || !user) {
      reportError('Không tìm thấy tài khoản với email này. Vui lòng kiểm tra lại.');
      return;
    }
    setOtpSent(true);
    reportSuccess('Mã OTP mô phỏng đã được tạo. Trong bản demo, hãy nhập mã 123456.');
  };

  const handleVerifyOtpAndReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(otp) || otp !== '123456') {
      reportError('Mã OTP không chính xác. Mã OTP thử nghiệm là 123456.');
      return;
    }
    if (newPassword.length < 6) {
      reportError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    setBusy(true);
    try {
      await store.setDemoPassword(email, newPassword);
      reportSuccess('Mật khẩu demo đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới.');
      window.setTimeout(() => switchMode('login'), 700);
    } catch (e) {
      reportError(e instanceof Error ? e.message : 'Không thể cập nhật mật khẩu.');
    } finally {
      setBusy(false);
    }
  };


  return (
    <div className="pet-auth-overlay" role="dialog" aria-modal="true" aria-label="Đăng nhập Pet Phết" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="pet-auth-shell">
        <button className="pet-auth-close" onClick={onClose} aria-label="Đóng cửa sổ"><X size={21} /></button>
        <div className="pet-auth-visual">
          <img className="pet-auth-visual-image" src={ASSETS.authMascots} alt="" aria-hidden="true" />
          <a className="pet-auth-brand" href="#home" onClick={(e) => { e.preventDefault(); onClose(); }}>
            <img src={ASSETS.brandLogo} alt="Pet Phết – Pet First" />
          </a>
          <div className="pet-auth-visual-caption">
            <span><PawPrint size={17} /> PET FIRST</span>
            <h2>Chăm sóc bé cưng<br />bằng cả trái tim.</h2>
            <p>Cún Phết & Mèo Bông luôn sẵn sàng đồng hành cùng bạn.</p>
          </div>
        </div>

        <div className="pet-auth-panel">
          <div className="pet-auth-heading">
            <span className="pet-auth-heading-mark"><PawPrint size={19} /></span>
            <h2>{mode === 'login' ? 'Chào bạn!' : mode === 'register' ? 'Gia nhập Pet Phết!' : 'Khôi phục mật khẩu'}</h2>
            <p>{mode === 'login' ? 'Đăng nhập để tiếp tục khám phá thế giới thú cưng của Pet Phết.' : mode === 'register' ? 'Tạo tài khoản để quản lý hồ sơ và lịch chăm sóc các bé.' : 'Xác minh email để thiết lập mật khẩu mới.'}</p>
          </div>

          {error && <div className="pet-auth-alert error" role="alert">{error}</div>}
          {successMsg && <div className="pet-auth-alert success" role="status"><CheckCircle2 size={16} /> {successMsg}</div>}

          {mode === 'login' && (
            <>
            <div className="pet-login-role-switch" aria-label="Chọn khu vực đăng nhập">
              <button type="button" className={loginRole === 'customer' ? 'is-active customer' : ''} onClick={() => { setLoginRole('customer'); setError(''); }}>
                <PawPrint size={17} /> Khách hàng
              </button>
              <button type="button" className={loginRole === 'admin' ? 'is-active admin' : ''} onClick={() => { setLoginRole('admin'); setError(''); }}>
                <ShieldCheck size={17} /> Quản trị viên
              </button>
            </div>
            <form onSubmit={handleLogin} className="pet-auth-form">
              <label className="pet-auth-field"><Mail size={18} /><input value={identity} onChange={(e) => setIdentity(e.target.value)} placeholder="Email hoặc số điện thoại" autoComplete="username" required /></label>
              <label className="pet-auth-field"><Lock size={18} /><input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></label>
              <div className="pet-auth-options"><label><input type="checkbox" defaultChecked /> Ghi nhớ đăng nhập</label><button type="button" onClick={() => switchMode('forgot')}>Quên mật khẩu?</button></div>
              <button className="pet-auth-submit" type="submit" disabled={busy}>{busy ? 'Đang xác thực…' : 'Đăng nhập ngay'} <ArrowRight size={18} /></button>
              <p className="pet-auth-switch">Chưa có tài khoản? <button type="button" onClick={() => switchMode('register')}>Đăng ký thành viên mới</button></p>
            </form>
            </>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="pet-auth-form">
              <label className="pet-auth-field"><UserRound size={18} /><input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Họ và tên" autoComplete="name" required /></label>
              <label className="pet-auth-field"><Mail size={18} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" required /></label>
              <label className="pet-auth-field"><Phone size={18} /><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại" autoComplete="tel" required /></label>
              <label className="pet-auth-field"><Lock size={18} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu (ít nhất 6 ký tự)" autoComplete="new-password" required /></label>
              <label className="pet-auth-field"><ShieldCheck size={18} /><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Xác nhận mật khẩu" autoComplete="new-password" required /></label>
              <button className="pet-auth-submit" type="submit" disabled={busy}>{busy ? 'Đang tạo tài khoản…' : 'Tạo tài khoản Pet Phết'} <UserRoundPlus size={18} /></button>
              <p className="pet-auth-switch">Đã có tài khoản? <button type="button" onClick={() => switchMode('login')}>Đăng nhập</button></p>
            </form>
          )}

          {mode === 'forgot' && (
            <div className="pet-auth-form">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="pet-auth-form">
                  <label className="pet-auth-field"><Mail size={18} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email đã đăng ký" required /></label>
                  <button className="pet-auth-submit" type="submit">Tạo mã OTP <ArrowRight size={18} /></button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtpAndReset} className="pet-auth-form">
                  <label className="pet-auth-field"><ShieldCheck size={18} /><input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" maxLength={6} placeholder="Mã OTP 6 chữ số" required /></label>
                  <label className="pet-auth-field"><Lock size={18} /><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mật khẩu mới" autoComplete="new-password" required /></label>
                  <button className="pet-auth-submit" type="submit" disabled={busy}>{busy ? 'Đang cập nhật…' : 'Xác nhận & cập nhật'} <ArrowRight size={18} /></button>
                </form>
              )}
              <p className="pet-auth-switch"><button type="button" onClick={() => switchMode('login')}>← Quay lại đăng nhập</button></p>
            </div>
          )}

          <div className="pet-auth-demo pet-auth-demo-credentials">
            <div><b>Tài khoản dùng thử</b><span>Đăng nhập bằng đúng khu vực và tài khoản tương ứng.</span></div>
            <p><strong>Khách hàng:</strong> khachhang@petphet.vn</p>
          </div>
          <p className="pet-auth-note">Mật khẩu dùng thử khách hàng: petphet123. Tài khoản Admin do chủ hệ thống cấp riêng, không thể tự đăng ký hoặc nâng quyền từ tài khoản khách hàng.</p>
        </div>
      </div>
    </div>
  );
};
