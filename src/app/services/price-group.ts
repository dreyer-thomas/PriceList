import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
<<<<<<< HEAD
import { AppData } from '../pricegroup.model'
=======
import { PriceGroup } from '../pricegroup.model'
>>>>>>> 1ac4b0f (Initial Commit: Angular Fromtend and Express Backend)


@Injectable({
  providedIn: 'root'
})
export class PriceGroupService {
  private readonly apiUrl = 'http://localhost:3000/api/preisgruppen';

  constructor(private http: HttpClient) {}

<<<<<<< HEAD
  getPriceGroups(): Observable<AppData> {
    return this.http.get<AppData>(this.apiUrl);
=======
  getPriceGroups(): Observable<PriceGroup[]> {
    return this.http.get<PriceGroup[]>(this.apiUrl);
>>>>>>> 1ac4b0f (Initial Commit: Angular Fromtend and Express Backend)
  }
}