import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gyms',
  imports: [CommonModule,RouterLink,FormsModule],
  templateUrl: './gyms.component.html',
  styleUrl: './gyms.component.css'
})
export class GymsComponent implements OnInit {
  gyms: any[] = [];
  filteredGyms: any[] = [];
  searchQuery: string = "";

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchGyms();
  }

  fetchGyms() {
    this.apiService.getGyms().subscribe({
      next: (data) => {
        this.gyms = data;
        this.filteredGyms = data;
        console.log("✅ Gyms loaded:", this.gyms);
      },
      error: (error) => {
        console.error("🔥 Error fetching gyms:", error);
      }
    });
  }
  onSearchChange() {
    this.filteredGyms = this.gyms.filter(gym =>
      gym.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      gym.city.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      gym.province.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      gym.category.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
}
