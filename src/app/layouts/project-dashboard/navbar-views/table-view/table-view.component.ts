import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

import { TaskService, Task } from '../../../../shared/services/task.service';
import { UserService } from '../../../../shared/services/user.service';
import { TeamService } from '../../../../shared/services/team.service';
@Component({
  selector: 'app-table-view',
  standalone: true,
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzPaginationModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzTagModule,
    NzAvatarModule,
    NzIconModule,
    NzModalModule,
    NzDropDownModule,
    NzMenuModule,
    DragDropModule,
    NzDatePickerModule
  ]
})
export class TableViewComponent implements OnInit {
  listOfData: Task[] = [];
  listOfDisplayData: Task[] = [];
  pagedData: Task[] = [];
  searchValue = '';
  selectedStatusFilters: string[] = [];
  selectedPriorityFilters: string[] = [];
  selectedTask: Task | null = null;
  isModalVisible = false;
  editingId: number | null = null;
  expandSet = new Set<number>();
userList: { id: string; fullName: string }[] = [];

  loading = false;
  projectId!: number;

  pageIndex = 1;
  pageSize = 5;
  total = 0;

  constructor(
    private taskService: TaskService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private modalService: NzModalService, 
    private userService: UserService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const pid = params['project'];
      if (pid) {
        this.projectId = +pid;
        this.fetchTasks();
      }
    });

    const savedCols = localStorage.getItem('tableCols');
    if (savedCols) {
      this.columns = JSON.parse(savedCols);
    }
  }

  fetchTasks(): void {
    this.loading = true;
   this.taskService.getTasksByProject(this.projectId).subscribe({
  next: (tasks) => {
    tasks.forEach(task => {
task.startDate = task.startDate ? new Date(task.startDate).toISOString() : '';
      task.dueDate = task.dueDate ? new Date(task.dueDate).toISOString() : '';
    });
    this.listOfData = tasks;
    this.applyFilters();
    this.loading = false;
  },
  error: (err) => {
    console.error('Error loading tasks:', err);
    this.loading = false;
  }
});

// 🔧 Separate call for userList:
this.teamService.getTeamMembersByProject(this.projectId).subscribe(users => {
  this.userList = users.map(u => ({
    id: u.userId,
    fullName: u.userName ?? ''
  }));
});

  }

  applyFilters(): void {
    this.listOfDisplayData = this.listOfData.filter((task) => {
      const matchesTitle = task.title
        .toLowerCase()
        .includes(this.searchValue.toLowerCase());
      const matchesStatus =
        this.selectedStatusFilters.length === 0 ||
        this.selectedStatusFilters.includes(task.status);
      const matchesPriority =
        this.selectedPriorityFilters.length === 0 ||
        this.selectedPriorityFilters.includes(task.priority);
      return matchesTitle && matchesStatus && matchesPriority;
    });

    this.total = this.listOfDisplayData.length;
    this.pageIndex = 1;
    this.updatePagedData();
  }

  updatePagedData(): void {
    const startIndex = (this.pageIndex - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedData = this.listOfDisplayData.slice(startIndex, endIndex);
  }

  // All the other methods below remain UNCHANGED:
  onPageChange(page: number): void {
    this.pageIndex = page;
    this.updatePagedData();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.updatePagedData();
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

  drop(event: CdkDragDrop<any[]>): void {
    const visibleColumns = this.columns.filter((col) => col.visible);
    const from = visibleColumns[event.previousIndex];
    const to = visibleColumns[event.currentIndex];

    const fromIndex = this.columns.findIndex((col) => col.key === from.key);
    const toIndex = this.columns.findIndex((col) => col.key === to.key);

    moveItemInArray(this.columns, fromIndex, toIndex);
    this.cdr.detectChanges();
    this.saveColumnSettings();
  }

  saveColumnSettings(): void {
    localStorage.setItem('tableCols', JSON.stringify(this.columns));
  }

  toggleColumnVisibility(key: string): void {
    const column = this.columns.find((c) => c.key === key);
    if (column) column.visible = !column.visible;
    this.saveColumnSettings();
  }

  getInitials(name?: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[1][0]).toUpperCase();
  }

  exportToExcel(): void {
    const exportData = this.listOfDisplayData.map((t) => ({
      ID: t.id,
      Title: t.title,
      Status: t.status,
      Priority: t.priority,
      Tags: t.tags,
      Assignee: t.assignedFullName,
      Author: t.authorFullName,
      StartDate: t.startDate,
      DueDate: t.dueDate
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data']
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });
    const blob = new Blob([excelBuffer], {
      type: 'application/octet-stream'
    });
    FileSaver.saveAs(blob, 'tasks_export.xlsx');
  }

  visibleColumnCount(): number {
    return this.columns.filter((col) => col.visible).length;
  }

  onExpandChange(id: number, checked: boolean): void {
    checked ? this.expandSet.add(id) : this.expandSet.delete(id);
  }

  showDetails(task: Task): void {
    this.selectedTask = task;
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.selectedTask = null;
  }

  startEdit(id: number): void {
    this.editingId = id;
  }


  cancelEdit(): void {
    this.editingId = null;
  }

  // Columns config
  columns = [
    { key: 'id', label: 'ID', visible: true },
    { key: 'title', label: 'Title', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'priority', label: 'Priority', visible: true },
    { key: 'tags', label: 'Tags', visible: true },
    { key: 'assignee', label: 'Assignee', visible: true },
    { key: 'author', label: 'Author', visible: true },
    { key: 'startDate', label: 'Start Date', visible: true },
    { key: 'dueDate', label: 'Due Date', visible: true }
  ];

  statusFilters = [
    { text: 'To Do', value: 'To Do' },
    { text: 'Work In Progress', value: 'Work In Progress' },
    { text: 'Under Review', value: 'Under Review' },
    { text: 'Completed', value: 'Completed' }
  ];

  priorityFilters = [
    { text: 'Low', value: 'Low' },
    { text: 'Medium', value: 'Medium' },
    { text: 'High', value: 'High' },
    { text: 'Urgent', value: 'Urgent' }
  ];


saveEdit(): void {
if (this.editingId !== null) {
  const task = this.listOfData.find(t => t.id === this.editingId);
  if (task) {
    const start = new Date(task.startDate);
    const due = new Date(task.dueDate);

    task.startDate = !isNaN(start.getTime()) ? start.toISOString() : '';
    task.dueDate = !isNaN(due.getTime()) ? due.toISOString() : '';

    this.taskService.updateTask(task.id!, task).subscribe({
      next: () => {
        this.editingId = null;
        this.fetchTasks();
      },
      error: (err) => {
        console.error('❌ Failed to update task:', err);
      }
    });
  }
}
}


  deleteTask(task: Task): void {
    this.modalService.warning({
      nzTitle: `Are you sure you want to delete "${task.title}"?`,
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes',
      nzOnOk: () => {
        this.taskService.deleteTask(task.id!).subscribe({
          next: () => {
            this.fetchTasks(); // refresh list after delete
          },
          error: (err) => {
            console.error('❌ Failed to delete task:', err);
          }
        });
      }
    });
  }
}


