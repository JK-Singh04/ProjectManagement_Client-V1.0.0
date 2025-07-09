//auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { TOKEN_KEY } from '../constants';
import { BehaviorSubject } from 'rxjs';
import { TeamService } from './team.service';
import { ProjectService } from './project.service';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private freshLoginSubject = new BehaviorSubject<boolean>(false);
  freshLogin$ = this.freshLoginSubject.asObservable();

constructor(
  private http: HttpClient,
  private router: Router,
  private teamService: TeamService,
  private projectService: ProjectService
) {}

clearSessionState(): void {
  this.deleteToken();
  this.teamService.clearTeams();
  this.projectService.clearProjects();
}

  createUser(formData: any) {
    formData.role = "GlobalUser";
    formData.gender = "Not Specified";
    return this.http.post(environment.apiBaseUrl + '/signup', formData,{ withCredentials: true});
  }

  signin(formData: any) {
    return this.http.post(environment.apiBaseUrl + '/signin', formData,{ withCredentials: true});
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  setToken(token: string): void {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      this.freshLoginSubject.next(true);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  deleteToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.freshLoginSubject.next(false);
  }

  getClaims(): any | null {
    const token = this.getToken()?.trim();
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
      const decoded = JSON.parse(atob(parts[1]));
      return decoded;
    } catch (e) {
      console.error('JWT decode error:', e);
      return null;
    }
  }

logout(): void {
  this.http.post(`${environment.apiBaseUrl}/logout`, {}, { withCredentials: true }).subscribe({
    next: () => {
      this.clearSessionState();
      localStorage.removeItem('welcomeModalShown');
      this.router.navigate(['/signin']);
    },
    error: (err) => {
      console.error('Logout failed', err);
    }
  });
}
validateInviteToken(token: string) {
  return this.http.get(`/api/teams/accept-invite/${token}`);
}


  
}
