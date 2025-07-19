export class PriceGroup {
  title = '';
  active = true;
  type: 'kugel' | 'becher' = 'kugel'; // NEU
  price: number = 0; // Nur für Typ 'kugel'
  articles: Article[] = [];
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
    public appLogo: string = '',
    public groups: PriceGroup[] = []
  ) {}
}