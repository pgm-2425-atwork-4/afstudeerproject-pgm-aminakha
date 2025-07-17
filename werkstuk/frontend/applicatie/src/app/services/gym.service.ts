import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../environments/environment";
import { Injectable } from "@angular/core";
import { catchError, of, tap } from "rxjs";
@Injectable({
  providedIn: 'root'
})
export class GymService { 
  private apiUrl = environment.apiUrl + '/gyms';
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
  constructor(private http: HttpClient) {}

  getGyms() {
    return this.http.get(`${this.apiUrl}/gyms`, { headers: this.getAuthHeaders() });
  }
  getGymById(gymId: string) {
    return this.http.get(`${this.apiUrl}/gyms/${gymId}`, { headers: this.getAuthHeaders() });
  }
  getGymImages(gymId: any) {
    return this.http.get(`${this.apiUrl}/${gymId}/images`);
  }
  addGym(formData: FormData) {
    return this.http.post(`${this.apiUrl}/gyms/add-gym`, formData, { headers: this.getAuthHeaders() });
  }
  updateGym(gymId: number, formData: FormData) {
    return this.http.put(`${this.apiUrl}/gyms/${gymId}`, formData, {headers: this.getAuthHeaders()});
  }
  deleteGym(gymId: number) {
    return this.http.delete(`${this.apiUrl}/gyms/${gymId}`, {headers: this.getAuthHeaders()});
  }
  uploadGymImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(`${this.apiUrl}/admin/upload-gym-image`, formData, { headers: this.getAuthHeaders() });
  }
  getAdminGyms(adminId: string) {
    return this.http.get(`${this.apiUrl}/admin/gyms/${adminId}`, { headers: this.getAuthHeaders() });
  }
  getSavedGyms(userId: string){
    return this.http.get(`${this.apiUrl}/saved-gyms/${userId}`, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      catchError(err => {
        if (err.status === 404) {
          console.warn("📭 No saved gyms found for user:", userId);
          return of([]);
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
  saveGym(userId: string, gymId: string) {
    return this.http.post(`${this.apiUrl}/users/save-gym`, { userId, gymId }, { headers: this.getAuthHeaders() });
  }
  deleteSavedGym(userId: string, gymId: string) {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({'Authorization': `Bearer ${token}`});

    return this.http.delete(`${this.apiUrl}/saved-gyms/${userId}/${gymId}`, { headers });
  }
}