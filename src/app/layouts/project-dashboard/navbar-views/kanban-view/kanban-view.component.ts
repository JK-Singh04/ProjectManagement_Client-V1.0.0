import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAvatarComponent } from 'ng-zorro-antd/avatar';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { FormsModule } from '@angular/forms';
import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  AfterViewInit,
} from '@angular/core';
import {
  CdkDropList,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { UserService } from '../../../../shared/services/user.service';
import { TaskService, Task } from '../../../../shared/services/task.service';
import { ActivatedRoute } from '@angular/router';

import { NzModalService } from 'ng-zorro-antd/modal';
import { UpdateTaskModalComponent } from '../../components/update-task-modal/update-task-modal.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';


@Component({
  selector: 'app-kanban-view',
  standalone: true,
  templateUrl: './kanban-view.component.html',
  styleUrls: ['./kanban-view.component.scss'],
  imports: [
    CommonModule,
    NzTagModule,
    DragDropModule,
    NzSpinModule,
    NzAvatarComponent,
    NzSelectModule,
    FormsModule,
    NzButtonComponent,
    NzToolTipModule,
    NzDropDownModule, 
    NzIconModule     
  ],
})
export class KanbanBoardComponent implements OnInit, AfterViewInit {
  taskStatus: string[] = [
    'To Do',
    'Work In Progress',
    'Under Review',
    'Completed',
  ];

  tasksByStatus: { [key: string]: Task[] } = {};
  dropListRefs: string[] = [];
  projectId!: number;
  loading = false;
  hideCompleted = false;


  // Filters
  allTasks: Task[] = [];
  assigneeOptions: { id: string; name: string }[] = [];
  selectedAssignees: string[] = [];
  onlyMyTasks = false;
  searchText = '';

  currentUserId = '';
  currentUserName = '';

  @ViewChildren(CdkDropList) dropLists!: QueryList<CdkDropList>;

 constructor(
  private taskService: TaskService,
  private userService: UserService,
  private route: ActivatedRoute,
  private modal: NzModalService,
  private message: NzMessageService
) {}


  ngOnInit(): void {
    for (const status of this.taskStatus) {
      this.tasksByStatus[status] = [];
    }

    this.route.queryParams.subscribe((params) => {
      const pid = params['project'];
      if (pid) {
        this.projectId = +pid;
        this.loadCurrentUser();
      } else {
        console.warn('No projectId found in query params');
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.dropListRefs = this.dropLists.map((dl) => dl.id);
    });
  }

  loadTasks(): void {
    this.loading = true;

    this.taskService.getTasksByProject(this.projectId).subscribe({
      next: (tasks) => {
        this.allTasks = tasks;
        this.extractAssignees(tasks);
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.loading = false;
      },
    });
  }

  extractAssignees(tasks: Task[]) {
    const seen = new Set();
    this.assigneeOptions = [];
    for (const t of tasks) {
      if (t.assignedUserId && !seen.has(t.assignedUserId)) {
        seen.add(t.assignedUserId);
        this.assigneeOptions.push({ id: t.assignedUserId, name: t.assignedFullName || 'User' });
      }
    }
  }

loadCurrentUser(): void {
  this.userService.getUserProfile().subscribe(
    (user: any) => {
      console.log('Loaded user profile:', user); // <-- Add this
      this.currentUserId = user.id;
      this.currentUserName = user.fullName;
      this.loadTasks();
    },
    (err) => {
      console.error('Error fetching current user', err);
    }
  );
}

applyFilters(): void {
  const filtered = this.allTasks.filter((task) => {
if (this.onlyMyTasks && String(task.assignedUserId) !== String(this.currentUserId)) {
      return false;
    }
    if (this.selectedAssignees.length > 0 && !this.selectedAssignees.includes(task.assignedUserId || '')) {
      return false;
    }
    if (this.hideCompleted && task.status === 'Completed') {
      return false;
    }
    if (
      this.searchText &&
      !(
        task.title?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        task.description?.toLowerCase().includes(this.searchText.toLowerCase())
      )
    ) {
      return false;
    }
    return true;
  });

  for (const status of this.taskStatus) {
    this.tasksByStatus[status] = filtered.filter((t) => t.status === status);
  }
}


  drop(event: CdkDragDrop<Task[]>, newStatus: string): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      const oldStatus = task.status;

      task.status = newStatus;

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.taskService.updateTask(task.id!, { ...task }).subscribe({
        error: (err) => {
          console.error('Error updating task status', err);
          task.status = oldStatus;
          this.loadTasks();
        },
      });
    }
  }

  getInitials(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'To Do': '#ffcc00',
      'Work In Progress': '#00ccff',
      'Under Review': '#ff6600',
      Completed: '#66cc66',
    };
    return colors[status] || '#ccc';
  }

  onAssigneeFilterChange(): void {
    this.applyFilters();
  }

  toggleMyTasks(): void {
    this.onlyMyTasks = !this.onlyMyTasks;
    this.applyFilters();
  }

  toggleCompleted(): void {
    this.hideCompleted = !this.hideCompleted;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  filterByAvatar(userId: string): void {
    if (this.selectedAssignees.includes(userId)) {
      this.selectedAssignees = this.selectedAssignees.filter(id => id !== userId);
    } else {
      this.selectedAssignees.push(userId);
    }
    this.applyFilters();
  }
  clearFilters(): void {
  this.selectedAssignees = [];
  this.onlyMyTasks = false;
  this.hideCompleted = false;
  this.searchText = '';
  this.applyFilters();
}
openUpdateModal(task: Task): void {
const modalRef = this.modal.create({
  nzTitle: 'Update Task',
  nzContent: UpdateTaskModalComponent,
  nzFooter: null,
});

// Set input after creation
modalRef.componentInstance!.existingTask = task;

  modalRef.afterClose.subscribe((updatedTask: Task | undefined) => {
    if (updatedTask) {
      this.loadTasks();
      this.message.success('Task updated successfully');
    }
  });
}

confirmDelete(task: Task): void {
  this.modal.confirm({
    nzTitle: 'Are you sure you want to delete this task?',
    nzContent: `<b>${task.title}</b> will be permanently deleted.`,
    nzOkText: 'Yes',
    nzOkDanger: true,
    nzOnOk: () => this.deleteTask(task),
    nzCancelText: 'No',
  });
}

deleteTask(task: Task): void {
  this.taskService.deleteTask(task.id!).subscribe({
    next: () => {
      this.loadTasks();
      this.message.success('Task deleted successfully');
    },
    error: (err) => {
      console.error('Delete failed', err);
      this.message.error('Failed to delete task');
    },
  });
}

}
