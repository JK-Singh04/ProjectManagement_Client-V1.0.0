//user-profile-modal.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, of, Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgForOf, NgIf } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NzUploadModule,
  NzUploadChangeParam,
  NzUploadFile,
  NzUploadXHRArgs,
} from 'ng-zorro-antd/upload';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { UserService } from '../../../../shared/services/user.service';
import { ProjectService } from '../../../../shared/services/project.service';
import { TeamService } from '../../../../shared/services/team.service';

@Component({
  selector: 'app-user-profile-modal',
  templateUrl: './user-profile-modal.component.html',
  styleUrls: ['./user-profile-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NgForOf,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    NzSpaceModule,
    NzButtonModule,
    NzTabsModule,
    NzIconModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzUploadModule,
    NzStepsModule,
    NzPopoverModule,
    NzToolTipModule,
    NzTagModule,
    NzCollapseModule,
    NzSpinModule,
  ],
})
export class UserProfileModalComponent implements OnInit {
  selectedTabIndex = 0;
  progressStage = 0;
  dateFormat = 'dd/MM/yyyy';
  avatarUrl?: string;
  loading = false;
  userProfile: FormGroup;
  // List of step keys corresponding to form control names
  stepFields = ['fullName', 'email'];
  // Mapping of form control names to display names
  fieldDisplayNames: { [key: string]: string } = {
    fullName: 'Username',
    email: 'Email',
  };
  stepStatus: boolean[] = [];
  availableProjectRoles: string[] = [];
  availableTeams: string[] = [];

  isEditMode = false; // you can toggle this with an "Edit" button if needed

  ngOnInit(): void {
    this.stepStatus = this.stepFields.map(() => false);

    this.userProfile.valueChanges.subscribe(() => this.updateStepStatus());

    this.userService.getUserProfile().subscribe({
      next: (res: any) => {
        console.log('User Profile Fetched:', res);
        this.userProfile.patchValue({
          fullName: res.fullName || '',
          email: res.email || '',
          gender: res.gender || '',
          dob: res.dob ? new Date(res.dob) : null,
        });

        if (res.profilePic) {
          this.avatarUrl = `http://localhost:5007${res.profilePic}`;
        }

        // 🟢 Fetch project roles
        this.projectService.getAllProjects().subscribe((projects) => {
          this.availableProjectRoles = projects.map(
            (p) => `${p.projectName} (${p.userRole})`
          );
          const selectedRoles = this.availableProjectRoles; // same as list since it's user-specific
          this.userProfile.patchValue({ projectRoles: selectedRoles });
        });

        // 🟢 Fetch teams
        this.teamService.getMyTeams().subscribe((teams) => {
          this.availableTeams = teams.map((t) => `${t.teamName} (${t.myRole})`);
          const selectedTeams = this.availableTeams; // same as list since it's user-specific
          this.userProfile.patchValue({ teams: selectedTeams });
        });
      },
      error: (err) => {
        this.messageService.error('Failed to load user profile.');
        console.error(err);
      },
    });
  }

  get hasProjectRoles(): boolean {
    return this.userProfile.get('projectRoles')?.value?.length > 0;
  }
  get hasTeams(): boolean {
    return this.userProfile.get('teams')?.value?.length > 0;
  }

  updateStepStatus(): void {
    this.stepStatus = this.stepFields.map(
      (field) => this.userProfile.get(field)?.valid ?? false
    );
  }

  // On step click, focus the relevant input
  onStepClick(index: number): void {
    const fieldId = this.stepFields[index];
    const element = document.getElementById(fieldId);
    if (element) {
      element.focus();
    }
    this.progressStage = index;
  }

  isFormComplete(): boolean {
    return (
      (this.userProfile.get('fullName')?.valid ?? false) &&
      (this.userProfile.get('email')?.valid ?? false) &&
      this.hasProjectRoles &&
      this.hasTeams
    );
  }

