import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  wakeUpBackend() {
    console.log("🔥 Trying to wake up backend at:", `${this.apiUrl}/ping`);
    
    this.http.get<{ message: string }>(`${this.apiUrl}/ping`).subscribe({
      next: (response) => console.log("✅ Backend response:", response.message),
      error: (err) => console.error("❌ Failed to wake up backend:", err)
    });
  }
  constructor(private http: HttpClient) {
    console.log("🚀 API Base URL:", this.apiUrl);
    this.loadUserFromStorage(); // ✅ Auto-load user on startup
  }

  /** ✅ Load JWT Token & User from Storage */
  private loadUserFromStorage() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');

    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  /** ✅ Auto-fetch Authenticated User */
  fetchUser() {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      console.log("❌ No token found, logging out.");
      this.currentUserSubject.next(null);
      return;
    }
  
    this.http.get(`${this.apiUrl}/auth/user`, { withCredentials: true }).subscribe({
      next: (user) => {
        console.log("✅ Authenticated User:", user);
        this.currentUserSubject.next(user);
      },
      error: (err) => {
        console.error("❌ Token might be invalid, logging out:", err);
        this.logout().subscribe(); // ✅ Auto logout if token is invalid
      }
    });
  }
  /** ✅ Login Method - Stores JWT Token & User Data */
  loginUser(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }, { withCredentials: true }).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('auth_token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
          console.log("🔑 JWT Token stored:", res.token); // ✅ Debugging
        } else {
          console.warn("❌ No token received!");
        }
      })
    );
  }
  

  /** ✅ Logout - Clears Token & User Data */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        console.log("🚪 Logging out...");
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        window.location.reload(); // ✅ Refresh to clear any cached user data
      })
    );
  }

  /** ✅ Secure API Request with JWT */
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

  /** ✅ Fetch Authenticated User */
  getAuthUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/user`, { headers: this.getAuthHeaders(), withCredentials: true });
  }

  /** ✅ Fetch Categories */
  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`, { headers: this.getAuthHeaders() });
  }

  /** ✅ Fetch Users */
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, { headers: this.getAuthHeaders() });
  }

  /** ✅ Fetch Specific User */
  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}`, { headers: this.getAuthHeaders() });
  }

  /** ✅ Register New User */
  registerUser(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, formData);
  }

  /** ✅ Fetch Gyms */
  getGyms(): Observable<any> {
    return this.http.get(`${this.apiUrl}/gyms`, { headers: this.getAuthHeaders() });
  }

  /** ✅ Fetch Single Gym */
  getGymById(gymId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/gyms/${gymId}`, { headers: this.getAuthHeaders() });
  }

  /** ✅ Upload Gym Image */
  uploadGymImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(`${this.apiUrl}/admin/upload-gym-image`, formData, { headers: this.getAuthHeaders() });
  }

  /** ✅ Add New Gym */
  addGym(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-gym`, formData, { headers: this.getAuthHeaders() });
  }

  /** ✅ Fetch Admin Gyms */
  getAdminGyms(adminId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/gyms/${adminId}`, { headers: this.getAuthHeaders() });
  }

  /** ✅ Fetch Pressure Types */
  getPressureTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pressures`, { headers: this.getAuthHeaders() });
  }

  /** ✅ Fetch Pricing Plans */
  getPricingPlans(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pricing`, { headers: this.getAuthHeaders() });
  }

  /** ✅ Fetch Provinces */
  getProvinces(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/provinces`, { headers: this.getAuthHeaders() });
  }

  /** ✅ Fetch Saved Gyms */
  getSavedGyms(userId: string): Observable<any> {
    console.log(`📡 Fetching saved gyms for User ID: ${userId}`);
  
    return this.http.get(`${this.apiUrl}/saved-gyms/${userId}`, {
      headers: this.getAuthHeaders(), 
      withCredentials: true
    }).pipe(
      tap({
        next: (res) => console.log("✅ Saved Gyms Loaded:", res),
        error: (err) => console.error("🔥 Error fetching saved gyms:", err)
      })
    );
  }
}
