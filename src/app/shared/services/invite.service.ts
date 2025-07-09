// src/app/services/invite.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TeamInviteRequest {
  email: string;
  teamId: number;
}

@Injectable({
  providedIn: 'root'
})
export class InviteService {
  private baseUrl = `${environment.apiBaseUrl}/teams`;

  constructor(private http: HttpClient) {}

  sendInvite(inviteData: TeamInviteRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/invite`, inviteData, { withCredentials: true });
  }

  validateInviteToken(tokenId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/accept-invite/${tokenId}`);
  }
} 

/*  // Send invite to a user for a team
  sendTeamInvite(invite: TeamInviteRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/invite`, invite, { withCredentials: true });
  }

  // Accept invite by token (public, no credentials)
  acceptTeamInvite(tokenId: string): Observable<any> {
    return this.http.get(`/api/teams/accept-invite/${tokenId}`);
  }*/
// Usage: 
// this.inviteService.sendInvite({ email: 'test@example.com', teamId: 5 }).subscribe(...);
// this.inviteService.validateInviteToken('some-token-id').subscribe(...);