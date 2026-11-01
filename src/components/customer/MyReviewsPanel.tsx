import React, { useEffect, useState } from 'react';
import { Edit3, MessageSquareQuote, Save, Star, Trash2, X } from 'lucide-react';
import { store } from '../../services/store';
import { notifyToast } from '../../utils/toast';
import { Review, UserProfile } from '../../types';

interface MyReviewsPanelProps {
  currentUser: UserProfile;
}

export const MyReviewsPanel: React.FC<MyReviewsPanelProps> = ({ currentUser }) => {
  const [, setRevision] = useState(0);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => store.subscribe(() => setRevision((value) => value + 1)), []);
  const reviews = store.getReviewsByUser(currentUser.id);

  const beginEdit = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
    setMessage('');
  };

  const saveEdit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingReview) return;
    const result = store.updateReview({ reviewId: editingReview.id, userId: currentUser.id, rating, comment });
    setMessage(result.message);
    notifyToast(result.success ? 'success' : 'error', result.message);
    if (result.success) setEditingReview(null);
  };

  const removeReview = (review: Review) => {
    const accepted = window.confirm(`Bạn có chắc muốn xóa đánh giá cho dịch vụ ${store.getServiceById(review.service_id)?.service_name || ''}? Điểm thưởng đã nhận sẽ được điều chỉnh lại.`);
    if (!accepted) return;
    const result = store.deleteReview(review.id, currentUser.id);
    setMessage(result.message);
    notifyToast(result.success ? 'success' : 'error', result.message);
  };

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#EC802B]">GÓC CHIA SẺ</span>
          <h2 className="text-2xl font-black text-[#81451F] mt-1">Đánh giá của tôi</h2>
          <p className="text-xs text-neutral-500 mt-1">Bạn có thể chỉnh sửa hoặc xóa đánh giá đã gửi.</p>
        </div>
        <span className="rounded-full bg-[#FFF4E5] border border-[#E8CCAD] px-3 py-1.5 text-xs font-bold text-[#81451F]">{reviews.length} đánh giá</span>
      </div>

      {message && <p className="mb-3 rounded-xl bg-[#FFF4E5] border border-[#E8CCAD] px-4 py-3 text-xs text-[#81451F]">{message}</p>}

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E8CCAD] bg-white/70 p-6 text-center text-sm text-neutral-500">
          <MessageSquareQuote className="mx-auto mb-2 text-[#EDC55B]" /> Bạn chưa gửi đánh giá nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-[#E8CCAD] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-[#81451F]">{store.getServiceById(review.service_id)?.service_name || 'Dịch vụ Pet Phết'}</h3>
                  <p className="text-[11px] text-neutral-400 mt-1">Bé {review.pet_name} · {new Date(review.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#FFF4E5] px-2.5 py-1 text-[11px] font-bold text-[#A66A20]">+{review.points_awarded.toLocaleString('vi-VN')} điểm</span>
              </div>
              <div className="flex gap-0.5 mt-3 text-[#EC802B]">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} fill={index < review.rating ? 'currentColor' : 'none'} />)}</div>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">{review.comment}</p>
              {review.admin_reply && <div className="mt-3 rounded-xl bg-[#F0F9F7] border border-[#CDE8E4] p-3 text-xs text-[#356E69]"><b>Pet Phết phản hồi:</b> {review.admin_reply}</div>}
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[#FAF0E4]">
                <button onClick={() => beginEdit(review)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8CCAD] px-3 py-2 text-xs font-bold text-[#81451F] hover:bg-[#FFF4E5]"><Edit3 size={14} /> Chỉnh sửa</button>
                <button onClick={() => removeReview(review)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"><Trash2 size={14} /> Xóa</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editingReview && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={saveEdit} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#E8CCAD]">
            <div className="flex items-center justify-between mb-4">
              <div><h3 className="text-xl font-black text-[#81451F]">Chỉnh sửa đánh giá</h3><p className="text-xs text-neutral-500 mt-1">{store.getServiceById(editingReview.service_id)?.service_name || 'Dịch vụ Pet Phết'}</p></div>
              <button type="button" onClick={() => setEditingReview(null)} aria-label="Đóng" className="p-2 rounded-xl hover:bg-[#FFF4E5]"><X size={20} /></button>
            </div>
            <label className="block text-xs font-bold text-[#81451F]">Số sao</label>
            <div className="flex gap-2 my-2">{[1,2,3,4,5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} sao`} className="p-1"><Star size={25} fill={value <= rating ? '#EC802B' : 'none'} color="#EC802B" /></button>)}</div>
            <label className="block text-xs font-bold text-[#81451F] mt-4">Nhận xét<textarea rows={4} required value={comment} onChange={(event) => setComment(event.target.value)} className="mt-2 w-full rounded-xl border border-[#E8CCAD] p-3 text-sm outline-none focus:ring-2 focus:ring-[#EC802B]" /></label>
            <div className="flex justify-end gap-2 mt-5"><button type="button" onClick={() => setEditingReview(null)} className="rounded-xl px-4 py-2.5 text-xs font-bold border border-[#E8CCAD] text-[#81451F]">Hủy</button><button type="submit" className="rounded-xl px-4 py-2.5 text-xs font-bold bg-[#EC802B] text-white inline-flex items-center gap-2"><Save size={15} /> Lưu thay đổi</button></div>
          </form>
        </div>
      )}
    </section>
  );
};
