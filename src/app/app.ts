import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from './header/header';
import { FooterComponent } from './footer/footer';
import { PriceGroupComponent } from './price-group/price-group';
import { PriceGroupService } from './services/price-group';
import { interval, switchMap, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AppData } from './pricegroup.model'
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, HeaderComponent, FooterComponent, PriceGroupComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true
})

export class App implements OnInit {
      appData: AppData = new AppData();
      zoom: number = 0.8;

      constructor(private service: PriceGroupService, private router: Router) {}

      ngOnInit(): void {
        this.loadInitialData();
        this.zoom = this.appData.zoom;
      
        // Alle 5 Sekunden neu laden
        interval(10000).pipe(
        switchMap(() => this.service.getPriceGroups()),
        retry(),
        catchError(error => {
            console.error('Fehler bei der zyklischen Datenanforderung:', error);
            return of(new AppData());
        })
          ).subscribe((data) => {
            this.appData.appTitle = data.appTitle;
            this.appData.appLogo = data.appLogo;
            this.appData.groups = data.groups.filter(group => group.active !== false);
            this.appData.zoom = data.zoom;
            this.appData.impressum = data.impressum;
            setTimeout(() => this.setZoom(), 100);
          });
      }

      private loadInitialData() {
        this.service.getPriceGroups().subscribe((data) => {
          this.appData.appTitle = data.appTitle;
          this.appData.appLogo = data.appLogo;
          this.appData.groups = data.groups.filter(group => group.active !== false);
          this.appData.zoom = data.zoom;
          this.appData.impressum = data.impressum;
          setTimeout(() => this.setZoom(), 100);
        });
      }

      setZoom() {
        if (this.router.url !== '/admin' && this.appData.zoom) {
            document.body.style.zoom = this.appData.zoom.toString();          
        } else {
          // Adminseite → Zoom zurücksetzen
          document.body.style.zoom = '0.8';
        }
      }

}
