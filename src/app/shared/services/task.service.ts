// src/app/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Task {
  id?: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  tags: string;
  startDate: string;
  dueDate: string;
  points: number;

  projectId: number;
  projectName?: string;

  authorUserId?: string;
  authorUserName?: string;
  authorFullName?: string;

  assignedUserId?: string;
  assignedUserName?: string;
  assignedFullName?: string;

  authorAvatarUrl?: string;
  assignedAvatarUrl?: string;

  assignToSelf?: boolean; // ✅ Only used on create/update
}

interface TaskListResponse {
  message: string;
  tasks: Task[];
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private baseUrl = `${environment.apiBaseUrl}/tasks`;

  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  private selectedTaskSubject = new BehaviorSubject<Task | null>(null);
  selectedTask$ = this.selectedTaskSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ✅ Create task
  createTask(task: Task): Observable<any> {
    return this.http.post(`${this.baseUrl}`, task, { withCredentials: true });
  }

  // ✅ Get tasks in a project
  getTasksByProject(projectId: number): Observable<Task[]> {
    return this.http
      .get<TaskListResponse>(`${this.baseUrl}/project/${projectId}`, { withCredentials: true })
      .pipe(map(res => res.tasks));
  }

  // ✅ Get tasks assigned to current user
  getAssignedTasks(): Observable<Task[]> {
    return this.http
      .get<TaskListResponse>(`${this.baseUrl}/assigned-to-me`, { withCredentials: true })
      .pipe(map(res => res.tasks));
  }

  // ✅ Get a single task
  getTaskById(id: number): Observable<Task> {
    return this.http
      .get<{ message: string; task: Task }>(`${this.baseUrl}/${id}`, { withCredentials: true })
      .pipe(map(res => res.task));
  }

  // ✅ Update task (supports author full update or assignee status-only update)
  updateTask(id: number, task: Task): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, task, { withCredentials: true });
  }

  // ✅ Delete task (soft delete)
  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  // ✅ State management helpers
  setTasks(tasks: Task[]) {
    this.tasksSubject.next(tasks);
  }

  setSelectedTask(task: Task | null) {
    this.selectedTaskSubject.next(task);
  }

  getCurrentTasks(): Task[] {
    return this.tasksSubject.getValue();
  }
}
