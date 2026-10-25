
import type { DataGridProps } from './data-grid-contract';

type SortDirection = 'ascending' | 'descending';

export function createDataGrid<T extends object>(
    
  props: DataGridProps<T>,
): HTMLDivElement {
  const table = document.createElement('table');
  table.setAttribute('role', 'grid');
  table.setAttribute('aria-label', props.ariaLabel);

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.setAttribute('role', 'row');

  const tbody = document.createElement('tbody');

  const toolbar = document.createElement('div');
  toolbar.className = 'data-grid-toolbar';

  const searchLabel = document.createElement('label');
  searchLabel.htmlFor = 'employee-grid-search';
  searchLabel.textContent = 'Search employees';

  const searchInput = document.createElement('input');
  searchInput.id = 'employee-grid-search';
  searchInput.type = 'search';
  searchInput.placeholder = 'Search by name, email, department...';
  searchInput.setAttribute('aria-label', 'Search employees');

  searchLabel.append(searchInput);
  toolbar.append(searchLabel);

  let filteredData = [...props.data];
  let sortedData = [...props.data];
  let sortKey: keyof T | null = null;
  let sortDirection: SortDirection = 'ascending';
  let filterQuery = '';

  const compareValues = (a: unknown, b: unknown): number => {
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }

    return String(a ?? '').localeCompare(String(b ?? ''), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  };

  const renderRows = (): void => {
    tbody.replaceChildren();

    for (const item of sortedData) {
      const row = document.createElement('tr');
      row.setAttribute('role', 'row');
      row.tabIndex = 0;

      for (const column of props.columns) {
        const cell = document.createElement('td');
        cell.setAttribute('role', 'gridcell');

        const value = item[column.accessorKey];
        cell.textContent = String(value ?? '');

        row.append(cell);
      }

      row.addEventListener('click', () => {
        props.onRowSelect?.(item);
      });

      row.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          props.onRowSelect?.(item);
        }
      });

      tbody.append(row);
    }
  };

  const applyFilterAndSort = (): void => {
  const query = filterQuery.trim().toLowerCase();

  filteredData = props.data.filter((item) => {
  if (!query) return true;

  return props.columns.some((column) => {
    const value = String(item[column.accessorKey] ?? '');
      const normalizedValue = value.toLowerCase();

    // Status must match exactly when searching for a status.
    if (column.accessorKey === 'status') {
      return normalizedValue === query;
    }

    // Other columns support partial matching.
    return normalizedValue.includes(query);
  });
});

  sortedData = [...filteredData];

  if (sortKey !== null) {
    sortedData.sort((a, b) => {
      const result = compareValues(a[sortKey!], b[sortKey!]);

      return sortDirection === 'ascending' ? result : -result;
    });
  }

  renderRows();
};

    searchInput.addEventListener('input', () => {
        filterQuery = searchInput.value;
        applyFilterAndSort();
    });

  for (const column of props.columns) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.setAttribute('role', 'columnheader');

    const headerButton = document.createElement('button');
    headerButton.type = 'button';
    headerButton.textContent = column.header;
    headerButton.disabled = !column.sortable;

    if (column.sortable) {
      headerButton.setAttribute(
        'aria-label',
        `Sort by ${column.header}`,
      );

      headerButton.addEventListener('click', () => {
        if (sortKey === column.accessorKey) {
          sortDirection =
            sortDirection === 'ascending' ? 'descending' : 'ascending';
        } else {
          sortKey = column.accessorKey;
          sortDirection = 'ascending';
        }

        const headerCells = headerRow.querySelectorAll<HTMLTableCellElement>('th');

        headerCells.forEach((header) => {
            header.removeAttribute('aria-sort');
        });

        th.setAttribute('aria-sort', sortDirection);

        applyFilterAndSort();
      });
    } else {
      headerButton.setAttribute('aria-label', column.header);
    }

    th.append(headerButton);
    headerRow.append(th);
  }

  thead.append(headerRow);
  table.append(thead);
  table.append(tbody);

const wrapper = document.createElement('div');
wrapper.className = 'data-grid';
wrapper.append(toolbar, table);

applyFilterAndSort();

return wrapper;
}
