import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from './header/header';
import { PriceGroupComponent } from './price-group/price-group';
import { PriceGroupService } from './services/price-group';
import { interval, switchMap, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AppData } from './pricegroup.model'
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PriceGroup } from './pricegroup.model';

@Component({
  selector: 'app-root',
  imports: [CommonModule, HeaderComponent, PriceGroupComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true
})

export class App implements OnInit {
      appData: AppData = new AppData();

      constructor(private service: PriceGroupService, private router: Router) {}

      ngOnInit(): void {
        this.loadInitialData();
      
        // Alle 5 Sekunden neu laden
        interval(2000).pipe(
        switchMap(() => this.service.getPriceGroups()),
        retry(),
        catchError(error => {
            console.error('Fehler bei der zyklischen Datenanforderung:', error);
            return of(new AppData());
        })
          ).subscribe((data) => {
            this.appData.appLogo = data.appLogo;
            this.appData.hidePrices = data.hidePrices;
            this.appData.groups = data.groups.filter(group => group.active !== false);
          });
      }

      private loadInitialData() {
        this.service.getPriceGroups().subscribe((data) => {
            const oldJson = JSON.stringify({
              appLogo: this.appData.appLogo,
              hidePrices: this.appData.hidePrices,
              groups: this.appData.groups
            });

            const newJson = JSON.stringify({
              appLogo: data.appLogo,
              hidePrices: data.hidePrices,
              groups: data.groups
            });

            if (oldJson !== newJson) {
              console.log('Änderung erkannt, Daten werden übernommen');
              this.appData = data;
              this.appData.groups = data.groups.filter(g => g.active !== false);
            }
        });
      }

      get kugelGroups(): PriceGroup[] {
        return this.appData.groups.filter(g => g.type === 'kugel' && g.active);
      }

      get becherGroups(): PriceGroup[] {
        return this.appData.groups.filter(
          g => g.type === 'becher' && g.active && g.articles[0]?.active
        );
      }

      get leftColumnGroups(): PriceGroup[] {
        return this.kugelGroups.filter(g => g.column === 'left');
      }

      get rightColumnGroups(): PriceGroup[] {
        return this.kugelGroups.filter(g => g.column === 'right');
      }

      trackByTitle(index: number, group: PriceGroup): string {
        return group.title;
      }

}
