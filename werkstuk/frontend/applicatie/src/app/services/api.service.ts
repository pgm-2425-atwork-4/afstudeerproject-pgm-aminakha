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
    
    this.http.get<{ message: string }>(`${this.apiUrl}/ping`).subscribe({
      next: (response) => console.log("✅ Backend response:", response.message),
      error: (err) => console.error("❌ Failed to wake up backend:", err)
    });
  }
  constructor(private http: HttpClient) {
    this.loadUserFromStorage(); 
  }
  

  private loadUserFromStorage() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');

    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
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
  
  
  loginUser(email: string, password: string,profile_image:string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password,profile_image }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
        }
      })
    );
  }
  updateGym(gymId: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/gyms/${gymId}`, formData, {
      headers: this.getAuthHeaders(),
    });
  }
  deleteGym(gymId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/gyms/${gymId}`, {
      headers: this.getAuthHeaders(),
    });
  }
  uploadCategory(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  updateCategory(categoryId: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/categories/${categoryId}`, formData, {
      headers: this.getAuthHeaders()
    });
  }
  deleteCategory(categoryId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${categoryId}`, {
      headers: this.getAuthHeaders()
    });
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

  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`, { headers: this.getAuthHeaders() });
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, { headers: this.getAuthHeaders() });
  }

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

    return this.http.put(`${this.apiUrl}/users/${userId}`, formData, { headers });
  }

  registerUser(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, formData);
  }

  getGyms(): Observable<any> {
    return this.http.get(`${this.apiUrl}/gyms`, { headers: this.getAuthHeaders() });
  }

  getGymById(gymId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/gyms/${gymId}`, { headers: this.getAuthHeaders() });
  }
  getPrices(): Observable<any> {
    return this.http.get(`${this.apiUrl}/prices`, { headers: this.getAuthHeaders() });
  }
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
  addGym(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/gyms/add-gym`, formData, { headers: this.getAuthHeaders() });
  }

  getAdminGyms(adminId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/gyms/${adminId}`, { headers: this.getAuthHeaders() });
  }

  getPressureTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pressures`, { headers: this.getAuthHeaders() });
  }

  getPricingPlans(): Observable<any> {
    return this.http.get(`${this.apiUrl}/prices`, { headers: this.getAuthHeaders() });
  }

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
  getSavedGyms(userId: string): Observable<any> {
  
    return this.http.get(`${this.apiUrl}/users/saved-gyms/${userId}`, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      catchError(err => {
        if (err.status === 404) {
          console.warn("📭 No saved gyms found for user:", userId);
          return of([]); // Return empty array instead of throwing
        } else {
          console.error("🔥 Error fetching saved gyms:", err);
          return of([]);
        }
      }),
      tap({
        next: (res) => console.log("✅ Saved Gyms Loaded:", res),
        error: (err) => console.error("🔥 Error fetching saved gyms:", err)
      })
    );
  }

  
  saveGym(userId: string, gymId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/save-gym`, { userId, gymId }, { headers: this.getAuthHeaders() });
  }
  deleteSavedGym(userId: string, gymId: string): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.delete(`${this.apiUrl}/saved-gyms/${userId}/${gymId}`, { headers });
  }
  addExercise(exercise: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/add-exercise`, exercise, {
      headers: this.getAuthHeaders()
    });
  }
  getExerciseCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/exercise-categories`, {
      headers: this.getAuthHeaders()
    });
  }
  getPressures(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pressures`, { headers: this.getAuthHeaders() });
  }
  
}