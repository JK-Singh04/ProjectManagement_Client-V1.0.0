// src/app/services/project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { environment } from '../../../environments/environment'; // ✅ Make sure this path is correct

export interface Project {
  id?: number;
  projectName: string;
  description: string;
  proposedStartDate: string;
  proposedDueDate: string;
  actualStartDate?: string;
  actualDueDate?: string;
  userRole: string; 
}
export interface ProjectWithUserRole extends Project {
  userRole: string; // e.g., 'Administrator', 'Developer', etc.
}

// Optional: for better type safety
interface ProjectListResponse {
  message: string;
  projects: Project[];
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private baseUrl = `${environment.apiBaseUrl}/projects`;

  private projectsSubject = new BehaviorSubject<Project[]>([]);
  projects$ = this.projectsSubject.asObservable();

  private selectedProjectSubject = new BehaviorSubject<Project | null>(null);
  selectedProject$ = this.selectedProjectSubject.asObservable();

  constructor(private http: HttpClient) {}

  createProject(project: Project): Observable<any> {
    return this.http.post(this.baseUrl, project, { withCredentials: true });
  }

  // ✅ FIXED: Extract `projects` from API response
  getAllProjects(): Observable<Project[]> {
    return this.http
      .get<ProjectListResponse>(this.baseUrl, { withCredentials: true })
      .pipe(map(res => res.projects));
  }

getProjectById(id: number): Observable<Project> {
  return this.http
    .get<{ message: string; project: Project }>(`${this.baseUrl}/${id}`)
    .pipe(map(res => res.project));
}


  updateProject(id: number, project: Project): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, project, { withCredentials: true });
  }

  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  setProjects(projects: Project[]) {
    this.projectsSubject.next(projects);
  }

setSelectedProject(project: Project | null) {
  this.selectedProjectSubject.next(project);
}

getSelectedProject(): Project | null {
  return this.selectedProjectSubject.getValue();
}

  getCurrentProjects(): Project[] {
    return this.projectsSubject.getValue();
  }

  clearProjects(): void {
  this.setProjects([]);
  this.setSelectedProject(null);
}
updateProjectMemberRole(projectId: number, userId: string, newRole: string) {
  return this.http.put(
    `${this.baseUrl}/${projectId}/members/${userId}/role`,
    { newRole },
    { withCredentials: true }
  );
}

}
