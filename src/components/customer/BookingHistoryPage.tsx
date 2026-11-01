import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  PawPrint,
  Scissors,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Star,
  Award,
  RefreshCw,
  Search,
  Eye,
  Filter,
  CreditCard,
  Banknote,
  Sparkles,
  X,
  MessageSquare
} from 'lucide-react';
import { store } from '../../services/store';
import { notifyToast } from '../../utils/toast';
import { Booking, BookingStatus, UserProfile } from '../../types';
import { formatVND } from '../../utils/bookingEngine';
import { MyReviewsPanel } from './MyReviewsPanel';

interface BookingHistoryPageProps {
  currentUser: UserProfile;
  onNavigateToBooking: () => void;
  onOpenPaymentForBooking: (booking: Booking) => void;
}

export const BookingHistoryPage: React.FC<BookingHistoryPageProps> = ({
  currentUser,
  onNavigateToBooking,
  onOpenPaymentForBooking
}) => {
  const userBookings = store.getBookingsByUser(currentUser.id);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<Booking | null>(null);

  // Reschedule state
  const [rescheduleBookingTarget, setRescheduleBookingTarget] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [newTime, setNewTime] = useState<string>('10:00');

  // Cancel state
  const [cancelBookingTarget, setCancelBookingTarget] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Bận việc đột xuất');

  // Review state
  const [reviewBookingTarget, setReviewBookingTarget] = useState<Booking | null>(null);
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewImage, setReviewImage] = useState<string>('');

  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filtered
  const filteredBookings = userBookings.filter((b) => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesQuery =
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.pet_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  // Handle Reschedule
  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleBookingTarget) return;

    const res = store.rescheduleBooking(rescheduleBookingTarget.id, currentUser.id, newDate, newTime);
    setActionMessage({ type: res.success ? 'success' : 'error', text: res.message });
    notifyToast(res.success ? 'success' : 'error', res.message);
    if (res.success) {
      setRescheduleBookingTarget(null);
    }
  };

  // Handle Cancel
  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelBookingTarget) return;

    const res = store.cancelBooking(cancelBookingTarget.id, currentUser.id, cancelReason);
    setActionMessage({ type: res.success ? 'success' : 'error', text: res.message });
    notifyToast(res.success ? 'success' : 'error', res.message);
    if (res.success) {
      setCancelBookingTarget(null);
    }
  };

  // Handle Review Submission (+1000 Pet Points)
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBookingTarget) return;
    if (!reviewComment.trim()) {
      setActionMessage({ type: 'error', text: 'Vui lòng nhập lời nhận xét của bạn.' });
      notifyToast('error', 'Vui lòng nhập lời nhận xét của bạn.');
      return;
    }

    const res = store.createReview({
      bookingId: reviewBookingTarget.id,
      userId: currentUser.id,
      rating: ratingStars,
      comment: reviewComment,
      imageUrl: reviewImage
    });

    setActionMessage({ type: res.success ? 'success' : 'error', text: res.message });
    notifyToast(res.success ? 'success' : 'error', res.message);
    if (res.success) {
      setReviewBookingTarget(null);
      setReviewComment('');
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Chờ xác nhận</span>;
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Đã xác nhận</span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Đang phục vụ</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Hoàn thành</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">Đã hủy</span>;
      case 'no_show':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-200 text-neutral-700">Khách vắng</span>;
    }
  };

  const getPaymentStatusBadge = (status: string, method: string) => {
    if (status === 'paid') {
      return <span className="text-emerald-700 font-bold text-xs flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Đã thanh toán ({method})</span>;
    }
    if (status === 'pending_reconcile') {
      return <span className="text-blue-700 font-bold text-xs flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Chờ đối chiếu ({method})</span>;
    }
    return <span className="text-amber-700 font-bold text-xs flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Chưa thanh toán ({method})</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#EC802B]">
            Theo dõi dịch vụ
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#81451F] font-heading mt-1">
            Lịch Hẹn Của Bạn
          </h1>
          <p className="text-sm text-neutral-600 mt-1 font-vietnamese">
            Quản lý, đổi giờ hoặc đánh giá dịch vụ sau khi hoàn thành để nhận ngay 1.000 Pet Point thưởng.
          </p>
        </div>

        <button
          onClick={onNavigateToBooking}
          className="px-5 py-3 rounded-2xl bg-[#EC802B] hover:bg-[#D46917] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" /> Đặt lịch mới
        </button>
      </div>

      {actionMessage && (
        <div
          className={`mb-6 p-4 rounded-2xl text-xs flex items-center gap-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border-2 border-[#E8CCAD] shadow-xs mb-8 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã (BK-...), tên dịch vụ, bé cưng..."
              className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-2xl pl-10 pr-3 py-2 text-xs text-[#81451F] focus:outline-none focus:ring-2 focus:ring-[#EC802B]"
            />
          </div>

          <div className="md:col-span-7 flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'pending', label: 'Chờ xác nhận' },
              { id: 'confirmed', label: 'Đã xác nhận' },
              { id: 'completed', label: 'Hoàn thành' },
              { id: 'cancelled', label: 'Đã hủy' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-[#EC802B] text-white'
                    : 'bg-[#FAF6F0] text-[#81451F] hover:bg-[#FDE8D7]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Table / List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-[#E8CCAD] p-8">
          <Calendar className="w-14 h-14 text-[#EDC55B] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#81451F] font-heading">
            Không tìm thấy lịch hẹn nào
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Bạn chưa có lịch hẹn nào phù hợp với bộ lọc hiện tại.
          </p>
          <button
            onClick={onNavigateToBooking}
            className="mt-4 px-6 py-2.5 bg-[#EC802B] text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Đặt lịch chăm sóc ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl border-2 border-[#E8CCAD] p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              {/* Left Info */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-black text-sm text-[#81451F] bg-[#FAF6F0] px-2.5 py-1 rounded-xl border border-[#E8CCAD]">
                    #{b.id}
                  </span>
                  {getStatusBadge(b.status)}
                  {getPaymentStatusBadge(b.payment_status, b.payment_method)}
                </div>

                <div>
                  <h3 className="font-black text-lg text-[#81451F] font-heading">
                    {b.service_name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 mt-1">
                    <span className="flex items-center gap-1 font-semibold text-[#81451F]">
                      <PawPrint className="w-3.5 h-3.5 text-[#EC802B]" /> Bé {b.pet_name} ({b.pet_weight}kg)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-[#81451F]">
                      <Calendar className="w-3.5 h-3.5 text-[#66BCB4]" /> {b.booking_time} - {b.end_time} ({b.booking_date})
                    </span>
                    <span>•</span>
                    <span className="font-black text-[#EC802B] text-sm">
                      {formatVND(b.total_amount)}
                    </span>
                  </div>
                </div>

                {b.customer_note && (
                  <p className="text-xs text-neutral-500 italic bg-[#FAF6F0] px-3 py-1.5 rounded-xl border border-[#E8CCAD]/50">
                    Ghi chú: "{b.customer_note}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-[#FAF6F0]">
                {/* View QR payment screen if unpaid QR */}
                {b.payment_method === 'QR' && ['unpaid', 'failed'].includes(b.payment_status) && b.status !== 'cancelled' && (
                  <button
                    onClick={() => onOpenPaymentForBooking(b)}
                    className="px-3.5 py-2 rounded-xl bg-[#66BCB4] hover:bg-[#4DA39B] text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> {b.payment_status === 'failed' ? 'Thanh toán lại' : 'Quét mã QR'}
                  </button>
                )}

                {/* Reschedule button (allowed for pending and confirmed) */}
                {['pending', 'confirmed'].includes(b.status) && (
                  <button
                    onClick={() => {
                      setRescheduleBookingTarget(b);
                      setNewDate(b.booking_date);
                      setNewTime(b.booking_time);
                      setActionMessage(null);
                    }}
                    className="px-3 py-2 rounded-xl border border-[#81451F] text-[#81451F] hover:bg-[#FAF6F0] text-xs font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Đổi lịch
                  </button>
                )}

                {/* Cancel button (allowed unless already cancelled or completed) */}
                {['pending', 'confirmed'].includes(b.status) && (
                  <button
                    onClick={() => {
                      setCancelBookingTarget(b);
                      setActionMessage(null);
                    }}
                    className="px-3 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold cursor-pointer flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Hủy lịch
                  </button>
                )}

                {/* Review button (+1000 Pet Points) if completed and not reviewed yet */}
                {b.status === 'completed' && !b.is_reviewed && (
                  <button
                    onClick={() => {
                      setReviewBookingTarget(b);
                      setRatingStars(5);
                      setReviewComment('');
                      setActionMessage(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#EDC55B] hover:bg-[#D6AB3D] text-[#81451F] font-black text-xs shadow-xs cursor-pointer flex items-center gap-1.5 animate-pulse"
                  >
                    <Award className="w-4 h-4 text-[#EC802B]" /> Đánh giá (+1.000 Pts)
                  </button>
                )}

                {b.is_reviewed && (
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã đánh giá
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <MyReviewsPanel currentUser={currentUser} />

      {/* RESCHEDULE MODAL */}
      {rescheduleBookingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl border-2 border-[#E8CCAD] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-3">
              <h3 className="font-bold text-base text-[#81451F] font-heading">
                Đổi ngày giờ lịch hẹn #{rescheduleBookingTarget.id}
              </h3>
              <button
                onClick={() => setRescheduleBookingTarget(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 font-vietnamese">
              Dịch vụ: <strong>{rescheduleBookingTarget.service_name}</strong> cho bé <strong>{rescheduleBookingTarget.pet_name}</strong>. Hệ thống sẽ kiểm tra sức chứa tự động tại khung giờ mới.
            </p>

            <form onSubmit={handleRescheduleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-1">Ngày hẹn mới</label>
                <input
                  type="date"
                  min={(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })()}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs font-bold text-[#81451F] focus:outline-none focus:ring-2 focus:ring-[#EC802B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-1">Giờ hẹn mới</label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs font-bold text-[#81451F] focus:outline-none focus:ring-2 focus:ring-[#EC802B]"
                >
                  {['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRescheduleBookingTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#EC802B] hover:bg-[#D46917] text-white font-bold text-xs cursor-pointer shadow-sm"
                >
                  Xác nhận đổi lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancelBookingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl border-2 border-red-200 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-red-100 pb-3">
              <h3 className="font-bold text-base text-red-700 font-heading">
                Xác nhận hủy lịch #{cancelBookingTarget.id}
              </h3>
              <button
                onClick={() => setCancelBookingTarget(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 font-vietnamese">
              Khi hủy lịch, chỗ sẽ được giải phóng ngay lập tức cho các khách hàng khác.
            </p>

            <form onSubmit={handleCancelSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-1">
                  Lý do hủy lịch hẹn:
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Bận việc, đổi kế hoạch, bé không khỏe..."
                  className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs text-[#81451F] focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancelBookingTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-100 cursor-pointer"
                >
                  Không hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-sm"
                >
                  Xác nhận hủy lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW & REWARD MODAL (+1.000 Pet Points) */}
      {reviewBookingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-[#EDC55B] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#EC802B]">
                  Đánh giá dịch vụ & Nhận quà
                </span>
                <h3 className="font-bold text-lg text-[#81451F] font-heading">
                  Đánh giá lịch hẹn #{reviewBookingTarget.id}
                </h3>
              </div>
              <button
                onClick={() => setReviewBookingTarget(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Loyalty point banner */}
            <div className="p-3 bg-[#FCF5DC] rounded-2xl border border-[#EDC55B] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EDC55B] flex items-center justify-center shrink-0">
                <Award className="w-6 h-6 text-[#EC802B]" />
              </div>
              <div className="text-xs">
                <strong className="text-[#81451F] block font-bold">+1.000 Pet Point thưởng ngay lập tức</strong>
                <span className="text-neutral-600">Gửi đánh giá để tích lũy điểm thưởng trong ví Pet Phết của bạn!</span>
              </div>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Star Rating */}
              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-1.5">
                  Mức độ hài lòng của bạn:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingStars(star)}
                      className="p-1 text-2xl text-[#EDC55B] hover:scale-125 transition-transform cursor-pointer"
                    >
                      {star <= ratingStars ? '★' : '☆'}
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#81451F] ml-2">
                    {ratingStars === 5 && 'Tuyệt vời, bé rất thích! 😍'}
                    {ratingStars === 4 && 'Rất hài lòng! 😊'}
                    {ratingStars === 3 && 'Tạm ổn! 🙂'}
                    {ratingStars < 3 && 'Cần cải thiện thêm! 😕'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-1">
                  Nhận xét chi tiết (quy trình chăm sóc, thái độ nhân viên, hương thơm thảo mộc...):
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Bé rất ngoan, lông mềm mượt thơm ngát, nhân viên nhẹ nhàng..."
                  className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs text-[#81451F] focus:outline-none focus:ring-2 focus:ring-[#EC802B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-1">
                  Hình ảnh bé sau khi spa (tùy chọn URL):
                </label>
                <input
                  type="url"
                  value={reviewImage}
                  onChange={(e) => setReviewImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs text-[#81451F] focus:outline-none focus:ring-2 focus:ring-[#EC802B]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewBookingTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#EC802B] hover:bg-[#D46917] text-white font-bold text-xs cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4 text-[#EDC55B]" /> Gửi đánh giá & Nhận 1.000 Pet Point
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
