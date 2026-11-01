export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export type PetSpecies = 'Chó' | 'Mèo' | 'Khác';
export type PetGender = 'Đực' | 'Cái' | 'Chưa xác định';

export interface Pet {
  id: string;
  user_id: string;
  pet_name: string;
  species: PetSpecies;
  breed: string;
  gender: PetGender;
  birth_date: string;
  weight: number; // in kg
  weight_updated_at?: string;
  notes?: string;
  health_status?: string;
  vaccination_history?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
}

export interface ServicePricingTier {
  id: string;
  service_id: string;
  min_weight: number;
  max_weight: number;
  price: number;
}

export interface Service {
  id: string;
  category_id: string;
  service_name: string;
  description: string;
  base_price: number;
  is_weight_based: boolean;
  pricing_tiers?: ServicePricingTier[];
  duration_minutes: number;
  species_supported: PetSpecies[];
  image_url: string;
  is_active: boolean;
  rating_avg: number;
  rating_count: number;
  created_at: string;
}

export interface WorkingSchedule {
  id: string;
  work_date: string; // YYYY-MM-DD
  start_time: string; // e.g. "08:00"
  end_time: string;   // e.g. "20:00"
  is_available: boolean;
  max_concurrent_capacity: number;
  slot_duration_minutes: number;
  notes?: string;
}

export interface TimeSlot {
  id: string;
  schedule_id: string;
  time: string; // e.g. "09:00"
  capacity: number;
  booked_count: number;
  status: 'available' | 'busy' | 'locked';
}

export type BookingStatus = 
  | 'pending'       // Chờ xác nhận
  | 'confirmed'     // Đã xác nhận
  | 'in_progress'   // Đang phục vụ
  | 'completed'     // Hoàn thành
  | 'cancelled'     // Đã hủy
  | 'no_show';      // Khách vắng

export type PaymentMethod = 'COD' | 'QR';

export type PaymentStatus = 
  | 'unpaid'        // Chưa thanh toán
  | 'pending_reconcile' // Chờ đối chiếu (sau khi khách chuyển khoản QR)
  | 'paid'          // Đã thanh toán (xác nhận)
  | 'failed'        // Thất bại
  | 'refunded';     // Đã hoàn tiền

export interface Booking {
  id: string; // e.g. "BK-2610-001"
  user_id: string;
  user_name: string;
  user_phone: string;
  user_email: string;
  pet_id: string;
  pet_name: string;
  pet_species: PetSpecies;
  pet_weight: number;
  service_id: string;
  service_name: string;
  booking_date: string; // YYYY-MM-DD
  booking_time: string; // HH:mm
  duration_minutes: number;
  end_time: string;     // HH:mm
  original_price: number;
  discount_amount: number;
  total_amount: number;
  coupon_code?: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: BookingStatus;
  customer_note?: string;
  admin_note?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  completed_at?: string;
  hold_expires_at?: string; // hold duration timestamp for QR
  is_reviewed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_reference: string;
  account_number: string;
  bank_name: string;
  account_holder: string;
  transfer_content: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  service_id: string;
  user_id: string;
  user_name: string;
  pet_name: string;
  rating: number; // 1 to 5
  comment: string;
  image_url?: string;
  admin_reply?: string;
  admin_replied_at?: string;
  points_awarded: number;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number; // percentage (0-100) or fixed amount in VND
  min_order_value: number;
  max_discount_amount?: number;
  is_active: boolean;
  expires_at: string;
  usage_limit: number;
  used_count: number;
  description: string;
}

export interface PetPointTransaction {
  id: string;
  user_id: string;
  amount: number; // e.g. +1000
  type: 'earn_review' | 'system_adjustment';
  reference_id: string; // booking_id or review_id
  description: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id?: string; // empty/null for admin notifications
  target_role: 'customer' | 'admin' | 'all';
  title: string;
  content: string;
  type: 'booking' | 'payment' | 'review' | 'points' | 'promotion' | 'system';
  is_read: boolean;
  created_at: string;
}
