//user.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  profilePic: string;
  gender: string;
  dob: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/userprofile`, {
      withCredentials: true
    });
  }

getAllUsers() {
  return this.http.get<{ id: string; fullName: string; email: string; profilePic?: string }[]>(
    `${this.baseUrl}/users`,
    { withCredentials: true }
  );
}

  uploadProfilePicture(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ imageUrl: string }>(
      `${this.baseUrl}/userprofile/profilepic`,
      formData,
      {
        withCredentials: true
      }
    );
  }

  updateProfilePicture(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.put<{ imageUrl: string }>(
      `${this.baseUrl}/userprofile/profilepic`,
      formData,
      {
        withCredentials: true
      }
    );
  }

  deleteProfilePicture(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/userprofile/profilepic`,
      {
        withCredentials: true
      }
    );
  }
}
