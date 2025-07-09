// File: users.component.ts
import {
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../../shared/services/auth.service';
import { UserService } from '../../../../shared/services/user.service';
import {
  TeamService,
  Team,
  TeamMember,
} from '../../../../shared/services/team.service';

import { HideIfClaimsNotMetDirective } from '../../../../directives/hide-if-claims-not-met.directive';
import { claimReq } from '../../../../shared/utils/claimReq-utils';

import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { UpdateTeamModalComponent } from '../../components/update-team-modal/update-team-modal.component';

// Zorro Ant Design imports
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzModalModule,NzModalService } from 'ng-zorro-antd/modal';
import { NzCardComponent } from 'ng-zorro-antd/card';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HideIfClaimsNotMetDirective,
    SidebarComponent,
    HeaderComponent,
    NzLayoutModule,
    NzIconModule,
    NzButtonModule,
    NzDropDownModule,
    NzTableModule,
    NzAvatarModule,
    NzSelectModule,
    NzTagModule,
    NzPaginationModule,
    NzInputModule,
    NzToolTipModule,
    NzBadgeModule,
    NzModalModule,
    NzCardComponent,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  isCollapsed = false;
  isDarkMode = false;
  fullName: string = '';
  claimReq = claimReq;
public objectKeys = Object.keys;

  selectedLayout: 'table' | 'grid' = 'table';

  allTeams: Team[] = [];
  filteredTeams: Team[] = [];
  pagedTeams: Team[] = [];
  allUsers: { [key: string]: string } = {}; // userId -> fullName map

  selectedPrivacyFilters: string[] = [];
  selectedManagerFilters: string[] = [];
  selectedRoleFilters: string[] = [];

  searchValue = '';
  pageIndex = 1;
  pageSize = 10;
  total = 0;
  loading = false;

  privacyFilters = [
    { text: 'Public', value: 'public' },
    { text: 'Private', value: 'private' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private teamService: TeamService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private nzModal: NzModalService 

  ) {}

  ngOnInit(): void {
    this.loadUsersAndTeams();
  }

  loadUsersAndTeams(): void {
    this.loading = true;

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users.reduce((map, user) => {
          map[user.id] = user.fullName;
          return map;
        }, {} as { [key: string]: string });

        this.teamService.getMyTeams().subscribe({
          next: (teams) => {
            this.allTeams = teams.map((team) => ({
              ...team,
              members: (team.members || []).map((m: TeamMember) => ({
                ...m,
                userName: this.allUsers[m.userId] || m.userId,
              })),
            }));

            this.applyFilters();
            this.loading = false;
          },
          error: (err) => {
            console.error('❌ Error loading teams:', err);
            this.loading = false;
          },
        });
      },
      error: (err) => {
        console.error('❌ Error loading users:', err);
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.filteredTeams = this.allTeams.filter((team) => {
      const matchesSearch = team.teamName
        .toLowerCase()
        .includes(this.searchValue.toLowerCase());

      const matchesPrivacy =
        this.selectedPrivacyFilters.length === 0 ||
        this.selectedPrivacyFilters.includes(
          team.isPrivate ? 'private' : 'public'
        );

      const matchesManager =
        this.selectedManagerFilters.length === 0 ||
        this.selectedManagerFilters.includes(team.productManagerId || '');

      const matchesRole =
        this.selectedRoleFilters.length === 0 ||
        team.members?.some((m) =>
          this.selectedRoleFilters.includes(m.roleInTeam || 'Member')
        );

      return matchesSearch && matchesPrivacy && matchesManager && matchesRole;
    });

    this.total = this.filteredTeams.length;
    this.pageIndex = 1;
    this.updatePagedTeams();
  }

  updatePagedTeams(): void {
    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedTeams = this.filteredTeams.slice(start, end);
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.updatePagedTeams();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.updatePagedTeams();
  }

  onPrivacyFilterChange(values: string[]): void {
    this.selectedPrivacyFilters = values;
    this.applyFilters();
  }

  onManagerFilterChange(values: string[]): void {
    this.selectedManagerFilters = values;
    this.applyFilters();
  }

  onRoleFilterChange(values: string[]): void {
    this.selectedRoleFilters = values;
    this.applyFilters();
  }

  onLayoutChange(layout: 'table' | 'grid'): void {
    this.selectedLayout = layout;
  }

  search(): void {
    this.applyFilters();
  }

  reset(): void {
    this.searchValue = '';
    this.selectedPrivacyFilters = [];
    this.selectedManagerFilters = [];
    this.selectedRoleFilters = [];
    this.applyFilters();
  }

  getOwnerName(team: Team): string {
    return this.allUsers[team.createdById ?? ''] || '—';
  }

  getManagerName(team: Team): string {
    return this.allUsers[team.productManagerId ?? ''] || '—';
  }

  getMemberNames(team: Team): string {
    return team.members?.map((m) => m.userName).join(', ') || '-';
  }

  getMemberRoles(team: Team): string[] {
    const roles = new Set<string>();
    (team.members || []).forEach((m) => roles.add(m.roleInTeam || 'Member'));
    return Array.from(roles);
  }

 /* viewTeam(team: Team): void {
    console.log('View:', team);
  } */

 editTeam(team: Team): void {
  this.teamService.getTeamById(team.id!).subscribe({
    next: (fullTeam) => {
      const modalRef = this.nzModal.create({
        nzTitle: 'Update Team',
        nzContent: UpdateTeamModalComponent,
        nzFooter: null,
        nzWidth: 700,
      });

      if (modalRef.componentInstance) {
        modalRef.componentInstance.mode = 'edit';
        modalRef.componentInstance.existingTeam = fullTeam;
      }

      modalRef.afterClose.subscribe((result) => {
        if (result?.teamName) {
          const updated = [...this.allTeams];
          const idx = updated.findIndex((t) => t.id === result.id);
          if (idx !== -1) {
            updated[idx] = {
              ...result,
              members: (result.members || []).map((m: TeamMember) => ({
                ...m,
                userName: this.allUsers[m.userId] || m.userId,
              })),
            };
          }
          this.allTeams = updated;
          this.applyFilters();
        }
      });
    },
    error: (err) => {
      console.error('Failed to fetch team for editing', err);
    },
  });
}


 deleteTeam(team: Team): void {
  this.nzModal.warning({
    nzTitle: `Are you sure you want to delete "${team.teamName}"?`,
    nzContent: 'This action cannot be undone.',
    nzOkText: 'Yes',
    nzOnOk: () => {
      this.teamService.deleteTeam(team.id!).subscribe({
        next: () => {
          this.teamService.getMyTeams().subscribe({
            next: (teams) => {
              this.allTeams = teams.map((team) => ({
                ...team,
                members: (team.members || []).map((m: TeamMember) => ({
                  ...m,
                  userName: this.allUsers[m.userId] || m.userId,
                })),
              }));
              this.applyFilters();
            },
            error: (err) =>
              console.error('Error refreshing teams after delete', err),
          });
        },
        error: (err) => {
          console.error('Failed to delete team', err);
        },
      });
    },
  });
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

}
