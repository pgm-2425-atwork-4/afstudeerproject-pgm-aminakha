import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeroHomeComponent } from '../../components/hero-home/hero-home.component';
import { ApiService } from '../../services/api.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeroHomeComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  gyms: any[] = [];
  savedGyms: any[] = [];
  userId: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchGyms();

    // ✅ Check if user is logged in
    this.userId = localStorage.getItem("userId");
    if (this.userId) {
      this.fetchSavedGyms();
    }
  }

  fetchGyms() {
    this.apiService.getGyms().subscribe({
      next: (res) => {
        console.log("✅ Gyms loaded:", res);
        this.gyms = res;
      },
      error: (err) => {
        console.error("🔥 Error fetching gyms:", err);
      }
    });
  }

  fetchSavedGyms() {
    if (!this.userId) return;
    
    this.apiService.getSavedGyms(this.userId).subscribe({
      next: (res) => {
        console.log("✅ Saved Gyms loaded:", res);
        this.savedGyms = res;
      },
      error: (err) => {
        console.error("🔥 Error fetching saved gyms:", err);
      }
    });
  }
}