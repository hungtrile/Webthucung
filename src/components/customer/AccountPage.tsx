import React, { useState } from 'react';
import { Bell, CheckCircle2, KeyRound, Mail, Phone, Save, ShieldCheck, UserRound } from 'lucide-react';
import { UserProfile } from '../../types';
import { store } from '../../services/store';
import { notifyToast } from '../../utils/toast';

interface AccountPageProps {
  currentUser: UserProfile;
}

interface NotificationPreferences {
  booking: boolean;
  payment: boolean;
  promotion: boolean;
}

export const AccountPage: React.FC<AccountPageProps> = ({ currentUser }) => {
  const [fullName, setFullName] = useState(currentUser.full_name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [profileMessage, setProfileMessage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const preferencesKey = `pet_phet_notification_preferences_${currentUser.id}`;
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem(preferencesKey);
      return saved ? JSON.parse(saved) as NotificationPreferences : { booking: true, payment: true, promotion: false };
    } catch {
      return { booking: true, payment: true, promotion: false };
    }
  });
  const [preferencesSaved, setPreferencesSaved] = useState(false);

  const saveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    if (fullName.trim().length < 2) {
      setProfileMessage('Họ tên cần có ít nhất 2 ký tự.');
      notifyToast('error', 'Họ tên cần có ít nhất 2 ký tự.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 9) {
      setProfileMessage('Số điện thoại chưa hợp lệ.');
      notifyToast('error', 'Số điện thoại chưa hợp lệ.');
      return;
    }
    try {
      store.updateUserProfile({ full_name: fullName.trim(), phone: phone.trim() });
      setProfileMessage('Thông tin cá nhân đã được cập nhật.');
      notifyToast('success', 'Thông tin cá nhân đã được cập nhật.');
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : 'Không thể cập nhật thông tin.');
      notifyToast('error', error instanceof Error ? error.message : 'Không thể cập nhật thông tin.');
    }
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    if (newPassword.length < 6) { setPasswordError('Mật khẩu mới cần có ít nhất 6 ký tự.'); notifyToast('error', 'Mật khẩu mới cần có ít nhất 6 ký tự.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Mật khẩu xác nhận không trùng khớp.'); notifyToast('error', 'Mật khẩu xác nhận không trùng khớp.'); return; }
    try {
      const valid = await store.verifyDemoPassword(currentUser.email, currentPassword);
      if (!valid) { setPasswordError('Mật khẩu hiện tại không chính xác.'); notifyToast('error', 'Mật khẩu hiện tại không chính xác.'); return; }
      await store.setDemoPassword(currentUser.email, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Đổi mật khẩu thành công.');
      notifyToast('success', 'Đổi mật khẩu thành công.');
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Không thể cập nhật mật khẩu.');
      notifyToast('error', error instanceof Error ? error.message : 'Không thể cập nhật mật khẩu.');
    }
  };

  const savePreferences = () => {
    localStorage.setItem(preferencesKey, JSON.stringify(preferences));
    notifyToast('success', 'Đã lưu tùy chọn thông báo trên trình duyệt này.');
    setPreferencesSaved(true);
    window.setTimeout(() => setPreferencesSaved(false), 2200);
  };

  return (
    <div className="pet-account-page">
      <div className="pet-page-intro">
        <span className="pet-section-kicker">THÔNG TIN CỦA BẠN</span>
        <h1>Tài khoản của tôi</h1>
        <p>Quản lý thông tin liên hệ, bảo mật và tùy chọn thông báo.</p>
      </div>

      <div className="pet-account-grid">
        <section className="pet-account-card">
          <div className="pet-account-card-heading"><span><UserRound /></span><div><h2>Thông tin cá nhân</h2><p>Cập nhật thông tin liên hệ của bạn.</p></div></div>
          <form onSubmit={saveProfile} className="pet-account-form">
            <label>Họ và tên<input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></label>
            <label>Email đăng nhập<div className="pet-account-input-icon"><Mail size={17} /><input value={currentUser.email} readOnly /></div><small>Email cần xác minh OTP khi thay đổi, nên đang được khóa trong bản demo.</small></label>
            <label>Số điện thoại<div className="pet-account-input-icon"><Phone size={17} /><input value={phone} onChange={(e) => setPhone(e.target.value)} required /></div></label>
            <button type="submit" className="pet-button pet-button-primary"><Save size={17} /> Lưu thông tin</button>
            {profileMessage && <p className="pet-account-feedback"><CheckCircle2 size={16} />{profileMessage}</p>}
          </form>
        </section>

        <section className="pet-account-card">
          <div className="pet-account-card-heading"><span className="teal"><KeyRound /></span><div><h2>Bảo mật tài khoản</h2><p>Thay đổi mật khẩu đăng nhập.</p></div></div>
          <form onSubmit={changePassword} className="pet-account-form">
            <label>Mật khẩu hiện tại<input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" required /></label>
            <label>Mật khẩu mới<input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" required /></label>
            <label>Xác nhận mật khẩu mới<input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required /></label>
            <button type="submit" className="pet-button pet-button-teal"><ShieldCheck size={17} /> Cập nhật mật khẩu</button>
            {passwordError && <p className="pet-account-feedback error">{passwordError}</p>}
            {passwordMessage && <p className="pet-account-feedback"><CheckCircle2 size={16} />{passwordMessage}</p>}
          </form>
        </section>

        <section className="pet-account-card pet-account-notifications">
          <div className="pet-account-card-heading"><span className="yellow"><Bell /></span><div><h2>Cài đặt thông báo</h2><p>Chọn những nội dung bạn muốn nhận.</p></div></div>
          <div className="pet-preference-list">
            <label><span><b>Thông báo lịch hẹn</b><small>Xác nhận, thay đổi hoặc nhắc lịch.</small></span><input type="checkbox" checked={preferences.booking} onChange={(e) => setPreferences((p) => ({ ...p, booking: e.target.checked }))} /></label>
            <label><span><b>Thông báo thanh toán</b><small>Kết quả giao dịch và đối chiếu QR.</small></span><input type="checkbox" checked={preferences.payment} onChange={(e) => setPreferences((p) => ({ ...p, payment: e.target.checked }))} /></label>
            <label><span><b>Ưu đãi và tin tức</b><small>Mã giảm giá và cập nhật từ Pet Phết.</small></span><input type="checkbox" checked={preferences.promotion} onChange={(e) => setPreferences((p) => ({ ...p, promotion: e.target.checked }))} /></label>
          </div>
          <button className="pet-button pet-button-light" onClick={savePreferences}><Save size={17} /> Lưu tùy chọn</button>
          {preferencesSaved && <p className="pet-account-feedback"><CheckCircle2 size={16} />Đã lưu tùy chọn thông báo trên trình duyệt này.</p>}
        </section>
      </div>
    </div>
  );
};
