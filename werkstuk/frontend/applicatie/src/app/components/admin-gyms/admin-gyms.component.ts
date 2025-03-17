import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-gyms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-gyms.component.html',
  styleUrls: ['./admin-gyms.component.css'],
  providers: [ApiService] // ✅ Ensure service is injected
})
export class AdminGymsComponent implements OnInit {
  gyms: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadGyms();
  }

  loadGyms() {
    this.apiService.getGyms().subscribe({
      next: (data) => {
        console.log("✅ Gyms Loaded:", data);
        this.gyms = data;
      },
      error: (error) => {
        console.error("🔥 Error fetching gyms:", error);
      }
    });
  }
}
