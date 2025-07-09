import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService, Task } from '../../../../shared/services/task.service';
import { ProjectService } from '../../../../shared/services/project.service';

@Component({
  selector: 'app-timeline-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-view.component.html',
  styleUrls: ['./timeline-view.component.scss']
})
export class TimelineViewComponent implements OnInit {
  days: string[] = [];
  zoomLevel: 'day' | 'week' | 'month' = 'day';

  tasks: Task[] = [];
  tasksGrouped: { [status: string]: Task[] } = {};
  today: string = this.normalizeDate(new Date());

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    const selectedProject = this.projectService.getSelectedProject();
    if (!selectedProject?.id) return;

    this.taskService.getTasksByProject(selectedProject.id).subscribe((tasks) => {
      const normalizedTasks = tasks.map(t => ({
        ...t,
        startDate: this.normalizeDate(t.startDate),
        dueDate: this.normalizeDate(t.dueDate)
      }));

      this.tasks = normalizedTasks;
      this.groupTasksByStatus(normalizedTasks);
      this.generateDaysRange(10);
    });
  }
headerRows = 1; // for sticky date headers

globalRowIndex(status: string, rowIndex: number): number {
  const priorStatuses = this.getTaskStatuses().slice(0, this.getTaskStatuses().indexOf(status));
  const offset = priorStatuses.reduce((acc, key) => acc + this.tasksGrouped[key].length, 0);
  return offset + rowIndex + this.headerRows + 1; // +1 to move below header
}

  normalizeDate(date?: string | Date): string {
    const d = new Date(date ?? '');
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  }

  groupTasksByStatus(tasks: Task[]): void {
    const groups: { [status: string]: Task[] } = {};
    for (const task of tasks) {
      const status = task.status || 'Unspecified';
      if (!groups[status]) groups[status] = [];
      groups[status].push(task);
    }
    this.tasksGrouped = groups;
  }

  getTaskStatuses(): string[] {
    return Object.keys(this.tasksGrouped);
  }

 generateDaysRange(bufferDays = 10): void {
  if (!this.tasks.length) return;

  const startDates = this.tasks.map(t => new Date(t.startDate));
  const endDates = this.tasks.map(t => new Date(t.dueDate));

  const minDate = new Date(Math.min(...startDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...endDates.map(d => d.getTime())));

  minDate.setDate(minDate.getDate() - bufferDays);
  maxDate.setDate(maxDate.getDate() + bufferDays);

  const step = this.zoomLevel === 'day' ? 1 : this.zoomLevel === 'week' ? 7 : 30;
  const days: string[] = [];
  const current = new Date(minDate);

  while (current <= maxDate) {
    days.push(this.normalizeDate(current));
    current.setDate(current.getDate() + step);
  }

  this.days = days;
}

// 📅 Month-Year label formatter
formatDateLabel(date: string): string {
  const d = new Date(date);
  if (this.zoomLevel === 'month') {
    return d.toLocaleString('default', { month: 'short', year: 'numeric' }); // "Jul 2025"
  } else if (this.zoomLevel === 'week') {
    return `Week of ${d.getDate()}/${d.getMonth() + 1}`;
  }
  return d.toLocaleDateString(); // default for day
}

  changeZoom(level: 'day' | 'week' | 'month'): void {
    this.zoomLevel = level;
    this.generateDaysRange(10);
  }

  getGridColumn(task: Task): { colStart: number, colSpan: number } {
    const startIndex = this.days.indexOf(task.startDate);
    const endIndex = this.days.indexOf(task.dueDate);
    const colStart = startIndex >= 0 ? startIndex + 1 : 1;
    const colSpan = endIndex >= startIndex ? (endIndex - startIndex + 1) : 1;
    return { colStart, colSpan };
  }

  viewTask(task: Task): void {
    alert(
      `📌 ${task.title}\n` +
      `👤 ${task.authorFullName ?? task.authorUserName ?? 'Unknown'}\n` +
      `👥 ${task.assignedFullName ?? task.assignedUserName ?? 'Unassigned'}\n` +
      `🗓 ${task.startDate} → ${task.dueDate}`
    );
  }

  // Count of all task rows across statuses
get totalGridRows(): number {
  const allRows = Object.values(this.tasksGrouped).reduce((acc, tasks) => acc + tasks.length, 0);
  return allRows + this.headerRows; // include header row
}
fakeRows(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i);
}

onGridScroll(event: Event): void {
  const container = event.target as HTMLElement;
  const header = document.querySelector('.calendar-header') as HTMLElement;
  header.scrollLeft = container.scrollLeft;
}

}
