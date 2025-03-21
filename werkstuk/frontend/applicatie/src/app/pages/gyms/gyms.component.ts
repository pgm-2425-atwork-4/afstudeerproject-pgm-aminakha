import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gyms',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './gyms.component.html',
  styleUrl: './gyms.component.css'
})
export class GymsComponent implements OnInit {
  gyms: any[] = [];
  filteredGyms: any[] = [];
  searchQuery: string = "";
  prices: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchGyms();
    this.fetchPrices(); // Fetch prices separately
  }

  fetchGyms() {
    this.apiService.getGyms().subscribe({
      next: (data) => {
        this.gyms = data;
        this.filteredGyms = data;
        this.mapPricesToGyms(); // Ensure gyms have their prices
        console.log("✅ Gyms loaded:", this.gyms);
      },
      error: (error) => {
        console.error("🔥 Error fetching gyms:", error);
      }
    });
  }

  fetchPrices() {
    this.apiService.getPrices().subscribe({
      next: (data) => {
        this.prices = data;
        console.log("💰 Prices loaded:", this.prices);
        this.mapPricesToGyms(); // Update gyms with price details
        console.log("💰 Prices loaded:", this.prices);
      },
      error: (error) => {
        console.error("🔥 Error fetching prices:", error);
      }
    });
  }

  mapPricesToGyms() {
    if (this.gyms.length > 0 && this.prices.length > 0) {
      this.gyms.forEach(gym => {
        const priceDetail = this.prices.find(p => p.id === gym.pricing_id);
        gym.priceBundle = priceDetail ? priceDetail.bundle_name : "N/A niet" ;
        gym.price = priceDetail ? priceDetail.price : "N/A";
      });
    }
  }

  searchGyms() {
    this.filteredGyms = this.gyms.filter(gym =>
      gym.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      gym.city.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      gym.province.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      gym.category.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
}
