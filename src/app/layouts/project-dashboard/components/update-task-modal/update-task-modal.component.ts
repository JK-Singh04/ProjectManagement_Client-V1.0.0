//  update-task-modal.component.ts
import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';

import { TaskService, Task } from '../../../../shared/services/task.service';
import { UserService } from '../../../../shared/services/user.service';
import { PreventEnterSubmitDirective } from '../../../../directives/prevent-enter-submit.directive';

@Component({
  selector: 'app-update-task-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    NzButtonModule,
    NzSelectModule,
    NzUploadModule,
    NzTagModule,
    NzCheckboxModule,
  ],
  templateUrl: './update-task-modal.component.html',
  styleUrl: './update-task-modal.component.scss',
})
export class UpdateTaskModalComponent implements OnInit {
  @Input() existingTask!: Task;

  taskForm!: FormGroup;
  priorities = ['Low', 'Medium', 'High', 'Urgent'];
  statuses = ['To Do', 'Work In Progress', 'Under Review', 'Completed'];
  tags: string[] = [];
  users: { id: string; name: string }[] = [];
  attachments: NzUploadFile[] = [];

  currentUserId: string | null = null;
  currentUserName: string | null = null;

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private taskService: TaskService,
    private userService: UserService,
    private message: NzMessageService
  ) {}

ngOnInit(): void {
  this.taskForm = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    status: ['', Validators.required],
    priority: ['', Validators.required],
    tags: [[]],
    startDate: [null, Validators.required],
    dueDate: [null, Validators.required],
    assignee: ['', Validators.required],
    author: [''],
    attachments: [[]],
    allowSelfAssign: [false],
  });

  // Load users first
  this.userService.getAllUsers().subscribe({
    next: (users) => {
      this.users = users.map(u => ({
        id: u.id,
        name: u.fullName || u.email || `User ${u.id}`
      }));

      // Once users are loaded, patch the form
      this.patchFormWithExistingTask();
    },
    error: (err) => console.error('Failed to load users:', err),
  });

  // Load current user profile
  this.userService.getUserProfile().subscribe({
    next: (profile: any) => {
      this.currentUserId = profile.id;
      this.currentUserName = profile.fullName || profile.email || `User ${profile.id}`;

      // Patch author if not already set
      if (!this.taskForm.get('author')?.value) {
        this.taskForm.get('author')?.setValue(this.currentUserId);
      }
    },
    error: (err) => console.error('Failed to load current user profile:', err),
  });
}

patchFormWithExistingTask(): void {
  if (!this.existingTask || !this.taskForm) return;

  const task = this.existingTask;

  this.tags = task.tags?.split(',') ?? [];
  this.taskForm.patchValue({
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    tags: this.tags,
    startDate: new Date(task.startDate),
    dueDate: new Date(task.dueDate),
    assignee: task.assignedUserId,
    author: task.authorUserId,
    allowSelfAssign: task.assignToSelf,
  });
}


  submitForm(): void {
    if (this.taskForm.invalid || !this.existingTask?.id) return;

    const formValues = this.taskForm.value;

    const updatedTask: Task = {
      ...this.existingTask,
      title: formValues.title,
      description: formValues.description,
      status: formValues.status,
      priority: formValues.priority,
      tags: formValues.tags.join(','),
      startDate: formValues.startDate,
      dueDate: formValues.dueDate,
      assignedUserId: formValues.assignee,
      authorUserId: formValues.author,
      assignToSelf: formValues.allowSelfAssign,
    };

    this.taskService.updateTask(this.existingTask.id, updatedTask).subscribe({
      next: (res) => {
        this.message.success('Task updated successfully!');
        this.modalRef.close(res.task);
      },
      error: (err) => {
        console.error('Failed to update task', err);
        this.message.error('Could not update task.');
      },
    });
  }

  cancel(): void {
    this.modalRef.destroy();
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter((t) => t !== tag);
    this.taskForm.get('tags')?.setValue(this.tags);
  }

  onTagEnter(event: any): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
      this.taskForm.get('tags')?.setValue(this.tags);
    }
    input.value = '';
    event.preventDefault();
  }

  onBackspace(event: any): void {
    const input = event.target as HTMLInputElement;
    if (!input.value && this.tags.length) {
      this.tags.pop();
      this.taskForm.get('tags')?.setValue(this.tags);
    }
  }

  beforeUpload(file: NzUploadFile): boolean {
    return file.size! / 1024 / 1024 < 5;
  }

  handleFileChange(event: any): void {
    this.attachments = event.fileList;
    this.taskForm.get('attachments')?.setValue(this.attachments);
  }
  
}
