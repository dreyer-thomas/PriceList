import { Component } from '@angular/core';
<<<<<<< HEAD
import { Input } from '@angular/core';
=======
>>>>>>> 1ac4b0f (Initial Commit: Angular Fromtend and Express Backend)

@Component({
  selector: 'app-header',
  standalone: true,       // <-- Sehr wichtig!
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
<<<<<<< HEAD
export class HeaderComponent {
  @Input() title: string="default";
  @Input() logo: string='';


  getImageUrl(name: string): string {
    return `/images/${name}`;
  }
}
=======
export class HeaderComponent {}
>>>>>>> 1ac4b0f (Initial Commit: Angular Fromtend and Express Backend)
