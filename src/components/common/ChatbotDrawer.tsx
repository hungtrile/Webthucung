import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { ASSETS } from '../../constants/assets';
import { store } from '../../services/store';
import { formatVND } from '../../utils/bookingEngine';
import { Service } from '../../types';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

const QUICK_PROMPTS = [
  'Giờ làm việc của Pet Phết?',
  'Giá dịch vụ được tính thế nào?',
  'Hướng dẫn đặt lịch',
  'Thanh toán QR và COD',
  'Cách nhận Pet Point'
];

const normalizeText = (value: string) => value
  .toLocaleLowerCase('vi-VN')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const containsAny = (value: string, terms: string[]) => terms.some((term) => value.includes(normalizeText(term)));

const getTime = () => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

function serviceSummary(service: Service) {
  const price = service.is_weight_based
    ? `Giá hiện từ ${formatVND(service.base_price)} và thay đổi theo cân nặng.`
    : `Giá niêm yết hiện tại là ${formatVND(service.base_price)}.`;
  const tiers = service.is_weight_based && service.pricing_tiers?.length
    ? ` Bảng giá theo cân nặng: ${service.pricing_tiers.map((tier) => `${tier.min_weight}–${tier.max_weight}kg ${formatVND(tier.price)}`).join('; ')}.`
    : '';
  return `${service.service_name}: ${service.description} Thời lượng khoảng ${service.duration_minutes} phút, tiếp nhận ${service.species_supported.join(' và ')}. ${price}${tiers}`;
}

