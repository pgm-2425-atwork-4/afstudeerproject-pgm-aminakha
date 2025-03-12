import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  user: any = null;
  isBrowser: boolean = false; //detect if the browser is running

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId); 

    if (this.isBrowser) {
      this.loadUser();

    
      window.addEventListener('storage', () => {
        this.loadUser();
      });
    }
  }

  loadUser() {
    if (this.isBrowser) {
      const storedUser = localStorage.getItem('user');
      this.user = storedUser ? JSON.parse(storedUser) : null;
    }
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('user');
      this.loadUser(); 
    }
    this.router.navigate(['/login']); 
  }
}
