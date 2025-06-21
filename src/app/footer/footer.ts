import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  standalone: true,
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class FooterComponent {
  @Input() title: string = 'Default';
  @Input() impressum: string = '';
}
