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
  searchGyms() {
    if (!this.searchQuery) {
      // If no search query, show all gyms again
      this.filteredGyms = [...this.gyms]; 
    } else {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredGyms = this.gyms.filter(gym =>
        gym.name.toLowerCase().includes(query) ||
        gym.city.toLowerCase().includes(query) ||
        gym.province.toLowerCase().includes(query) ||
        (gym.category && gym.category.toLowerCase().includes(query))
      );
    }
  }
}
