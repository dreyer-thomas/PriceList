import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,       // <-- Sehr wichtig!
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  @Input() title: string="default";
  @Input() logo: string='';


  getImageUrl(name: string): string {
    return `/images/${name}`;
  }

}