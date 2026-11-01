import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Scissors,
  Clock,
  Star,
  Calendar,
  AlertCircle,
  Info
} from 'lucide-react';
import { store } from '../../services/store';
import { Service } from '../../types';
import { formatVND } from '../../utils/bookingEngine';

interface ServicesPageProps {
  onSelectServiceToBook: (serviceId: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onSelectServiceToBook }) => {
  const categories = store.getCategories();
  const allServices = store.getServices(true);

  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [detailModalService, setDetailModalService] = useState<Service | null>(null);

  useEffect(() => {
    if (!detailModalService) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDetailModalService(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [detailModalService]);

  // Filter logic
  const filteredServices = allServices.filter((s) => {
    const matchesCat = selectedCat === 'all' || s.category_id === selectedCat;
    const matchesQuery =
      s.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = s.base_price <= maxPrice;
    return matchesCat && matchesQuery && matchesPrice;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title & Banner */}
      <div className="mb-8">
        <span className="text-xs font-black uppercase tracking-widest text-[#EC802B]">
          Minh bạch & Chuẩn y khoa
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#81451F] font-heading mt-1">
          Dịch Vụ & Bảng Giá Chăm Sóc Thú Cưng
        </h1>
        <p className="text-sm text-neutral-600 mt-2 font-vietnamese">
          Dịch vụ Spa tính giá theo các mốc cân nặng thực tế. Dịch vụ Thú y hiển thị phí khám ban đầu, các xét nghiệm chuyên sâu phát sinh sẽ được bác sĩ tư vấn trực tiếp.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border-2 border-[#E8CCAD] shadow-xs mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Keyword Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm dịch vụ (tắm spa, cắt tỉa, vaccine...)"
              className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-2xl pl-10 pr-4 py-2 text-sm text-[#81451F] focus:outline-none focus:ring-2 focus:ring-[#EC802B]"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="md:col-span-7 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCat('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCat === 'all'
                  ? 'bg-[#EC802B] text-white shadow-xs'
                  : 'bg-[#FAF6F0] text-[#81451F] hover:bg-[#FDE8D7]'
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCat === cat.id
                    ? 'bg-[#EC802B] text-white shadow-xs'
                    : 'bg-[#FAF6F0] text-[#81451F] hover:bg-[#FDE8D7]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Price Slider */}
        <div className="pt-2 border-t border-[#FAF6F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-600">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#81451F]">Mức giá tối đa:</span>
            <input
              type="range"
              min="100000"
              max="1000000"
              step="50000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-36 sm:w-48 accent-[#EC802B] cursor-pointer"
            />
            <span className="font-black text-[#EC802B]">{formatVND(maxPrice)}</span>
          </div>

          <span className="text-[11px] text-neutral-400">
            Tìm thấy {filteredServices.length} dịch vụ phù hợp
          </span>
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-[#E8CCAD] p-8">
          <AlertCircle className="w-12 h-12 text-[#EDC55B] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#81451F] font-heading">
            Không tìm thấy dịch vụ phù hợp
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Vui lòng thử tìm với từ khóa khác hoặc điều chỉnh bộ lọc giá.
          </p>
          <button
            onClick={() => {
              setSelectedCat('all');
              setSearchQuery('');
              setMaxPrice(1000000);
            }}
            className="mt-4 px-4 py-2 bg-[#EC802B] text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((srv) => (
            <article
              key={srv.id}
              role="button"
              tabIndex={0}
              aria-label={`Xem chi tiết dịch vụ ${srv.service_name}`}
              onClick={() => setDetailModalService(srv)}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setDetailModalService(srv); } }}
              className="pet-service-result-card bg-white rounded-3xl border-2 border-[#E8CCAD] overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group"
            >
              <div className="relative h-48 overflow-hidden bg-neutral-100">
                <img
                  src={srv.image_url}
                  alt={srv.service_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-full text-xs font-black text-[#81451F] flex items-center gap-1 shadow-xs">
                  <Star className="w-3.5 h-3.5 text-[#EDC55B] fill-current" />
                  <span>{srv.rating_count > 0 ? srv.rating_avg.toFixed(1) : 'Chưa có'}</span>
                  <span className="text-neutral-400 text-[10px]">({srv.rating_count})</span>
                </div>

                {srv.is_weight_based && (
                  <div className="absolute bottom-3 left-3 bg-[#EC802B] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                    Giá theo cân nặng
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#66BCB4]" /> {srv.duration_minutes} phút
                    </span>
                    <span>•</span>
                    <span>Dành cho: {srv.species_supported.join(', ')}</span>
                  </div>

                  <h3 className="font-bold text-lg text-[#81451F] font-heading group-hover:text-[#EC802B] transition-colors line-clamp-1">
                    {srv.service_name}
                  </h3>

                  <p className="text-xs text-neutral-600 line-clamp-2 mt-2 leading-relaxed font-vietnamese">
                    {srv.description}
                  </p>

                  {/* Weight Brackets Preview if applicable */}
                  {srv.is_weight_based && srv.pricing_tiers && (
                    <div className="mt-3 p-2.5 bg-[#FAF6F0] rounded-2xl border border-[#E8CCAD] text-[11px] space-y-1">
                      <span className="font-bold text-[#81451F] block text-[10px] uppercase">
                        Khung giá theo cân nặng:
                      </span>
                      <div className="grid grid-cols-2 gap-1 text-neutral-600">
                        {srv.pricing_tiers.map((t) => (
                          <div key={t.id} className="flex justify-between">
                            <span>{t.min_weight} - {t.max_weight}kg:</span>
                            <strong className="text-[#81451F]">{formatVND(t.price)}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!srv.is_weight_based && (
                    <div className="mt-3 p-2 bg-[#FCF5DC] rounded-xl text-[10px] text-[#81451F] flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#EC802B] shrink-0" />
                      <span>Phí khám cơ bản (chưa gồm xét nghiệm & điều trị phát sinh).</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#FAF6F0] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-neutral-400 block">
                      {srv.is_weight_based ? 'Giá từ' : 'Phí dịch vụ'}
                    </span>
                    <span className="text-xl font-black text-[#EC802B]">
                      {formatVND(srv.base_price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(event) => { event.stopPropagation(); onSelectServiceToBook(srv.id); }}
                      className="px-4 py-2 rounded-xl bg-[#EC802B] hover:bg-[#D46917] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Đặt lịch
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailModalService && (
        <div
          className="pet-service-detail-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setDetailModalService(null); }}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-[#E8CCAD] overflow-hidden max-h-[90vh] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={`Chi tiết ${detailModalService.service_name}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="relative h-56 bg-neutral-100 shrink-0">
              <img
                src={detailModalService.image_url}
                alt={detailModalService.service_name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-[#81451F] font-heading">
                    {detailModalService.service_name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                    <span className="flex items-center gap-1 font-bold text-[#66BCB4]">
                      <Clock className="w-3.5 h-3.5" /> Thời lượng: {detailModalService.duration_minutes} phút
                    </span>
                    <span>•</span>
                    <span>Tiếp nhận: {detailModalService.species_supported.join(', ')}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-neutral-400 block">
                    {detailModalService.is_weight_based ? 'Giá từ' : 'Giá dịch vụ'}
                  </span>
                  <span className="text-2xl font-black text-[#EC802B]">
                    {formatVND(detailModalService.base_price)}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#81451F] mb-1">Mô tả quy trình dịch vụ</h4>
                <p className="text-xs text-neutral-700 leading-relaxed font-vietnamese">
                  {detailModalService.description}
                </p>
              </div>

              {detailModalService.is_weight_based && detailModalService.pricing_tiers && (
                <div>
                  <h4 className="font-bold text-sm text-[#81451F] mb-2">Bảng giá chi tiết theo cân nặng</h4>
                  <div className="divide-y divide-[#E8CCAD] border border-[#E8CCAD] rounded-2xl overflow-hidden text-xs">
                    {detailModalService.pricing_tiers.map((tier) => (
                      <div key={tier.id} className="flex justify-between p-3 bg-white hover:bg-[#FAF6F0]">
                        <span className="font-semibold text-neutral-700">
                          Bé từ {tier.min_weight}kg đến dưới {tier.max_weight}kg
                        </span>
                        <strong className="text-[#EC802B] font-bold">
                          {formatVND(tier.price)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Reviews */}
              <div className="pt-2 border-t border-[#FAF6F0]">
                <h4 className="font-bold text-sm text-[#81451F] mb-2 flex items-center justify-between">
                  <span>Đánh giá từ khách hàng ({detailModalService.rating_count})</span>
                  <span className="text-xs font-black text-[#EC802B] flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current text-[#EDC55B]" /> {detailModalService.rating_count > 0 ? `${detailModalService.rating_avg} / 5.0` : 'Chưa có đánh giá'}
                  </span>
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {store.getReviewsByService(detailModalService.id).length === 0 ? (
                    <p className="text-xs text-neutral-400 italic">Chưa có đánh giá nào cho dịch vụ này.</p>
                  ) : (
                    store.getReviewsByService(detailModalService.id).map((r) => (
                      <div key={r.id} className="p-3 rounded-xl bg-[#FAF6F0] text-xs space-y-1">
                        <div className="flex justify-between font-bold text-[#81451F]">
                          <span>{r.user_name} ({r.pet_name})</span>
                          <span className="text-[#EDC55B]">{'★'.repeat(r.rating)}</span>
                        </div>
                        <p className="text-neutral-600">{r.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FAF6F0] border-t border-[#E8CCAD] flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => {
                  const id = detailModalService.id;
                  setDetailModalService(null);
                  onSelectServiceToBook(id);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#EC802B] hover:bg-[#D46917] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" /> Đặt lịch dịch vụ này
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
