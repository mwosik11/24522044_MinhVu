
import './style.css';
import { InventoryMachine } from './inventory/inventory-machine';
import { renderFlashSaleView } from './ui/flash-sale-view';

const root = document.querySelector<HTMLElement>('#app');

if (!root) {
  throw new Error('Application root element #app was not found.');
}

const inventory = new InventoryMachine(10);

const cleanup = renderFlashSaleView({
  root,
  inventory,
  productName: 'Wireless Headphones',
  priceVnd: 499_000,
  saleEndsAt: Date.now() + 5 * 60 * 1000,
});

window.addEventListener('pagehide', cleanup, { once: true });
