import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PriceGroup } from '../pricegroup.model';
import { AdminService } from './admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  imports: [CommonModule, FormsModule]
})
export class AdminComponent {
  priceGroups: PriceGroup[] = [];
  private readonly apiUrl = 'http://localhost:3000/api/preisgruppen';

  constructor(private service: AdminService) {
    this.load();
  }

  load() {
    this.service.getPriceGroups().subscribe((data) => {
      this.priceGroups = data;
    });
  }

  save() {
    this.service.savePriceGroups(this.priceGroups).subscribe(() => {
      alert('Gespeichert');
    });
  }

  addArticle(groupIndex: number) {
      const group = this.priceGroups[groupIndex];
      if (!group.articles) {
        group.articles = [];  // Falls nicht vorhanden, initialisieren
      }
      group.articles.push({ name: '', price: 0.0 , active: true});
  }

  removeArticle(groupIndex: number, articleIndex: number) {
    this.priceGroups[groupIndex].articles.splice(articleIndex, 1);
  }

  addGroup() {
    this.priceGroups.push({
      title: 'Neue Gruppe',
      image: '',
      articles: [],
      active: true
    });
  }

  deleteGroup(index: number) {
    this.priceGroups.splice(index, 1);
  }

}