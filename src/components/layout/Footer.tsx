import React from 'react';
import { Phone, Mail, MapPin, Clock, Heart, Shield, Award, Sparkles } from 'lucide-react';
import { ASSETS } from '../../constants/assets';

export const Footer: React.FC = () => {
  return (
    <footer className="pet-footer bg-[#81451F] text-[#FAF6F0] pt-14 pb-8 border-t-4 border-[#EC802B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-[#A45C2D]">
          {/* Brand & Mascot Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={ASSETS.brandLogo}
                alt="Pet Phết – Pet First"
                className="pet-footer-logo"
              />
            </div>

            <p className="text-xs text-orange-100/90 leading-relaxed font-vietnamese">
              Người bạn đồng hành chăm sóc thú cưng toàn diện, mang đến trải nghiệm spa, thú y chuẩn y khoa và tình yêu thương vô điều kiện cho mọi bé cưng.
            </p>

          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-bold text-[#EDC55B] font-heading mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#EC802B]" /> Dịch vụ chính
            </h4>
            <ul className="space-y-2.5 text-xs text-orange-100/80">
              <li>Combo Tắm Thảo Mộc 7 Bước</li>
              <li>Grooming Cắt Tỉa Tạo Kiểu Nghệ Thuật</li>
              <li>Khám Thú Y & Chẩn Đoán Sinh Hiệu</li>
              <li>Tiêm Vaccine Định Kỳ Có Sổ Theo Dõi</li>
              <li>Vệ Sinh Răng Miệng Sóng Siêu Âm</li>
              <li>Khách Sạn Thú Cưng Máy Lạnh 24/7</li>
            </ul>
          </div>

          {/* Working Hours & Commitments */}
          <div>
            <h4 className="text-base font-bold text-[#EDC55B] font-heading mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#66BCB4]" /> Giờ làm việc & Cam kết
            </h4>
            <ul className="space-y-3 text-xs text-orange-100/80">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#EDC55B] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Thứ 2 – Chủ Nhật:</strong> 08:00 – 20:00 (Kể cả ngày lễ, có đặt trước)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-[#66BCB4] shrink-0 mt-0.5" />
                <span>Kiểm tra sức chứa liên tục, không nhồi nhét, đảm bảo an toàn tuyệt đối</span>
              </li>
              <li className="flex items-start gap-2">
                <Award className="w-4 h-4 text-[#EDC55B] shrink-0 mt-0.5" />
                <span>Tặng 1.000 Pet Point cho mỗi đánh giá dịch vụ hoàn tất</span>
              </li>
            </ul>
          </div>

          {/* Contact & Address */}
          <div>
            <h4 className="text-base font-bold text-[#EDC55B] font-heading mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#EC802B]" /> Liên hệ Pet Phết
            </h4>
            <ul className="space-y-2.5 text-xs text-orange-100/80">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#EC802B] shrink-0 mt-0.5" />
                <span>123 Đường Thú Cưng Yêu Thương, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#66BCB4] shrink-0" />
                <span>Hotline: <strong className="text-white">0909.123.456</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#EDC55B] shrink-0" />
                <span>Email: contact@petphet.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-orange-200/60">
          <p>© 2026 Pet Phết – Pet First. Tất cả quyền được bảo lưu.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Được phát triển với <Heart className="w-3.5 h-3.5 text-[#EC802B] fill-current" /> dành trọn cho các bé cưng.
          </p>
        </div>
      </div>
    </footer>
  );
};
