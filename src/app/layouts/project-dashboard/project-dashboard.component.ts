import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { NzModalService, NzModalModule } from 'ng-zorro-antd/modal';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { TaskService, Task } from '../../shared/services/task.service';
import { HideIfClaimsNotMetDirective } from '../../directives/hide-if-claims-not-met.directive';
import { claimReq } from '../../shared/utils/claimReq-utils';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HideIfClaimsNotMetDirective,
    SidebarComponent,
    HeaderComponent,
    NzIconModule,
    NzLayoutModule,
    NzGridModule,
    NzModalModule,
    NgxChartsModule,
    NzTableModule,
    NzPaginationModule,
    NzCardModule,
    NzTagModule,
    NzAvatarModule,
    NzDropDownModule,
    DragDropModule,
    FormsModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
  ],
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.scss'],
})
export class ProjectDashboardComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  isDarkMode = false;
  fullName: string = '';
  claimReq = claimReq;

  tasks: Task[] = [];
  listOfDisplayData: Task[] = [];
  pagedData: Task[] = [];

  searchValue: string = '';
  selectedTask: Task | null = null;
  selectedStatusFilters: string[] = [];
  selectedPriorityFilters: string[] = [];
  isModalVisible = false;

  pageIndex: number = 1;
  pageSize: number = 10;
  total: number = 0;

  editingId: number | null = null;
  expandSet = new Set<number>();
  priorityChartData: any[] = [];
  statusChartData: any[] = [];

  view: [number, number] = [700, 300]; // width, height (adjust as needed)

  columns = [
    { key: 'id', label: 'ID', visible: true },
    { key: 'title', label: 'Title', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'priority', label: 'Priority', visible: true },
    { key: 'projectName', label: 'Project', visible: true }, // ✅ NEW COLUMN
    { key: 'author', label: 'Author', visible: true },
    { key: 'dueDate', label: 'Due Date', visible: true },
  ];

  statusFilters = [
    { label: 'To Do', value: 'To Do' },
    { label: 'Work In Progress', value: 'Work In Progress' },
    { label: 'Under Review', value: 'Under Review' },
    { label: 'Completed', value: 'Completed' },
  ];

  priorityFilters = [
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' },
    { label: 'Urgent', value: 'Urgent' },
  ];

  private isFreshLogin = false;
  private profileLoaded = false;
  private destroyed = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private taskService: TaskService,
    private modal: NzModalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const theme = localStorage.getItem('theme') || 'light';
    this.isDarkMode = theme === 'dark';
    document.documentElement.setAttribute('data-theme', theme);

    this.loadUserTasks();

    this.authService.freshLogin$.subscribe((freshLogin) => {
      this.isFreshLogin = freshLogin;
      this.maybeShowWelcomeModal();
    });

    this.userService.getUserProfile().subscribe({
      next: (res: any) => {
        if (!this.authService.isLoggedIn()) return;
        this.fullName = res.fullName;
        this.profileLoaded = true;
        this.maybeShowWelcomeModal();
      },
      error: (err: any) => console.error('Error retrieving profile:', err),
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
  }

loadUserTasks(): void {
  this.userService.getAllUsers().subscribe({
    next: (users) => {
      const userMap = new Map(users.map(user => [user.id, user]));

      this.taskService.getAssignedTasks().subscribe({
        next: (tasks) => {
          tasks.forEach(task => {
            const author = userMap.get(task.authorUserId || '');
            if (author) {
              task.authorFullName = author.fullName;
task.authorAvatarUrl = author.profilePic?.trim() || undefined;
            }
          });

          this.tasks = tasks;
          this.listOfDisplayData = [...tasks];
          this.total = tasks.length;
          this.updatePagedData();
          this.generatePriorityChartData();
          this.generateStatusChartData();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading tasks:', err),
      });
    },
    error: (err) => console.error('Error loading users for avatars:', err),
  });
}


  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    const theme = this.isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  maybeShowWelcomeModal(): void {
    if (this.destroyed) return;
    if (this.isFreshLogin && this.profileLoaded && this.fullName) {
      this.showWelcomeModal();
      this.authService['freshLoginSubject'].next(false);
    }
  }

  showWelcomeModal(): void {
    this.modal.info({
      nzTitle: `Welcome, ${this.fullName}!`,
      nzContent: `<p>Glad to have you on the Project Dashboard.</p>`,
      nzOkText: 'Let’s Get Started!',
    });
  }

  onLogout(): void {
    this.fullName = '';
    this.authService.logout();
    this.router.navigateByUrl('/signin');
  }

  generatePriorityChartData(): void {
    const map = new Map<string, number>();
    this.tasks.forEach(t => map.set(t.priority, (map.get(t.priority) || 0) + 1));
    this.priorityChartData = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }

  generateStatusChartData(): void {
    const map = new Map<string, number>();
    this.tasks.forEach(t => map.set(t.status, (map.get(t.status) || 0) + 1));
    this.statusChartData = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }

  drop(event: CdkDragDrop<any[]>): void {
    const visibleCols = this.columns.filter(c => c.visible);
    const from = visibleCols[event.previousIndex];
    const to = visibleCols[event.currentIndex];
    const fromIndex = this.columns.findIndex(c => c.key === from.key);
    const toIndex = this.columns.findIndex(c => c.key === to.key);
    moveItemInArray(this.columns, fromIndex, toIndex);
  }

  toggleColumnVisibility(key: string): void {
    const col = this.columns.find(c => c.key === key);
    if (col) col.visible = !col.visible;
    this.saveColumnSettings();
  }

  saveColumnSettings(): void {
    localStorage.setItem('tableCols', JSON.stringify(this.columns));
  }

  startEdit(id: number): void {
    this.editingId = id;
  }

  saveEdit(): void {
    this.editingId = null;
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.listOfDisplayData);
    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, 'user-tasks_export.xlsx');
  }

  showDetails(task: Task): void {
    this.selectedTask = task;
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.selectedTask = null;
    this.isModalVisible = false;
  }

  getInitials(name?: string): string {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
  }

  onStatusFilterChange(statuses: string[]): void {
    this.selectedStatusFilters = statuses;
    this.applyFilters();
  }

  onPriorityFilterChange(priorities: string[]): void {
    this.selectedPriorityFilters = priorities;
    this.applyFilters();
  }

  search(): void {
    this.applyFilters();
  }

  reset(): void {
    this.searchValue = '';
    this.selectedStatusFilters = [];
    this.selectedPriorityFilters = [];
    this.applyFilters();
  }

  applyFilters(): void {
    this.listOfDisplayData = this.tasks.filter(task => {
      const matchesTitle = task.title.toLowerCase().includes(this.searchValue.toLowerCase());
      const matchesStatus = this.selectedStatusFilters.length === 0 || this.selectedStatusFilters.includes(task.status);
      const matchesPriority = this.selectedPriorityFilters.length === 0 || this.selectedPriorityFilters.includes(task.priority);
      return matchesTitle && matchesStatus && matchesPriority;
    });

    this.total = this.listOfDisplayData.length;
    this.pageIndex = 1;
    this.updatePagedData();
  }

  updatePagedData(): void {
    const start = (this.pageIndex - 1) * this.pageSize;
    this.pagedData = this.listOfDisplayData.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.updatePagedData();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.updatePagedData();
  }

  getColumn(label: string): boolean {
    return this.columns.find(c => c.label === label)?.visible ?? false;
  }

  visibleColumnCount(): number {
    return this.columns.filter(c => c.visible).length;
  }

  onExpandChange(id: any, expanded: boolean): void {
  if (!this.expandSet) {
    this.expandSet = new Set();
  }
  if (expanded) {
    this.expandSet.add(id);
  } else {
    this.expandSet.delete(id);
  }
}
getColumnValue(data: any, key: string): any {
  return data && key ? data[key] : '';
}
}