function buildAssistantReply(rawQuestion: string, services: Service[]) {
  const question = normalizeText(rawQuestion);
  const serviceMatch = services.find((service) => {
    const name = normalizeText(service.service_name);
    if (question.includes(name)) return true;
    const words = name.split(' ').filter((word) => word.length > 3);
    return words.length >= 2 && words.filter((word) => question.includes(word)).length >= 2;
  });

  if (serviceMatch) return serviceSummary(serviceMatch);

  if (containsAny(question, ['xin chao', 'chao', 'hello', 'hi', 'alo', 'gâu'])) {
    return 'Xin chào bạn và bé cưng! 🐾 Mình là trợ lý Cún Phết. Mình có thể tư vấn dịch vụ, giá theo cân nặng, đặt lịch, thanh toán, hồ sơ thú cưng, lịch hẹn và Pet Point. Bạn đang cần hỗ trợ phần nào nè?';
  }
  if (containsAny(question, ['cam on', 'thanks', 'thank you', 'tuyet voi'])) {
    return 'Dạ, Pet Phết rất vui được hỗ trợ bạn! Chúc bạn và bé cưng có một ngày thật nhiều niềm vui. Nếu cần xem dịch vụ hoặc đặt lịch, cứ nhắn mình nhé. 🧡';
  }
  if (containsAny(question, ['gio mo cua', 'gio lam viec', 'may gio', 'mo cua', 'dong cua', 'ngay le'])) {
    return 'Pet Phết phục vụ từ Thứ 2 đến Chủ Nhật, 08:00–20:00. Ngày lễ có thể tiếp nhận khi bạn đặt trước. Bạn nên chọn ngày và khung giờ còn chỗ trên màn hình Đặt lịch nhé.';
  }
  if (containsAny(question, ['dia chi', 'o dau', 'chi nhanh', 'duong nao', 'ban o dau'])) {
    return 'Địa chỉ mẫu hiện trên website: 123 Đường Thú Cưng Yêu Thương, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh. Bạn nên liên hệ trước qua hotline 0909.123.456 để xác nhận thông tin cơ sở.';
  }
  if (containsAny(question, ['hotline', 'so dien thoai', 'lien he', 'email'])) {
    return 'Bạn có thể liên hệ Pet Phết qua hotline 0909.123.456 hoặc email contact@petphet.vn. Với tình huống sức khỏe khẩn cấp, hãy đưa bé đến cơ sở thú y gần nhất thay vì chờ phản hồi chatbot.';
  }
  if (containsAny(question, ['gia', 'bao nhieu tien', 'bang gia', 'phi dich vu', 'gia ca', 'tinh tien'])) {
    const lines = services.slice(0, 6).map((service) => `• ${service.service_name}: ${service.is_weight_based ? `từ ${formatVND(service.base_price)} (theo cân nặng)` : formatVND(service.base_price)}`).join('\n');
    return `Mình gửi bạn một số mức giá đang hiển thị trong danh mục:\n${lines}\n\nGiá cuối cùng có thể phụ thuộc cân nặng và tình trạng thực tế của bé. Bạn nhấn vào thẻ dịch vụ để xem mô tả và bảng giá chi tiết nhé.`;
  }
  if (containsAny(question, ['can nang', 'kg', 'kilogram', 'nang bao nhieu'])) {
    return 'Một số dịch vụ Spa & Grooming áp dụng giá theo cân nặng. Khi đặt lịch, bạn chọn hồ sơ thú cưng và xác nhận cân nặng hiện tại; hệ thống sẽ tính theo bậc giá tương ứng. Bạn nên cập nhật cân nặng gần nhất để dự toán chính xác hơn.';
  }
  if (containsAny(question, ['dich vu', 'spa', 'grooming', 'tam', 'cat tia', 'tiem', 'vaccine', 'thu y', 'kham benh'])) {
    const lines = services.slice(0, 7).map((service) => `• ${service.service_name} – ${service.duration_minutes} phút – ${service.is_weight_based ? `từ ${formatVND(service.base_price)}` : formatVND(service.base_price)}`).join('\n');
    return `Pet Phết hiện có các dịch vụ đang mở:\n${lines}\n\nBạn mở mục Dịch vụ và chạm vào bất kỳ thẻ dịch vụ nào để xem chi tiết, bảng giá và đánh giá trước khi đặt lịch.`;
  }
  if (containsAny(question, ['dat lich', 'booking', 'hen lich', 'lich hen', 'lich trong'])) {
    return 'Bạn có thể đặt lịch theo các bước: 1) Chọn dịch vụ; 2) Chọn hồ sơ thú cưng; 3) Chọn ngày và khung giờ còn chỗ; 4) Kiểm tra giá tạm tính, ghi chú và mã giảm giá; 5) Chọn COD hoặc QR rồi xác nhận. Hệ thống sẽ kiểm tra lại sức chứa trước khi tạo lịch.';
  }
  if (containsAny(question, ['khong thay gio', 'het cho', 'khong con lich', 'khung gio trong', 'ngay nghi'])) {
    return 'Khung giờ chỉ hiện khi cơ sở mở cửa và còn đủ sức chứa cho toàn bộ thời lượng dịch vụ. Nếu ngày bạn chọn không còn chỗ, hãy thử ngày khác hoặc chọn dịch vụ có thời lượng phù hợp hơn.';
  }
  if (containsAny(question, ['huy lich', 'huy don', 'cancel'])) {
    return 'Bạn mở mục Lịch hẹn, chọn đơn cần xem và gửi yêu cầu hủy nếu đơn còn ở trạng thái cho phép. Đơn QR đã chuyển khoản hoặc đang chờ đối chiếu sẽ cần được xử lý thanh toán trước, nên hệ thống có thể khóa thao tác hủy trực tiếp.';
  }
  if (containsAny(question, ['doi lich', 'doi ngay', 'doi gio', 'reschedule'])) {
    return 'Bạn vào Lịch hẹn, mở chi tiết đơn và chọn đổi lịch khi trạng thái còn cho phép. Hệ thống sẽ kiểm tra ngày, giờ hoạt động, thời lượng dịch vụ và sức chứa trước khi lưu lịch mới.';
  }
  if (containsAny(question, ['qr loi', 'qr het han', 'chua thanh toan', 'chuyen khoan roi', 'da chuyen khoan'])) {
    return 'Nếu chọn QR, bạn hãy kiểm tra đúng số tiền và nội dung chuyển khoản theo đơn. Khi đã chuyển khoản, đừng tạo thanh toán lặp lại; hãy giữ lại biên nhận và liên hệ hotline 0909.123.456 để được đối chiếu. Đơn QR quá hạn 15 phút có thể tự động hủy và giải phóng chỗ.';
  }
  if (containsAny(question, ['thanh toan', 'tra tien', 'cod', 'qr', 'chuyen khoan', 'quet ma'])) {
    return 'Pet Phết hỗ trợ hai phương thức: COD – thanh toán trực tiếp sau khi sử dụng dịch vụ; QR – quét mã và chuyển khoản theo nội dung đơn. Với QR, chỗ được giữ tạm trong 15 phút; Admin cần đối chiếu khoản tiền trước khi xác nhận lịch.';
  }
  if (containsAny(question, ['pet point', 'diem thuong', 'tich diem', '1 000 diem', '1000 diem'])) {
    return 'Bạn nhận 1.000 Pet Point khi gửi đánh giá hợp lệ cho đơn dịch vụ đã hoàn thành. Điểm sẽ được cộng vào tài khoản sau khi đánh giá được lưu thành công.';
  }
  if (containsAny(question, ['danh gia', 'review', 'viet nhan xet', 'cham sao'])) {
    return 'Bạn chỉ có thể đánh giá đơn đã hoàn thành và thuộc tài khoản của mình. Vào Lịch hẹn, chọn đơn hoàn thành, chấm từ 1 đến 5 sao và viết nhận xét. Mỗi đánh giá hợp lệ được thưởng 1.000 Pet Point.';
  }
  if (containsAny(question, ['ho so', 'them thu cung', 'them be', 'pet profile', 'can nang cua be'])) {
    return 'Vào mục Thú cưng → Thêm hồ sơ. Bạn cần nhập tên và loài; các thông tin như giống, giới tính, ngày sinh, cân nặng và lưu ý sức khỏe giúp Pet Phết tư vấn dịch vụ phù hợp hơn. Một tài khoản có thể quản lý nhiều bé.';
  }
  if (containsAny(question, ['dang ky', 'tao tai khoan', 'quen mat khau', 'dang nhap', 'mat khau'])) {
    return 'Bạn chọn Đăng ký để tạo tài khoản khách hàng bằng họ tên, email, số điện thoại và mật khẩu. Nếu đã có tài khoản, chọn Đăng nhập. Chức năng quên mật khẩu trong bản demo dùng OTP mô phỏng 123456.';
  }
  if (containsAny(question, ['ma giam gia', 'voucher', 'coupon', 'khuyen mai', 'uu dai'])) {
    return 'Bạn nhập mã giảm giá trong bước xác nhận đặt lịch. Hệ thống sẽ kiểm tra thời hạn và điều kiện áp dụng trước khi tính tổng tiền. Nếu mã không hợp lệ, bạn có thể bỏ mã và tiếp tục đặt lịch.';
  }
  if (containsAny(question, ['benh', 'chan thuong', 'non', 'bo an', 'kho tho', 'co giat', 'ngat', 'ngung tho'])) {
    return 'Mình không thể chẩn đoán bệnh qua chat. Nếu bé khó thở, co giật, chảy máu nhiều, ngất hoặc có dấu hiệu nguy hiểm, hãy đưa bé đến cơ sở thú y gần nhất ngay. Với nhu cầu khám định kỳ, bạn có thể xem nhóm dịch vụ Thú y của Pet Phết.';
  }
  if (containsAny(question, ['long roi', 'rụng lông', 'ngua', 'ngua ngay', 've sinh tai', 've sinh mong', 'cham soc long'])) {
    return 'Bạn nên chải lông phù hợp với loại lông, giữ vùng tai và bàn chân sạch, đồng thời tránh dùng sản phẩm của người cho thú cưng. Nếu bé ngứa kéo dài, rụng lông thành mảng, có mùi hoặc da đỏ, hãy đặt lịch khám thú y để được kiểm tra nguyên nhân thay vì tự dùng thuốc.';
  }
  if (containsAny(question, ['tiem phong', 'vaccin', 'vacxin', 'lich tiem', 'mui tiem'])) {
    return 'Lịch tiêm phòng cần căn cứ vào loài, độ tuổi, tiền sử tiêm và tình trạng sức khỏe của bé. Bạn có thể xem dịch vụ tiêm vaccine trên website và tạo hồ sơ thú cưng trước; bác sĩ sẽ xác nhận loại vaccine và lịch phù hợp khi tiếp nhận.';
  }
  if (containsAny(question, ['triet san', 'steril', 'sinh san', 'dong duc'])) {
    return 'Triệt sản cần được bác sĩ thú y thăm khám và đánh giá độ tuổi, thể trạng cùng các rủi ro gây mê trước khi chỉ định. Bạn có thể tìm dịch vụ thú y trên Pet Phết để gửi yêu cầu tư vấn; chatbot không thể xác nhận bé đủ điều kiện phẫu thuật.';
  }
  if (containsAny(question, ['cho an', 'thuc an', 'an gi', 'dinh duong', 'hat cho', 'pate'])) {
    return 'Khẩu phần nên phù hợp với loài, độ tuổi, cân nặng, mức vận động và bệnh nền của bé. Hãy đổi thức ăn từ từ, luôn có nước sạch và không cho bé ăn thực phẩm độc với chó mèo như chocolate, hành, tỏi hoặc nho. Nếu cần chế độ ăn điều trị, hãy hỏi bác sĩ thú y.';
  }
  if (containsAny(question, ['bao lau', 'mat bao lau', 'thoi gian spa', 'thoi luong'])) {
    return `Thời lượng phụ thuộc vào dịch vụ cụ thể. ${services.slice(0, 5).map((service) => `${service.service_name}: khoảng ${service.duration_minutes} phút`).join('; ')}. Bạn mở thẻ dịch vụ để xem thời lượng chính xác trước khi chọn khung giờ.`;
  }
  if (containsAny(question, ['dat lai', 'dat cho hai be', 'nhieu thu cung', '2 be', 'hai be'])) {
    return 'Bạn có thể tạo nhiều hồ sơ thú cưng trong cùng tài khoản. Khi đặt lịch, hãy chọn đúng hồ sơ cho từng lượt đặt; hệ thống sẽ kiểm tra sức chứa riêng theo khung giờ và nhóm dịch vụ. Nếu đặt cho nhiều bé, bạn nên kiểm tra từng lượt để tránh trùng hoặc hết chỗ.';
  }
  if (containsAny(question, ['cho', 'meo', 'thu cung', 'be cung', 'cach cham soc'])) {
    return 'Pet Phết phục vụ cả chó và mèo. Bạn nên tạo hồ sơ riêng cho từng bé, cập nhật cân nặng và lưu ý sức khỏe; khi chọn dịch vụ, hệ thống sẽ hiển thị nhóm thú cưng được tiếp nhận.';
  }

  const topicHints = ['giá và bảng giá', 'dịch vụ spa/grooming/thú y', 'đặt lịch và đổi/hủy lịch', 'COD/QR', 'hồ sơ thú cưng', 'đánh giá và Pet Point', 'giờ làm việc và liên hệ'];
  return `Mình chưa nắm rõ ý bạn ở câu “${rawQuestion.trim()}”. Bạn có thể hỏi cụ thể hơn về ${topicHints.join(', ')}. Nếu bạn mô tả tên dịch vụ hoặc vấn đề đang gặp, mình sẽ tìm thông tin phù hợp trong dữ liệu Pet Phết nhé.`;
}

