import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PriceGroup } from '../pricegroup.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = 'http://localhost:3000/api/preisgruppen';

  constructor(private http: HttpClient) {}

  getPriceGroups(): Observable<PriceGroup[]> {
    return this.http.get<PriceGroup[]>(this.apiUrl);
  }

  savePriceGroups(data: PriceGroup[]): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}