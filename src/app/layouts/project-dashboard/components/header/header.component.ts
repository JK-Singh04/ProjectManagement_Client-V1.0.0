//header.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule, NzButtonSize } from 'ng-zorro-antd/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AddProjectModalComponent } from '../add-project-modal/add-project-modal.component';
import { ProjectService } from '../../../../shared/services/project.service';
import { Team, TeamService } from '../../../../shared/services/team.service';
import { CreateTeamModalComponent } from '../create-team-modal/create-team-modal.component';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NzPageHeaderModule,
    NzDropDownModule,
    NzAvatarModule,
    NzBreadCrumbModule,
    NzIconModule,
    NzButtonModule,
    NzSwitchModule,
    NzSpaceModule,
    NzModalModule,
    NzTagModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  size: NzButtonSize = 'large';
  @Input() isDarkMode = false;
  @Input() teams: Team[] = []; // 👈 Add this line

  @Output() projectChange = new EventEmitter<string>();
  @Output() teamChange = new EventEmitter<string>();

  onTeamSelect(teamName: string): void {
    this.teamChange.emit(teamName);
  }

  selectedProject: string | null = null;
  selectedTeam: string | null = null;

  toggleTheme(): void {
    const theme = this.isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
  projects$;

  constructor(
    private router: Router,
    private authService: AuthService,
    private modal: NzModalService,
    private projectService: ProjectService,
    private teamService: TeamService
  ) {
    this.projects$ = this.projectService.projects$;
  }

  ngOnInit(): void {
    this.projects$ = this.projectService.projects$;
  }

  onProjectChange(projectName: string) {
    this.projectChange.emit(projectName);
    this.projectService.setSelectedProject({ name: projectName } as any); // Cast because minimal info
  }

  openAddProjectModal(): void {
    this.modal
      .create({
        nzTitle: 'Add New Project',
        nzContent: AddProjectModalComponent,
        nzFooter: null,
        nzWidth: 600,
      })
      .afterClose.subscribe((result) => {
        if (result?.name) {
          this.selectedProject = result.name;
          this.projectService.setSelectedProject(result);
          this.projectChange.emit(this.selectedProject ?? undefined);
        }
      });
  }
  openCreateTeamModal(): void {
    this.modal
      .create({
        nzTitle: 'Create New Team',
        nzContent: CreateTeamModalComponent,
        nzFooter: null,
        nzWidth: 600,
      })
      .afterClose.subscribe((result) => {
        if (result?.teamName) {
          this.teamService.createTeam(result).subscribe((newTeam) => {
            // Update current teams list in the service
            const currentTeams = this.teamService.getCurrentTeams();
            const updatedTeams = [...currentTeams, newTeam];
            this.teamService.setTeams(updatedTeams);

            this.selectedTeam = newTeam.teamName;
            this.teamChange.emit(this.selectedTeam);
          });
        }
      });
  }

  onLogout(): void {
    this.authService.deleteToken();
    this.router.navigateByUrl('/signin');
  }
}
