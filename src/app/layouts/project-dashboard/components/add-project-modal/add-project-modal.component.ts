import {
  Component,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PreventEnterSubmitDirective } from '../../../../directives/prevent-enter-submit.directive';
import { ProjectService, Project } from '../../../../shared/services/project.service';

@Component({
  selector: 'app-add-project-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PreventEnterSubmitDirective,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    NzButtonModule,
  ],
  templateUrl: './add-project-modal.component.html',
  styleUrls: ['./add-project-modal.component.scss'],
})
export class AddProjectModalComponent implements OnInit {
  projectForm: any;

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private projectService: ProjectService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.projectForm = this.fb.group({
      projectName: ['', Validators.required],
      description: ['', Validators.required],
      proposedstartDate: [null, Validators.required],
      proposeddueDate: [null, Validators.required],
      actualstartDate: [null],
      actualdueDate: [null],
    });
  }

  submitForm(): void {
    if (this.projectForm.invalid) {
      this.message.warning('Please fill all required fields correctly.');
      return;
    }

    const formValue = this.projectForm.value;
    const project: Project = {
      projectName: formValue.projectName!,
      description: formValue.description!,
      proposedStartDate: formValue.proposedstartDate!,
      proposedDueDate: formValue.proposeddueDate!,
      actualStartDate: formValue.actualstartDate ?? undefined,
      actualDueDate: formValue.actualdueDate ?? undefined,
      userRole: 'Admin', // Default role for new projects, can be adjusted as needed
    };

    this.projectService.createProject(project).subscribe({
      next: (res) => {
        this.message.success('Project created successfully!');
        this.modalRef.close(res);
      },
      error: (err) => {
        console.error('Project creation failed', err);
        this.message.error('Failed to create project.');
      },
    });
  }

  cancel(): void {
    this.modalRef.destroy();
  }
}
