
import { describe, expect, it } from 'vitest';
import {
  InventoryMachine,
  type ReservationStatus,
} from '../src/inventory/inventory-machine';

describe('InventoryMachine', () => {
  it('reserves inventory when stock is available', () => {
    const inventory = new InventoryMachine(5);

    const reservation = inventory.reserve('customer-1', 2);

    expect(reservation.status).toBe('reserved');
    expect(inventory.availableStock).toBe(3);
  });

  it('rejects a reservation when stock is insufficient', () => {
    const inventory = new InventoryMachine(2);

    expect(() => inventory.reserve('customer-1', 3)).toThrow();
    expect(inventory.availableStock).toBe(2);
  });

  it('releases inventory when a reservation expires', () => {
    const inventory = new InventoryMachine(5);
    const reservation = inventory.reserve('customer-1', 2);

    inventory.expireReservation(reservation.id);

    expect(inventory.availableStock).toBe(5);
    expect(inventory.getReservation(reservation.id)?.status).toBe(
      'expired' satisfies ReservationStatus,
    );
  });

  it('consumes reserved inventory after checkout', () => {
    const inventory = new InventoryMachine(5);
    const reservation = inventory.reserve('customer-1', 2);

    inventory.checkout(reservation.id);

    expect(inventory.availableStock).toBe(3);
    expect(inventory.getReservation(reservation.id)?.status).toBe('checked-out');
  });

  it('does not release inventory twice when expiration is repeated', () => {
    const inventory = new InventoryMachine(5);
    const reservation = inventory.reserve('customer-1', 2);

    inventory.expireReservation(reservation.id);
    inventory.expireReservation(reservation.id);

    expect(inventory.availableStock).toBe(5);
  });

  it('does not allow checkout after reservation expiry', () => {
    const inventory = new InventoryMachine(5);
    const reservation = inventory.reserve('customer-1', 2);

    inventory.expireReservation(reservation.id);

    expect(() => inventory.checkout(reservation.id)).toThrow();
    expect(inventory.availableStock).toBe(5);
  });

  it('rejects zero or negative reservation quantities', () => {
    const inventory = new InventoryMachine(5);

    expect(() => inventory.reserve('customer-1', 0)).toThrow();
    expect(() => inventory.reserve('customer-1', -1)).toThrow();
  });

  it('prevents concurrent reservations from overselling stock', async () => {
    const inventory = new InventoryMachine(5);

    const results = await Promise.allSettled([
      Promise.resolve().then(() => inventory.reserve('customer-1', 4)),
      Promise.resolve().then(() => inventory.reserve('customer-2', 4)),
    ]);

    const successes = results.filter(
      (result) => result.status === 'fulfilled',
    );

    expect(successes).toHaveLength(1);
    expect(inventory.availableStock).toBe(1);
  });


    it('expires reservations whose deadlines have passed', () => {
    const inventory = new InventoryMachine(5);
    const reservation = inventory.reserve('customer-1', 2, 1_000);

    inventory.expireDueReservations(reservation.expiresAt);

    expect(inventory.getReservation(reservation.id)?.status).toBe('expired');
    expect(inventory.availableStock).toBe(5);
    });

    it('does not release inventory twice when expiry is repeated', () => {
    const inventory = new InventoryMachine(5);
    const reservation = inventory.reserve('customer-1', 2, 1_000);

    inventory.expireDueReservations(reservation.expiresAt);
    inventory.expireDueReservations(reservation.expiresAt);

    expect(inventory.availableStock).toBe(5);
    });


it('never allows available stock to become negative', async () => {
  const inventory = new InventoryMachine(10);

  const results = await Promise.allSettled(
    Array.from({ length: 20 }, (_, index) =>
      Promise.resolve().then(() =>
        inventory.reserve(`customer-${index}`, 1),
      ),
    ),
  );

  const successfulReservations = results.filter(
    (result) => result.status === 'fulfilled',
  );

  expect(successfulReservations).toHaveLength(10);
  expect(inventory.availableStock).toBe(0);
  expect(inventory.availableStock).toBeGreaterThanOrEqual(0);
});

    it('does not restore inventory after a reservation is checked out', () => {
    const inventory = new InventoryMachine(5);
    const reservation = inventory.reserve('customer-1', 2);

    inventory.checkout(reservation.id);
    inventory.expireDueReservations(Number.MAX_SAFE_INTEGER);

    expect(inventory.availableStock).toBe(3);
    expect(inventory.getReservation(reservation.id)?.status).toBe('checked-out');
    });

    it('rejects duplicate checkout attempts', () => {
    const inventory = new InventoryMachine(5);
    const reservation = inventory.reserve('customer-1', 2);

    inventory.checkout(reservation.id);

    expect(() => inventory.checkout(reservation.id)).toThrow();
    expect(inventory.availableStock).toBe(3);
    });
});
