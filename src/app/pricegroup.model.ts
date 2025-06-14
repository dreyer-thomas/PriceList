export interface Article {
  name: string;
  price: number;
  active: boolean;
}

export interface PriceGroup {
  title: string;
  image: string;
  active: boolean;
  articles: Article[];
}

export interface AppData {
  appTitle: string;
  appLogo: string;
  groups: PriceGroup[];
}