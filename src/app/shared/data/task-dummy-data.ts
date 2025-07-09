//task-dummy-data.ts
export interface User {
    userId: number;
    username: string;
  }
  
  export interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    tags: string[];
    startDate?: Date;
    dueDate?: Date;
    assignee?: { userId: number; username: string; avatarUrl: string };
    author?: { userId: number; username: string; avatarUrl: string };
    points?: number;
    comments?: string[];
    attachments?: { fileName: string; fileURL: string }[];
  }
  
  export const TASKS: Task[] = [
    {
      id: 1,
      title: 'Implement Login Page',
      description: 'Create the login page with form validation and error handling.',
      status: 'To Do',
      priority: 'High',
      tags: ['Frontend', 'Angular'],
      startDate: new Date('2025-05-10'),
      dueDate: new Date('2025-05-14'),
      assignee: { userId: 1, username: 'Alice', avatarUrl: 'assets/avatar1.png' },
      author: { userId: 2, username: 'Bob', avatarUrl: 'assets/avatar2.png' },
      points: 3,
      comments: ['Initial task created.'],
      attachments: []
    },
    {
      id: 2,
      title: 'Write API Documentation',
      description: 'Document the REST APIs using Swagger.',
      status: 'To Do',
      priority: 'Medium',
      tags: ['Backend', 'Documentation'],
      startDate: new Date('2025-06-15'),
      dueDate: new Date('2025-07-20'),
      assignee: { userId: 3, username: 'Eve', avatarUrl: 'assets/avatar3.png' },
      author: { userId: 4, username: 'John', avatarUrl: 'assets/avatar4.png' },
      points: 2,
      comments: ['Pending API review.'],
      attachments: [{ fileName: 'api_specs.docx', fileURL: 'assets/docs/api_specs.docx' }]
    },
    {
      id: 3,
      title: 'Create Dashboard UI',
      description: 'Design and implement the user dashboard with charts.',
      status: 'Work In Progress',
      priority: 'Urgent',
      tags: ['UI/UX', 'Angular', 'Chart.js'],
      startDate: new Date('2025-05-12'),
      dueDate: new Date('2025-05-25'),
      assignee: { userId: 5, username: 'Carol', avatarUrl: 'assets/avatar5.png' },
      author: { userId: 1, username: 'Alice', avatarUrl: 'assets/avatar1.png' },
      points: 5,
      comments: ['Design approved.', 'Started implementation.'],
      attachments: [{ fileName: 'dashboard_mockup.png', fileURL: 'assets/images/dashboard_mockup.png' }]
    },
    {
      id: 4,
      title: 'Integrate Payment Gateway',
      description: 'Setup and test Stripe payment integration.',
      status: 'Work In Progress',
      priority: 'High',
      tags: ['Backend', 'Finance'],
      startDate: new Date('2025-05-18'),
      dueDate: new Date('2025-05-22'),
      assignee: { userId: 6, username: 'David', avatarUrl: 'assets/avatar6.png' },
      author: { userId: 2, username: 'Bob', avatarUrl: 'assets/avatar2.png' },
      points: 4,
      comments: ['Stripe keys configured.'],
      attachments: [{ fileName: 'integration_notes.txt', fileURL: 'assets/docs/integration_notes.txt' }]
    },
    {
      id: 5,
      title: 'Fix Login Bug',
      description: 'Resolve issue where login fails on incorrect password.',
      status: 'Under Review',
      priority: 'Medium',
      tags: ['Bugfix', 'Authentication'],
      startDate: new Date('2025-05-13'),
      dueDate: new Date('2025-05-15'),
      assignee: { userId: 1, username: 'Alice', avatarUrl: 'assets/avatar1.png' },
      author: { userId: 2, username: 'Bob', avatarUrl: 'assets/avatar2.png' },
      points: 1,
      comments: ['Bug replicated.', 'Fix under review.'],
      attachments: []
    },
    {
      id: 6,
      title: 'Accessibility Improvements',
      description: 'Add ARIA roles and better keyboard navigation.',
      status: 'Under Review',
      priority: 'Low',
      tags: ['Frontend', 'Accessibility'],
      startDate: new Date('2025-05-11'),
      dueDate: new Date('2025-05-19'),
      assignee: { userId: 3, username: 'Eve', avatarUrl: 'assets/avatar3.png' },
      author: { userId: 4, username: 'John', avatarUrl: 'assets/avatar4.png' },
      points: 2,
      comments: ['Feedback from QA incorporated.'],
      attachments: [{ fileName: 'accessibility_audit.pdf', fileURL: 'assets/docs/accessibility_audit.pdf' }]
    },
    {
      id: 7,
      title: 'Setup CI/CD Pipeline',
      description: 'Create GitHub Actions workflow for builds and deploys.',
      status: 'Completed',
      priority: 'High',
      tags: ['DevOps', 'CI/CD'],
      startDate: new Date('2025-05-01'),
      dueDate: new Date('2025-06-05'),
      assignee: { userId: 6, username: 'David', avatarUrl: 'assets/avatar6.png' },
      author: { userId: 5, username: 'Carol', avatarUrl: 'assets/avatar5.png' },
      points: 4,
      comments: ['Workflow created.', 'CI/CD verified.'],
      attachments: [{ fileName: 'cicd_workflow.yml', fileURL: 'assets/configs/cicd_workflow.yml' }]
    },
    {
      id: 8,
      title: 'Optimize Image Loading',
      description: 'Lazy load images to improve performance.',
      status: 'Completed',
      priority: 'Medium',
      tags: ['Performance', 'Frontend'],
      startDate: new Date('2025-04-25'),
      dueDate: new Date('2025-05-02'),
      assignee: { userId: 1, username: 'Alice', avatarUrl: 'assets/avatar1.png' },
      author: { userId: 2, username: 'Bob', avatarUrl: 'assets/avatar2.png' },
      points: 2,
      comments: ['Implemented lazy loading.', 'Performance improved.'],
      attachments: []
    }
  ];
  