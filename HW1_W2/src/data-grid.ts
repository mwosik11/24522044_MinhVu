
import type { DataGridProps } from './data-grid-contract';

export function createDataGrid<T extends object>(
  props: DataGridProps<T>,
): HTMLTableElement {
  const table = document.createElement('table');
  table.setAttribute('role', 'grid');
  table.setAttribute('aria-label', props.ariaLabel);

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.setAttribute('role', 'row');

  for (const column of props.columns) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.setAttribute('role', 'columnheader');

    const headerButton = document.createElement('button');
    headerButton.type = 'button';
    headerButton.textContent = column.header;
    headerButton.disabled = !column.sortable;
    headerButton.setAttribute(
      'aria-label',
      column.sortable
        ? `Sort by ${column.header}`
        : column.header,
    );

    th.append(headerButton);
    headerRow.append(th);
  }

  thead.append(headerRow);
  table.append(thead);

  const tbody = document.createElement('tbody');

  for (const item of props.data) {
    const row = document.createElement('tr');
    row.setAttribute('role', 'row');

    for (const column of props.columns) {
      const cell = document.createElement('td');
      cell.setAttribute('role', 'gridcell');

      const value = item[column.accessorKey];
      cell.textContent = String(value ?? '');

      row.append(cell);
    }

    row.tabIndex = 0;
    row.addEventListener('click', () => {
      props.onRowSelect?.(item);
    });

    tbody.append(row);
  }

  table.append(tbody);

  return table;
}
