import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  constructor(private http : HttpClient) { }
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

  ngOnInit() {
    this.loadUserFromStorage(); 
  }
  loginUser(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password}).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
        }
      })
    );
  }
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        
        document.cookie = "auth_token=; Max-Age=0; path=/; domain=" + window.location.hostname;
        
        this.currentUserSubject.next(null);
        
        setTimeout(() => window.location.reload(), 500);
      })
    );
  }
  registerUser(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, formData);
  }
  fetchUser() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return;
    }
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    this.http.get(`${this.apiUrl}/auth/user`, { headers, withCredentials: true }).subscribe({
      next: (user) => {
        console.log("✅ Authenticated User:", user);
        this.currentUserSubject.next(user);
      },
      error: (err) => {
        console.error("❌ Token error:", err);
        if (err.status === 401 || err.status === 403) {
          console.warn("⏳ Token expired or invalid, logging out...");
          this.logout().subscribe();
        }
      }
    });
  }
  //mogelijk te verwijderen omdat het niet gebruikt wordt
  getAuthUser(): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('auth_token')}`
    );
  
    return this.http.get(`${this.apiUrl}/auth/user`, {
      headers,
      withCredentials: true,
    });
  }
  updateUserProfile(userId: string, formData: FormData): Observable<any> {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      console.error("No token found in localStorage.");
      return new Observable(observer => observer.error('No token found'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // Attach Authorization header
    });

    return this.http.put(`${this.apiUrl}/users/${userId}`, formData, { headers });
  }
  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}`, { headers: this.getAuthHeaders() });
  }
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, { headers: this.getAuthHeaders() });
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');

    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }
}
