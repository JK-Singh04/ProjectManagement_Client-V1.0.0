//projects.component.ts
import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';
import { UserService } from '../../../../shared/services/user.service';
import { HideIfClaimsNotMetDirective } from '../../../../directives/hide-if-claims-not-met.directive';
import { claimReq } from '../../../../shared/utils/claimReq-utils';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

import { KanbanBoardComponent } from '../../navbar-views/kanban-view/kanban-view.component';
import { ListViewComponent } from '../../navbar-views/list-view/list-view.component';
import { TimelineViewComponent } from '../../navbar-views/timeline-view/timeline-view.component';
import { TableViewComponent } from '../../navbar-views/table-view/table-view.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ProjectService } from '../../../../shared/services/project.service'; 

//Zorro Ant Design imports
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    HideIfClaimsNotMetDirective,
    SidebarComponent,
    HeaderComponent,
    NavbarComponent,
    KanbanBoardComponent,
    ListViewComponent,
    TimelineViewComponent,
    TableViewComponent,
    NzIconModule,
    NzLayoutModule,
    NzModalModule,
  ],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit {
  isCollapsed = false;
  isDarkMode = false;
  fullName: string = '';
  claimReq = claimReq;
  selectedView: 'kanban' | 'list' | 'timeline' | 'table' = 'kanban';

  constructor(private router: Router, 
    private authService: AuthService,
    private modal: NzModalService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
) {}

openAddProjectModal(): void {
  this.modal.create({
    nzTitle: 'Create New Project',
    nzContent: `
      <p>Implement form component or inline form here</p>
      <p>You can replace this with a custom component like <app-create-project></app-create-project></p>
    `,
    nzFooter: null,
    nzClosable: true,
    nzWidth: 600
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

  onViewChange(view: 'kanban' | 'list' | 'timeline' | 'table') {
    this.selectedView = view;
  }
  onProjectSwitched(projectName: string) {
    console.log('Switched to project:', projectName);
    // You can load project-specific data here
  }
ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    const projectId = params['project'];
    if (projectId) {
      // Convert to number and fetch project
      const id = parseInt(projectId, 10);
      this.projectService.getProjectById(id).subscribe({
        next: (project) => {
          this.projectService.setSelectedProject(project); // ✅ set it!
          console.log('Selected project set:', project);
        },
        error: (err) => {
          console.error('Failed to load project by ID:', err);
        }
      });
    }
  });
}
}
