//invite-people-modal.component.ts
import { Component, Input,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { PreventEnterSubmitDirective } from '../../../../directives/prevent-enter-submit.directive';
import { InviteService } from '../../../../shared/services/invite.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ProjectService } from '../../../../shared/services/project.service';
import { TeamService } from '../../../../shared/services/team.service';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-invite-people-modal',
  standalone: true,
  imports: [
    CommonModule,
    NzFormModule,
    ReactiveFormsModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzIconModule,
  ],
  providers: [TeamService], // ✅ ADD THIS
  templateUrl: './invite-people-modal.component.html',
  styleUrls: ['./invite-people-modal.component.scss']
})
export class InvitePeopleModalComponent {
  inviteForm: FormGroup;

  @Input() teamId!: number;

  projectList: string[] = []; // now dynamically populated
  teamList: { id: number; name: string }[] = [];
  projectRoles = ['Administrator', 'Manager', 'Member'];

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private inviteService: InviteService,
    private message: NzMessageService,
    private projectService: ProjectService,
    private teamService: TeamService // ✅ inject team service
  ) {
    this.inviteForm = this.fb.group({
      emails: [[], [Validators.required]], // Changed from string to string[]
      project: [null, Validators.required],
      role: [this.projectRoles[0], Validators.required],
      team: [null, Validators.required]  // ✅ new control for selecting team
    });
  }
ngOnInit(): void {
  this.projectService.getAllProjects().subscribe({
    next: (projects) => {
      this.projectList = projects.map(p => p.projectName);
      if (this.projectList.length > 0) {
        this.inviteForm.patchValue({ project: this.projectList[0] });
      }
    },
    error: (err) => {
      console.error('Failed to fetch projects', err);
      this.message.error('Could not load projects');
    }
  });

  this.teamService.getMyTeams().subscribe({
    next: (teams) => {
      this.teamList = teams.map((t: any) => ({ id: t.id, name: t.teamName }));
      if (this.teamId) {
        this.inviteForm.patchValue({ team: this.teamId });
      }
    },
    error: (err) => {
      console.error('Failed to fetch teams', err);
      this.message.error('Could not load teams');
    }
  });
}

isSubmitting = false;

submitForm(): void {
  if (this.inviteForm.valid) {
    this.isSubmitting = true;
const { emails, team } = this.inviteForm.value;
const inviteRequests = emails.map((email: string) => ({
  email,
  teamId: team
}));


    const inviteObservables = inviteRequests.map((invite: { email: string; teamId: number }) =>
      this.inviteService.sendInvite(invite).pipe(
        catchError((err) => {
          console.error(`❌ Error sending invite to ${invite.email}`, err);
          return of({ error: true, email: invite.email });
        })
      )
    );

forkJoin(inviteObservables as Observable<any>[]).subscribe((results: any[]) => {
      const failed = results.filter((res) => (res as any).error);
      const successCount = results.length - failed.length;

      if (successCount > 0) {
        this.message.success(`✅ ${successCount} invite(s) sent successfully.`);
      }

      if (failed.length > 0) {
        const failedEmails = failed.map((f: any) => f.email).join(', ');
        this.message.error(`❌ Failed to send invites to: ${failedEmails}`);
      }

      this.modalRef.close(inviteRequests);
      this.isSubmitting = false;
    });
  }
}


  cancel(): void {
    this.inviteForm.reset();
    this.modalRef.destroy();
  }

  inviteFrom(provider: string) {
    alert(`Invite from ${provider} not implemented yet.`);
  }
}