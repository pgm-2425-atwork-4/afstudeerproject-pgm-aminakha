import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  uploadCategory(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, formData);
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`);
  }
}
