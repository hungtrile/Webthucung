import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  PawPrint,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Tag,
  CreditCard,
  Banknote,
  ArrowRight,
  ArrowLeft,
  Scale,
  Sparkles,
  Info,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { store } from '../../services/store';
import { notifyToast } from '../../utils/toast';
import {
  Booking,
  PaymentMethod,
  PaymentTransaction,
  Pet,
  Service,
  UserProfile
} from '../../types';
import {
  applyCouponDiscount,
  calculateEndTime,
  calculateServicePrice,
  checkContinuousCapacity,
  formatVND
} from '../../utils/bookingEngine';
import { ASSETS } from '../../constants/assets';

interface BookingWizardProps {
  currentUser: UserProfile;
  preselectedServiceId?: string;
  preselectedPetId?: string;
  onBookingCompleted: (booking: Booking, payment?: PaymentTransaction) => void;
  onNavigateToPetManagement: () => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  currentUser,
  preselectedServiceId,
  preselectedPetId,
  onBookingCompleted,
  onNavigateToPetManagement
}) => {
  const services = store.getServices(true);
  const userPets = store.getPetsByUser(currentUser.id);
  const schedules = store.getSchedules();

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selections
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preselectedServiceId || services[0]?.id || ''
  );
  const [selectedPetId, setSelectedPetId] = useState<string>(
    preselectedPetId || userPets[0]?.id || ''
  );
  const [confirmedWeight, setConfirmedWeight] = useState<number>(4.0);
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [bookingTime, setBookingTime] = useState<string>('09:00');
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponMessage, setCouponMessage] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [customerNote, setCustomerNote] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string>('');
  const reportError = (message: string) => { setErrorMessage(message); notifyToast('error', message); };
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Current selected objects
  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedPet = userPets.find((p) => p.id === selectedPetId);

  // Ensure stale unpaid QR reservations are released before showing availability.
  useEffect(() => {
    store.processExpiredQrBookings();
  }, []);

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Sync pet weight when pet selection changes
  useEffect(() => {
    if (selectedPet) {
      setConfirmedWeight(selectedPet.weight || 4.0);
    }
  }, [selectedPetId]);

  // If preselectedServiceId changes from outside
  useEffect(() => {
    if (preselectedServiceId) {
      setSelectedServiceId(preselectedServiceId);
    }
  }, [preselectedServiceId]);

  // Compute prices
  const basePrice = selectedService
    ? calculateServicePrice(selectedService, confirmedWeight)
    : 0;
  const couponCalculation = applyCouponDiscount(basePrice, appliedCoupon);

  // Available Time Slots for selected date
  const selectedSchedule = store.getScheduleForDate(bookingDate);
  const allBookings = store.getBookings();

  // Generate only start times that fit the whole service duration inside working hours.
  const slotOptions: { time: string; isAvailable: boolean; reason?: string }[] = [];
  if (selectedService && selectedSchedule.is_available) {
    const [openH, openM] = selectedSchedule.start_time.split(':').map(Number);
    const [closeH, closeM] = selectedSchedule.end_time.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    const stepMinutes = Math.max(15, selectedSchedule.slot_duration_minutes || 30);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let startMinutes = openMinutes; startMinutes + selectedService.duration_minutes <= closeMinutes; startMinutes += stepMinutes) {
      const timeStr = `${Math.floor(startMinutes / 60).toString().padStart(2, '0')}:${(startMinutes % 60).toString().padStart(2, '0')}`;
      const isPastToday = bookingDate === todayKey && startMinutes <= currentMinutes;
      const check = checkContinuousCapacity(
        bookingDate,
        timeStr,
        selectedService.duration_minutes,
        allBookings,
        selectedSchedule.max_concurrent_capacity
      );
      slotOptions.push({
        time: timeStr,
        isAvailable: !isPastToday && check.isAvailable,
        reason: isPastToday ? 'Khung giờ này đã qua.' : check.reason
      });
    }
  }

  // Handle coupon application
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const coupon = store.getCoupons().find(
      (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase()
    );

    if (!coupon) {
      setCouponMessage('Mã giảm giá không tồn tại.');
      setAppliedCoupon(null);
      notifyToast('error', 'Mã giảm giá không tồn tại.');
      return;
    }

    const check = applyCouponDiscount(basePrice, coupon);
    if (!check.isValid) {
      setCouponMessage(check.message);
      setAppliedCoupon(null);
      notifyToast('error', check.message);
    } else {
      setAppliedCoupon(coupon);
      setCouponMessage(check.message);
      notifyToast('success', check.message || `Đã áp dụng mã ${coupon.code}.`);
    }
  };

  // STEP VALIDATION
  const handleNextStep = () => {
    setErrorMessage('');

    if (currentStep === 1) {
      if (!selectedService) {
        reportError('Vui lòng chọn dịch vụ chăm sóc.');
        return;
      }
      notifyToast('success', `Đã chọn dịch vụ ${selectedService.service_name}.`);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (userPets.length === 0) {
        reportError('Bạn chưa có hồ sơ thú cưng nào. Vui lòng thêm hồ sơ trước khi đặt lịch.');
        return;
      }
      if (!selectedPet) {
        reportError('Vui lòng chọn thú cưng.');
        return;
      }
      // Species compatibility
      if (selectedService && !selectedService.species_supported.includes(selectedPet.species)) {
        reportError(
          `Dịch vụ ${selectedService.service_name} chỉ áp dụng cho ${selectedService.species_supported.join(', ')}. Bé ${selectedPet.pet_name} là ${selectedPet.species} không phù hợp.`
        );
        return;
      }
      if (confirmedWeight <= 0) {
        reportError('Vui lòng xác nhận cân nặng thực tế lớn hơn 0 kg.');
        return;
      }
      notifyToast('success', `Đã chọn hồ sơ bé ${selectedPet.pet_name} và xác nhận cân nặng.`);
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!selectedSchedule.is_available) {
        reportError(`Cơ sở đóng cửa ngày ${bookingDate}. Vui lòng chọn ngày khác.`);
        return;
      }
      if (selectedService) {
        const selectedSlot = slotOptions.find((slot) => slot.time === bookingTime);
        if (!selectedSlot || !selectedSlot.isAvailable) {
          reportError(selectedSlot?.reason || 'Khung giờ này không còn khả dụng. Vui lòng chọn khung giờ khác.');
          return;
        }
      }
      notifyToast('success', `Khung giờ ${bookingTime} ngày ${bookingDate} còn chỗ cho dịch vụ đã chọn.`);
      setCurrentStep(4);
    }
  };

  // FINAL SUBMISSION (Step 4 -> Step 5)
  const handleConfirmBooking = () => {
    setIsSubmitting(true);
    setErrorMessage('');

    setTimeout(() => {
      const res = store.createBooking({
        userId: currentUser.id,
        petId: selectedPetId,
        serviceId: selectedServiceId,
        bookingDate,
        bookingTime,
        confirmedWeight,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        paymentMethod,
        customerNote
      });

      setIsSubmitting(false);

      if (!res.success || !res.booking) {
        reportError(res.message);
        return;
      }

      notifyToast('success', `Đặt lịch thành công. Mã lịch hẹn ${res.booking.id} đã được tạo.`);
      onBookingCompleted(res.booking, res.payment);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Wizard Progress Bar */}
      <div className="mb-8">
        <span className="text-xs font-black uppercase tracking-widest text-[#EC802B]">
          Đặt lịch dễ dàng
        </span>
        <h1 className="text-3xl font-black text-[#81451F] font-heading mt-1">
          Quy Trình Đặt Lịch Chăm Sóc Bé Cưng
        </h1>

        {/* Step indicator pills */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          {[
            { num: 1, label: 'Chọn dịch vụ' },
            { num: 2, label: 'Bé cưng & Cân nặng' },
            { num: 3, label: 'Ngày & Khung giờ' },
            { num: 4, label: 'Xác nhận & Thanh toán' }
          ].map((s) => (
            <div
              key={s.num}
              className={`p-3 rounded-2xl border text-center transition-all ${
                currentStep === s.num
                  ? 'bg-[#EC802B] text-white border-[#EC802B] shadow-sm'
                  : currentStep > s.num
                  ? 'bg-[#FAF6F0] text-[#66BCB4] border-[#66BCB4] font-bold'
                  : 'bg-white text-neutral-400 border-[#E8CCAD]'
              }`}
            >
              <div className="text-xs font-black">BƯỚC {s.num}</div>
              <div className="text-[11px] font-semibold truncate hidden sm:block">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: CHỌN DỊCH VỤ */}
      {currentStep === 1 && (
        <div className="bg-white p-6 rounded-3xl border-2 border-[#E8CCAD] shadow-xs space-y-6">
          <div className="border-b border-[#FAF6F0] pb-3">
            <h3 className="text-xl font-black text-[#81451F] font-heading">
              Bước 1: Lựa chọn dịch vụ
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Chọn dịch vụ spa hoặc thăm khám thú y phù hợp cho bé cưng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((srv) => (
              <div
                key={srv.id}
                onClick={() => setSelectedServiceId(srv.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex gap-4 ${
                  selectedServiceId === srv.id
                    ? 'border-[#EC802B] bg-[#FDE8D7]/30 ring-2 ring-[#EC802B]'
                    : 'border-[#E8CCAD] hover:border-[#EDC55B] bg-[#FAF6F0]/40'
                }`}
              >
                <img
                  src={srv.image_url}
                  alt={srv.service_name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-sm text-[#81451F] truncate">
                      {srv.service_name}
                    </h4>
                    {selectedServiceId === srv.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#EC802B] shrink-0" />
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-600 line-clamp-2 mt-1">
                    {srv.description}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-neutral-500 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-[#66BCB4]" /> {srv.duration_minutes} phút
                    </span>
                    <span className="font-black text-[#EC802B]">
                      {srv.is_weight_based ? 'Từ ' : ''}{formatVND(srv.base_price)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-[#FAF6F0]">
            <button
              onClick={handleNextStep}
              className="px-6 py-3 rounded-2xl bg-[#EC802B] hover:bg-[#D46917] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              Tiếp tục: Chọn bé cưng <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CHỌN THÚ CƯNG & XÁC NHẬN CÂN NẶNG */}
      {currentStep === 2 && (
        <div className="bg-white p-6 rounded-3xl border-2 border-[#E8CCAD] shadow-xs space-y-6">
          <div className="border-b border-[#FAF6F0] pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-[#81451F] font-heading">
                Bước 2: Chọn thú cưng & Xác nhận cân nặng
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Kiểm tra loài và cập nhật cân nặng để áp dụng giá chính xác.
              </p>
            </div>
            <button
              onClick={onNavigateToPetManagement}
              className="text-xs font-bold text-[#EC802B] hover:underline cursor-pointer"
            >
              + Thêm hồ sơ thú cưng mới
            </button>
          </div>

          {userPets.length === 0 ? (
            <div className="p-8 text-center bg-[#FAF6F0] rounded-2xl border border-dashed border-[#E8CCAD]">
              <PawPrint className="w-12 h-12 text-[#EDC55B] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#81451F]">Bạn chưa có hồ sơ thú cưng nào</p>
              <button
                onClick={onNavigateToPetManagement}
                className="mt-3 px-4 py-2 bg-[#EC802B] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Tạo hồ sơ thú cưng ngay
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-[#81451F]">
                Chọn bé cưng của bạn:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userPets.map((pet) => {
                  const isCompatible = selectedService?.species_supported.includes(pet.species);
                  return (
                    <div
                      key={pet.id}
                      onClick={() => setSelectedPetId(pet.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                        selectedPetId === pet.id
                          ? 'border-[#EC802B] bg-[#FDE8D7]/30 ring-2 ring-[#EC802B]'
                          : !isCompatible
                          ? 'border-neutral-200 bg-neutral-50 opacity-60'
                          : 'border-[#E8CCAD] bg-[#FAF6F0]/40'
                      }`}
                    >
                      <img
                        src={pet.avatar_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80'}
                        alt={pet.pet_name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#EDC55B]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-[#81451F] truncate">
                            {pet.pet_name}
                          </h4>
                          {selectedPetId === pet.id && (
                            <CheckCircle2 className="w-4 h-4 text-[#EC802B] shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-neutral-500">
                          {pet.species} • {pet.breed || 'Chưa rõ giống'}
                        </p>
                        <span className="text-[11px] text-[#EC802B] font-bold">
                          Cân nặng: {pet.weight} kg
                        </span>
                        {!isCompatible && (
                          <span className="block text-[10px] text-red-500 font-semibold mt-0.5">
                            ⚠️ Dịch vụ không nhận {pet.species}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Weight Confirmation Section */}
              {selectedPet && (
                <div className="p-4 rounded-2xl bg-[#FCF5DC] border border-[#EDC55B] space-y-3">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#EC802B]" />
                    <h4 className="text-xs font-bold text-[#81451F] uppercase tracking-wide">
                      Xác nhận cân nặng hiện tại của bé {selectedPet.pet_name}
                    </h4>
                  </div>
                  <p className="text-xs text-neutral-600 font-vietnamese">
                    Đối với dịch vụ Spa, mức giá sẽ được tính theo cân nặng thực tế tại thời điểm phục vụ.
                  </p>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="100"
                      value={confirmedWeight}
                      onChange={(e) => setConfirmedWeight(Number(e.target.value))}
                      className="w-32 bg-white border border-[#E8CCAD] rounded-xl px-3 py-2 text-sm font-bold text-[#81451F] focus:ring-2 focus:ring-[#EC802B] focus:outline-none"
                    />
                    <span className="text-sm font-bold text-[#81451F]">kg</span>

                    {selectedService?.is_weight_based && (
                      <div className="ml-auto text-right">
                        <span className="text-[11px] text-neutral-500 block">Giá ước tính cho bé:</span>
                        <span className="text-base font-black text-[#EC802B]">
                          {formatVND(calculateServicePrice(selectedService, confirmedWeight))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-[#FAF6F0]">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-xl border border-[#81451F] text-[#81451F] font-bold text-xs hover:bg-[#FAF6F0] cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
            <button
              onClick={handleNextStep}
              className="px-6 py-2.5 rounded-xl bg-[#EC802B] hover:bg-[#D46917] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              Tiếp tục: Chọn ngày giờ <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CHỌN NGÀY VÀ GIỜ (Continuous Capacity Checking) */}
      {currentStep === 3 && (
        <div className="bg-white p-6 rounded-3xl border-2 border-[#E8CCAD] shadow-xs space-y-6">
          <div className="border-b border-[#FAF6F0] pb-3">
            <h3 className="text-xl font-black text-[#81451F] font-heading">
              Bước 3: Chọn ngày và khung giờ phục vụ
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Hệ thống tự động kiểm tra năng lực phục vụ liên tục trong suốt {selectedService?.duration_minutes} phút của dịch vụ.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-[#81451F] mb-1">
                Chọn ngày hẹn:
              </label>
              <input
                type="date"
                min={todayKey}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-2xl px-3 py-2.5 text-sm font-bold text-[#81451F] focus:ring-2 focus:ring-[#EC802B] focus:outline-none"
              />

              <div className="mt-4 p-3 rounded-2xl bg-[#FCF5DC] border border-[#EDC55B] text-xs space-y-1">
                <span className="font-bold text-[#81451F] block">Thông tin cơ sở:</span>
                <p className="text-neutral-700">Giờ mở cửa: {selectedSchedule.start_time} - {selectedSchedule.end_time}</p>
                <p className="text-neutral-700">Sức chứa tối đa: {selectedSchedule.max_concurrent_capacity} bé cùng lúc</p>
                {!selectedSchedule.is_available && (
                  <p className="text-red-600 font-bold">⚠️ Ngày này cơ sở tạm nghỉ!</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#81451F] mb-1">
                Khung giờ khả dụng (Toàn bộ ca kéo dài đến {calculateEndTime(bookingTime, selectedService?.duration_minutes || 60)}):
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1">
                {slotOptions.length === 0 && <p className="col-span-full rounded-xl bg-[#FFF4E5] p-3 text-xs text-[#946d48]">Không có khung giờ phù hợp với thời lượng dịch vụ trong ngày này.</p>}
                {slotOptions.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={!slot.isAvailable}
                    onClick={() => setBookingTime(slot.time)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      bookingTime === slot.time
                        ? 'bg-[#EC802B] text-white shadow-xs ring-2 ring-[#EC802B]'
                        : slot.isAvailable
                        ? 'bg-[#FAF6F0] text-[#81451F] hover:bg-[#FDE8D7] border border-[#E8CCAD]'
                        : 'bg-neutral-100 text-neutral-300 cursor-not-allowed border border-neutral-200 line-through'
                    }`}
                    title={slot.reason || 'Khung giờ khả dụng'}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-[#FAF6F0]">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl border border-[#81451F] text-[#81451F] font-bold text-xs hover:bg-[#FAF6F0] cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
            <button
              onClick={handleNextStep}
              className="px-6 py-2.5 rounded-xl bg-[#EC802B] hover:bg-[#D46917] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              Tiếp tục: Thanh toán & Mã ưu đãi <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: THÔNG TIN XÁC NHẬN, COUPON & PHƯƠNG THỨC THANH TOÁN */}
      {currentStep === 4 && selectedService && selectedPet && (
        <div className="bg-white p-6 rounded-3xl border-2 border-[#E8CCAD] shadow-xs space-y-6">
          <div className="border-b border-[#FAF6F0] pb-3">
            <h3 className="text-xl font-black text-[#81451F] font-heading">
              Bước 4: Xác nhận thông tin & Thanh toán
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Kiểm tra lại toàn bộ thông tin lịch hẹn trước khi xác nhận.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Booking Snapshot Summary */}
            <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8CCAD] space-y-3 text-xs">
              <h4 className="font-bold text-sm text-[#81451F] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#EC802B]" /> Tóm tắt lịch hẹn
              </h4>

              <div className="space-y-1.5 divide-y divide-[#E8CCAD]/40">
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500">Khách hàng:</span>
                  <strong className="text-[#81451F]">{currentUser.full_name} ({currentUser.phone})</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500">Bé cưng:</span>
                  <strong className="text-[#81451F]">{selectedPet.pet_name} ({selectedPet.species} - {confirmedWeight}kg)</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500">Dịch vụ:</span>
                  <strong className="text-[#81451F]">{selectedService.service_name}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500">Thời gian:</span>
                  <strong className="text-[#81451F]">
                    {bookingTime} - {calculateEndTime(bookingTime, selectedService.duration_minutes)} ({bookingDate})
                  </strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500">Thời lượng:</span>
                  <strong className="text-[#81451F]">{selectedService.duration_minutes} phút</strong>
                </div>
              </div>

              {/* Note input */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-[#81451F] mb-1">
                  Ghi chú cho kỹ thuật viên Pet Phết:
                </label>
                <textarea
                  rows={2}
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Ví dụ: Bé hơi sợ nước, xin nhẹ tay; dặn dò tỉa phần đuôi tròn..."
                  className="w-full bg-white border border-[#E8CCAD] rounded-xl px-3 py-1.5 text-xs text-[#81451F] focus:ring-2 focus:ring-[#EC802B] focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Method & Pricing Calculation */}
            <div className="space-y-4">
              {/* Coupon input */}
              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#EC802B]" /> Mã ưu đãi / Coupon:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="PETFIRST50K, BANMOI15..."
                    className="flex-1 bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs font-bold uppercase text-[#81451F] focus:ring-2 focus:ring-[#EC802B] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-[#81451F] hover:bg-[#5C2E11] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Áp dụng
                  </button>
                </div>
                {couponMessage && (
                  <p
                    className={`text-[11px] mt-1 font-semibold ${
                      appliedCoupon ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {couponMessage}
                  </p>
                )}
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-2">
                  Chọn phương thức thanh toán:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-[#EC802B] bg-[#FDE8D7]/40 ring-1 ring-[#EC802B]'
                        : 'border-[#E8CCAD] bg-[#FAF6F0]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-[#EC802B]" />
                      <strong className="text-xs text-[#81451F]">COD Tại Salon</strong>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Thanh toán tiền mặt hoặc thẻ tại quầy sau khi phục vụ xong.
                    </p>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('QR')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'QR'
                        ? 'border-[#EC802B] bg-[#FDE8D7]/40 ring-1 ring-[#EC802B]'
                        : 'border-[#E8CCAD] bg-[#FAF6F0]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-[#66BCB4]" />
                      <strong className="text-xs text-[#81451F]">Quét QR Ngân Hàng</strong>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Giữ chỗ trong 15 phút. Quét mã VietQR tiện lợi, đối chiếu nhanh.
                    </p>
                  </div>
                </div>
              </div>

              {/* Price summary */}
              <div className="p-3.5 rounded-2xl bg-[#FCF5DC] border border-[#EDC55B] text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Giá gốc dịch vụ:</span>
                  <span className="font-bold text-[#81451F]">{formatVND(basePrice)}</span>
                </div>
                {couponCalculation.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Mã giảm giá ({appliedCoupon.code}):</span>
                    <span className="font-bold">-{formatVND(couponCalculation.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[#EDC55B]/60 text-sm">
                  <span className="font-black text-[#81451F]">Tổng thanh toán:</span>
                  <span className="font-black text-xl text-[#EC802B]">
                    {formatVND(couponCalculation.finalTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-[#FAF6F0]">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl border border-[#81451F] text-[#81451F] font-bold text-xs hover:bg-[#FAF6F0] cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
            <button
              disabled={isSubmitting}
              onClick={handleConfirmBooking}
              className="px-8 py-3 rounded-2xl bg-[#EC802B] hover:bg-[#D46917] text-white font-black text-sm shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang tạo lịch...' : 'Hoàn tất & Xác nhận đặt lịch'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
