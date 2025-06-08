import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-price-group',
  imports: [CommonModule],
  templateUrl: './price-group.html',
  styleUrl: './price-group.css'
})
export class PriceGroupComponent {
  @Input() title: string = '';
  @Input() image: string = '';
  @Input() articles: {name: string, price: number, active: boolean}[] = [];
  @Input() active: boolean = true;

  get visibleArticles() {
     return this.articles?.filter(a => a.active !== false);
  }
<<<<<<< HEAD

  getImageUrl(name: string): string {
  return `/images/${name}`;
}
=======
>>>>>>> 1ac4b0f (Initial Commit: Angular Fromtend and Express Backend)
}

