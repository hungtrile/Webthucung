import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  Star,
  Settings,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Tag,
  LogOut,
  Sparkles,
  QrCode,
  CreditCard,
  Banknote
} from 'lucide-react';
import { store } from '../../services/store';
import { notifyToast } from '../../utils/toast';
import {
  Booking,
  BookingStatus,
  Coupon,
  PaymentTransaction,
  Pet,
  Review,
  Service,
  ServiceCategory,
  UserProfile,
  WorkingSchedule
} from '../../types';
import { formatVND } from '../../utils/bookingEngine';
import { NotificationDropdown } from '../common/NotificationDropdown';

interface AdminPortalProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

const AdminPortalContent: React.FC<AdminPortalProps> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'bookings' | 'services' | 'schedules' | 'customers' | 'reviews' | 'coupons'
  >('dashboard');

  // Filter state for dashboard
  const [dateFilter, setDateFilter] = useState<'today' | '7days' | '30days' | 'all'>('all');

  // Refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  // Data pulls
  const allBookings = store.getBookings();
  const allPayments = store.getPayments();
  const allServices = store.getServices(false);
  const allCategories = store.getCategories();
  const allReviews = store.getReviews();
  const allPets = store.getAllPets();
  const allUsers = store.getAllUsers();
  const allSchedules = store.getSchedules();
  const allCoupons = store.getCoupons();

  // Metrics computation
  const customerCount = allUsers.filter((u) => u.role === 'customer').length;
  const petCount = allPets.filter((p) => p.is_active).length;
  const serviceCount = allServices.length;
  const bookingCount = allBookings.length;

  const pendingBookings = allBookings.filter((b) => b.status === 'pending');
  const confirmedBookings = allBookings.filter((b) => b.status === 'confirmed');
  const inProgressBookings = allBookings.filter((b) => b.status === 'in_progress');
  const completedBookings = allBookings.filter((b) => b.status === 'completed');
  const cancelledBookings = allBookings.filter((b) => b.status === 'cancelled');

  const pendingReconcilePayments = allPayments.filter(
    (p) => p.payment_status === 'pending_reconcile'
  );

  const totalVerifiedRevenue = allPayments
    .filter((p) => p.payment_status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  // Admin state actions
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const reportAction = (type: 'success' | 'error', text: string) => { setActionAlert({ type, text }); notifyToast(type, text); };

  // Booking management filters & modal
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [bookingSearch, setBookingSearch] = useState<string>('');
  const [selectedBookingForAction, setSelectedBookingForAction] = useState<Booking | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState<string>('');

  // Service modal
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [srvName, setSrvName] = useState('');
  const [srvCatId, setSrvCatId] = useState(allCategories[0]?.id || '');
  const [srvPrice, setSrvPrice] = useState<number>(200000);
  const [srvDuration, setSrvDuration] = useState<number>(60);
  const [srvDesc, setSrvDesc] = useState('');
  const [srvImage, setSrvImage] = useState('');
  const [srvIsWeightBased, setSrvIsWeightBased] = useState(false);

  // Schedule modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [targetScheduleDate, setTargetScheduleDate] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; });
  const [schStartTime, setSchStartTime] = useState('08:00');
  const [schEndTime, setSchEndTime] = useState('20:00');
  const [schCapacity, setSchCapacity] = useState<number>(4);
  const [schIsAvailable, setSchIsAvailable] = useState<boolean>(true);

  // Review reply state
  const [replyReviewTarget, setReplyReviewTarget] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');

  // Coupon state
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [cpCode, setCpCode] = useState('');
  const [cpType, setCpType] = useState<'percent' | 'fixed'>('fixed');
  const [cpValue, setCpValue] = useState<number>(50000);
  const [cpMinSpend, setCpMinSpend] = useState<number>(200000);
  const [cpDesc, setCpDesc] = useState('');


  // Handlers
  const handleUpdateBookingStatus = (bookingId: string, status: BookingStatus) => {
    const res = store.updateBookingStatus(bookingId, status, adminNoteInput);
    reportAction(res.success ? 'success' : 'error', res.message);
    setSelectedBookingForAction(null);
    setAdminNoteInput('');
    triggerRefresh();
  };

  const handleReconcilePayment = (paymentId: string, isApproved: boolean) => {
    const res = store.reconcilePayment(paymentId, isApproved, currentUser.id);
    reportAction(res.success ? 'success' : 'error', res.message);
    triggerRefresh();
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      store.updateService(editingService.id, {
        service_name: srvName,
        category_id: srvCatId,
        base_price: Number(srvPrice),
        duration_minutes: Number(srvDuration),
        description: srvDesc,
        image_url: srvImage,
        is_weight_based: srvIsWeightBased
      });
      reportAction('success', `Đã cập nhật dịch vụ "${srvName}".`);
    } else {
      store.addService({
        service_name: srvName,
        category_id: srvCatId,
        base_price: Number(srvPrice),
        duration_minutes: Number(srvDuration),
        description: srvDesc,
        image_url: srvImage || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80',
        is_weight_based: srvIsWeightBased,
        species_supported: ['Chó', 'Mèo'],
        is_active: true
      });
      reportAction('success', `Đã thêm mới dịch vụ "${srvName}".`);
    }
    setServiceModalOpen(false);
    triggerRefresh();
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetScheduleDate || schEndTime <= schStartTime || schCapacity < 1) {
      reportAction('error', 'Vui lòng kiểm tra ngày, giờ hoạt động và sức chứa.');
      return;
    }
    store.updateSchedule(targetScheduleDate, {
      start_time: schStartTime,
      end_time: schEndTime,
      max_concurrent_capacity: Number(schCapacity),
      is_available: schIsAvailable
    });
    reportAction('success', `Cập nhật lịch làm việc ngày ${targetScheduleDate} thành công!`);
    setScheduleModalOpen(false);
    triggerRefresh();
  };

  const handleReplyReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyReviewTarget || !replyText.trim()) return;
    const res = store.replyReview(replyReviewTarget.id, replyText);
    reportAction(res.success ? 'success' : 'error', res.message);
    setReplyReviewTarget(null);
    setReplyText('');
    triggerRefresh();
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpCode.trim()) return;
    store.addCoupon({
      code: cpCode.toUpperCase().trim(),
      discount_type: cpType,
      discount_value: Number(cpValue),
      min_order_value: Number(cpMinSpend),
      is_active: true,
      expires_at: '2029-12-31T23:59:59Z',
      usage_limit: 500,
      description: cpDesc || `Giảm ${cpType === 'percent' ? `${cpValue}%` : formatVND(cpValue)} cho đơn từ ${formatVND(cpMinSpend)}`
    });
    reportAction('success', `Đã tạo mã coupon mới: ${cpCode.toUpperCase()}`);
    setCouponModalOpen(false);
    setCpCode('');
    triggerRefresh();
  };

  return (
    <div className="pet-admin-portal-root min-h-screen flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-[#81451F] text-white border-b-2 border-[#EC802B] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-xs">
              <span className="font-black text-[#EC802B] text-xl font-heading">P</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-[#EDC55B] font-heading">
                  Pet Phết Admin Portal
                </span>
                <span className="text-[10px] bg-[#EC802B] text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Quản Trị Viên
                </span>
              </div>
              <p className="text-[11px] text-orange-200">Hệ thống điều hành dịch vụ thú cưng</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationDropdown role="admin" />

            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 rounded-xl bg-[#FCF5DC] text-[#81451F] hover:bg-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5 text-[#EC802B]" /> Đăng xuất
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar gap-1 pt-1 pb-2">
          {[
            { id: 'dashboard', label: 'Tổng quan (Dashboard)', icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: 'bookings', label: `Lịch hẹn (${bookingCount})`, icon: <Calendar className="w-4 h-4" />, badge: pendingBookings.length > 0 ? `${pendingBookings.length} mới` : undefined },
            { id: 'services', label: `Dịch vụ & Bảng giá (${serviceCount})`, icon: <Scissors className="w-4 h-4" /> },
            { id: 'schedules', label: 'Lịch & Sức chứa', icon: <Clock className="w-4 h-4" /> },
            { id: 'customers', label: `Khách & Bé cưng (${customerCount})`, icon: <Users className="w-4 h-4" /> },
            { id: 'reviews', label: `Đánh giá (${allReviews.length})`, icon: <Star className="w-4 h-4" /> },
            { id: 'coupons', label: `Mã ưu đãi (${allCoupons.length})`, icon: <Tag className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#EC802B] text-white shadow-xs'
                  : 'text-orange-100 hover:bg-white/10'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge && (
                <span className="bg-[#EDC55B] text-[#81451F] text-[9px] font-black px-1.5 py-0.2 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {actionAlert && (
          <div
            className={`mb-6 p-4 rounded-2xl text-xs flex items-center justify-between ${
              actionAlert.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionAlert.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>{actionAlert.text}</span>
            </div>
            <button
              onClick={() => setActionAlert(null)}
              className="text-neutral-400 hover:text-neutral-700 text-xs font-bold cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* 1. MODULE: ADMIN DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#81451F] font-heading">
                  Báo Cáo Hoạt Động & Chỉ Số Quản Trị
                </h2>
                <p className="text-xs text-neutral-600">
                  Số liệu được tổng hợp từ dữ liệu demo đang lưu trên trình duyệt.
                </p>
              </div>

              {/* Time range filter */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-[#E8CCAD]">
                {[
                  { id: 'today', label: 'Hôm nay' },
                  { id: '7days', label: '7 ngày' },
                  { id: '30days', label: '30 ngày' },
                  { id: 'all', label: 'Toàn bộ' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setDateFilter(f.id as any)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      dateFilter === f.id
                        ? 'bg-[#EC802B] text-white shadow-2xs'
                        : 'text-neutral-600 hover:bg-[#FAF6F0]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Key KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white border-2 border-[#E8CCAD] shadow-xs space-y-1">
                <span className="text-[11px] text-neutral-400 uppercase font-bold tracking-wider">
                  Tổng Doanh Thu Đã Thu
                </span>
                <p className="text-2xl sm:text-3xl font-black text-[#EC802B]">
                  {formatVND(totalVerifiedRevenue)}
                </p>
                <span className="text-[10px] text-emerald-600 font-bold block pt-1">
                  Đã đối chiếu thực tế qua sao kê
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white border-2 border-[#E8CCAD] shadow-xs space-y-1">
                <span className="text-[11px] text-neutral-400 uppercase font-bold tracking-wider">
                  Tổng Số Booking
                </span>
                <p className="text-2xl sm:text-3xl font-black text-[#81451F]">
                  {bookingCount}
                </p>
                <span className="text-[10px] text-[#EC802B] font-bold block pt-1">
                  {pendingBookings.length} lịch hẹn chờ xác nhận
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white border-2 border-[#E8CCAD] shadow-xs space-y-1">
                <span className="text-[11px] text-neutral-400 uppercase font-bold tracking-wider">
                  Khách Hàng & Bé Cưng
                </span>
                <p className="text-2xl sm:text-3xl font-black text-[#66BCB4]">
                  {customerCount} / {petCount}
                </p>
                <span className="text-[10px] text-neutral-500 block pt-1">
                  Khách hàng / Thú cưng hoạt động
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white border-2 border-[#E8CCAD] shadow-xs space-y-1">
                <span className="text-[11px] text-neutral-400 uppercase font-bold tracking-wider">
                  Dịch Vụ Đang Mở
                </span>
                <p className="text-2xl sm:text-3xl font-black text-[#EDC55B]">
                  {allServices.filter((s) => s.is_active).length}
                </p>
                <span className="text-[10px] text-neutral-500 block pt-1">
                  {allCategories.length} nhóm danh mục chăm sóc
                </span>
              </div>
            </div>

            {/* Pending QR Reconciliation Section */}
            {pendingReconcilePayments.length > 0 && (
              <div className="p-5 rounded-3xl bg-[#FCF5DC] border-2 border-[#EDC55B] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#81451F] flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#EC802B]" /> Có {pendingReconcilePayments.length} giao dịch QR đang chờ đối chiếu sao kê
                  </h3>
                  <span className="text-xs text-[#EC802B] font-bold">Cần kiểm tra</span>
                </div>

                <div className="divide-y divide-[#E8CCAD]/60">
                  {pendingReconcilePayments.map((p) => (
                    <div key={p.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <strong className="text-[#81451F]">{p.transfer_content}</strong>
                        <span className="text-neutral-500 ml-2">({formatVND(p.amount)})</span>
                        <span className="text-[10px] text-neutral-400 block">Tham chiếu: {p.transaction_reference}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReconcilePayment(p.id, true)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                        >
                          Khớp sao kê (Duyệt)
                        </button>
                        <button
                          onClick={() => handleReconcilePayment(p.id, false)}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold cursor-pointer"
                        >
                          Không khớp
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
              <div className="p-4 bg-white rounded-2xl border border-amber-200">
                <span className="text-[11px] font-bold text-amber-700 block">Chờ xác nhận</span>
                <span className="text-2xl font-black text-amber-600">{pendingBookings.length}</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-blue-200">
                <span className="text-[11px] font-bold text-blue-700 block">Đã xác nhận</span>
                <span className="text-2xl font-black text-blue-600">{confirmedBookings.length}</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-purple-200">
                <span className="text-[11px] font-bold text-purple-700 block">Đang phục vụ</span>
                <span className="text-2xl font-black text-purple-600">{inProgressBookings.length}</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-700 block">Hoàn thành</span>
                <span className="text-2xl font-black text-emerald-600">{completedBookings.length}</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-red-200">
                <span className="text-[11px] font-bold text-red-700 block">Đã hủy</span>
                <span className="text-2xl font-black text-red-600">{cancelledBookings.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. MODULE: BOOKING MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#81451F] font-heading">
                  Quản Lý Lịch Hẹn Chăm Sóc Bé Cưng
                </h2>
                <p className="text-xs text-neutral-600">
                  Xác nhận, cập nhật trạng thái phục vụ và đối chiếu thanh toán.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Tìm mã, khách, bé..."
                    className="bg-white border border-[#E8CCAD] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#81451F] focus:outline-none focus:ring-2 focus:ring-[#EC802B]"
                  />
                </div>

                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="bg-white border border-[#E8CCAD] rounded-xl px-3 py-1.5 text-xs text-[#81451F] font-bold focus:outline-none"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="in_progress">Đang phục vụ</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>

            {/* Booking Records Table */}
            <div className="bg-white rounded-3xl border-2 border-[#E8CCAD] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6F0] text-[#81451F] font-black uppercase tracking-wider border-b border-[#E8CCAD]">
                    <tr>
                      <th className="p-4">Mã Booking</th>
                      <th className="p-4">Khách hàng & Bé cưng</th>
                      <th className="p-4">Dịch vụ</th>
                      <th className="p-4">Ngày & Giờ</th>
                      <th className="p-4">Thanh toán</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FAF6F0]">
                    {allBookings
                      .filter((b) => {
                        const mStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
                        const mSearch =
                          b.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          b.user_name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          b.pet_name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          b.service_name.toLowerCase().includes(bookingSearch.toLowerCase());
                        return mStatus && mSearch;
                      })
                      .map((b) => (
                        <tr key={b.id} className="hover:bg-[#FAF6F0]/60 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#81451F]">
                            #{b.id}
                          </td>
                          <td className="p-4">
                            <strong className="block text-[#81451F]">{b.user_name}</strong>
                            <span className="text-neutral-500">{b.user_phone}</span>
                            <div className="text-[11px] text-[#EC802B] font-bold mt-0.5">
                              🐾 {b.pet_name} ({b.pet_species} - {b.pet_weight}kg)
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-neutral-700 block">{b.service_name}</span>
                            <span className="font-black text-[#EC802B]">{formatVND(b.total_amount)}</span>
                          </td>
                          <td className="p-4 text-neutral-600">
                            <strong>{b.booking_time} - {b.end_time}</strong>
                            <span className="block text-[11px] text-neutral-400">{b.booking_date}</span>
                          </td>
                          <td className="p-4">
                            <span className="block font-bold text-[#81451F]">{b.payment_method}</span>
                            <span
                              className={`text-[10px] font-bold ${
                                b.payment_status === 'paid'
                                  ? 'text-emerald-600'
                                  : b.payment_status === 'pending_reconcile'
                                  ? 'text-blue-600'
                                  : 'text-amber-600'
                              }`}
                            >
                              {b.payment_status === 'paid' && 'Đã thanh toán'}
                              {b.payment_status === 'pending_reconcile' && 'Chờ đối chiếu'}
                              {b.payment_status === 'unpaid' && 'Chưa thanh toán'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                b.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : b.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : b.status === 'in_progress'
                                  ? 'bg-purple-100 text-purple-800'
                                  : b.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {b.status === 'pending' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                                  className="px-2.5 py-1 bg-[#66BCB4] hover:bg-[#4DA39B] text-white rounded-lg font-bold text-[11px] cursor-pointer"
                                  title="Xác nhận lịch hẹn"
                                >
                                  Xác nhận
                                </button>
                              )}

                              {b.status === 'confirmed' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'in_progress')}
                                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                                  title="Bắt đầu phục vụ"
                                >
                                  Bắt đầu
                                </button>
                              )}

                              {b.status === 'in_progress' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                                  title="Đánh dấu hoàn thành"
                                >
                                  Hoàn thành
                                </button>
                              )}

                              {b.status !== 'completed' && b.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                                  className="px-2 py-1 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-bold text-[11px] cursor-pointer"
                                  title="Hủy lịch hẹn"
                                >
                                  Từ chối
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. MODULE: SERVICES & PRICING MANAGEMENT */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#81451F] font-heading">
                  Quản Lý Dịch Vụ & Bảng Giá Cân Nặng
                </h2>
                <p className="text-xs text-neutral-600">
                  Cấu hình dịch vụ, thiết lập bảng giá theo cân nặng cho Grooming & Spa.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingService(null);
                  setSrvName('');
                  setSrvPrice(200000);
                  setSrvDuration(60);
                  setSrvDesc('');
                  setSrvImage('https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80');
                  setSrvIsWeightBased(false);
                  setServiceModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-[#EC802B] hover:bg-[#D46917] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Thêm dịch vụ mới
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allServices.map((srv) => (
                <div
                  key={srv.id}
                  className="bg-white rounded-3xl border-2 border-[#E8CCAD] overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-40 bg-neutral-100">
                      <img
                        src={srv.image_url}
                        alt={srv.service_name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          store.updateService(srv.id, { is_active: !srv.is_active });
                          triggerRefresh();
                        }}
                        className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer shadow-xs ${
                          srv.is_active
                            ? 'bg-emerald-500 text-white'
                            : 'bg-neutral-600 text-white'
                        }`}
                      >
                        {srv.is_active ? 'Đang hoạt động' : 'Tạm ẩn'}
                      </button>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-base text-[#81451F] font-heading line-clamp-1">
                        {srv.service_name}
                      </h3>
                      <p className="text-xs text-neutral-500 line-clamp-2">{srv.description}</p>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-neutral-500">{srv.duration_minutes} phút</span>
                        <span className="font-black text-[#EC802B] text-base">
                          {formatVND(srv.base_price)}
                        </span>
                      </div>

                      {srv.is_weight_based && srv.pricing_tiers && (
                        <div className="mt-2 p-2 bg-[#FAF6F0] rounded-xl text-[10px] text-neutral-600 space-y-0.5">
                          <strong className="text-[#81451F] block">Khung giá theo cân nặng:</strong>
                          {srv.pricing_tiers.map((t) => (
                            <div key={t.id} className="flex justify-between">
                              <span>{t.min_weight}-{t.max_weight}kg:</span>
                              <strong>{formatVND(t.price)}</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF6F0] border-t border-[#E8CCAD] flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingService(srv);
                        setSrvName(srv.service_name);
                        setSrvCatId(srv.category_id);
                        setSrvPrice(srv.base_price);
                        setSrvDuration(srv.duration_minutes);
                        setSrvDesc(srv.description);
                        setSrvImage(srv.image_url);
                        setSrvIsWeightBased(srv.is_weight_based);
                        setServiceModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[#81451F] text-[#81451F] hover:bg-white text-xs font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. MODULE: SCHEDULE & CAPACITY MANAGEMENT */}
        {activeTab === 'schedules' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#81451F] font-heading">
                  Quản Lý Lịch Làm Việc & Sức Chứa Đồng Thời
                </h2>
                <p className="text-xs text-neutral-600">
                  Cấu hình ngày mở cửa, giờ phục vụ và giới hạn lượt nhận bé mỗi ca.
                </p>
              </div>

              <button
                onClick={() => setScheduleModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-[#EC802B] hover:bg-[#D46917] text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4" /> Cấu hình ngày làm việc
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allSchedules.map((sch) => (
                <div
                  key={sch.id}
                  className={`p-4 rounded-3xl border-2 transition-all ${
                    sch.is_available
                      ? 'bg-white border-[#E8CCAD]'
                      : 'bg-neutral-100 border-neutral-300 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-sm text-[#81451F]">{sch.work_date}</strong>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        sch.is_available
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sch.is_available ? 'Hoạt động' : 'Nghỉ'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-neutral-600">
                    <p>Giờ mở cửa: <strong>{sch.start_time} - {sch.end_time}</strong></p>
                    <p>Sức chứa tối đa: <strong className="text-[#EC802B]">{sch.max_concurrent_capacity} bé</strong> / cùng ca</p>
                  </div>

                  <button
                    onClick={() => {
                      setTargetScheduleDate(sch.work_date);
                      setSchStartTime(sch.start_time);
                      setSchEndTime(sch.end_time);
                      setSchCapacity(sch.max_concurrent_capacity);
                      setSchIsAvailable(sch.is_available);
                      setScheduleModalOpen(true);
                    }}
                    className="mt-3 w-full py-1.5 text-center text-xs font-bold text-[#81451F] hover:bg-[#FAF6F0] rounded-xl border border-[#E8CCAD] cursor-pointer"
                  >
                    Chỉnh sửa
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. MODULE: CUSTOMERS & PETS */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-[#81451F] font-heading">
                Danh Sách Khách Hàng & Thú Cưng
              </h2>
              <p className="text-xs text-neutral-600">
                Theo dõi hồ sơ chủ nuôi và lịch sử dịch vụ của từng bé.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allUsers.filter((u) => u.role === 'customer').map((customer) => {
                const pets = allPets.filter((p) => p.user_id === customer.id && p.is_active);
                const bookings = allBookings.filter((b) => b.user_id === customer.id);
                const points = store.getUserPetPoints(customer.id);

                return (
                  <div
                    key={customer.id}
                    className="bg-white rounded-3xl border-2 border-[#E8CCAD] p-5 shadow-xs space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={customer.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt={customer.full_name}
                        className="w-12 h-12 rounded-2xl object-cover border border-[#EDC55B]"
                      />
                      <div>
                        <h3 className="font-bold text-base text-[#81451F]">{customer.full_name}</h3>
                        <p className="text-xs text-neutral-500">{customer.phone} • {customer.email}</p>
                        <span className="text-[11px] text-[#EC802B] font-bold">
                          Điểm tích lũy: {points} Pet Point
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-[#FAF6F0] pt-3">
                      <h4 className="text-xs font-bold text-[#81451F] mb-2">Thú cưng sở hữu ({pets.length}):</h4>
                      <div className="flex flex-wrap gap-2">
                        {pets.map((pet) => (
                          <div
                            key={pet.id}
                            className="p-2 rounded-xl bg-[#FAF6F0] border border-[#E8CCAD] text-xs flex items-center gap-2"
                          >
                            <img
                              src={pet.avatar_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80'}
                              alt={pet.pet_name}
                              className="w-7 h-7 rounded-lg object-cover"
                            />
                            <div>
                              <strong className="block text-[#81451F]">{pet.pet_name}</strong>
                              <span className="text-[10px] text-neutral-500">{pet.species} - {pet.weight}kg</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-[11px] text-neutral-400">
                      Tổng số lượt đặt lịch: <strong className="text-[#81451F]">{bookings.length}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. MODULE: REVIEWS & FEEDBACK */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-[#81451F] font-heading">
                Đánh Giá Khách Hàng & Phản Hồi Chính Thức
              </h2>
              <p className="text-xs text-neutral-600">
                Xem đánh giá, chấm sao và phản hồi chăm sóc từ phía Pet Phết.
              </p>
            </div>

            <div className="space-y-4">
              {allReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-3xl border-2 border-[#E8CCAD] p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#81451F]">
                        {rev.user_name} (chủ bé {rev.pet_name})
                      </h3>
                      <div className="flex items-center gap-1 text-[#EDC55B] text-xs mt-0.5">
                        {'★'.repeat(rev.rating)}
                        <span className="text-neutral-400 text-[10px] ml-1">
                          {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] text-[#66BCB4] font-bold bg-[#E5F6F4] px-2 py-0.5 rounded-full">
                      Đã cộng +1.000 pts
                    </span>
                  </div>

                  <p className="text-xs text-neutral-700 italic font-vietnamese">
                    "{rev.comment}"
                  </p>

                  {rev.admin_reply ? (
                    <div className="p-3 bg-[#FAF6F0] rounded-2xl border-l-4 border-[#EC802B] text-xs text-[#81451F] space-y-1">
                      <p className="font-bold text-[11px] text-[#EC802B]">
                        Phản hồi của Admin:
                      </p>
                      <p>{rev.admin_reply}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setReplyReviewTarget(rev);
                        setReplyText('');
                      }}
                      className="px-3 py-1.5 bg-[#FAF6F0] hover:bg-[#FDE8D7] text-[#81451F] rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#EC802B]" /> Phản hồi khách hàng
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. MODULE: COUPONS */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#81451F] font-heading">
                  Quản Lý Mã Giảm Giá & Vouchers
                </h2>
                <p className="text-xs text-neutral-600">
                  Tạo các mã khuyến mãi tri ân khách hàng và kích cầu đặt lịch.
                </p>
              </div>

              <button
                onClick={() => setCouponModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-[#EC802B] hover:bg-[#D46917] text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Tạo mã giảm giá mới
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCoupons.map((cp) => (
                <div
                  key={cp.id}
                  className="bg-white rounded-3xl border-2 border-[#E8CCAD] p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-base text-[#EC802B] bg-[#FDE8D7] px-3 py-1 rounded-xl">
                      {cp.code}
                    </span>
                    <button
                      onClick={() => {
                        store.updateCoupon(cp.id, { is_active: !cp.is_active });
                        triggerRefresh();
                      }}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full cursor-pointer ${
                        cp.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {cp.is_active ? 'Khả dụng' : 'Khóa'}
                    </button>
                  </div>

                  <p className="text-xs text-neutral-700 font-semibold">{cp.description}</p>

                  <div className="text-[11px] text-neutral-500 space-y-1">
                    <p>Đơn tối thiểu: <strong>{formatVND(cp.min_order_value)}</strong></p>
                    <p>Đã sử dụng: <strong>{cp.used_count}</strong> / {cp.usage_limit} lượt</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* SERVICE MODAL */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-[#E8CCAD] p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-[#81451F] font-heading">
              {editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-1">Tên dịch vụ *</label>
                <input
                  type="text"
                  value={srvName}
                  onChange={(e) => setSrvName(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs font-bold text-[#81451F]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#81451F] mb-1">Danh mục</label>
                  <select
                    value={srvCatId}
                    onChange={(e) => setSrvCatId(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs font-bold text-[#81451F]"
                  >
                    {allCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#81451F] mb-1">Thời lượng (phút)</label>
                  <input
                    type="number"
                    value={srvDuration}
                    onChange={(e) => setSrvDuration(Number(e.target.value))}
                    className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs font-bold text-[#81451F]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-1">Giá cơ bản (VNĐ) *</label>
                <input
                  type="number"
                  step="10000"
                  value={srvPrice}
                  onChange={(e) => setSrvPrice(Number(e.target.value))}
                  className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs font-bold text-[#81451F]"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="weightBased"
                  checked={srvIsWeightBased}
                  onChange={(e) => setSrvIsWeightBased(e.target.checked)}
                  className="rounded text-[#EC802B]"
                />
                <label htmlFor="weightBased" className="text-xs font-bold text-[#81451F]">
                  Dịch vụ tính giá theo cân nặng (Spa/Grooming)
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-1">Mô tả dịch vụ</label>
                <textarea
                  rows={3}
                  value={srvDesc}
                  onChange={(e) => setSrvDesc(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs text-[#81451F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-1">URL Hình ảnh</label>
                <input
                  type="url"
                  value={srvImage}
                  onChange={(e) => setSrvImage(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs text-[#81451F]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#FAF6F0]">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#EC802B] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Lưu dịch vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl border-2 border-[#E8CCAD] p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-lg text-[#81451F] font-heading">
              Cấu hình ngày làm việc: {targetScheduleDate}
            </h3>

            <form onSubmit={handleSaveSchedule} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#81451F] mb-1">Giờ mở cửa</label>
                  <input
                    type="time"
                    value={schStartTime}
                    onChange={(e) => setSchStartTime(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#81451F] mb-1">Giờ đóng cửa</label>
                  <input
                    type="time"
                    value={schEndTime}
                    onChange={(e) => setSchEndTime(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-1">
                  Sức chứa đồng thời (số bé phục vụ cùng lúc)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={schCapacity}
                  onChange={(e) => setSchCapacity(Number(e.target.value))}
                  className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="schAvailable"
                  checked={schIsAvailable}
                  onChange={(e) => setSchIsAvailable(e.target.checked)}
                  className="rounded text-[#EC802B]"
                />
                <label htmlFor="schAvailable" className="text-xs font-bold text-[#81451F]">
                  Cơ sở hoạt động nhận lịch vào ngày này
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#FAF6F0]">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#EC802B] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Lưu cấu hình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW REPLY MODAL */}
      {replyReviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl border-2 border-[#E8CCAD] p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-[#81451F] font-heading">
              Phản hồi đánh giá của {replyReviewTarget.user_name}
            </h3>
            <p className="text-xs text-neutral-600 italic">
              "{replyReviewTarget.comment}"
            </p>

            <form onSubmit={handleReplyReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-1">
                  Nội dung phản hồi chính thức:
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Dạ cảm ơn bạn nhiều ạ, Pet Phết rất vui được chăm sóc bé..."
                  className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs text-[#81451F]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyReviewTarget(null)}
                  className="px-4 py-2 text-xs font-bold text-neutral-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#EC802B] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Gửi phản hồi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COUPON MODAL */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl border-2 border-[#E8CCAD] p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-[#81451F] font-heading">
              Tạo mã giảm giá mới
            </h3>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-1">Mã coupon *</label>
                <input
                  type="text"
                  value={cpCode}
                  onChange={(e) => setCpCode(e.target.value.toUpperCase())}
                  placeholder="PETVIP30"
                  className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#81451F] mb-1">Loại giảm</label>
                  <select
                    value={cpType}
                    onChange={(e) => setCpType(e.target.value as any)}
                    className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                    <option value="percent">Phần trăm (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#81451F] mb-1">Giá trị giảm</label>
                  <input
                    type="number"
                    value={cpValue}
                    onChange={(e) => setCpValue(Number(e.target.value))}
                    className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-1">Chi tiêu tối thiểu (VNĐ)</label>
                <input
                  type="number"
                  value={cpMinSpend}
                  onChange={(e) => setCpMinSpend(Number(e.target.value))}
                  className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-1">Mô tả hiển thị</label>
                <input
                  type="text"
                  value={cpDesc}
                  onChange={(e) => setCpDesc(e.target.value)}
                  placeholder="Giảm 50.000đ cho đơn từ 200k"
                  className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs text-[#81451F]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#EC802B] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Tạo mã
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Role guard runs before the admin portal reads any privileged data.
export const AdminPortal: React.FC<AdminPortalProps> = (props) => {
  if (props.currentUser.role !== 'admin') {
    return (
      <main className="pet-admin-access-denied">
        <h1>Không có quyền truy cập</h1>
        <p>Tài khoản hiện tại không có quyền quản trị viên.</p>
        <button onClick={props.onLogout}>Quay về trang chủ</button>
      </main>
    );
  }
  return <AdminPortalContent {...props} />;
};
