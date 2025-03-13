import { Component } from '@angular/core';
import {HeaderComponent} from './header/header.component';
import { RouterModule } from '@angular/router'; // ✅ Import RouterModule
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api.service'; // ✅ Import the API Service

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ HeaderComponent,CommonModule,RouterOutlet], // ✅ Ensure RouterModule is included
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ApiService] // ✅ Add the API Service to the providers array
})
export class AppComponent {
  constructor(private apiService: ApiService) {} // ✅ Inject service
  ngOnInit() {
    console.log("🌍 App started, waking up backend..."); // ✅ Check if this appears
    this.apiService.wakeUpBackend(); // ✅ Call the backend
  }
}
