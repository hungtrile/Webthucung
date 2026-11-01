import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Copy,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Booking, PaymentTransaction } from '../../types';
import { store } from '../../services/store';
import { notifyToast } from '../../utils/toast';
import { formatVND } from '../../utils/bookingEngine';

interface PaymentViewProps {
  booking: Booking;
  payment?: PaymentTransaction;
  onViewBookingHistory: () => void;
}

export const PaymentView: React.FC<PaymentViewProps> = ({
  booking,
  payment,
  onViewBookingHistory
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(booking.payment_status === 'pending_reconcile');
  const [timeLeft, setTimeLeft] = useState<number>(() => booking.hold_expires_at ? Math.max(0, Math.ceil((new Date(booking.hold_expires_at).getTime() - Date.now()) / 1000)) : 0);

  useEffect(() => {
    if (booking.payment_method !== 'QR' || booking.payment_status === 'paid' || !booking.hold_expires_at) return;
    const refreshRemaining = () => {
      const remaining = Math.max(0, Math.ceil((new Date(booking.hold_expires_at!).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) store.processExpiredQrBookings();
    };
    refreshRemaining();
    const timer = window.setInterval(refreshRemaining, 1000);
    return () => window.clearInterval(timer);
  }, [booking.id, booking.hold_expires_at, booking.payment_method, booking.payment_status]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Trình duyệt không hỗ trợ sao chép tự động.');
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 2000);
      notifyToast('success', 'Đã sao chép thông tin vào bộ nhớ tạm.');
    } catch (error) {
      notifyToast('error', error instanceof Error ? error.message : 'Không thể sao chép thông tin.');
    }
  };

  const handleConfirmTransferred = () => {
    const result = store.submitQrTransfer(booking.id);
    if (result.success) {
      setIsSubmitted(true);
      notifyToast('success', result.message || 'Đã gửi xác nhận chuyển khoản. Pet Phết sẽ đối chiếu giao dịch.');
    } else {
      notifyToast('error', result.message || 'Không thể gửi xác nhận chuyển khoản.');
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    `2|99|0909123456888|PET PHET VIETNAM||0|0|${booking.total_amount}|PETPHET ${booking.id}|transfer_myqr`
  )}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl border-2 border-[#E8CCAD] shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-[#EC802B] to-[#EDC55B] text-white text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mb-2">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black font-heading">
            Ghi nhận lịch hẹn #{booking.id}
          </h2>
          <p className="text-xs text-orange-100 mt-1 font-vietnamese">
            Dịch vụ: <strong>{booking.service_name}</strong> cho bé <strong>{booking.pet_name}</strong>
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* METHOD: COD */}
          {booking.payment_method === 'COD' && (
            <div className="space-y-4 text-center">
              <div className="p-5 rounded-2xl bg-[#FCF5DC] border border-[#EDC55B] space-y-2">
                <span className="text-xs font-black uppercase text-[#81451F] tracking-wider block">
                  Phương thức: Thanh toán trực tiếp tại quầy (COD)
                </span>
                <p className="text-sm text-neutral-700">
                  Số tiền cần thanh toán khi sử dụng dịch vụ:
                </p>
                <p className="text-3xl font-black text-[#EC802B]">
                  {formatVND(booking.total_amount)}
                </p>
                <p className="text-xs text-neutral-500 font-vietnamese">
                  Trạng thái hiện tại: <strong className="text-[#81451F]">{booking.payment_status === 'paid' ? 'Đã thanh toán' : booking.status === 'cancelled' ? 'Đã hủy' : 'Chờ xác nhận & Chưa thanh toán'}</strong>. {booking.payment_status === 'paid' ? 'Pet Phết đã ghi nhận khoản thu.' : 'Chuyên viên sẽ gọi điện hoặc kiểm tra xác nhận lịch hẹn trước giờ phục vụ.'}
                </p>
              </div>

              <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#E8CCAD] text-xs text-neutral-600 space-y-1 text-left">
                <p>📍 <strong>Địa chỉ tiệm:</strong> 123 Đường Thú Cưng Yêu Thương, Q.1, TP.HCM</p>
                <p>⏰ <strong>Thời gian hẹn:</strong> {booking.booking_time} ngày {booking.booking_date}</p>
                <p>🐾 <strong>Bé cưng:</strong> {booking.pet_name} ({booking.pet_weight}kg)</p>
              </div>

              <button
                onClick={onViewBookingHistory}
                className="w-full py-3 bg-[#EC802B] hover:bg-[#D46917] text-white font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Xem lịch hẹn của tôi <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* METHOD: QR TRANSFER */}
          {booking.payment_method === 'QR' && (
            <div className="space-y-6">
              {/* Countdown Timer Badge */}
              <div className="flex items-center justify-between p-3.5 bg-[#FAF6F0] rounded-2xl border border-[#E8CCAD]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#81451F]">
                  <Clock className="w-4 h-4 text-[#EC802B]" />
                  <span>Thời gian giữ chỗ tự động:</span>
                </div>
                <span className="font-mono text-base font-black text-[#EC802B] bg-white px-3 py-1 rounded-xl border border-[#EDC55B]">
                  {formatTimer(timeLeft)}
                </span>
              </div>

              {/* QR Image and Bank Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-[#E8CCAD] shadow-xs">
                  <img
                    src={qrImageUrl}
                    alt="Mã QR Chuyển khoản VietQR"
                    className="w-48 h-48 rounded-xl"
                  />
                  <span className="text-[11px] text-neutral-500 font-semibold mt-2 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-[#66BCB4]" /> Quét nhanh bằng app Ngân hàng
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-neutral-400 text-[10px] uppercase font-bold block">Ngân hàng</span>
                    <strong className="text-sm text-[#81451F]">MB Bank (Ngân hàng Quân Đội)</strong>
                  </div>

                  <div>
                    <span className="text-neutral-400 text-[10px] uppercase font-bold block">Chủ tài khoản</span>
                    <strong className="text-sm text-[#81451F]">PET PHET VIETNAM</strong>
                  </div>

                  <div>
                    <span className="text-neutral-400 text-[10px] uppercase font-bold block">Số tài khoản</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <strong className="text-base text-[#EC802B] font-mono">0909123456888</strong>
                      <button
                        onClick={() => handleCopy('0909123456888', 'stk')}
                        className="p-1 text-xs text-neutral-500 hover:text-[#EC802B] cursor-pointer"
                        title="Sao chép số tài khoản"
                      >
                        {copiedField === 'stk' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-neutral-400 text-[10px] uppercase font-bold block">Số tiền cần chuyển</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <strong className="text-lg text-[#EC802B] font-black">{formatVND(booking.total_amount)}</strong>
                      <button
                        onClick={() => handleCopy(booking.total_amount.toString(), 'amount')}
                        className="p-1 text-xs text-neutral-500 hover:text-[#EC802B] cursor-pointer"
                        title="Sao chép số tiền"
                      >
                        {copiedField === 'amount' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-neutral-400 text-[10px] uppercase font-bold block">Nội dung chuyển khoản (bắt buộc)</span>
                    <div className="flex items-center gap-2 mt-0.5 bg-[#FAF6F0] p-2 rounded-xl border border-[#E8CCAD]">
                      <strong className="text-xs text-[#81451F] font-mono">PETPHET {booking.id}</strong>
                      <button
                        onClick={() => handleCopy(`PETPHET ${booking.id}`, 'content')}
                        className="p-1 text-xs text-neutral-500 hover:text-[#EC802B] ml-auto cursor-pointer"
                        title="Sao chép nội dung"
                      >
                        {copiedField === 'content' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Notice */}
              <div className="p-3.5 bg-[#FCF5DC] rounded-2xl border border-[#EDC55B] text-xs text-neutral-700 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#EC802B] shrink-0 mt-0.5" />
                <p className="font-vietnamese leading-relaxed">
                  <strong>Lưu ý nghiệp vụ:</strong> Sau khi bạn chuyển khoản, quản trị viên Pet Phết sẽ đối chiếu giao dịch với sao kê ngân hàng và cập nhật sang <strong>Đã thanh toán</strong>. Hệ thống không tự động coi là thanh toán thành công nếu chưa có đối chiếu.
                </p>
              </div>

              {booking.payment_status === 'paid' ? (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Giao dịch đã được Pet Phết xác nhận thanh toán thành công.</span>
                  <button onClick={onViewBookingHistory} className="shrink-0 px-4 py-2 bg-white border border-emerald-200 rounded-xl font-bold">Xem lịch hẹn</button>
                </div>
              ) : booking.status === 'cancelled' || timeLeft === 0 ? (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-red-800 text-xs flex items-center justify-between gap-3">
                  <span>{booking.status === 'cancelled' ? 'Đơn đặt lịch đã bị hủy và không còn hiệu lực.' : 'Thời gian giữ chỗ đã kết thúc. Đơn không còn hiệu lực; vui lòng tạo lịch hẹn mới.'}</span>
                  <button onClick={onViewBookingHistory} className="shrink-0 px-4 py-2 bg-white border border-red-200 rounded-xl font-bold">Xem lịch hẹn</button>
                </div>
              ) : isSubmitted ? (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Đã ghi nhận yêu cầu đối chiếu chuyển khoản! Đang chờ Admin xác nhận.</span>
                  </div>
                  <button
                    onClick={onViewBookingHistory}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 cursor-pointer text-xs"
                  >
                    Xem lịch hẹn
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleConfirmTransferred}
                    className="flex-1 py-3 bg-[#66BCB4] hover:bg-[#4DA39B] text-white font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Tôi đã chuyển khoản thành công
                  </button>
                  <button
                    onClick={onViewBookingHistory}
                    className="px-6 py-3 border border-[#81451F] text-[#81451F] hover:bg-[#FAF6F0] font-bold text-xs rounded-2xl transition-all cursor-pointer"
                  >
                    Về danh sách lịch hẹn
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
