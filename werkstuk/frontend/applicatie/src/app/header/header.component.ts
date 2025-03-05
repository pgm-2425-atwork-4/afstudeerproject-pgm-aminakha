import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // ✅ FIX: Import RouterModule

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule], // ✅ FIX: Ensure RouterModule is included
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {}
