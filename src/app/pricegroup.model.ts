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
    public groups: PriceGroup[] = [],
    public zoom: number = 0.8,
    public impressum: string = '',
  ) {}
}