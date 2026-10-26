
import './style.css';
import { createDataGrid } from './data-grid';
import { employeeData } from './data';
import type { Employee } from './data';

const columns = [
  { header: 'ID', accessorKey: 'id', sortable: true },
  { header: 'Name', accessorKey: 'name', sortable: true },
  { header: 'Email', accessorKey: 'email' },
  { header: 'Department', accessorKey: 'department', sortable: true },
  { header: 'Position', accessorKey: 'position' },
  { header: 'Salary', accessorKey: 'salary', sortable: true },
  { header: 'Status', accessorKey: 'status', sortable: true },
] as const satisfies import('./data-grid-contract').ColumnDef<Employee>[];

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root element #app was not found.');
}

const heading = document.createElement('h1');
heading.textContent = 'Employee Data Grid';

const description = document.createElement('p');
description.textContent = 'Employee directory — sample data for Data Grid testing.';

const tableContainer = document.createElement('div');
tableContainer.className = 'table-container';

const grid = createDataGrid<Employee>({
  data: employeeData,
  columns: [...columns],
  ariaLabel: 'Employee directory',
  onRowSelect: (employee) => {
    console.log('Selected employee:', employee);
  },
});

tableContainer.append(grid);
app.replaceChildren(heading, description, tableContainer);
