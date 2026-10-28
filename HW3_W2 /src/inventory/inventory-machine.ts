
export type ReservationStatus = 'reserved' | 'expired' | 'checked-out';

export interface Reservation {
  readonly id: string;
  readonly customerId: string;
  readonly quantity: number;
  readonly expiresAt: number;
  status: ReservationStatus;
}

export class InventoryMachine {
  private stock: number;
  private readonly reservations = new Map<string, Reservation>();
  private nextReservationId = 1;

  constructor(initialStock: number) {
    if (!Number.isSafeInteger(initialStock) || initialStock < 0) {
      throw new RangeError(
        'Initial stock must be a non-negative safe integer.',
      );
    }

    this.stock = initialStock;
  }

  get availableStock(): number {
    return this.stock;
  }

  reserve(
    customerId: string,
    quantity: number,
    ttlMs = 5 * 60 * 1000,
  ): Reservation {
    if (!customerId.trim()) {
      throw new Error('Customer ID is required.');
    }

    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new RangeError('Quantity must be a positive safe integer.');
    }

    if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
      throw new RangeError('Reservation TTL must be a positive finite number.');
    }

    this.expireDueReservations();

    if (quantity > this.stock) {
      throw new Error('Insufficient inventory.');
    }

    const reservation: Reservation = {
      id: `reservation-${this.nextReservationId++}`,
      customerId,
      quantity,
      expiresAt: Date.now() + ttlMs,
      status: 'reserved',
    };

    this.stock -= quantity;
    this.reservations.set(reservation.id, reservation);

    return { ...reservation };
  }

  getReservation(id: string): Reservation | undefined {
    this.expireDueReservations();

    const reservation = this.reservations.get(id);
    return reservation ? { ...reservation } : undefined;
  }

  expireReservation(id: string): void {
    const reservation = this.requireReservation(id);

    if (reservation.status !== 'reserved') {
      return;
    }

    reservation.status = 'expired';
    this.stock += reservation.quantity;
  }

  expireDueReservations(now = Date.now()): void {
    for (const reservation of this.reservations.values()) {
      if (
        reservation.status === 'reserved' &&
        now >= reservation.expiresAt
      ) {
        reservation.status = 'expired';
        this.stock += reservation.quantity;
      }
    }
  }

  checkout(id: string): Reservation {
    this.expireDueReservations();

    const reservation = this.requireReservation(id);

    if (reservation.status !== 'reserved') {
      throw new Error(
        `Cannot checkout a reservation with status "${reservation.status}".`,
      );
    }

    reservation.status = 'checked-out';
    return { ...reservation };
  }

  private requireReservation(id: string): Reservation {
    const reservation = this.reservations.get(id);

    if (!reservation) {
      throw new Error(`Reservation "${id}" was not found.`);
    }

    return reservation;
  }
}
