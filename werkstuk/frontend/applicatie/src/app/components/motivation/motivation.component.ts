import { Component } from '@angular/core';

@Component({
  selector: 'motivation',
  imports: [],
  templateUrl: './motivation.component.html',
  styleUrl: './motivation.component.css'
})
export class MotivationComponent {
  randomMotivation: any;
  motivations = [
      {
        text: "“Succes is doen wat je moet doen, zelfs wanneer je er geen zin in hebt.”",
        author: '@Daniël Storm',
        image: 'images/daniel.png'
      }, 
      {
        text: "“Discipline is kiezen tussen wat je nu wilt en wat je het allermeest wilt.”",
        author: '@Sven Richter',
        image: 'images/sven.png'
      },
      {
        text: "“Je lichaam kan bijna alles aan. Het is je geest die je moet overtuigen.”",
        author: '@Noah de Vries',
        image: 'images/noah.png'
  }];
  ngOnInit() {
        this.randomMotivation = this.motivations[Math.floor(Math.random() * this.motivations.length)];
  }
}
