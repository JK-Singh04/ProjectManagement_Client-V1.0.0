//add-task-modal.component.ts
import { Input, Component, OnInit } from '@angular/core';
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
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { PreventEnterSubmitDirective } from '../../../../directives/prevent-enter-submit.directive';
import { ProjectService } from '../../../../shared/services/project.service';
import { UserService } from '../../../../shared/services/user.service';
import { TaskService, Task } from '../../../../shared/services/task.service';
@Component({
  selector: 'app-add-task-modal',
  standalone: true,
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
    PreventEnterSubmitDirective,
  ],
  templateUrl: './add-task-modal.component.html',
  styleUrls: ['./add-task-modal.component.scss'],
})
export class AddTaskModalComponent {
  @Input() projectId!: number;

  taskForm: FormGroup;
  priorities = ['Low', 'Medium', 'High', 'Urgent'];
  statuses = ['To Do', 'Work In Progress', 'Under Review', 'Completed'];
  tags: string[] = [];
  users: { id: string; name: string }[] = [];
  currentUserId: string | null = null;
  currentUserName: string | null = null;
  attachments: NzUploadFile[] = [];

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private taskService: TaskService,
    private userService: UserService,
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      status: ['', Validators.required],
      priority: ['', Validators.required],
      tags: [this.tags],
      startDate: [null, [Validators.required]],
      dueDate: [null, [Validators.required]],
      assignee: ['', Validators.required],
      author: [''],
      attachments: [this.attachments],
      allowSelfAssign: [false],
    });
  }
  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users.map((u) => ({
          id: u.id,
          name: u.fullName || u.email || `User ${u.id}`,
        }));

        // Fetch current user profile after users are loaded
        this.userService.getUserProfile().subscribe({
          next: (profile: any) => {
            this.currentUserId = profile.id;
            this.currentUserName =
              profile.fullName || profile.email || `User ${profile.id}`;
            this.taskForm.get('author')?.updateValueAndValidity();
          },
          error: (err) =>
            console.error('Failed to load current user profile:', err),
        });
      },
      error: (err) => console.error('Failed to load users:', err),
    });
  }

  submitForm(): void {
    if (this.taskForm.valid) {
      const formValues = this.taskForm.value;

      const taskPayload: Task = {
        title: formValues.title,
        description: formValues.description,
        status: formValues.status,
        priority: formValues.priority,
        tags: formValues.tags.join(','), // Convert array to comma-separated string
        startDate: formValues.startDate,
        dueDate: formValues.dueDate,
        projectId: this.projectId,
        assignedUserId: formValues.assignee,
        authorUserId: formValues.author,
        assignToSelf: formValues.allowSelfAssign,
        points: 0,
      };

      this.taskService.createTask(taskPayload).subscribe({
        next: (res) => {
          this.modalRef.close(res.task); // optionally return created task
        },
        error: (err) => {
          console.error('Task creation failed:', err);
        },
      });
    }
  }

  handleTagInput(value: string): void {
    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
      this.taskForm.get('tags')?.setValue(this.tags);
    }
  }

  onTagEnter(event: any): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();

    event.preventDefault();
    event.stopImmediatePropagation();

    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
      this.taskForm.get('tags')?.setValue(this.tags);
    }

    input.value = '';
  }

  onBackspace(event: any): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (!value && this.tags.length) {
      event.preventDefault();
      const removedTag = this.tags.pop();
      this.taskForm.get('tags')?.setValue(this.tags);
      console.log(`Removed tag: ${removedTag}`);
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter((t) => t !== tag);
    this.taskForm.get('tags')?.setValue(this.tags);
  }

  beforeUpload(file: NzUploadFile, fileList: NzUploadFile[]): boolean {
    const isValid = file.size !== undefined && file.size / 1024 / 1024 < 5;
    if (!isValid) {
      console.error('File size exceeds 5MB limit.');
    }
    return isValid;
  }

  handleFileChange(event: any): void {
    this.attachments = event.fileList;
    this.taskForm.get('attachments')?.setValue(this.attachments);
  }

  cancel(): void {
    this.taskForm.reset();
    this.tags = [];
    this.attachments = [];
    this.modalRef.destroy();
  }
}
