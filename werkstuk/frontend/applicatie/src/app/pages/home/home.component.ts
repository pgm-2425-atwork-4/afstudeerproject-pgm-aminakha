import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeroHomeComponent } from '../../components/hero-home/hero-home.component';
import { ApiService } from '../../services/api.service';
import { GymCardComponent } from '../../components/gym-card/gym-card.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeroHomeComponent,GymCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  gyms: any[] = [];
  savedGyms: any[] = [];
  userId: string | null = null;
  user: any = null; // ✅ Declare user

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    const storedUser = localStorage.getItem("user");
    console.log("🔍 Stored User from localStorage:", storedUser); // ✅ Check what's in localStorage
  
    if (storedUser) {
      this.user = JSON.parse(storedUser);
      this.userId = this.user?.id ? String(this.user.id) : null;
  
      console.log("🆔 Logged-in User ID:", this.userId); // ✅ Check the retrieved user ID
  
      if (this.userId) {
        this.fetchSavedGyms(this.userId);
      }
    } else {
      this.userId = null;
      console.log("❌ No user logged in! User ID is:", this.userId); // ✅ Log if no user
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

  fetchSavedGyms(userId: string | null) {
    if (!userId) {
      console.warn("⚠️ No user ID provided. Skipping saved gyms fetch.");
      return;
    }
  
    if (this.userId) {
      this.apiService.getSavedGyms(this.userId as string).subscribe({
        next: (res) => {
          console.log("✅ Saved Gyms Loaded:", res);
          this.savedGyms = res;
        },
        error: (err) => {
          console.error("🔥 Error fetching saved gyms:", err);
        }
      });
    } else {
      console.warn("⚠️ No valid userId found. Skipping saved gyms fetch.");
    }
  }}
