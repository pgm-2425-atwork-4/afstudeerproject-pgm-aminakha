import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core'; 

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  isBrowser: boolean = false; 

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef, 
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId); 

    if (this.isBrowser) {
      this.loadUserProfile();
    }
  }

  loadUserProfile() {
    const userId = this.route.snapshot.paramMap.get('id'); 
    console.log("🔍 Fetching user with ID:", userId); 

    if (userId) {
      this.http.get(`http://localhost:5000/users/${userId}`).subscribe(
        (res: any) => {
          console.log("✅ User data received:", res); 
          this.user = res;
          this.cdr.detectChanges(); // Force view update
        },
        (error) => {
          console.error("🔥 Error fetching user:", error);
        }
      );
    }
  }
}
