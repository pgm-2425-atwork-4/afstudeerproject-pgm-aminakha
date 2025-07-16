import { Component } from '@angular/core';
import {HeaderComponent} from './header/header.component';
import { RouterModule } from '@angular/router'; 
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api.service'; 
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ HeaderComponent,FooterComponent,CommonModule,RouterOutlet ], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ApiService] 
})
export class AppComponent {
  constructor(private apiService: ApiService) {}
  ngOnInit() {
    console.log("🌍 App started, waking up backend..."); 
    this.apiService.wakeUpBackend(); 
  }
}
