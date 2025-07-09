// src/app/services/team.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Team {
  id?: number;
  teamName: string;
  isPrivate: boolean;
  allowJoinWithoutApproval: boolean;
  createdById?: string;
  productOwnerId?: string;
  productManagerId?: string;
  userIds?: string[];
  projectIds?: number[];

  members?: TeamMember[]; // ✅ add this
}

export interface TeamMember {
  userId: string;
  userName?: string;
  roleInTeam: string;
  joinedAt: string;
}
export interface TeamWithUserRole extends Team {
  myRole: string; // based on TeamMember.roleInTeam
}
export interface CreateTeamRequest {
  teamName: string;
  isPrivate: boolean;
  allowJoinWithoutApproval: boolean;
  userIds: string[];
  projectIds: number[];
}

export interface UpdateTeamRequest extends CreateTeamRequest {}

export interface TeamInviteRequest {
  email: string;
  teamId: number;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private baseUrl = `${environment.apiBaseUrl}/teams`;

  private teamsSubject = new BehaviorSubject<Team[]>([]);
  teams$ = this.teamsSubject.asObservable();

  private selectedTeamSubject = new BehaviorSubject<Team | null>(null);
  selectedTeam$ = this.selectedTeamSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Create Team
  createTeam(team: CreateTeamRequest): Observable<Team> {
    return this.http.post<Team>(this.baseUrl, team, { withCredentials: true });
  }

  // Get all teams (admin or created)
  getAllTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.baseUrl, { withCredentials: true });
  }

  // Get team by ID
  getTeamById(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  // Update team
  updateTeam(id: number, updateData: UpdateTeamRequest): Observable<Team> {
    return this.http.put<Team>(`${this.baseUrl}/${id}`, updateData, { withCredentials: true });
  }

  // Delete team
  deleteTeam(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  // Get logged-in user's teams
  getMyTeams(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/my-teams`, { withCredentials: true });
  }

  // Get team members for a given project
  getTeamMembersByProject(projectId: number): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.baseUrl}/project/${projectId}/team-members`, { withCredentials: true });
  }

  // Setters and Getters for selected team
  setTeams(teams: Team[]) {
    this.teamsSubject.next(teams);
  }

  setSelectedTeam(team: Team | null) {
    this.selectedTeamSubject.next(team);
  }

  getCurrentTeams(): Team[] {
    return this.teamsSubject.getValue();
  }

  getCurrentSelectedTeam(): Team | null {
    return this.selectedTeamSubject.getValue();
  }
  clearTeams(): void {
  this.setTeams([]); // Reset observable
  this.setSelectedTeam(null);
}

updateTeamMemberRole(teamId: number, userId: string, newRole: string) {
  return this.http.put(
    `${this.baseUrl}/${teamId}/members/${userId}/role`,
    { newRole },
    { withCredentials: true }
  );
}

}
