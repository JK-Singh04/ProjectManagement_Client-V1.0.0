//create-team-modal.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { PreventEnterSubmitDirective } from '../../../../directives/prevent-enter-submit.directive';
import { CreateTeamRequest,TeamService } from '../../../../shared/services/team.service';
@Component({
  selector: 'app-create-team-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzCheckboxModule,
    NzButtonModule,
    PreventEnterSubmitDirective
  ],
  templateUrl: './create-team-modal.component.html',
  styleUrl: './create-team-modal.component.scss'
})
export class CreateTeamModalComponent {
  teamForm: FormGroup;
  visibilityOptions = ['Public', 'Private'];
  //users = ['User 1', 'User 2', 'User 3', 'User 4', 'User 5'];
  maxUsers = 50;
  constructor(private fb: FormBuilder, private modalRef: NzModalRef) {
    this.teamForm = this.fb.group({
      name: ['', Validators.required],
      visibility: ['Public'],
      //members: [[], Validators.required],
      allowAnyoneJoin: [false]
    });
  }
  getMaxTagPlaceholder = (omittedValues: any[]) => `+${omittedValues.length} more`;

  submitForm(): void {
  if (this.teamForm.valid) {
    const formValue = this.teamForm.value;

    const teamPayload: CreateTeamRequest = {
      teamName: formValue.name,
      isPrivate: formValue.visibility === 'Private',
      allowJoinWithoutApproval: formValue.allowAnyoneJoin,
      userIds: formValue.members,        // assume these are user IDs
      projectIds: []                     // no projects selected yet
    };

    this.modalRef.close(teamPayload);
  }
}

  cancel(): void {
    this.teamForm.reset();
    this.modalRef.destroy();
  }
}
