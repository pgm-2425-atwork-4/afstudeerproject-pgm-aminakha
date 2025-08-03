import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GymService } from '../../services/gym.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MetaDataService } from '../../services/meta-data.service';
import { CardListComponent } from '../../components/card-list/card-list.component';
import { MotivationComponent} from '../../components/motivation/motivation.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardListComponent, MotivationComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None
  
})
export class HomeComponent implements OnInit {
  gyms: any[] = [];
  savedGyms: any[] = [];
  userId: string | null = null;
  gymCategories: any[] = [];  
  form = new FormGroup({
    query: new FormControl('', Validators.required)
  });
  get query() {
    return this.form.get('query');
  }
  randomMotivation: any;
  constructor(private gymService: GymService, private router: Router, private metadataService: MetaDataService) {}

  ngOnInit() {
    const token = localStorage.getItem("auth_token");
    console.log("🔍 Stored Token:", token); 
    
    if (token) {
      const decodedToken = this.decodeJWT(token);
      console.log("🔑 Decoded Token:", decodedToken);

      if (decodedToken && decodedToken.id) {
        this.userId = decodedToken.id.toString();
        console.log("🆔 User ID from Token:", this.userId);
        
        this.fetchSavedGyms(this.userId);
      }
    }

    this.fetchGyms();
    this.metadataService.getCategories().subscribe({
      next: (res: any) => {
        console.log("✅ Categories loaded:", res);
        this.gymCategories = res;
        console.log("🔍 Gym Categories:", this.gymCategories);
        
      },
      error: (err) => {
        console.error("🔥 Error fetching categories:", err);
      }
    });    
  }
  onSearchSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
      const searchValue = this.form.get('query')?.value?.trim();
      if (searchValue) {
        this.router.navigate(['/gyms'], { queryParams: { search: searchValue } });
      }
    }
  decodeJWT(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error("❌ Invalid token structure");
      return null;
    }
    
    const payload = parts[1]; 
    const decoded = atob(payload); 
    return JSON.parse(decoded); 
  }

  fetchGyms() {
    this.gymService.getGyms().subscribe({
      next: (res: any) => {
        console.log("✅ Gyms loaded:", res);
        this.gyms = res;
      },
      error: (err) => {
        console.error("🔥 Error fetching gyms:", err);
      }
    });
  }

  fetchSavedGyms(userId: string | null) {
  if (!userId) return;

  this.gymService.getSavedGyms(userId).subscribe({
    next: (res: any) => {
      this.savedGyms = Array.isArray(res) ? res : [];
    },
    error: (err) => {
      if (err.status === 404) {
        // Zwijgen bij lege lijst
        this.savedGyms = [];
      } else {
        console.error("🔥 Fout bij ophalen gyms:", err);
      }
    }
  });
  }
}