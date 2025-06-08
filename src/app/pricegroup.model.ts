<<<<<<< HEAD
export class Article {
    constructor(
    public name: string = '',
    public price: number = 0,
    public active: boolean = true
  ) {}
}

export class PriceGroup {
  constructor(
    public title: string = '',
    public image: string = '',
    public active: boolean = true,
    public articles: Article[] = []
  ) {}
}

export class AppData {
  constructor(
    public appTitle: string = '',
    public appLogo: string = '',
    public groups: PriceGroup[] = []
  ) {}
=======
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
>>>>>>> 1ac4b0f (Initial Commit: Angular Fromtend and Express Backend)
}