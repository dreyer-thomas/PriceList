import { Component, OnInit } from '@angular/core';
import { PriceGroupComponent } from './price-group/price-group';
import { PriceGroupService } from './services/price-group';
import { interval, switchMap, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AppData } from './pricegroup.model'
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PriceGroup } from './pricegroup.model';
import { BottomText } from "./bottom-text/bottom-text";

@Component({
  selector: 'app-root',
  imports: [CommonModule, PriceGroupComponent, BottomText],
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
            this.appData.hidePrices = data.hidePrices;
            this.appData.hideDescription = data.hideDescription;
            this.appData.footerText = data.footerText;
            this.appData.groups = data.groups.filter(group => group.active !== false);
            this.appData.landscapeMode = data.landscapeMode ?? false;
          });
      }

      private loadInitialData() {
        this.service.getPriceGroups().subscribe((data) => {
            const oldJson = JSON.stringify({
              hidePrices: this.appData.hidePrices,
              hideDescription: this.appData.hideDescription,
              footerText: this.appData.footerText,
              groups: this.appData.groups
            });

            const newJson = JSON.stringify({
              hidePrices: data.hidePrices,
              hideDescription: this.appData.hideDescription,
              footerText: this.appData.footerText,
              groups: data.groups
            });

            if (oldJson !== newJson) {
              console.log('Änderung erkannt, Daten werden übernommen');
              this.appData = data;
              this.appData.footerText = data.footerText;
              this.appData.groups = data.groups.filter(g => g.active !== false);
              (this.appData as any).twoColumnCupsLandscape = (data as any).twoColumnCupsLandscape ?? false;
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

      get becherLeft(): PriceGroup[] {
        return this.becherGroups.filter(g => g.column === 'left');
      }

      get becherRight(): PriceGroup[] {
        return this.becherGroups.filter(g => g.column === 'right');
      }

      get leftColumnGroups(): PriceGroup[] {
        return this.kugelGroups.filter(g => g.column === 'left');
      }

      get rightColumnGroups(): PriceGroup[] {
        return this.kugelGroups.filter(g => g.column === 'right');
      }

      get middleColumnGroups(): PriceGroup[] {
        return this.appData.landscapeMode
          ? this.kugelGroups.filter(g => g.column === 'middle')
          : [];
      }

      trackByTitle(index: number, group: PriceGroup): string {
        return group.title;
      }

}
