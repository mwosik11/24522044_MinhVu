
export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  status: 'Active' | 'On Leave' | 'Inactive';
}

export const employeeData: Employee[] = [
  {
    id: 1,
    name: 'Nguyen Minh Anh',
    email: 'minhanh@example.com',
    department: 'Engineering',
    position: 'Frontend Developer',
    salary: 1800,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Tran Quoc Bao',
    email: 'quocbao@example.com',
    department: 'Engineering',
    position: 'Backend Developer',
    salary: 2200,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Le Thu Ha',
    email: 'thuha@example.com',
    department: 'Human Resources',
    position: 'HR Specialist',
    salary: 1500,
    status: 'On Leave',
  },
  {
    id: 4,
    name: 'Pham Duc Long',
    email: 'duclong@example.com',
    department: 'Finance',
    position: 'Financial Analyst',
    salary: 1900,
    status: 'Active',
  },
  {
    id: 5,
    name: 'Vo Ngoc Linh',
    email: 'ngoclinh@example.com',
    department: 'Marketing',
    position: 'Marketing Executive',
    salary: 1600,
    status: 'Inactive',
  },
  {
    id: 6,
    name: 'Do Hoang Nam',
    email: 'hoangnam@example.com',
    department: 'Engineering',
    position: 'QA Engineer',
    salary: 1700,
    status: 'Active',
  },
  {
    id: 7,
    name: 'Bui Khanh Vy',
    email: 'khanhvy@example.com',
    department: 'Marketing',
    position: 'Content Specialist',
    salary: 1450,
    status: 'On Leave',
  },
  {
    id: 8,
    name: 'Hoang Gia Huy',
    email: 'giahuy@example.com',
    department: 'Finance',
    position: 'Accountant',
    salary: 1650,
    status: 'Active',
  },
  {
    id: 9,
    name: 'Dang My Duyen',
    email: 'myduyen@example.com',
    department: 'Human Resources',
    position: 'Recruiter',
    salary: 1550,
    status: 'Active',
  },
  {
    id: 10,
    name: 'Nguyen Thanh Tung',
    email: 'thanhtung@example.com',
    department: 'Engineering',
    position: 'DevOps Engineer',
    salary: 2400,
    status: 'Inactive',
  },
  {
    id: 11,
    name: 'Truong Bao Chau',
    email: 'baochau@example.com',
    department: 'Marketing',
    position: 'Marketing Manager',
    salary: 2500,
    status: 'Active',
  },
  {
    id: 12,
    name: 'Ly Thanh Phuc',
    email: 'thanhphuc@example.com',
    department: 'Finance',
    position: 'Finance Manager',
    salary: 2800,
    status: 'Active',
  },
];
