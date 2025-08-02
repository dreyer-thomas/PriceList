export class PriceGroup {
  title = '';
  active = true;
  type: 'kugel' | 'becher' = 'kugel'; // NEU
  price: number = 0; // Nur für Typ 'kugel'
  articles: Article[] = [];
  column: 'left' | 'right' = 'left';
}

export class Article {
  name = '';
  price = 0;
  image = '';
  ingredients = '';
  active = true;
}

export class AppData {
  constructor(
    public groups: PriceGroup[] = [],
    public hidePrices: boolean = false
  ) {}
}

export interface Image {
  file: string;
  name: string;
  url: string;
}