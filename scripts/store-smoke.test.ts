import test from 'node:test';
import assert from 'node:assert/strict';

const localStorageData = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => localStorageData.get(key) ?? null,
    setItem: (key: string, value: string) => localStorageData.set(key, String(value)),
    removeItem: (key: string) => localStorageData.delete(key)
  }
});

const { store } = await import('../src/services/store');

function localDatePlus(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}


test('Customer cannot promote their own session to Admin', () => {
  const customer = store.getUserByIdentity('khachhang@petphet.vn')!;
  store.setCurrentUser(customer);
  assert.throws(() => store.switchRole('admin'), /Không thể tự chuyển vai trò/);
  assert.equal(store.getCurrentUser().role, 'customer');
});

test('StoreService booking, QR reconciliation, capacity, review reward and expiry flow', () => {
  const customer = store.getCurrentUser();
  assert.equal(customer.role, 'customer');
  const pet = store.getPetsByUser(customer.id)[0];
  assert.ok(pet);
  const initialPoints = store.getUserPetPoints(customer.id);
  const bookingDate = localDatePlus(5);

  store.setCurrentUser(store.getUserByIdentity('admin@petphet.vn')!);
  store.updateSchedule(bookingDate, {
    start_time: '08:00', end_time: '20:00', is_available: true,
    max_concurrent_capacity: 1, slot_duration_minutes: 30
  });
  store.setCurrentUser(store.getUserByIdentity('khachhang@petphet.vn')!);

  const bookingResult = store.createBooking({
    userId: customer.id, petId: pet.id, serviceId: 'srv-spa-01',
    bookingDate, bookingTime: '09:00', confirmedWeight: pet.weight,
    couponCode: 'PETFIRST50K', paymentMethod: 'QR'
  });
  assert.equal(bookingResult.success, true);
  assert.ok(bookingResult.booking && bookingResult.payment);
  const booking = bookingResult.booking!;
  const payment = bookingResult.payment!;

  assert.equal(store.submitQrTransfer(booking.id).success, true);
  assert.equal(store.cancelBooking(booking.id, customer.id, 'Thử hủy đơn QR').success, false);
  store.setCurrentUser(store.getUserByIdentity('admin@petphet.vn')!);
  assert.equal(store.updateBookingStatus(booking.id, 'confirmed').success, false);
  assert.equal(store.updateBookingStatus(booking.id, 'cancelled').success, false);
  assert.equal(store.reconcilePayment(payment.id, true, store.getCurrentUser().id).success, true);
  assert.equal(store.getBookingById(booking.id)?.status, 'confirmed');

  store.setCurrentUser(store.getUserByIdentity('khachhang@petphet.vn')!);
  const overlappingBooking = store.createBooking({
    userId: customer.id, petId: pet.id, serviceId: 'srv-spa-01',
    bookingDate, bookingTime: '09:00', confirmedWeight: pet.weight,
    paymentMethod: 'COD'
  });
  assert.equal(overlappingBooking.success, false);

  store.setCurrentUser(store.getUserByIdentity('admin@petphet.vn')!);
  assert.equal(store.updateBookingStatus(booking.id, 'in_progress').success, true);
  assert.equal(store.updateBookingStatus(booking.id, 'completed').success, true);
  store.setCurrentUser(store.getUserByIdentity('khachhang@petphet.vn')!);

  const codDate = localDatePlus(7);
  const codBooking = store.createBooking({
    userId: customer.id, petId: pet.id, serviceId: 'srv-vet-01',
    bookingDate: codDate, bookingTime: '11:00', paymentMethod: 'COD'
  });
  assert.equal(codBooking.success, true);
  store.setCurrentUser(store.getUserByIdentity('admin@petphet.vn')!);
  assert.equal(store.updateBookingStatus(codBooking.booking!.id, 'confirmed').success, true);
  assert.equal(store.updateBookingStatus(codBooking.booking!.id, 'in_progress').success, true);
  assert.equal(store.updateBookingStatus(codBooking.booking!.id, 'completed').success, true);
  assert.equal(store.getBookingById(codBooking.booking!.id)?.payment_status, 'paid');
  assert.equal(store.getPayments().find((item) => item.booking_id === codBooking.booking!.id)?.payment_status, 'paid');
  store.setCurrentUser(store.getUserByIdentity('khachhang@petphet.vn')!);

  const reviewResult = store.createReview({
    bookingId: booking.id, userId: customer.id,
    rating: 5, comment: 'Dịch vụ tốt, bé được chăm sóc chu đáo.'
  });
  assert.equal(reviewResult.success, true);
  assert.equal(store.getUserPetPoints(customer.id), initialPoints + 1000);
  assert.equal(store.updateReview({
    reviewId: reviewResult.review!.id, userId: customer.id,
    rating: 4, comment: 'Cập nhật đánh giá.'
  }).success, true);
  assert.equal(store.deleteReview(reviewResult.review!.id, customer.id).success, true);
  assert.equal(store.getUserPetPoints(customer.id), initialPoints);

  const expiredBookingResult = store.createBooking({
    userId: customer.id, petId: pet.id, serviceId: 'srv-spa-01',
    bookingDate: localDatePlus(6), bookingTime: '10:00',
    confirmedWeight: pet.weight, paymentMethod: 'QR'
  });
  assert.equal(expiredBookingResult.success, true);
  expiredBookingResult.booking!.hold_expires_at = new Date(Date.now() - 1000).toISOString();
  store.processExpiredQrBookings();
  assert.equal(store.getBookingById(expiredBookingResult.booking!.id)?.status, 'cancelled');
  assert.equal(store.getBookingById(expiredBookingResult.booking!.id)?.payment_status, 'failed');
});
