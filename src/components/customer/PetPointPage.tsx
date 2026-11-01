import React from 'react';
import { Award, Sparkles, CheckCircle2, Clock, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { store } from '../../services/store';
import { UserProfile } from '../../types';
import { ASSETS } from '../../constants/assets';

interface PetPointPageProps {
  currentUser: UserProfile;
  onNavigateToBooking: () => void;
  onNavigateToHistory: () => void;
}

export const PetPointPage: React.FC<PetPointPageProps> = ({
  currentUser,
  onNavigateToBooking,
  onNavigateToHistory
}) => {
  const currentPoints = store.getUserPetPoints(currentUser.id);
  const transactions = store.getPetPointTransactions(currentUser.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div>
        <span className="text-xs font-black uppercase tracking-widest text-[#EC802B]">
          Chương trình tri ân khách hàng
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#81451F] font-heading mt-1">
          Ví Điểm Thưởng Pet Point
        </h1>
        <p className="text-sm text-neutral-600 mt-1 font-vietnamese">
          Tích lũy 1.000 Pet Point cho mỗi đánh giá sau khi hoàn thành lịch hẹn để khẳng định tình yêu thương cùng bé cưng.
        </p>
      </div>

      {/* Balance Card with Mascot */}
      <div className="bg-gradient-to-r from-[#EC802B] via-[#EDC55B] to-[#E8CCAD] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black text-white uppercase tracking-wider">
              Số dư khả dụng
            </span>
            <div className="flex items-baseline gap-2 justify-center sm:justify-start">
              <span className="text-5xl sm:text-6xl font-black font-heading tracking-tight">
                {currentPoints.toLocaleString('vi-VN')}
              </span>
              <span className="text-xl font-bold text-orange-100">Pet Point</span>
            </div>
            <p className="text-xs text-orange-100/90 font-vietnamese">
              Chủ sở hữu: <strong>{currentUser.full_name}</strong> ({currentUser.email})
            </p>
          </div>

          <div className="w-24 h-24 rounded-3xl overflow-hidden bg-white/90 border-2 border-white shadow-lg shrink-0 flex items-center justify-center">
            <img
              src={ASSETS.bgBanner}
              alt="Mascot Pet Phết"
              className="w-[200%] h-[200%] max-w-none object-cover object-[25%_45%]"
            />
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="mt-6 pt-6 border-t border-white/20 flex flex-wrap gap-3">
          <button
            onClick={onNavigateToHistory}
            className="px-4 py-2 bg-white text-[#81451F] hover:bg-neutral-100 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-[#EC802B]" /> Đánh giá lịch hẹn để nhận thêm +1.000 pts
          </button>
          <button
            onClick={onNavigateToBooking}
            className="px-4 py-2 bg-[#81451F] text-white hover:bg-[#5C2E11] font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" /> Đặt lịch dịch vụ mới
          </button>
        </div>
      </div>

      {/* Point Rules Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border-2 border-[#E8CCAD] space-y-2">
          <div className="w-8 h-8 rounded-xl bg-[#FCF5DC] flex items-center justify-center text-[#EC802B]">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-[#81451F]">Cộng 1.000 Điểm / Đánh giá</h4>
          <p className="text-xs text-neutral-600 leading-relaxed font-vietnamese">
            Mỗi khi dịch vụ hoàn thành, chỉ cần gửi đánh giá kèm nhận xét chân thực, hệ thống sẽ tự động thưởng 1.000 Pet Point.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border-2 border-[#E8CCAD] space-y-2">
          <div className="w-8 h-8 rounded-xl bg-[#FCF5DC] flex items-center justify-center text-[#66BCB4]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-[#81451F]">Bảo Vệ Chống Trùng</h4>
          <p className="text-xs text-neutral-600 leading-relaxed font-vietnamese">
            Hệ thống khóa mã booking sau khi đã thưởng, bảo đảm tính minh bạch, công bằng và không cộng trùng khi cập nhật đánh giá.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border-2 border-[#E8CCAD] space-y-2">
          <div className="w-8 h-8 rounded-xl bg-[#FCF5DC] flex items-center justify-center text-[#EDC55B]">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-[#81451F]">Hiệu Lực Trọn Đời</h4>
          <p className="text-xs text-neutral-600 leading-relaxed font-vietnamese">
            Pet Point được lưu trữ vĩnh viễn trên tài khoản của bạn, gắn liền với lịch sử chăm sóc của các bé cưng.
          </p>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white rounded-3xl border-2 border-[#E8CCAD] p-6 shadow-xs space-y-4">
        <h3 className="font-black text-lg text-[#81451F] font-heading flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#EC802B]" /> Lịch Sử Biến Động Điểm Thưởng
        </h3>

        {transactions.length === 0 ? (
          <div className="text-center py-10 text-neutral-400 text-xs">
            Chưa có giao dịch tích điểm nào phát sinh.
          </div>
        ) : (
          <div className="divide-y divide-[#FAF6F0]">
            {transactions.map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FCF5DC] border border-[#EDC55B] flex items-center justify-center font-bold text-[#81451F] text-xs shrink-0 mt-0.5">
                    +1K
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#81451F]">{tx.description}</h4>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">
                      Mã tham chiếu: #{tx.reference_id} • Thời gian: {new Date(tx.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>

                <span className="font-black text-base text-emerald-600 shrink-0">
                  +{tx.amount.toLocaleString('vi-VN')} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
