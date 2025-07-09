//update-team-modal.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PreventEnterSubmitDirective } from '../../../../directives/prevent-enter-submit.directive';

import { TeamService, Team, UpdateTeamRequest } from '../../../../shared/services/team.service';
import { UserService } from '../../../../shared/services/user.service';
import { ProjectService } from '../../../../shared/services/project.service';

@Component({
  selector: 'app-update-team-modal',
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
  templateUrl: './update-team-modal.component.html',
  styleUrls: ['./update-team-modal.component.scss']
})
export class UpdateTeamModalComponent implements OnInit {
  @Input() existingTeam!: Team;
  @Input() mode: string | null = null; // ✅ Add this input

  teamForm!: FormGroup;
  visibilityOptions = ['Public', 'Private'];
  maxUsers = 50;

  allUsers: { id: string; name: string }[] = [];
  allProjects: { id: number; name: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private teamService: TeamService,
    private userService: UserService,
    private projectService: ProjectService,
    private message: NzMessageService
  ) {}

 ngOnInit(): void {
  this.teamForm = this.fb.group({
    name: ['', Validators.required],
    visibility: ['Public'],
    allowAnyoneJoin: [false],
    members: [[], Validators.required],
    projects: [[]]
  });

  this.loadData();

  if (this.existingTeam) {
    const extractedUserIds = this.existingTeam['members']?.map((m: any) => m.userId) || [];

    this.teamForm.patchValue({
      name: this.existingTeam.teamName,
      visibility: this.existingTeam.isPrivate ? 'Private' : 'Public',
      allowAnyoneJoin: this.existingTeam.allowJoinWithoutApproval,
      members: extractedUserIds,
      projects: this.existingTeam.projectIds || []
    });
  }
}

  loadData(): void {
  this.userService.getAllUsers().subscribe((users: { id: string; fullName?: string; email?: string }[]) => {
    this.allUsers = users.map((u: { id: string; fullName?: string; email?: string }) => ({
      id: u.id,
      name: u.fullName || u.email || `User ${u.id}`
    }));
  });

  this.projectService.getAllProjects().subscribe((projects: { id?: number; projectName: string }[]) => {
    this.allProjects = projects
      .filter(p => p.id !== undefined)
      .map(p => ({
        id: p.id as number,
        name: p.projectName
      }));
  });
}


  getMaxTagPlaceholder = (omitted: any[]) => `+${omitted.length} more`;

  submitForm(): void {
    if (this.teamForm.invalid || !this.existingTeam?.id) return;

    const formValue = this.teamForm.value;

    const updatePayload: UpdateTeamRequest = {
      teamName: formValue.name,
      isPrivate: formValue.visibility === 'Private',
      allowJoinWithoutApproval: formValue.allowAnyoneJoin,
      userIds: formValue.members as string[],
      projectIds: formValue.projects as number[]
    };

    this.teamService.updateTeam(this.existingTeam.id!, updatePayload).subscribe({
      next: (res) => {
        this.message.success('✅ Team updated successfully!');
        this.modalRef.close(res);
      },
      error: (err) => {
        console.error('❌ Error updating team:', err);
        this.message.error('Failed to update team.');
      }
    });
  }

  cancel(): void {
    this.modalRef.destroy();
  }
}
