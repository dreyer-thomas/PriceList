import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from './header/header';
import { FooterComponent } from './footer/footer';
import { PriceGroupComponent } from './price-group/price-group';
import { PriceGroupService } from './services/price-group';
import { interval, switchMap } from 'rxjs';
import { PriceGroup } from './pricegroup.model'

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, FooterComponent, PriceGroupComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true
})

export class App implements OnInit {
  priceGroups: PriceGroup[] = [];

   constructor(private service: PriceGroupService) {}

  ngOnInit(): void {
    this.loadInitialData();

    // Alle 5 Sekunden neu laden
    interval(10000).pipe(
      switchMap(() => this.service.getPriceGroups())
    ).subscribe((data) => {
      this.priceGroups = data.filter(group => group.active !== false);
    });
  }

  private loadInitialData() {
    this.service.getPriceGroups().subscribe((data) => {
      this.priceGroups = data.filter(group => group.active !== false);
    });
  }

}
