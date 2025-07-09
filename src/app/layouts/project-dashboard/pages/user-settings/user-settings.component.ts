// File: user-settings.component.ts
import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../shared/services/auth.service';
import { UserService } from '../../../../shared/services/user.service';
import { HideIfClaimsNotMetDirective } from '../../../../directives/hide-if-claims-not-met.directive';
import { claimReq } from '../../../../shared/utils/claimReq-utils';
import { CommonModule } from '@angular/common';

import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';

import { KanbanBoardComponent } from '../../navbar-views/kanban-view/kanban-view.component';
import { ListViewComponent } from '../../navbar-views/list-view/list-view.component';
import { TimelineViewComponent } from '../../navbar-views/timeline-view/timeline-view.component';
import { TableViewComponent } from '../../navbar-views/table-view/table-view.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

//Zorro Ant Design imports
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [
    CommonModule,
    HideIfClaimsNotMetDirective,
    SidebarComponent,
    HeaderComponent,
    //NavbarComponent,
    //KanbanBoardComponent,
    //ListViewComponent,
    //TimelineViewComponent,
    //TableViewComponent,
    NzIconModule,
    NzLayoutModule,
    NzModalModule,
  ],
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
})
export class UserSettingsComponent implements OnInit {
  isCollapsed = false;
  isDarkMode = false;
  fullName: string = '';
  claimReq = claimReq;
  selectedView: 'kanban' | 'list' | 'timeline' | 'table' = 'kanban';

  ngOnInit(): void {
    // Initialization logic here
  }

  constructor(private router: Router, private authService: AuthService) {}

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
}
