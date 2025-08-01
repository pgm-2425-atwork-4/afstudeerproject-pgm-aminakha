import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "../environments/environment";
import { Injectable } from "@angular/core";
@Injectable({
  providedIn: 'root'
})
export class ExerciseService { 
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
  constructor(private http: HttpClient) {}
  getExercises() {
    return this.http.get(`${this.apiUrl}/exercises`, { headers: this.getAuthHeaders() });
  }
  getExerciseById(id: string) {
    return this.http.get(`${this.apiUrl}/exercises/${id}`, { headers: this.getAuthHeaders() });
  }
  getExerciseImages(id: string) {
    return this.http.get(`${this.apiUrl}/exercises/${id}/images`, { headers: this.getAuthHeaders() });
  }
  getExerciseCategories() {
    return this.http.get(`${this.apiUrl}/exercises/categories`);
  }
  addExerciseCategory(category: any) {
    return this.http.post(`${this.apiUrl}/exercises/admin/add-category`, category, {
      headers: this.getAuthHeaders()
    });
  }
  updateExerciseCategory(id: number, formData: FormData) {
    return this.http.put(`${this.apiUrl}/exercises/admin/categories/${id}`, formData);
  }
  deleteExerciseCategory(id: number) {
    return this.http.delete(`${this.apiUrl}/exercises/admin/categories/${id}`);
  }

  addExercise(exercise: any){
    return this.http.post(`${this.apiUrl}/exercises/admin/add-exercise`, exercise, {
      headers: this.getAuthHeaders()
    });
  }
  getPressures() {
    return this.http.get(`${this.apiUrl}/exercises/pressures`, { headers: this.getAuthHeaders() });
  }
  saveExercise(userId: string, exerciseId: string) {
    return this.http.post(`${this.apiUrl}/saved-exercises`, { userId, exerciseId }, { headers: this.getAuthHeaders() });
  }
  savedExercises(userId: string) {
    return this.http.get(`${this.apiUrl}/saved-exercises/${userId}`, { headers: this.getAuthHeaders() });
  }
  deleteSavedExercise(userId: string, exerciseId: string) {
    return this.http.delete(`${this.apiUrl}/saved-exercises/${userId}/${exerciseId}`, { headers: this.getAuthHeaders() });
  }
  
}