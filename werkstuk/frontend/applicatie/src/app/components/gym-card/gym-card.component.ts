import { Component, Input } from '@angular/core';

@Component({
  selector: 'gym-card',
  imports: [],
  templateUrl: './gym-card.component.html',
  styleUrl: './gym-card.component.css'
})
export class GymCardComponent {
  @Input() gym: any;  

}
