import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-gyms',
  imports: [CommonModule,RouterLink],
  templateUrl: './gyms.component.html',
  styleUrl: './gyms.component.css'
})
export class GymsComponent implements OnInit {
  gyms: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchGyms();
  }

  fetchGyms() {
    this.apiService.getGyms().subscribe({
      next: (data) => {
        this.gyms = data;
        console.log("✅ Gyms loaded:", this.gyms);
      },
      error: (error) => {
        console.error("🔥 Error fetching gyms:", error);
      }
    });
  }
}
