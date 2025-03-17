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

  constructor(
    private router: Router,
    private apiService: ApiService, 
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.apiService.currentUser$.subscribe(user => {
        console.log("✅ User Data for Header:", user);
        this.user = user;
      });
    }
  }

  logout() {
    this.apiService.logout(); 
    this.router.navigate(['/login']);
  }
}
