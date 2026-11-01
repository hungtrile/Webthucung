import React, { useState } from 'react';
import {
  PawPrint,
  Plus,
  Edit2,
  EyeOff,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  Scale,
  HeartPulse,
  ShieldAlert
} from 'lucide-react';
import { store } from '../../services/store';
import { notifyToast } from '../../utils/toast';
import { Pet, PetGender, PetSpecies, UserProfile } from '../../types';

interface PetManagementPageProps {
  currentUser: UserProfile;
  onNavigateToBookingWithPet?: (petId: string) => void;
}

export const PetManagementPage: React.FC<PetManagementPageProps> = ({
  currentUser,
  onNavigateToBookingWithPet
}) => {
  const userPets = store.getPetsByUser(currentUser.id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

  // Form states
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState<PetSpecies>('Chó');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<PetGender>('Chưa xác định');
  const [birthDate, setBirthDate] = useState('2024-01-01');
  const [weight, setWeight] = useState<number>(4.0);
  const [healthStatus, setHealthStatus] = useState('');
  const [vaccinationHistory, setVaccinationHistory] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const reportMessage = (type: 'success' | 'error', text: string) => { setMessage({ type, text }); notifyToast(type, text); };

  const openAddModal = () => {
    setEditingPet(null);
    setPetName('');
    setSpecies('Chó');
    setBreed('');
    setGender('Chưa xác định');
    setBirthDate('2024-01-01');
    setWeight(4.0);
    setHealthStatus('');
    setVaccinationHistory('');
    setNotes('');
    setAvatarUrl('https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=300&q=80');
    setMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (pet: Pet) => {
    setEditingPet(pet);
    setPetName(pet.pet_name);
    setSpecies(pet.species);
    setBreed(pet.breed || '');
    setGender(pet.gender);
    setBirthDate(pet.birth_date || '2024-01-01');
    setWeight(pet.weight || 4.0);
    setHealthStatus(pet.health_status || '');
    setVaccinationHistory(pet.vaccination_history || '');
    setNotes(pet.notes || '');
    setAvatarUrl(pet.avatar_url || '');
    setMessage(null);
    setIsModalOpen(true);
  };

  const handleSavePet = (e: React.FormEvent) => {
    e.preventDefault();

    if (!petName.trim()) {
      reportMessage('error', 'Tên thú cưng là bắt buộc.');
      return;
    }
    if (weight <= 0) {
      reportMessage('error', 'Cân nặng phải lớn hơn 0 kg.');
      return;
    }

    if (editingPet) {
      const res = store.updatePet(editingPet.id, {
        pet_name: petName,
        species,
        breed,
        gender,
        birth_date: birthDate,
        weight: Number(weight),
        health_status: healthStatus,
        vaccination_history: vaccinationHistory,
        notes,
        avatar_url: avatarUrl
      });
      reportMessage(res.success ? 'success' : 'error', res.message);
      if (res.success) {
        setTimeout(() => setIsModalOpen(false), 900);
      }
    } else {
      store.addPet({
        user_id: currentUser.id,
        pet_name: petName,
        species,
        breed,
        gender,
        birth_date: birthDate,
        weight: Number(weight),
        health_status: healthStatus,
        vaccination_history: vaccinationHistory,
        notes,
        avatar_url: avatarUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80'
      });
      reportMessage('success', `Thêm hồ sơ bé ${petName} thành công!`);
      setTimeout(() => setIsModalOpen(false), 900);
    }
  };

  const handleHidePet = (pet: Pet) => {
    if (!confirm(`Bạn có chắc chắn muốn ẩn hồ sơ của bé ${pet.pet_name}? Lịch sử dịch vụ đã xong vẫn được lưu trữ.`)) {
      return;
    }
    const res = store.hidePet(pet.id);
    reportMessage(res.success ? 'success' : 'error', res.message);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#EC802B]">
            Quản lý gia đình thú cưng
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#81451F] font-heading mt-1">
            Hồ Sơ Thú Cưng Của Bạn
          </h1>
          <p className="text-sm text-neutral-600 mt-1 font-vietnamese">
            Lưu giữ thông tin cân nặng, lịch tiêm phòng và lưu ý chăm sóc để chuyên viên phục vụ bé chu đáo nhất.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 rounded-2xl bg-[#EC802B] hover:bg-[#D46917] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Thêm hồ sơ thú cưng
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-2xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Pets List */}
      {userPets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-[#E8CCAD] p-8">
          <PawPrint className="w-16 h-16 text-[#EDC55B] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#81451F] font-heading">
            Chưa có hồ sơ thú cưng nào
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Hãy thêm hồ sơ của bé cưng để đặt lịch spa, tiêm phòng và nhận tư vấn chăm sóc phù hợp nhé!
          </p>
          <button
            onClick={openAddModal}
            className="mt-5 px-6 py-2.5 bg-[#EC802B] text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
          >
            + Thêm bé ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userPets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-3xl border-2 border-[#E8CCAD] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Card */}
                <div className="p-5 pb-4 flex items-center gap-4 border-b border-[#FAF6F0]">
                  <img
                    src={pet.avatar_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80'}
                    alt={pet.pet_name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#EDC55B] shadow-2xs"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-xl text-[#81451F] font-heading truncate">
                        {pet.pet_name}
                      </h3>
                      <span className="text-[11px] bg-[#FAF6F0] text-[#EC802B] font-bold px-2 py-0.5 rounded-full border border-[#E8CCAD]">
                        {pet.species}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 truncate mt-0.5">
                      {pet.breed || 'Chưa cập nhật giống'} • {pet.gender}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8CCAD]/60">
                      <span className="text-neutral-400 text-[10px] block font-semibold">CÂN NẶNG</span>
                      <span className="font-black text-sm text-[#81451F] flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-[#EC802B]" /> {pet.weight} kg
                      </span>
                      {pet.weight_updated_at && (
                        <span className="text-[9px] text-neutral-400 block mt-0.5">
                          Cập nhật: {new Date(pet.weight_updated_at).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8CCAD]/60">
                      <span className="text-neutral-400 text-[10px] block font-semibold">NGÀY SINH</span>
                      <span className="font-bold text-xs text-[#81451F] flex items-center gap-1 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-[#66BCB4]" />
                        {pet.birth_date ? new Date(pet.birth_date).toLocaleDateString('vi-VN') : 'Chưa rõ'}
                      </span>
                    </div>
                  </div>

                  {pet.health_status && (
                    <div className="p-2.5 rounded-xl bg-[#FCF5DC]/50 border border-[#EDC55B]/40 text-neutral-700">
                      <strong className="text-[10px] text-[#81451F] block uppercase font-bold">
                        Sức khỏe:
                      </strong>
                      <p className="text-[11px] mt-0.5">{pet.health_status}</p>
                    </div>
                  )}

                  {pet.vaccination_history && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/50 text-neutral-700">
                      <strong className="text-[10px] text-emerald-800 block uppercase font-bold">
                        Tiêm chủng:
                      </strong>
                      <p className="text-[11px] mt-0.5">{pet.vaccination_history}</p>
                    </div>
                  )}

                  {pet.notes && (
                    <div className="text-[11px] text-neutral-500 italic">
                      Ghi chú: "{pet.notes}"
                    </div>
                  )}

                  {(() => {
                    const completedHistory = store.getCompletedBookingsByPet(pet.id, currentUser.id);
                    return completedHistory.length > 0 ? (
                      <div className="p-2.5 rounded-xl bg-[#F0F9F7] border border-[#CDE8E4] text-neutral-700">
                        <strong className="text-[10px] text-[#356E69] block uppercase font-bold">Lịch sử dịch vụ hoàn thành</strong>
                        <div className="mt-1.5 space-y-1.5">
                          {completedHistory.slice(0, 3).map((booking) => (
                            <div key={booking.id} className="flex justify-between gap-2 text-[10px]">
                              <span className="font-semibold">{booking.service_name}</span>
                              <span className="shrink-0 text-neutral-500">{new Date(booking.booking_date).toLocaleDateString('vi-VN')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-[#FAF6F0] border-t border-[#E8CCAD] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(pet)}
                    className="p-2 rounded-xl text-neutral-600 hover:text-[#EC802B] hover:bg-white transition-colors cursor-pointer"
                    title="Chỉnh sửa thông tin"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleHidePet(pet)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
                    title="Ẩn hồ sơ bé"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => onNavigateToBookingWithPet?.(pet.id)}
                  className="px-4 py-2 rounded-xl bg-[#EC802B] hover:bg-[#D46917] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" /> Đặt lịch cho bé
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT PET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-[#E8CCAD] overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-[#FCF5DC] border-b border-[#E8CCAD] flex items-center justify-between shrink-0">
              <h3 className="font-black text-xl text-[#81451F] font-heading">
                {editingPet ? `Chỉnh sửa hồ sơ: ${editingPet.pet_name}` : 'Thêm hồ sơ thú cưng mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-[#81451F] hover:bg-white/80 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePet} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#81451F] mb-1">
                    Tên thú cưng *
                  </label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="Bánh Mì, Mây Mây..."
                    className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-sm text-[#81451F] focus:outline-none focus:ring-2 focus:ring-[#EC802B]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#81451F] mb-1">
                    Loài thú cưng *
                  </label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value as PetSpecies)}
                    className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-sm text-[#81451F] focus:outline-none focus:ring-2 focus:ring-[#EC802B]"
                  >
                    <option value="Chó">Chó</option>
                    <option value="Mèo">Mèo</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#81451F] mb-1">Giống</label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="Poodle, Anh lông ngắn..."
                    className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-sm text-[#81451F] focus:outline-none focus:ring-2 focus:ring-[#EC802B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#81451F] mb-1">Giới tính</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as PetGender)}
                    className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-sm text-[#81451F] focus:outline-none focus:ring-2 focus:ring-[#EC802B]"
                  >
                    <option value="Đực">Đực</option>
                    <option value="Cái">Cái</option>
                    <option value="Chưa xác định">Chưa xác định</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#81451F] mb-1">
                    Cân nặng (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-sm text-[#81451F] focus:outline-none focus:ring-2 focus:ring-[#EC802B]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#81451F] mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-sm text-[#81451F] focus:outline-none focus:ring-2 focus:ring-[#EC802B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-1">
                  Tình trạng sức khỏe (chủ nuôi cung cấp)
                </label>
                <input
                  type="text"
                  value={healthStatus}
                  onChange={(e) => setHealthStatus(e.target.value)}
                  placeholder="Khỏe mạnh, da hơi ngứa, tai sạch..."
                  className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-sm text-[#81451F] focus:outline-none focus:ring-2 focus:ring-[#EC802B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-1">
                  Lịch sử tiêm phòng (chủ nuôi cung cấp)
                </label>
                <input
                  type="text"
                  value={vaccinationHistory}
                  onChange={(e) => setVaccinationHistory(e.target.value)}
                  placeholder="Đã tiêm 3 mũi, dại định kỳ 2025..."
                  className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-sm text-[#81451F] focus:outline-none focus:ring-2 focus:ring-[#EC802B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-1">Ghi chú riêng</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Bé hơi nhát nước, thích khen ngoan, vuốt cằm..."
                  className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-sm text-[#81451F] focus:outline-none focus:ring-2 focus:ring-[#EC802B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#81451F] mb-1">
                  Ảnh đại diện thú cưng (URL)
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#FAF6F0] border border-[#E8CCAD] rounded-xl px-3 py-2 text-xs text-[#81451F] focus:outline-none focus:ring-2 focus:ring-[#EC802B]"
                />
              </div>

              <div className="pt-3 border-t border-[#E8CCAD] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#EC802B] hover:bg-[#D46917] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {editingPet ? 'Lưu thay đổi' : 'Thêm hồ sơ bé'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
