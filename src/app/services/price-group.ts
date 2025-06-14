import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppData } from '../pricegroup.model'


@Injectable({
  providedIn: 'root'
})
export class PriceGroupService {
  private readonly apiUrl = 'http://localhost:3000/api/preisgruppen';

  constructor(private http: HttpClient) {}

  getPriceGroups(): Observable<AppData> {
    return this.http.get<AppData>(this.apiUrl);
  }
}