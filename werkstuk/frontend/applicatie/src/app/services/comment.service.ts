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
  likeComment(commentId: number, userId: number) {
    return this.http.post<any>(`${this.apiUrl}/comments/like`, { commentId, userId }, {
      headers: this.getAuthHeaders()  
    });
  }
}
