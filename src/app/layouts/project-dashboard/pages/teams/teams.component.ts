// File: teams.component.ts
import { UserService } from '../../../../shared/services/user.service';
import { HideIfClaimsNotMetDirective } from '../../../../directives/hide-if-claims-not-met.directive';
import { claimReq } from '../../../../shared/utils/claimReq-utils';

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { CreateTeamModalComponent } from '../../components/create-team-modal/create-team-modal.component';
import { InvitePeopleModalComponent } from '../../components/invite-people-modal/invite-people-modal.component';
import { Team, TeamService } from '../../../../shared/services/team.service';

//Zorro Ant Design imports
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    CommonModule,
    HideIfClaimsNotMetDirective,
    SidebarComponent,
    HeaderComponent,
    NzIconModule,
    NzButtonModule,
    NzLayoutModule,
    NzModalModule,
  ],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
})
export class TeamsComponent implements OnInit {
  isCollapsed = false;
  isDarkMode = false;
  fullName: string = '';
  claimReq = claimReq;
  @Output() teamChange = new EventEmitter<string>();

  selectedTeam: string | null = null;

  teams: Team[] = [];

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.teamService.getAllTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
        this.teamService.setTeams(teams);
      },
      error: (err) => {
        console.error('Failed to load teams:', err);
      },
    });
  }

  projects$;

  constructor(
    private router: Router,
    private authService: AuthService,
    private modal: NzModalService,
    private teamService: TeamService
  ) {
    this.projects$ = this.teamService.teams$;
  }
  onLogout(): void {
    this.authService.deleteToken();
    this.router.navigateByUrl('/signin');
  }
  toggleTheme(): void {
    const theme = this.isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  onTeamChange(teamName: string) {
    this.teamChange.emit(teamName);
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

  invitePeopleModal(): void {
    const selectedTeam = this.teamService.getCurrentSelectedTeam();

    const modalRef = this.modal.create({
      nzTitle: 'Add People to Team',
      nzContent: InvitePeopleModalComponent,
      nzFooter: null,
      nzWidth: 600,
    });
  }
}
