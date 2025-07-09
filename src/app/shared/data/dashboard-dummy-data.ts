//dashboard-dummy-data.ts
export interface User {
    userId: number;
    username: string;
  }
  
  export interface Task {
    id: number;
    title: string;
    description: string;
    status: 'To Do' | 'Work In Progress' | 'Under Review' | 'Completed' ;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    dueDate: Date;
    author: User;
    [key: string]: any;

  }

  export const USERS: User[] = [
    { userId: 1, username: 'Alice' },
    { userId: 2, username: 'Robert' },
    { userId: 3, username: 'Carol' },
    { userId: 4, username: 'Daniel' }
  ];
  
  function getRandomAuthor(): User {
    return USERS[Math.floor(Math.random() * USERS.length)];
  }
  
  export const TASKS: Task[] = [
    { id: 1, title: 'Initialize Project Repo', description: 'Create GitHub repo and push initial commit.', status: 'Completed', priority: 'Low', dueDate: new Date('2025-05-01') , author: getRandomAuthor() },
    { id: 2, title: 'Setup Angular Routing', description: 'Configure app routing with lazy loading.', status: 'To Do', priority: 'High', dueDate: new Date('2025-06-01') , author: getRandomAuthor() },
    { id: 3, title: 'Implement Login Page', description: 'Create login component with form validation.', status: 'Work In Progress', priority: 'Urgent', dueDate: new Date('2025-05-23') , author: getRandomAuthor() },
    { id: 4, title: 'Design Home Page', description: 'Mock up and build home screen.', status: 'Completed', priority: 'Medium', dueDate: new Date('2025-05-10') , author: getRandomAuthor() },
    { id: 5, title: 'Create User Service', description: 'Add CRUD operations for users.', status: 'Under Review', priority: 'Medium', dueDate: new Date('2025-05-26') , author: getRandomAuthor() },
    { id: 6, title: 'Setup Role Management', description: 'Add support for project roles.', status: 'To Do', priority: 'High', dueDate: new Date('2025-06-02') , author: getRandomAuthor() },
    { id: 7, title: 'Dashboard Pie Charts', description: 'Render task breakdown charts.', status: 'Work In Progress', priority: 'Medium', dueDate: new Date('2025-05-25') , author: getRandomAuthor() },
    { id: 8, title: 'Integrate NG-ZORRO', description: 'Add and configure NG-ZORRO UI library.', status: 'Completed', priority: 'Low', dueDate: new Date('2025-05-11') , author: getRandomAuthor() },
    { id: 9, title: 'Create Footer Component', description: 'Build footer with links and styles.', status: 'Completed', priority: 'Low', dueDate: new Date('2025-05-05') , author: getRandomAuthor() },
    { id: 10, title: 'Implement JWT Auth', description: 'Secure backend with JWT.', status: 'Under Review', priority: 'High', dueDate: new Date('2025-05-27') , author: getRandomAuthor() },
    { id: 11, title: 'Build Task Table UI', description: 'Table for task list with actions.', status: 'Work In Progress', priority: 'Urgent', dueDate: new Date('2025-05-28') , author: getRandomAuthor() },
    { id: 12, title: 'Column Resizing Feature', description: 'Enable dynamic column sizing.', status: 'To Do', priority: 'Medium', dueDate: new Date('2025-06-04') , author: getRandomAuthor() },
    { id: 13, title: 'Drag-and-Drop Sorting', description: 'Implement row drag-and-drop.', status: 'To Do', priority: 'Medium', dueDate: new Date('2025-06-06') , author: getRandomAuthor() },
    { id: 14, title: 'Implement Pagination', description: 'Add pagination to task table.', status: 'Completed', priority: 'Low', dueDate: new Date('2025-05-14') , author: getRandomAuthor() },
    { id: 15, title: 'Create Notification Service', description: 'Toast alerts for user actions.', status: 'To Do', priority: 'High', dueDate: new Date('2025-06-05') , author: getRandomAuthor() },
    { id: 16, title: 'Secure API Routes', description: 'Protect .NET endpoints.', status: 'Under Review', priority: 'High', dueDate: new Date('2025-05-29') , author: getRandomAuthor() },
    { id: 17, title: 'Project Sidebar Navigation', description: 'Sidebar with icons and nav links.', status: 'Completed', priority: 'Low', dueDate: new Date('2025-05-12') , author: getRandomAuthor() },
    { id: 18, title: 'Theme Switcher', description: 'Toggle dark/light theme.', status: 'To Do', priority: 'Low', dueDate: new Date('2025-06-10') , author: getRandomAuthor() },
    { id: 19, title: 'Setup Azure CI/CD', description: 'Create pipeline for deployment.', status: 'To Do', priority: 'High', dueDate: new Date('2025-06-08') , author: getRandomAuthor() },
    { id: 20, title: 'Add Task Priority Filter', description: 'Filter tasks by priority.', status: 'Work In Progress', priority: 'Medium', dueDate: new Date('2025-05-30') , author: getRandomAuthor() },
    { id: 21, title: 'Bug Fix: Form Validation', description: 'Fix form errors on user input.', status: 'Under Review', priority: 'Urgent', dueDate: new Date('2025-05-24') , author: getRandomAuthor() },
    { id: 22, title: 'Add Breadcrumb Navigation', description: 'Show user path on each page.', status: 'To Do', priority: 'Low', dueDate: new Date('2025-06-15') , author: getRandomAuthor() },
    { id: 23, title: 'Task Due Reminder', description: 'Add due-date based reminders.', status: 'To Do', priority: 'Medium', dueDate: new Date('2025-06-20') , author: getRandomAuthor() },
    { id: 24, title: 'Export to Excel/CSV', description: 'Export task table to file.', status: 'To Do', priority: 'Medium', dueDate: new Date('2025-06-07'), author: getRandomAuthor() },
    { id: 25, title: 'Dynamic Column Toggle', description: 'Show/hide columns dynamically.', status: 'To Do', priority: 'Medium', dueDate: new Date('2025-06-09') , author: getRandomAuthor() },
    { id: 26, title: 'Mobile-Responsive Layout', description: 'Ensure dashboard is mobile friendly.', status: 'Work In Progress', priority: 'Urgent', dueDate: new Date('2025-05-31') , author: getRandomAuthor() },
    { id: 27, title: 'Unit Tests for Services', description: 'Add tests for Angular services.', status: 'To Do', priority: 'Low', dueDate: new Date('2025-06-12') , author: getRandomAuthor() },
    { id: 28, title: 'Form Builder Utility', description: 'Reusable form generator.', status: 'Completed', priority: 'Medium', dueDate: new Date('2025-05-13') , author: getRandomAuthor() },
    { id: 29, title: 'Error Boundary Component', description: 'Global error handling UI.', status: 'To Do', priority: 'High', dueDate: new Date('2025-06-13') , author: getRandomAuthor() },
    { id: 30, title: 'Profile Page UI', description: 'Create profile update screen.', status: 'Under Review', priority: 'Medium', dueDate: new Date('2025-06-03') , author: getRandomAuthor() },
    { id: 31, title: 'Search Bar for Tasks', description: 'Search functionality in table.', status: 'Completed', priority: 'Medium', dueDate: new Date('2025-05-18') , author: getRandomAuthor() },
    { id: 32, title: 'Reusable Button Component', description: 'Styled button variants.', status: 'Completed', priority: 'Low', dueDate: new Date('2025-05-16') , author: getRandomAuthor() },
    { id: 33, title: 'User Analytics Chart', description: 'Display login activity.', status: 'To Do', priority: 'Low', dueDate: new Date('2025-06-16') , author: getRandomAuthor() },
    { id: 34, title: 'Implement Guarded Routes', description: 'Route protection by role.', status: 'Work In Progress', priority: 'High', dueDate: new Date('2025-06-01') , author: getRandomAuthor() },
    { id: 35, title: 'Handle Token Expiry', description: 'Auto-logout on JWT expiration.', status: 'To Do', priority: 'High', dueDate: new Date('2025-06-11') , author: getRandomAuthor() },
    { id: 36, title: 'Refactor AuthService', description: 'Clean and simplify logic.', status: 'Completed', priority: 'Medium', dueDate: new Date('2025-05-15') , author: getRandomAuthor() },
    { id: 37, title: '404 Not Found Page', description: 'Custom page for unknown routes.', status: 'Completed', priority: 'Low', dueDate: new Date('2025-05-17') , author: getRandomAuthor() },
    { id: 38, title: 'Dockerize Frontend', description: 'Add Dockerfile for Angular.', status: 'To Do', priority: 'High', dueDate: new Date('2025-06-14') , author: getRandomAuthor() },
    { id: 39, title: 'Dockerize Backend', description: 'Add Dockerfile for .NET API.', status: 'To Do', priority: 'High', dueDate: new Date('2025-06-18') , author: getRandomAuthor() },
    { id: 40, title: 'Combine Docker Compose', description: 'Unify frontend & backend containers.', status: 'To Do', priority: 'Medium', dueDate: new Date('2025-06-19') , author: getRandomAuthor() },
    { id: 41, title: 'Add CI Build Badge', description: 'Show build status in README.', status: 'Completed', priority: 'Low', dueDate: new Date('2025-05-08') , author: getRandomAuthor() },
    { id: 42, title: 'Security Audit Checklist', description: 'Review basic security checks.', status: 'To Do', priority: 'Medium', dueDate: new Date('2025-06-21') , author: getRandomAuthor() },
    { id: 43, title: 'Implement RBAC Logic', description: 'Role-based access for features.', status: 'Work In Progress', priority: 'High', dueDate: new Date('2025-06-01') , author: getRandomAuthor() },
    { id: 44, title: 'Project Archiving Feature', description: 'Allow archiving inactive projects.', status: 'To Do', priority: 'Low', dueDate: new Date('2025-06-22') , author: getRandomAuthor() },
    { id: 45, title: 'Deploy to Azure App Service', description: 'Publish live version.', status: 'To Do', priority: 'High', dueDate: new Date('2025-06-25') , author: getRandomAuthor() },
    { id: 46, title: 'Write Dev README', description: 'Instructions for local dev setup.', status: 'Completed', priority: 'Low', dueDate: new Date('2025-05-06') , author: getRandomAuthor() },
    { id: 47, title: 'Auto-assign Tasks', description: 'Logic to assign tasks to creator.', status: 'To Do', priority: 'Medium', dueDate: new Date('2025-06-26') , author: getRandomAuthor() },
    { id: 48, title: 'Project Progress Bar', description: 'Visual progress indicator.', status: 'Under Review', priority: 'Medium', dueDate: new Date('2025-06-17') , author: getRandomAuthor() },
    { id: 49, title: 'Milestone Tracking', description: 'Track key project events.', status: 'To Do', priority: 'High', dueDate: new Date('2025-06-28') , author: getRandomAuthor() },
    { id: 50, title: 'Final Testing & QA', description: 'Full application QA.', status: 'To Do', priority: 'Urgent', dueDate: new Date('2025-06-30'), author: getRandomAuthor() }
  ];
  