  constructor(
    private modalRef: NzModalRef,
    private messageService: NzMessageService,
    private http: HttpClient,
    private fb: FormBuilder,
    private userService: UserService,
    private projectService: ProjectService,
    private teamService: TeamService,
    private cdRef: ChangeDetectorRef
  ) {
    this.userProfile = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: [''],
      dob: [null],
      projectRoles: [[]],
      teams: [[]],
    });

    // 🧠 Bind customUpload so `this` context is preserved
    this.customUpload = this.customUpload.bind(this);
  }

  closeModal(): void {
    this.modalRef.close();
  }

  beforeUpload = (file: NzUploadFile): Observable<boolean> => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      this.messageService.error('You can only upload JPG or PNG files!');
      return of(false);
    }

    const isLt2M = (file.size ?? 0) / 1024 / 1024 < 2;
    if (!isLt2M) {
      this.messageService.error('Image must be smaller than 2MB!');
      return of(false);
    }

    return of(true);
  };
  customUpload = (item: NzUploadXHRArgs): Subscription => {
    console.log('🧪 Upload Triggered', item);

    const file: File = (item.file as any)?.originFileObj || (item.file as any);
    if (!file) {
      console.error('❌ No file found in upload item:', item);
      this.messageService.error('File upload failed. No file found.');
      return new Subscription();
    }

    const formData = new FormData();
    formData.append('file', file);
    const req = new XMLHttpRequest();
    req.open('POST', `${environment.apiBaseUrl}/userprofile/profilepic`, true);
    req.withCredentials = true;

    req.onload = () => {
      if (req.status >= 200 && req.status < 300) {
        const response = JSON.parse(req.response);
        item.onSuccess?.(response, item.file, req);

        // ✅ Update avatarUrl immediately
        this.avatarUrl = `${environment.apiBaseUrl}${response.imageUrl}`;
        this.messageService.success('Profile picture uploaded.');

        // ✅ 🟢 OPTIMISTIC REFRESH of profile form
        this.userService.getUserProfile().subscribe((res) => {
          this.userProfile.patchValue({
            fullName: res.fullName || '',
            email: res.email || '',
            gender: res.gender || '',
            dob: res.dob ? new Date(res.dob) : null,
          });

          if (res.profilePic) {
            this.avatarUrl = `http://localhost:5007${res.profilePic}`;
          }
        });
      } else {
        item.onError?.(new Error('Upload failed'), item.file);
        this.messageService.error('Upload failed.');
      }
    };

    req.onerror = () => {
      item.onError?.(new Error('Upload failed'), item.file);
      this.messageService.error('Upload failed.');
    };

    req.send(formData);
    return new Subscription();
  };

  private handleUploadSuccess(
    imageUrl: string,
    file: File,
    item: NzUploadXHRArgs
  ): void {
    this.avatarUrl = `http://localhost:5007${imageUrl}`;
    this.loading = false;
    this.messageService.success(`${file.name} uploaded successfully.`);

    const uploadFile: NzUploadFile = {
      uid: `${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified.toString(),
      url: this.avatarUrl,
      originFileObj: file,
    };

    item.onSuccess?.({}, uploadFile, new ProgressEvent('upload'));
  }

  deleteProfileImage(): void {
    if (!this.avatarUrl) return;

    this.userService.deleteProfilePicture().subscribe({
      next: (res) => {
        this.avatarUrl = '';
        this.messageService.success('Profile picture deleted.');
      },
      error: () => {
        this.messageService.error('Failed to delete profile picture.');
      },
    });
  }

  handleChange(info: NzUploadChangeParam): void {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status?.toLowerCase() === 'done') {
      this.messageService.success(
        `${info.file.name} file uploaded successfully`
      );
    } else if (info.file.status === 'error') {
      this.messageService.error(`${info.file.name} file upload failed.`);
    }
  }

  getTagColor(label: string): string {
    if (label.includes('Admin')) return 'green';
    if (label.includes('Manager')) return 'gold';
    if (label.includes('User')) return 'blue';
    return 'default';
  }
  submitUserProfile(): void {
    if (this.userProfile.invalid) {
      this.messageService.error(
        'Please fill in all required fields correctly.'
      );
      this.userProfile.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.userProfile.value,
      dob: this.userProfile.value.dob
        ? this.userProfile.value.dob.toISOString()
        : null,
    };

    this.userService.updateProfilePicture(payload).subscribe({
      next: (res) => {
        this.messageService.success('Profile updated successfully.');
        this.modalRef.close(true); // pass true to indicate successful save
      },
      error: (err) => {
        console.error(err);
        this.messageService.error('Failed to update profile.');
      },
    });
  }
  //Manage Access
  manageAccessData: {
    projects: { projectName: string; members: any[] }[];
    teams: { teamName: string; members: any[] }[];
  } = {
    projects: [],
    teams: [],
  };

  readonly roleOptions = ['Administrator', 'Manager', 'Member'];
  isLoadingManageAccess = false;

  fetchManageAccessData(): void {
    this.isLoadingManageAccess = true;

    this.projectService.getAllProjects().subscribe((projects) => {
      this.manageAccessData.projects = [];

      projects.forEach((project) => {
        this.teamService
          .getTeamMembersByProject(project.id!)
          .subscribe((members) => {
            this.manageAccessData.projects.push({
              projectName: project.projectName,
              members: members.map((m) => ({
                ...m,
                role: m.roleInTeam,
                projectId: project.id, // ✅ ADD THIS
                isSaving: false,
              })),
            });
          });
      });
    });

    this.teamService.getMyTeams().subscribe((teams) => {
      this.manageAccessData.teams = [];

      teams.forEach((team) => {
        this.teamService.getTeamById(team.id).subscribe((teamData) => {
          this.manageAccessData.teams.push({
            teamName: teamData.teamName,
            members:
              teamData.members?.map((m) => ({
                ...m,
                role: m.roleInTeam,
                teamId: team.id, // ✅ Already correct!
                isSaving: false,
              })) ?? [],
          });
        });
      });
    });
  }

  updateMemberRole(
    scope: 'project' | 'team',
    scopeName: string,
    member: any,
    newRole: string
  ): void {
    member.isSaving = true;

    const roleUpdate$ =
      scope === 'project'
        ? this.projectService.updateProjectMemberRole(
            member.projectId,
            member.userId,
            newRole
          )
        : this.teamService.updateTeamMemberRole(
            member.teamId,
            member.userId,
            newRole
          );

    roleUpdate$.subscribe({
      next: () => {
        member.role = newRole;
        this.messageService.success(
          `${member.userName}'s role updated in ${scopeName}`
        );
      },
      error: () => {
        this.messageService.error(`Failed to update ${member.userName}'s role`);
      },
      complete: () => {
        member.isSaving = false;
      },
    });
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;

    if (index === 1) {
      console.log('🟡 Fetching Manage Access Data...');
      this.fetchManageAccessData();
    }
  }
}
