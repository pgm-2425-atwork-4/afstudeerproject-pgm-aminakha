import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = environment.apiUrl;
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      console.warn("❌ No auth token found in localStorage!");
      return new HttpHeaders();
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
  constructor(private http : HttpClient) { }
  getComments(gymId: string) {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/comments/${gymId}`, { headers: this.getAuthHeaders() });
  }
  addComment(commentData: any) {
    return this.http.post<any>(`${this.apiUrl}/comments`, commentData, { headers: this.getAuthHeaders() });
  }
  getExerciseComments(exerciseId: string) {
    return this.http.get<any>(`${this.apiUrl}/comments/exercise/${exerciseId}`, { headers: this.getAuthHeaders() });
  }

  addExerciseComment(exerciseId: string, commentData: any) {
    return this.http.post<any>(`${this.apiUrl}/comments/exercise/${exerciseId}`, commentData, { headers: this.getAuthHeaders() });
  }
}
