import { Routes } from '@angular/router';
import { App } from './app';           // Deine Hauptkomponente
import { AdminComponent } from './admin/admin';  // Admin-Komponente

export const routes: Routes = [
  { path: '', component: App },                 // Startseite
  { path: 'admin', component: AdminComponent }  // Admin-Seite
  ];
