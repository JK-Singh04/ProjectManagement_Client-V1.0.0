//navbar.component.ts
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
//import { NzNoAnimationModule } from 'ng-zorro-antd/core/no-animation';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { AddTaskModalComponent } from '../add-task-modal/add-task-modal.component';
import { TaskService } from '../../../../shared/services/task.service';
import { ProjectService } from '../../../../shared/services/project.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzSegmentedModule,
    NzIconModule,
    NzButtonModule,
    NzModalModule,
    NzSelectModule,
    NzAvatarModule,
    NzBreadCrumbModule,
    NzDropDownModule,
    NzGridModule,
    NzPageHeaderModule,
    NzSpaceModule,
    NzTagModule,
    NzTypographyModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  @Output() viewChange = new EventEmitter<
    'kanban' | 'list' | 'timeline' | 'table'
  >();
  @Output() taskChange = new EventEmitter<string>();

  selectedView: 'kanban' | 'list' | 'timeline' | 'table' = 'kanban';
  selectedTask: string | null = null;

  projectName: string = '';
  projectDescription: string = '';
  projectStatus: string = 'Running';

  options = [
    { label: 'Kanban', value: 'kanban', icon: 'project' },
    { label: 'List', value: 'list', icon: 'unordered-list' },
    { label: 'Timeline', value: 'timeline', icon: 'field-time' },
    { label: 'Table', value: 'table', icon: 'table' },
  ];

  constructor(
    private modal: NzModalService,
    private taskService: TaskService,
    private projectService: ProjectService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.projectService.selectedProject$.subscribe((project) => {
      if (!project) {
        this.projectName = '';
        this.projectDescription = '';
        this.projectStatus = '';
        return;
      }

      // 💡 If description missing, fetch full project again
      if (!project.description) {
        if (project.id == null) return;

        this.projectService.getProjectById(project.id).subscribe({
          next: (fullProject) => {
            this.projectService.setSelectedProject(fullProject); // override with full
            this.assignProjectData(fullProject);
          },
          error: (err) => {
            console.warn(
              '⚠️ Cannot access full project details in navbar.',
              err
            );
            this.assignProjectData(project); // fallback to partial
          },
        });
      } else {
        this.assignProjectData(project);
      }
    });
  }

  private assignProjectData(project: any): void {
    this.projectName = project.projectName;
    this.projectDescription = project.description ?? '';
    this.projectStatus = 'Active'; // since you don’t have status yet
  }

  tasks: { name: string }[] = [];

  onSegmentChange(value: 'kanban' | 'list' | 'timeline' | 'table') {
    this.selectedView = value;
    this.viewChange.emit(value);
  }
getProjectInitials(): string {
  if (!this.projectName) return 'P';
  const words = this.projectName.trim().split(' ');
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (
    words[0].charAt(0).toUpperCase() +
    words[words.length - 1].charAt(0).toUpperCase()
  );
}

  openAddTaskModal(): void {
    const selectedProject = this.projectService.getSelectedProject();

    if (!selectedProject?.id) {
      console.warn('No project selected. Cannot create task.');
      return;
    }

    const modalRef = this.modal.create({
      nzTitle: 'Add New Task',
      nzContent: AddTaskModalComponent,
      nzFooter: null,
      nzWidth: 600,
    });

    if (modalRef.componentInstance) {
      modalRef.componentInstance.projectId = selectedProject.id;
    }

    modalRef.afterClose.subscribe((result: any) => {
      if (result?.name) {
        this.selectedTask = result.name;
        this.taskChange.emit(this.selectedTask ?? undefined);
      }
    });
  }
}
