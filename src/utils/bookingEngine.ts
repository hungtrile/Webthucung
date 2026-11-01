import { Booking, Coupon, Service, ServicePricingTier } from '../types';

/**
 * Converts "HH:mm" to minutes from start of day.
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

/**
 * Converts minutes from start of day back to "HH:mm".
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Calculates end time string "HH:mm" from a start time and duration in minutes.
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMin = timeToMinutes(startTime);
  return minutesToTime(startMin + durationMinutes);
}

/**
 * Checks if two time intervals [startA, endA) and [startB, endB) overlap.
 */
export function isOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);
  return Math.max(sA, sB) < Math.min(eA, eB);
}

/**
 * Checks capacity throughout the ENTIRE duration of a proposed booking.
 * Returns true if at all 15-minute slices during [startTime, endTime) concurrent active bookings < maxCapacity.
 */
export function checkContinuousCapacity(
  date: string,
  startTime: string,
  durationMinutes: number,
  existingBookings: Booking[],
  maxCapacity: number,
  excludeBookingId?: string
): { isAvailable: boolean; maxConcurrentFound: number; reason?: string } {
  const startMin = timeToMinutes(startTime);
  const endMin = startMin + durationMinutes;

  // Filter existing active bookings for that date
  const activeBookings = existingBookings.filter(
    (b) =>
      b.booking_date === date &&
      b.id !== excludeBookingId &&
      ['pending', 'confirmed', 'in_progress'].includes(b.status)
  );

  let maxConcurrent = 0;

  // Check every 15-minute slice within the proposed duration
  for (let t = startMin; t < endMin; t += 15) {
    let concurrentAtSlice = 0;
    for (const b of activeBookings) {
      const bStart = timeToMinutes(b.booking_time);
      const bEnd = timeToMinutes(b.end_time || calculateEndTime(b.booking_time, b.duration_minutes));
      if (t >= bStart && t < bEnd) {
        concurrentAtSlice++;
      }
    }
    if (concurrentAtSlice > maxConcurrent) {
      maxConcurrent = concurrentAtSlice;
    }
    if (concurrentAtSlice >= maxCapacity) {
      return {
        isAvailable: false,
        maxConcurrentFound: concurrentAtSlice,
        reason: `Khung giờ ${minutesToTime(t)} - ${minutesToTime(t + 15)} đã đạt sức chứa tối đa (${concurrentAtSlice}/${maxCapacity} chỗ). Vui lòng chọn khung giờ khác.`
      };
    }
  }

  return {
    isAvailable: true,
    maxConcurrentFound: maxConcurrent
  };
}

/**
 * Calculates price based on pet weight for weight-dependent services.
 */
export function calculateServicePrice(
  service: Service,
  petWeightKg: number
): number {
  if (!service.is_weight_based || !service.pricing_tiers || service.pricing_tiers.length === 0) {
    return service.base_price;
  }

  // Find matching tier
  const matchedTier = service.pricing_tiers.find(
    (tier) => petWeightKg >= tier.min_weight && petWeightKg < tier.max_weight
  );

  if (matchedTier) {
    return matchedTier.price;
  }

  // Fallback to highest tier if over max, or base price
  const highestTier = [...service.pricing_tiers].sort((a, b) => b.max_weight - a.max_weight)[0];
  if (highestTier && petWeightKg >= highestTier.max_weight) {
    return highestTier.price;
  }

  return service.base_price;
}

/**
 * Applies a coupon code and calculates discount + final amount.
 */
export function applyCouponDiscount(
  originalPrice: number,
  coupon?: Coupon | null
): { discountAmount: number; finalTotal: number; isValid: boolean; message: string } {
  if (!coupon) {
    return {
      discountAmount: 0,
      finalTotal: originalPrice,
      isValid: true,
      message: ''
    };
  }

  if (!coupon.is_active) {
    return {
      discountAmount: 0,
      finalTotal: originalPrice,
      isValid: false,
      message: 'Mã giảm giá đã tạm khóa hoặc hết hiệu lực.'
    };
  }

  const now = new Date().toISOString();
  if (coupon.expires_at && coupon.expires_at < now) {
    return {
      discountAmount: 0,
      finalTotal: originalPrice,
      isValid: false,
      message: 'Mã giảm giá đã hết hạn sử dụng.'
    };
  }

  if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
    return {
      discountAmount: 0,
      finalTotal: originalPrice,
      isValid: false,
      message: 'Mã giảm giá đã đạt giới hạn số lượt sử dụng.'
    };
  }

  if (originalPrice < coupon.min_order_value) {
    return {
      discountAmount: 0,
      finalTotal: originalPrice,
      isValid: false,
      message: `Đơn dịch vụ tối thiểu ${coupon.min_order_value.toLocaleString('vi-VN')}đ để sử dụng mã này.`
    };
  }

  let discount = 0;
  if (coupon.discount_type === 'percent') {
    discount = Math.round((originalPrice * coupon.discount_value) / 100);
    if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
      discount = coupon.max_discount_amount;
    }
  } else {
    discount = coupon.discount_value;
  }

  // Total can never be negative
  const finalTotal = Math.max(0, originalPrice - discount);

  return {
    discountAmount: Math.min(discount, originalPrice),
    finalTotal,
    isValid: true,
    message: `Áp dụng thành công mã ${coupon.code}!`
  };
}

/**
 * Pet point calculation rule:
 * Customer receives exactly 1,000 Pet Points for each valid, completed review.
 */
export const PET_POINT_REVIEW_REWARD = 1000;

export function canAwardReviewPoints(booking: Booking, hasExistingReview: boolean): boolean {
  return booking.status === 'completed' && !hasExistingReview && !booking.is_reviewed;
}

/**
 * Format currency helper in VND
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}
