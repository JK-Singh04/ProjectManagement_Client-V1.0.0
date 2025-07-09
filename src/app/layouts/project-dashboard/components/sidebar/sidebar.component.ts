//sidebar.component.ts
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HideIfClaimsNotMetDirective } from '../../../../directives/hide-if-claims-not-met.directive';
import { claimReq } from '../../../../shared/utils/claimReq-utils';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { take } from 'rxjs';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  QueryList,
  ElementRef,
  ViewChildren,
} from '@angular/core';

import { UserService } from '../../../../shared/services/user.service';
import { TeamService, Team } from '../../../../shared/services/team.service';
import { UserProfileModalComponent } from '../user-profile-modal/user-profile-modal.component';
import { UpdateProjectModalComponent } from '../update-project-modal/update-project-modal.component';
import { UpdateTeamModalComponent } from '../update-team-modal/update-team-modal.component';
import { ProjectService } from '../../../../shared/services/project.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HideIfClaimsNotMetDirective,
    NzMenuModule,
    NzIconModule,
    NzAvatarModule,
    NzModalModule,
    NzDividerModule,
    NzLayoutModule,
    NzToolTipModule,
    NzDropDownModule,
    NzButtonModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, AfterViewInit {
  @Input() isCollapsed = false;
  claimReq = claimReq;
  projectForm: any;

  @ViewChildren('menuItem') menuItems!: QueryList<ElementRef<HTMLElement>>;

  fullName: string = '';
  email: string = '';
avatarUrl: string = '';

  projects$!: Observable<{ name: string }[]>;
  selectedProjectName: string = '';

  teams$!: Observable<{ id: number; name: string }[]>;
  selectedTeamName: string = '';

  constructor(
    private router: Router,
    private userService: UserService,
    private modal: NzModalService,
    private projectService: ProjectService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    // ✅ Call the API and update BehaviorSubject
    this.projectService.getAllProjects().subscribe({
      next: (projects) => {
        this.projectService.setProjects(projects); // Updates the observable used in UI
      },
      error: (err) => {
        console.error('Error loading projects in sidebar', err);
      },
    });

    // Existing logic for setting up the observable pipeline
    this.projects$ = this.projectService.projects$.pipe(
      map((projects) =>
        projects.map((project) => ({
          id: project.id,
          name: project.projectName,
        }))
      )
    );

    this.projectService.selectedProject$.subscribe((project) => {
      this.selectedProjectName = project?.projectName || '';
    });

this.userService.getUserProfile().subscribe({
  next: (res: any) => {
    this.fullName = res.fullName;
    this.email = res.email;

    // ✅ Set avatar image if available
    if (res.profilePic) {
      this.avatarUrl = `http://localhost:5007${res.profilePic}`;
    }
  },
  error: (err: any) =>
    console.error('Error fetching user profile in sidebar', err),
});


    this.teamService.getAllTeams().subscribe({
      next: (teams) => {
        this.teamService.setTeams(teams);
      },
      error: (err) => console.error('Error loading teams in sidebar', err),
    });

    this.teams$ = this.teamService.teams$.pipe(
      map((teams) =>
        teams.map((team) => ({ id: team.id!, name: team.teamName }))
      )
    );

    this.teamService.selectedTeam$.subscribe((team) => {
      this.selectedTeamName = team?.teamName || '';
    });
    // ✅ Extra guard to clear stale teams if user has none
    this.teamService.teams$.pipe(take(1)).subscribe((teams) => {
      if (!teams.length) {
        this.teamService.clearTeams();
      }
    });
  }

switchProject(projectName: string): void {
  this.projectService.projects$.pipe(take(1)).subscribe((projects) => {
    const selected = projects.find((p) => p.projectName === projectName);
    if (!selected || selected.id == null) return; // ✅ guard added

    this.projectService.getProjectById(selected.id).subscribe({
      next: (fullProject) => {
        this.projectService.setSelectedProject(fullProject);
        this.router.navigate(['/projects'], {
          queryParams: { project: fullProject.id },
        });
      },
      error: (err) => {
        console.warn('⚠️ Limited permission. Using fallback.', err);
        this.projectService.setSelectedProject(selected); // ✅ fallback
        this.router.navigate(['/projects'], {
          queryParams: { project: selected.id },
        });
      }
    });
  });
}



  ngAfterViewInit(): void {
    setTimeout(() => {
      this.menuItems.forEach((el) => {
        const nativeEl = el?.nativeElement;
        if (!nativeEl) return;

        const textSpan = nativeEl.querySelector('span');
        if (this.isCollapsed) {
          nativeEl.setAttribute('title', textSpan?.textContent?.trim() || '');
        } else {
          nativeEl.removeAttribute('title');
        }
      });
    });
  }

  ngOnChanges(): void {
    this.ngAfterViewInit();
  }

openUserProfile(): void {
  const modalRef = this.modal.create({
    nzTitle: 'Edit Profile',
    nzContent: UserProfileModalComponent,
    nzWidth: 700,
    nzFooter: null,
  });

  modalRef.afterClose.subscribe((result) => {
    if (result === 'profileUpdated') {
      this.userService.getUserProfile().subscribe({
        next: (res: any) => {
          this.fullName = res.fullName;
          this.email = res.email;
          this.avatarUrl = res.profilePic
            ? `http://localhost:5007${res.profilePic}`
            : '';
        },
      });
    }
  });
}

  updateProject(project: any): void {
    this.projectService.getProjectById(project.id).subscribe({
      next: (fullProject) => {
        const modalRef = this.modal.create({
          nzTitle: 'Update Project',
          nzContent: UpdateProjectModalComponent,
          nzFooter: null,
          nzWidth: 700,
        });

        // ✅ Assign component inputs after modal creation
        if (modalRef.componentInstance) {
          modalRef.componentInstance.mode = 'edit';
          modalRef.componentInstance.existingProject = fullProject;
        }

        // ✅ Handle modal result
        modalRef.afterClose.subscribe((result) => {
          if (result?.name) {
            const updatedProjects = [
              ...this.projectService.getCurrentProjects(),
            ];
            const index = updatedProjects.findIndex((p) => p.id === result.id);
            if (index !== -1) {
              updatedProjects[index] = result;
            } else {
              updatedProjects.push(result);
            }
            this.projectService.setProjects(updatedProjects);
            this.projectService.setSelectedProject(result);
            this.selectedProjectName = result.projectName;
          }
        });
      },
      error: (err) => {
        console.error('Failed to fetch project for update', err);
      },
    });
  }

  deleteProject(project: any): void {
    this.modal.warning({
      nzTitle: `Are you sure you want to delete "${project.projectName}"?`,
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes',
      nzOnOk: () => {
        this.projectService.deleteProject(project.id).subscribe({
          next: () => {
            // Remove deleted project from BehaviorSubject
            const currentProjects = this.projectService.getCurrentProjects();
            const updatedProjects = currentProjects.filter(
              (p) => p.id !== project.id
            );
            this.projectService.setProjects(updatedProjects);

            // If deleted project was selected, reset selection
            if (this.selectedProjectName === project.projectName) {
              this.projectService.setSelectedProject(null);
              this.selectedProjectName = '';
            }
          },
          error: (err) => {
            console.error('Failed to delete project', err);
          },
        });
      },
    });
  }

  stopEvent(event: any): void {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
  }

  switchTeam(teamName: string): void {
    this.teamService.teams$.pipe(take(1)).subscribe((teams) => {
      const selected = teams.find((t) => t.teamName === teamName);
      if (selected) {
        this.teamService.setSelectedTeam(selected);
        this.router.navigate(['/teams'], {
          queryParams: { team: selected.id },
        });
      }
    });
  }
}

