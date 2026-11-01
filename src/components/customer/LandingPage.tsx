import React, { useEffect, useState } from 'react';
import {
  ArrowRight, CalendarDays, Clock3, Heart, PawPrint,
  Scissors, ShieldCheck, Sparkles, Star, Tag, Clock
} from 'lucide-react';
import { ASSETS } from '../../constants/assets';
import { store } from '../../services/store';
import { formatVND } from '../../utils/bookingEngine';
import { Service } from '../../types';

interface LandingPageProps {
  onNavigateToBooking: (serviceId?: string) => void;
  onNavigateToServices: () => void;
  onNavigateToPets: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToBooking,
  onNavigateToServices,
  onNavigateToPets
}) => {
  const services = store.getServices(true).slice(0, 3);
  const reviews = store.getReviews().slice(0, 3);
  const coupons = store.getCoupons().filter((coupon) => coupon.is_active).slice(0, 2);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const selectedServiceReviews = selectedService
    ? store.getReviewsByService(selectedService.id)
    : [];
  const selectedServiceRatingCount = selectedServiceReviews.length;
  const selectedServiceRatingAverage = selectedServiceRatingCount
    ? (selectedServiceReviews.reduce((sum, review) => sum + review.rating, 0) / selectedServiceRatingCount).toFixed(1)
    : '0.0';

  useEffect(() => {
    if (!selectedService) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelectedService(null); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedService]);

  return (
    <div className="pet-landing-page">
      <section className="pet-hero-section">
        <div className="pet-hero-backdrop" aria-hidden="true" />
        <div className="pet-hero-mascots" aria-hidden="true"><img src={ASSETS.heroPair} alt="" /></div>
        <div className="pet-hero-copy">
          <span className="pet-eyebrow"><Sparkles size={15} /> A HAPPY PLACE FOR YOUR LOVELY PETS</span>
          <h1 className="pet-hero-title"><span>Yêu thương bé cưng</span><em>bằng cả trái tim!</em></h1>
          <p>Chăm sóc tận tâm – Trải nghiệm dễ thương – Đồng hành cùng mọi khoảnh khắc của bé.</p>
          <div className="pet-hero-actions">
            <button className="pet-button pet-button-primary" onClick={() => onNavigateToBooking()}><CalendarDays size={19} /> Đặt lịch ngay</button>
            <button className="pet-button pet-button-light" onClick={onNavigateToServices}><Scissors size={19} /> Khám phá dịch vụ</button>
          </div>
          {coupons.length > 0 && (
            <div className="pet-coupon-row">
              {coupons.map((coupon) => <span key={coupon.id}><Tag size={14} /><b>{coupon.code}</b> · {coupon.description}</span>)}
            </div>
          )}
          <div className="pet-hero-trust">
            <span><ShieldCheck size={17} /> Chăm sóc tận tâm</span>
            <span><Clock3 size={17} /> Đặt lịch linh hoạt</span>
            <span><Heart size={17} /> Yêu thương từng bé</span>
          </div>
        </div>
        <div className="pet-hero-scroll">Khám phá Pet Phết <span>↓</span></div>
      </section>

      <section className="pet-welcome-strip">
        <div className="pet-welcome-copy">
          <span className="pet-section-kicker">PET PHẾT – PET FIRST</span>
          <h2>Mỗi bé cưng đều xứng đáng được chăm sóc bằng sự dịu dàng.</h2>
          <p>Từ tắm spa, cắt tỉa đến thăm khám và tiêm phòng, Pet Phết giúp bạn quản lý hành trình chăm sóc bé trong một nơi duy nhất.</p>
          <button className="pet-text-link" onClick={onNavigateToPets}>Tạo hồ sơ cho bé <ArrowRight size={17} /></button>
        </div>
        <div className="pet-mascot-card">
          <img src={ASSETS.bgBanner} alt="Cún Phết và Mèo Bông" />
          <div><strong>Cún Phết & Mèo Bông</strong><span>Hai người bạn đồng hành của Pet Phết</span></div>
        </div>
      </section>

      <section className="pet-quick-benefits">
        <article><span className="benefit-icon orange"><PawPrint /></span><div><strong>Hồ sơ riêng cho từng bé</strong><small>Lưu cân nặng, thông tin và lịch sử chăm sóc.</small></div></article>
        <article><span className="benefit-icon teal"><CalendarDays /></span><div><strong>Đặt lịch chủ động</strong><small>Chọn ngày, khung giờ còn chỗ và dịch vụ phù hợp.</small></div></article>
        <article><span className="benefit-icon yellow"><Star /></span><div><strong>Nhận Pet Point</strong><small>Nhận 1.000 điểm khi gửi đánh giá hợp lệ.</small></div></article>
      </section>

      <section className="pet-section-block">
        <div className="pet-section-heading">
          <div><span className="pet-section-kicker">DỊCH VỤ NỔI BẬT</span><h2>Chăm sóc bé từ A đến Z</h2><p>Lựa chọn dịch vụ phù hợp với nhu cầu của thú cưng.</p></div>
          <button className="pet-outline-link" onClick={onNavigateToServices}>Xem tất cả dịch vụ <ArrowRight size={16} /></button>
        </div>
        <div className="pet-service-grid">
          {services.map((service, index) => (
            <article
              className="pet-service-card pet-home-service-card"
              key={service.id}
              role="button"
              tabIndex={0}
              aria-label={`Xem chi tiết ${service.service_name}`}
              onClick={() => setSelectedService(service)}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedService(service); } }}
            >
              <div className="pet-service-image-wrap"><img src={service.image_url} alt={service.service_name} loading="lazy" /><span>{index === 0 ? 'Được yêu thích' : service.duration_minutes + ' phút'}</span></div>
              <div className="pet-service-card-body">
                <div className="pet-service-meta"><span>{service.is_weight_based ? 'Giá theo cân nặng' : 'Giá niêm yết'}</span><span><Star size={13} fill="currentColor" /> {service.rating_avg.toFixed(1)} ({service.rating_count})</span></div>
                <h3>{service.service_name}</h3>
                <p>{service.description}</p>
                <div className="pet-service-card-footer"><strong>{service.is_weight_based ? 'Từ ' : ''}{formatVND(service.base_price)}</strong><button onClick={(event) => { event.stopPropagation(); onNavigateToBooking(service.id); }} aria-label={`Đặt lịch ${service.service_name}`}><ArrowRight size={18} /></button></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="pet-how-it-works" className="pet-how-it-works">
        <div className="pet-section-heading centered"><div><span className="pet-section-kicker">ĐẶT LỊCH THẬT DỄ DÀNG</span><h2>Chỉ 4 bước để bé được chăm sóc</h2></div></div>
        <div className="pet-steps-grid">
          {[
            ['01', 'Chọn dịch vụ', 'Tìm hiểu dịch vụ phù hợp với bé cưng.'],
            ['02', 'Chọn thú cưng', 'Sử dụng hồ sơ bé đã lưu hoặc tạo mới.'],
            ['03', 'Chọn thời gian', 'Chọn ngày và khung giờ còn sức chứa.'],
            ['04', 'Xác nhận đặt lịch', 'Kiểm tra thông tin và chọn COD hoặc QR.']
          ].map(([number, title, description]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}
        </div>
        <div className="pet-center-action"><button className="pet-button pet-button-primary" onClick={() => onNavigateToBooking()}>Bắt đầu đặt lịch <ArrowRight size={18} /></button></div>
      </section>

      <section className="pet-review-section">
        <div className="pet-section-heading"><div><span className="pet-section-kicker">CHIA SẺ TỪ KHÁCH HÀNG</span><h2>Những chiếc đuôi vui vẻ</h2><p>Đánh giá được ghi nhận từ các lịch hẹn đã hoàn thành.</p></div></div>
        {reviews.length > 0 ? <div className="pet-review-grid">{reviews.map((review) => <article key={review.id} className="pet-review-card"><div className="pet-review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div><p>“{review.comment}”</p><strong>{review.user_name}</strong><small>Chủ bé {review.pet_name}</small>{review.admin_reply && <div className="pet-review-reply"><b>Pet Phết phản hồi:</b> {review.admin_reply}</div>}</article>)}</div> : <div className="pet-empty-reviews"><Sparkles /> Pet Phết đang chờ những chia sẻ đầu tiên từ bạn.</div>}
      </section>

      <section className="pet-bottom-cta">
        <div><span className="pet-section-kicker">SẴN SÀNG CHO MỘT NGÀY THẬT VUI?</span><h2>Bé cưng đang chờ một buổi chăm sóc thật chill!</h2><p>Tạo hồ sơ, chọn dịch vụ và đặt lịch cùng Pet Phết nhé.</p></div>
        <button className="pet-button pet-button-white" onClick={() => onNavigateToBooking()}>Đặt lịch cho bé <ArrowRight size={18} /></button>
      </section>

      {selectedService && (
        <div
          className="pet-service-detail-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedService(null); }}
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border-2 border-[#E8CCAD]" role="dialog" aria-modal="true" aria-label={`Chi tiết ${selectedService.service_name}`} onMouseDown={(event) => event.stopPropagation()}>
            <img src={selectedService.image_url} alt={selectedService.service_name} className="w-full h-56 object-cover" />
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-2xl font-black text-[#81451F] font-heading">{selectedService.service_name}</h3>
                  <p className="mt-1 text-xs text-[#7d634a] flex items-center gap-2"><Clock size={14} /> {selectedService.duration_minutes} phút · {selectedService.species_supported.join(', ')}</p>
                </div>
                <strong className="text-xl text-[#EC802B]">{selectedService.is_weight_based ? 'Từ ' : ''}{formatVND(selectedService.base_price)}</strong>
              </div>
              <p className="text-sm leading-7 text-[#76583d]">{selectedService.description}</p>
              {selectedService.is_weight_based && selectedService.pricing_tiers?.length ? (
                <div className="rounded-2xl bg-[#FFF7ED] border border-[#E8CCAD] p-4">
                  <h4 className="font-bold text-sm text-[#81451F] mb-2">Bảng giá theo cân nặng</h4>
                  <div className="space-y-2 text-xs">{selectedService.pricing_tiers.map((tier) => <div key={tier.id} className="flex justify-between gap-3"><span>{tier.min_weight}–{tier.max_weight} kg</span><strong>{formatVND(tier.price)}</strong></div>)}</div>
                </div>
              ) : null}
              <div className="border-t border-[#F0E2D2] pt-3">
                <div className="flex items-center justify-between gap-3"><h4 className="font-bold text-sm text-[#81451F]">Đánh giá khách hàng ({selectedServiceRatingCount})</h4><span className="text-xs text-[#D79A2D]">★ {selectedServiceRatingAverage} / 5.0</span></div>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">{selectedServiceReviews.length ? selectedServiceReviews.map((review) => <div key={review.id} className="rounded-xl bg-[#FFFAF4] p-3 text-xs"><strong>{review.user_name} · {review.pet_name}</strong><p className="mt-1 text-[#76583d]">{review.comment}</p></div>) : <p className="text-xs text-[#9b846e]">Dịch vụ chưa có đánh giá.</p>}</div>
              </div>
              <div className="flex justify-end"><button className="pet-button pet-button-primary" onClick={() => { const id = selectedService.id; setSelectedService(null); onNavigateToBooking(id); }}><CalendarDays size={17} /> Đặt lịch dịch vụ này</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
