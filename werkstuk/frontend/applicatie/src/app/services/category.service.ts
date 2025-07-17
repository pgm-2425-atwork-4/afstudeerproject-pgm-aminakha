import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:5000/categories';
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
}
