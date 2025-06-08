import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PriceGroup } from '../pricegroup.model'


@Injectable({
  providedIn: 'root'
})
export class PriceGroupService {
  private readonly apiUrl = 'http://localhost:3000/api/preisgruppen';

  constructor(private http: HttpClient) {}

  getPriceGroups(): Observable<PriceGroup[]> {
    return this.http.get<PriceGroup[]>(this.apiUrl);
  }
}