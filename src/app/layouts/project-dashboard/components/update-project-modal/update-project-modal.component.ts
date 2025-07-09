//update-project-modal.component.ts
import {
  Component,
  Input,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule
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
  selector: 'app-update-project-modal',
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
  templateUrl: './update-project-modal.component.html',
  styleUrls: ['./update-project-modal.component.scss'],
})
export class UpdateProjectModalComponent implements OnInit {
  @Input() existingProject: Project | null = null;
  @Input() mode: string | null = null; // ✅ Add this input

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

    if (this.existingProject) {
      console.log('✏️ Pre-filling project update form', this.existingProject);

      this.projectForm.patchValue({
        projectName: this.existingProject.projectName,
        description: this.existingProject.description,
        proposedstartDate: this.toDate(this.existingProject.proposedStartDate),
        proposeddueDate: this.toDate(this.existingProject.proposedDueDate),
        actualstartDate: this.toDate(this.existingProject.actualStartDate),
        actualdueDate: this.toDate(this.existingProject.actualDueDate),
      });
    }
  }

  toDate(value: string | null | undefined): Date | null {
    return value ? new Date(value) : null;
  }

  submitForm(): void {
    if (this.projectForm.invalid) {
      this.message.warning('Please fill all required fields correctly.');
      return;
    }

    if (!this.existingProject?.id) {
      this.message.error('Project ID is missing!');
      return;
    }

    const formValue = this.projectForm.value;
    const updatedProject: Project = {
      projectName: formValue.projectName!,
      description: formValue.description!,
      proposedStartDate: formValue.proposedstartDate!,
      proposedDueDate: formValue.proposeddueDate!,
      actualStartDate: formValue.actualstartDate ?? undefined,
      actualDueDate: formValue.actualdueDate ?? undefined,
      userRole: this.existingProject.userRole, // Preserve user role
    };

    this.projectService.updateProject(this.existingProject.id, updatedProject).subscribe({
      next: (res) => {
        this.message.success('Project updated successfully!');
        this.modalRef.close(res);
      },
      error: (err) => {
        console.error('Failed to update project', err);
        this.message.error('Could not update project.');
      },
    });
  }

  cancel(): void {
    this.modalRef.destroy();
  }
}