/*updateTeam(team: any): void {
    this.teamService.getTeamById(team.id).subscribe({
      next: (fullTeam) => {
        const modalRef = this.modal.create({
          nzTitle: 'Update Team',
          nzContent: UpdateTeamModalComponent, // Replace this with your UpdateTeamModalComponent
          nzFooter: null,
          nzWidth: 700,
        });

        if (modalRef.componentInstance) {
          modalRef.componentInstance.mode = 'edit';
          modalRef.componentInstance.existingTeam = fullTeam;
        }

        modalRef.afterClose.subscribe((result) => {
          if (result?.teamName) {
            const updatedTeams = [...this.teamService.getCurrentTeams()];
            const index = updatedTeams.findIndex((t) => t.id === result.id);
            if (index !== -1) {
              updatedTeams[index] = result;
            } else {
              updatedTeams.push(result);
            }
            this.teamService.setTeams(updatedTeams);
            this.teamService.setSelectedTeam(result);
            this.selectedTeamName = result.teamName;
          }
        });
      },
      error: (err) => console.error('Failed to fetch team for update', err),
    });
  }

  deleteTeam(team: any): void {
    this.modal.warning({
      nzTitle: `Are you sure you want to delete "${team.teamName}"?`,
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Yes',
      nzOnOk: () => {
        this.teamService.deleteTeam(team.id).subscribe({
          next: () => {
            // ✅ Refetch from API instead of filtering local list
            this.teamService.getAllTeams().subscribe({
              next: (updatedTeams) => {
                this.teamService.setTeams(updatedTeams);

                if (this.selectedTeamName === team.teamName) {
                  this.teamService.setSelectedTeam(null);
                  this.selectedTeamName = '';
                }

                console.log(`✅ Deleted and refreshed teams list`);
              },
              error: (err) => {
                console.error('Error refreshing teams after delete', err);
              },
            });
          },
          error: (err) => {
            console.error('Failed to delete team', err);
          },
        });
      },
    });
  } */