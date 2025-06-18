import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppData } from '../pricegroup.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl =  '/api/preisgruppen';

  constructor(private http: HttpClient) {}

  getPriceGroups(): Observable<AppData> {
    return this.http.get<AppData>(this.apiUrl);
  }

  savePriceGroups(data: AppData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}