import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl; 

  private currentUserSubject = new BehaviorSubject<any>(null); // ✅ Store user in memory
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log("🚀 API Base URL:", this.apiUrl);
  }

  wakeUpBackend() {
    console.log("🔥 Trying to wake up backend at:", `${this.apiUrl}/ping`);
    
    this.http.get<{ message: string }>(`${this.apiUrl}/ping`).subscribe({
      next: (response) => console.log("✅ Backend response:", response.message),
      error: (err) => console.error("❌ Failed to wake up backend:", err)
    });
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`);
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}`);
  }

  registerUser(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, formData);
  }

  loginUser(email: string, password: string): Observable<any> {
    return this.http.post<{ user: any }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (response.user) {
          this.currentUserSubject.next(response.user); // ✅ Store user in memory
        }
      })
    );
  }

  logout() {
    this.currentUserSubject.next(null); // ✅ Clear user from memory
  }

  getGyms(): Observable<any> {
    return this.http.get(`${this.apiUrl}/gyms`);
  }

  getGymById(gymId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/gyms/${gymId}`);
  }

  uploadGymImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
  
    return this.http.post(`${this.apiUrl}/admin/upload-gym-image`, formData);
  }
  addGym(gymData: any) {
    return this.http.post(`${this.apiUrl}/gyms`, gymData);
  }
  // ✅ Fetch Admin Gyms
getAdminGyms(adminId: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/admin/gyms/${adminId}`);
}
}
