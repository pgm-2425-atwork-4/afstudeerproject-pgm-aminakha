import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  user: any = null;
  isBrowser: boolean = false;
  isNavVisible: boolean = false; // This controls the visibility of the navigation menu

  constructor(
    private router: Router,
    private apiService: ApiService, 
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.apiService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      // Fetch user on initialization
      this.apiService.fetchUser();
    }
  }

  // Toggle the navigation menu visibility on mobile
  toggleNav() {
    this.isNavVisible = !this.isNavVisible; // Toggle the navigation visibility
  }

  logout() {
    this.apiService.logout().subscribe(() => {
      console.log("🚪 User logged out!");
      this.user = null;  // Remove user from UI
      this.router.navigate(['/login']); // Redirect to login page
    });
  }
}
