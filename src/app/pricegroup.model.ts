export class PriceGroup {
  title = '';
  active = true;
  type: 'kugel' | 'becher' = 'kugel'; // NEU
  price: number = 0; // Nur für Typ 'kugel'
  articles: Article[] = [];
  column: 'left' | 'right' | 'middle' = 'left';
}

export class Article {
  name = '';
  price = 0;
  image = '';
  ingredients = '';
  active = true;
  description = '';
}

export class AppData {
  constructor(
    public groups: PriceGroup[] = [],
    public hidePrices: boolean = false,
    public hideDescription: boolean = false,
    public footerText: string = "",
    public landscapeMode: boolean = false
  ) {}
}

export interface Image {
  file: string;
  name: string;
  url: string;
}