export const ChatbotDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: 'Gâu gâu! Cún Phết xin chào bạn và bé cưng. 🐾 Mình có thể tư vấn dịch vụ, giá, đặt lịch, thanh toán, hồ sơ thú cưng và Pet Point. Bạn cứ hỏi bằng cách diễn đạt tự nhiên nhé!',
      time: 'Vừa xong'
    }
  ]);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const serviceCatalog = useMemo(() => store.getServices(true), []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping, isOpen]);

  const handleSend = (suggestedText?: string) => {
    const text = (suggestedText ?? input).trim();
    if (!text || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: getTime()
    };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsTyping(true);

    window.setTimeout(() => {
      const reply = buildAssistantReply(text, serviceCatalog);
      setMessages((current) => [...current, {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: reply,
        time: getTime()
      }]);
      setIsTyping(false);
    }, 420);
  };

  return (
    <>
      <div className="pet-chatbot-float fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {!isOpen && (
          <div className="hidden sm:block bg-white text-[#81451F] text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-[#EDC55B]">
            Cún Phết đang trực tuyến 🐾
          </div>
        )}
        <button
          onClick={() => setIsOpen((value) => !value)}
          aria-label="Mở khung trò chuyện hỗ trợ"
          className="pet-chatbot-launcher relative shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <img src={ASSETS.chatbotDog} alt="Cún Phết – trợ lý hỗ trợ Pet Phết" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#66BCB4] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#66BCB4] border border-white"></span>
          </span>
        </button>
      </div>

      {isOpen && (
        <section className="pet-chatbot-drawer fixed bottom-24 right-6 w-[92vw] max-w-md h-[min(620px,calc(100dvh-120px))] bg-white rounded-3xl shadow-2xl border-2 border-[#E8CCAD] z-50 flex flex-col overflow-hidden" aria-label="Trợ lý Cún Phết" aria-live="polite">
          <header className="bg-gradient-to-r from-[#EC802B] to-[#EDC55B] px-5 py-4 text-white flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#FAF6F0] border border-white/50 shrink-0 flex items-center justify-center">
                <img src={ASSETS.chatbotDog} alt="Cún Phết" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base tracking-wide flex items-center gap-1.5 font-heading">Cún Phết <Sparkles className="w-4 h-4 text-yellow-200" /></h3>
                <p className="text-xs text-orange-100 font-medium">Trợ lý thông tin Pet Phết</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/90 hover:text-white p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer" aria-label="Đóng khung chat">
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="bg-[#FAF6F0] px-3 py-2 border-b border-[#E8CCAD] flex gap-2 overflow-x-auto no-scrollbar text-xs shrink-0">
            {QUICK_PROMPTS.map((prompt) => (
              <button key={prompt} onClick={() => handleSend(prompt)} disabled={isTyping} className="whitespace-nowrap bg-white border border-[#E8CCAD] text-[#81451F] hover:bg-[#FDE8D7] disabled:opacity-50 px-3 py-2 rounded-full font-semibold transition-colors cursor-pointer">
                {prompt}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3 bg-[#FFFAF4]">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-2.5 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.sender === 'bot' && (
                  <div className="w-9 h-9 rounded-xl overflow-hidden bg-white border border-[#E8CCAD] shrink-0 mt-0.5 flex items-center justify-center">
                    <img src={ASSETS.chatbotDog} alt="Cún Phết" className="w-full h-full object-contain" />
                  </div>
                )}
                <div className={`max-w-[84%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${message.sender === 'user' ? 'bg-[#EC802B] text-white rounded-br-sm' : 'bg-white text-[#71421F] border border-[#E8CCAD] rounded-bl-sm'}`}>
                  <p className="whitespace-pre-line">{message.text}</p>
                  <span className={`block text-[10px] mt-1 text-right ${message.sender === 'user' ? 'text-orange-100' : 'text-neutral-400'}`}>{message.time}</span>
                </div>
              </div>
            ))}
            {isTyping && <div className="text-xs text-[#8B684A] pl-12">Cún Phết đang soạn câu trả lời…</div>}
            <div ref={messageEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-[#E8CCAD] flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') handleSend(); }}
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 min-w-0 bg-[#FAF6F0] border border-[#E8CCAD] rounded-full px-4 py-3 text-sm text-[#81451F] focus:outline-none focus:ring-2 focus:ring-[#EC802B]"
            />
            <button onClick={() => handleSend()} disabled={!input.trim() || isTyping} className="w-11 h-11 rounded-full bg-[#EC802B] hover:bg-[#D46917] disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0" aria-label="Gửi tin nhắn">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[10px] text-center text-[#9A7C62] pb-2 bg-white">Trợ lý tự động theo dữ liệu website · Không thay thế tư vấn thú y</div>
        </section>
      )}
    </>
  );
};
