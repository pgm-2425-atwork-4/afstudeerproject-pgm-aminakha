import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  wakeUpBackend() {
    
    this.http.get<{ message: string }>(`${this.apiUrl}/ping`).subscribe({
      next: (response) => console.log("✅ Backend response:", response.message),
      error: (err) => console.error("❌ Failed to wake up backend:", err)
    });
  }
  constructor(private http: HttpClient) {}

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
  
  getPressures(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pressures`, { headers: this.getAuthHeaders() });
  }
  
}