import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from './header/header';
import { FooterComponent } from './footer/footer';
import { PriceGroupComponent } from './price-group/price-group';
import { PriceGroupService } from './services/price-group';
import { interval, switchMap } from 'rxjs';
import { AppData } from './pricegroup.model'

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, FooterComponent, PriceGroupComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true
})

export class App implements OnInit {
  //priceGroups: PriceGroup[] = [];
  appData: AppData = {
      appTitle: '', 
      appLogo: '',
      groups: [] 
    }


  constructor(private service: PriceGroupService) {}

  ngOnInit(): void {
    this.loadInitialData();

    // Alle 5 Sekunden neu laden
    interval(10000).pipe(
      switchMap(() => this.service.getPriceGroups())
    ).subscribe((data) => {
      this.appData.appTitle = data.appTitle;
      this.appData.appLogo = data.appLogo;
      this.appData.groups = data.groups.filter(group => group.active !== false);
    });
  }

  private loadInitialData() {
    this.service.getPriceGroups().subscribe((data) => {
      this.appData.appTitle = data.appTitle;
      this.appData.appLogo = data.appLogo;
      this.appData.groups = data.groups.filter(group => group.active !== false);
    });
  }

}
