import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
<<<<<<< HEAD
import { AppData } from '../pricegroup.model';
=======
import { PriceGroup } from '../pricegroup.model';
>>>>>>> 1ac4b0f (Initial Commit: Angular Fromtend and Express Backend)
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = 'http://localhost:3000/api/preisgruppen';

  constructor(private http: HttpClient) {}

<<<<<<< HEAD
  getPriceGroups(): Observable<AppData> {
    return this.http.get<AppData>(this.apiUrl);
  }

  savePriceGroups(data: AppData): Observable<any> {
=======
  getPriceGroups(): Observable<PriceGroup[]> {
    return this.http.get<PriceGroup[]>(this.apiUrl);
  }

  savePriceGroups(data: PriceGroup[]): Observable<any> {
>>>>>>> 1ac4b0f (Initial Commit: Angular Fromtend and Express Backend)
    return this.http.post(this.apiUrl, data);
  }
}