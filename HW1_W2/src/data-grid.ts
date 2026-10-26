
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

  const wrapper = document.createElement('div');
  wrapper.className = 'data-grid';

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
  let currentPage = 1;
  let pageSize = 5;

  const pagination = document.createElement('div');
  pagination.className = 'data-grid-pagination';
  pagination.setAttribute('aria-label', 'Table pagination');

  const pageInfo = document.createElement('p');
  pageInfo.className = 'data-grid-page-info';
  pageInfo.setAttribute('aria-live', 'polite');

  const pageSizeLabel = document.createElement('label');
  pageSizeLabel.htmlFor = 'data-grid-page-size';
  pageSizeLabel.textContent = 'Rows per page:';

  const pageSizeSelect = document.createElement('select');
  pageSizeSelect.id = 'data-grid-page-size';
  pageSizeSelect.setAttribute('aria-label', 'Rows per page');

  for (const size of [5, 10, 20]) {
    const option = document.createElement('option');
    option.value = String(size);
    option.textContent = String(size);
    option.selected = size === pageSize;
    pageSizeSelect.append(option);
  }

  pageSizeLabel.append(pageSizeSelect);

  const previousButton = document.createElement('button');
  previousButton.type = 'button';
  previousButton.textContent = 'Previous';

  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.textContent = 'Next';

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

    const startIndex = (currentPage - 1) * pageSize;
    const pageData = sortedData.slice(startIndex, startIndex + pageSize);

    for (const item of pageData) {
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

    const totalItems = sortedData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const firstItem = totalItems === 0 ? 0 : startIndex + 1;
    const lastItem = Math.min(startIndex + pageSize, totalItems);

    pageInfo.textContent =
      `Showing ${firstItem}–${lastItem} of ${totalItems} employees`;

    previousButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;

    pagination.setAttribute('aria-label', `Page ${currentPage} of ${totalPages}`);
  };

  const applyFilterAndSort = (): void => {
    const query = filterQuery.trim().toLowerCase();

    filteredData = props.data.filter((item) => {
      if (!query) return true;

      return props.columns.some((column) => {
        const value = String(item[column.accessorKey] ?? '');
        const normalizedValue = value.toLowerCase();

        if (column.accessorKey === 'status') {
          return normalizedValue === query;
        }

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

    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);

    renderRows();
  };

  searchInput.addEventListener('input', () => {
    filterQuery = searchInput.value;
    currentPage = 1;
    applyFilterAndSort();
  });

  pageSizeSelect.addEventListener('change', () => {
    pageSize = Number(pageSizeSelect.value);
    currentPage = 1;
    renderRows();
  });

  previousButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage -= 1;
      renderRows();
    }
  });

  nextButton.addEventListener('click', () => {
    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));

    if (currentPage < totalPages) {
      currentPage += 1;
      renderRows();
    }
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
      headerButton.setAttribute('aria-label', `Sort by ${column.header}`);

      headerButton.addEventListener('click', () => {
        if (sortKey === column.accessorKey) {
          sortDirection =
            sortDirection === 'ascending' ? 'descending' : 'ascending';
        } else {
          sortKey = column.accessorKey;
          sortDirection = 'ascending';
        }

        headerRow.querySelectorAll<HTMLTableCellElement>('th').forEach((header) => {
          header.removeAttribute('aria-sort');
        });

        th.setAttribute('aria-sort', sortDirection);
        currentPage = 1;
        applyFilterAndSort();
      });
    } else {
      headerButton.setAttribute('aria-label', column.header);
    }

    th.append(headerButton);
    headerRow.append(th);
  }

  thead.append(headerRow);
  table.append(thead, tbody);

  pagination.append(pageInfo, pageSizeLabel, previousButton, nextButton);
  wrapper.append(toolbar, table, pagination);

  applyFilterAndSort();

  return wrapper;
}
