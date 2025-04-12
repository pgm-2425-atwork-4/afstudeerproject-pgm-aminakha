import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'gym-card',
  imports: [RouterLink],
  templateUrl: './gym-card.component.html',
  styleUrl: './gym-card.component.css'
})
export class GymCardComponent {
  @Input() gym: any;  

}
