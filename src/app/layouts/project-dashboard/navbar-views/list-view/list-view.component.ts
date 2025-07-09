//list-view.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzCardModule } from 'ng-zorro-antd/card';
import { CommonModule } from '@angular/common';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { UpdateTaskModalComponent } from '../../components/update-task-modal/update-task-modal.component';

import { TaskService, Task } from '../../../../shared/services/task.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-list-view',
  standalone: true,
  imports: [
    NzListModule,
    NzCardModule,
    NzTagModule,
    NzAvatarModule,
    CommonModule,
    NzCheckboxModule,
    FormsModule,
    NzIconModule,
    NzButtonModule,
    NzDropDownModule,
  ],
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
})
export class ListViewComponent implements OnInit {
  tasks: (Task & { checked?: boolean })[] = [];
  loading = false;
  projectId!: number;

  constructor(private taskService: TaskService, private route: ActivatedRoute,
              private modalService: NzModalService 
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const pid = params['project'];
      if (pid) {
        this.projectId = +pid;
        this.fetchTasks();
      } else {
        console.warn('No projectId found in query params');
      }
    });
  }

  fetchTasks(): void {
    this.loading = true;

    this.taskService
      .getTasksByProject(this.projectId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.tasks = res.map((t) => ({ ...t, checked: false }));
        },
        error: (err) => {
          console.error('Failed to fetch project tasks', err);
        },
      });
  }

  getInitials(name?: string): string {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.length === 1
      ? parts[0].charAt(0).toUpperCase()
      : (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }

  getPriorityColor(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'purple';
      case 'medium':
        return 'orange';
      case 'low':
        return 'yellow';
      case 'urgent':
        return 'red';
      default:
        return 'default';
    }
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'to do':
        return 'blue';
      case 'work in progress':
        return 'processing';
      case 'under review':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  }
openUpdateModal(task: Task): void {
const modalRef = this.modalService.create({
  nzTitle: 'Update Task',
  nzContent: UpdateTaskModalComponent,
  nzFooter: null,
});

// Set input after creation
modalRef.componentInstance!.existingTask = task;


  modalRef.afterClose.subscribe((updatedTask: Task | undefined) => {
    if (updatedTask) {
      const index = this.tasks.findIndex((t) => t.id === updatedTask.id);
      if (index > -1) this.tasks[index] = { ...updatedTask, checked: false };
    }
  });
}

confirmDelete(task: Task): void {
  this.modalService.confirm({
    nzTitle: 'Are you sure you want to delete this task?',
    nzContent: `<b>${task.title}</b> will be permanently deleted.`,
    nzOkText: 'Yes',
    nzOkType: 'primary',
    nzOkDanger: true,
    nzOnOk: () => this.deleteTask(task),
    nzCancelText: 'No',
  });
}

deleteTask(task: Task): void {
  this.taskService.deleteTask(task.id!).subscribe({
    next: () => {
      this.tasks = this.tasks.filter((t) => t.id !== task.id);
    },
    error: (err) => {
      console.error('Delete failed', err);
    },
  });
}

}
