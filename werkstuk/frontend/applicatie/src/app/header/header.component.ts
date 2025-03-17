import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  providers: [ApiService] // ✅ Provide ApiService here
})
export class HeaderComponent implements OnInit {
  user: any = null;
  isBrowser: boolean = false; // ✅ Detect if running in browser

  constructor(
    private router: Router, 
    private apiService: ApiService, // ✅ Inject ApiService correctly
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId); 

    if (this.isBrowser) {
      this.loadUser();

      // ✅ Listen for storage changes (sync login state)
      window.addEventListener('storage', () => {
        this.loadUser();
      });
    }
  }

  loadUser() {
    const userId = localStorage.getItem("userId"); // ✅ Get stored user ID
    if (!userId) {
      console.log("❌ No user logged in.");
      this.user = null; // ✅ Ensure UI updates when user logs out
      return;
    }

    this.apiService.getUserById(userId).subscribe({
      next: (res) => {
        console.log("✅ User Data for Header:", res);
        this.user = res;
      },
      error: (err) => {
        console.error("🔥 Error loading user:", err);
        this.user = null; // ✅ Reset user if error occurs
      }
    });
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('user');
      localStorage.removeItem('userId'); // ✅ Also remove userId
      this.user = null; // ✅ Reset user object to update UI
    }
    this.router.navigate(['/login']); 
  }
}
