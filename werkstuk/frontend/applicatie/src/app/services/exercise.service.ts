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
  addExercise(exercise: any){
    return this.http.post(`${this.apiUrl}/exercises/admin/add-exercise`, exercise, {
      headers: this.getAuthHeaders()
    });
  }
  getPressures() {
    return this.http.get(`${this.apiUrl}/exercises/pressures`, { headers: this.getAuthHeaders() });
  }
  saveExercise(userId: string, exerciseId: string) {
    return this.http.post(`${this.apiUrl}/users/save-exercise`, { userId, exerciseId }, { headers: this.getAuthHeaders() });
  }
  savedExercises(userId: string) {
    return this.http.get(`${this.apiUrl}/users/saved-exercises/${userId}`, { headers: this.getAuthHeaders() });
  }
  deleteSavedExercise(exerciseId: string) {
    return this.http.delete(`${this.apiUrl}/users/saved-exercises/${exerciseId}`, { headers: this.getAuthHeaders() });
  }
  
}