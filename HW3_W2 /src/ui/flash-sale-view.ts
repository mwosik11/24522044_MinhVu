
import { InventoryMachine } from '../inventory/inventory-machine';
import { createAntiDriftTimer } from '../timer/anti-drift-timer';

export interface FlashSaleViewOptions {
  root: HTMLElement;
  inventory: InventoryMachine;
  productName: string;
  priceVnd: number;
  saleEndsAt: number;
}

export function renderFlashSaleView({
  root,
  inventory,
  productName,
  priceVnd,
  saleEndsAt,
}: FlashSaleViewOptions): () => void {
  let currentReservationId: string | null = null;
  let disposed = false;

  root.replaceChildren();

  const page = document.createElement('main');
  page.className = 'flash-sale';

  const header = document.createElement('header');
  header.className = 'flash-sale__header';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'flash-sale__eyebrow';
  eyebrow.textContent = 'LIMITED-TIME EVENT';

  const heading = document.createElement('h1');
  heading.textContent = 'Flash Sale';

  const description = document.createElement('p');
  description.className = 'flash-sale__description';
  description.textContent =
    'Reserve your product before the countdown reaches zero.';

  header.append(eyebrow, heading, description);

  const product = document.createElement('section');
  product.className = 'flash-sale__product';
  product.setAttribute('aria-labelledby', 'product-name');

  const productTitle = document.createElement('h2');
  productTitle.id = 'product-name';
  productTitle.textContent = productName;

  const price = document.createElement('p');
  price.className = 'flash-sale__price';
  price.textContent = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(priceVnd);

  const stock = document.createElement('p');
  stock.className = 'flash-sale__stock';
  stock.setAttribute('aria-live', 'polite');

  const countdownTitle = document.createElement('h2');
  countdownTitle.textContent = 'Sale ends in';

  const countdown = document.createElement('p');
  countdown.className = 'flash-sale__countdown';
  countdown.setAttribute('role', 'timer');
  countdown.setAttribute('aria-label', 'Time remaining');

  const status = document.createElement('p');
  status.className = 'flash-sale__status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  const reserveButton = document.createElement('button');
  reserveButton.type = 'button';
  reserveButton.textContent = 'Reserve item';

  const checkoutButton = document.createElement('button');
  checkoutButton.type = 'button';
  checkoutButton.textContent = 'Checkout';
  checkoutButton.disabled = true;

  const refreshStock = (): void => {
    stock.textContent = `Available stock: ${inventory.availableStock}`;
  };

  const updateCountdown = (remainingMs: number): void => {
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    countdown.textContent =
      `${String(minutes).padStart(2, '0')}:` +
      String(seconds).padStart(2, '0');

    if (remainingMs === 0) {
      reserveButton.disabled = true;
      checkoutButton.disabled = true;
      status.textContent = 'The flash sale has ended.';
    }
  };

  const stopTimer = createAntiDriftTimer(
    Math.max(0, saleEndsAt - Date.now()),
    updateCountdown,
);

    const expiryCheckId = window.setInterval(() => {
    if (disposed) {
        return;
    }

    inventory.expireDueReservations();

    if (currentReservationId) {
        const reservation = inventory.getReservation(currentReservationId);

        if (reservation?.status === 'expired') {
        checkoutButton.disabled = true;
        status.textContent = 'Your reservation has expired.';
        refreshStock();
        }
    }
    }, 250);

  const handleReserve = (): void => {
    if (disposed || Date.now() >= saleEndsAt) {
      status.textContent = 'The flash sale has ended.';
      reserveButton.disabled = true;
      return;
    }

    try {
      if (currentReservationId) {
        const previous = inventory.getReservation(currentReservationId);

        if (previous?.status === 'reserved') {
          status.textContent = 'You already have a reserved item.';
          return;
        }
      }

      const remainingSaleMs = saleEndsAt - Date.now();

        if (remainingSaleMs <= 0) {
        reserveButton.disabled = true;
        status.textContent = 'The flash sale has ended.';
        return;
        }

        const reservation = inventory.reserve(
        'demo-customer',
        1,
        Math.min(5 * 60 * 1000, remainingSaleMs),
        );
      currentReservationId = reservation.id;

      refreshStock();
      checkoutButton.disabled = false;
      status.textContent = 'Item reserved. Complete checkout before expiry.';
    } catch (error: unknown) {
      status.textContent =
        error instanceof Error ? error.message : 'Unable to reserve item.';
    }
  };

  const handleCheckout = (): void => {
    if (disposed || !currentReservationId) {
      return;
    }

    try {
      inventory.checkout(currentReservationId);
      refreshStock();
      checkoutButton.disabled = true;
      reserveButton.disabled = true;
      status.textContent = 'Checkout successful.';
    } catch (error: unknown) {
      refreshStock();
      checkoutButton.disabled = true;
      status.textContent =
        error instanceof Error ? error.message : 'Checkout failed.';
    }
  };

  reserveButton.addEventListener('click', handleReserve);
  checkoutButton.addEventListener('click', handleCheckout);

  product.append(
    productTitle,
    price,
    stock,
    countdownTitle,
    countdown,
    reserveButton,
    checkoutButton,
    status,
  );

  page.append(header, product);
  root.append(page);

  refreshStock();

  return (): void => {
    if (disposed) {
      return;
    }

    disposed = true;
    stopTimer();
    window.clearInterval(expiryCheckId);

    reserveButton.removeEventListener('click', handleReserve);
    checkoutButton.removeEventListener('click', handleCheckout);
    root.replaceChildren();
  };
}
