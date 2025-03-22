import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
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
  private getAuthToken(): string | null {
    return this.currentUserSubject.value ? `Bearer ${this.currentUserSubject.value.token}` : null;
  }
  /** ✅ Auto-fetch Authenticated User */
  fetchUser() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.warn("❌ No auth token found, skipping fetchUser()");
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
          this.logout().subscribe(); // ✅ Auto logout on invalid token
        }
      }
    });
  }
  
  
  /** ✅ Login Method - Stores JWT Token & User Data */
  loginUser(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('auth_token', response.token); // Store the token in localStorage
        }
      })
    );
  }

  /** ✅ Logout - Clears Token & User Data */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        console.log("🚪 Logging out...");
        
        // ✅ Clear session storage and local storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        
        // ✅ Remove cookies
        document.cookie = "auth_token=; Max-Age=0; path=/; domain=" + window.location.hostname;
        
        // ✅ Update UI
        this.currentUserSubject.next(null);
        
        // ✅ Force reload the page to clear cached user data
        setTimeout(() => window.location.reload(), 500);
      })
    );
  }

  /** ✅ Secure API Request with JWT */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    console.log("🔒Hier Auth token:", token);
    
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
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('auth_token')}`
    );
  
    return this.http.get(`${this.apiUrl}/auth/user`, {
      headers,
      withCredentials: true, // ✅ Ensures cookies & credentials are sent
    });
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
  updateUserProfile(userId: string, formData: FormData): Observable<any> {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      console.error("No token found in localStorage.");
      return new Observable(observer => observer.error('No token found'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // Attach Authorization header
    });

    // Make the PUT request to update the profile
    return this.http.put(`${this.apiUrl}/users/${userId}`, formData, { headers });
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
  getPrices(): Observable<any> {
    return this.http.get(`${this.apiUrl}/prices`, { headers: this.getAuthHeaders() });
  }
  /** ✅ Upload Gym Image */
  uploadGymImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(`${this.apiUrl}/admin/upload-gym-image`, formData, { headers: this.getAuthHeaders() });
  }
  likeComment(commentId: number, userId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/comments/like`, { commentId, userId }, {
      headers: this.getAuthHeaders()  // Make sure the headers are being sent
    });
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
  getComments(gymId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/comments/${gymId}`, { headers: this.getAuthHeaders() });
  }
  addComment(commentData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/comments`, commentData, { headers: this.getAuthHeaders() });
  }
  /** ✅ Fetch Saved Gyms */
  getSavedGyms(userId: string): Observable<any> {
    console.log(`📡 Fetching saved gyms for User ID: ${userId}`);
  
    return this.http.get(`${this.apiUrl}/saved-gyms/${userId}`, {
      headers: this.getAuthHeaders(),  // ✅ Add Authorization Header
      withCredentials: true
    }).pipe(
      tap({
        next: (res) => console.log("✅ Saved Gyms Loaded:", res),
        error: (err) => console.error("🔥 Error fetching saved gyms:", err)
      })
    );
  }

  
  saveGym(userId: string, gymId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/save-gym`, { userId, gymId }, { headers: this.getAuthHeaders() });
  }
  
}