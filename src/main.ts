import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { LayoutComponent } from './app/layout/layout'; 


bootstrapApplication(LayoutComponent, appConfig)
  .catch((err) => console.error(err));
