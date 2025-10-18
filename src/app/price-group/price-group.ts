import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Article } from '../pricegroup.model';

@Component({
  selector: 'app-price-group',
  imports: [CommonModule],
  templateUrl: './price-group.html',
  styleUrl: './price-group.css'
})
export class PriceGroupComponent {
  @Input() title: string = '';
  @Input() articles: Article[] = [];
  @Input() type: 'kugel' | 'becher' = 'kugel';
  @Input() price: number = 0;
  @Input() active: boolean = true;
  @Input() hidePrices: boolean = false;
  @Input() hideDescriptions: boolean = false;

  readonly titleColorClass: string = 'color-red';

  constructor() {
    const classes = ['color-red', 'color-blue', 'color-green', 'color-orange', 'color-purple'];
    this.titleColorClass = classes[Math.floor(Math.random() * classes.length)];
  }

  get visibleArticles() {
     return this.articles?.filter(a => a.active !== false);
  }

  getImageUrl(name: string): string {
    return `/images/${name}`;
  }

  get isBecherActive(): boolean {
    return this.articles[0]?.active ?? false;
  }

}

