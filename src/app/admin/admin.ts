import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppData, Article, PriceGroup } from '../pricegroup.model';
import { AdminService } from './admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  imports: [CommonModule, FormsModule]
})
export class AdminComponent {
  appData: AppData = new AppData();
  private readonly apiUrl = '/api/preisgruppen';

  selectedFile?: File;
  previewUrl?: string;
  images: string[] = [];

  constructor(private service: AdminService) {
    this.load();
  }

  ngOnInit() {
    this.loadImages();
  }

  load() {
    this.service.getPriceGroups().subscribe((data) => {
      this.appData = data;
    });
  }

  save() {
    this.service.savePriceGroups(this.appData).subscribe(() => { });
  }

  addArticle(groupIndex: number) {
      const group = this.appData.groups[groupIndex];
      if (!group.articles) {
        group.articles = [];  // Falls nicht vorhanden, initialisieren
      }
      group.articles.push(new Article());
  }

  removeArticle(groupIndex: number, articleIndex: number) {
    this.appData.groups[groupIndex].articles.splice(articleIndex, 1);
  }

  addGroup() {
    this.appData.groups.push(new PriceGroup());
  }

  deleteGroup(index: number) {
    this.appData.groups.splice(index, 1);
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  } 

  onUpload() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('image', this.selectedFile);

    fetch('/api/images', {
      method: 'POST',
      body: formData
    }).then(response => {
      if (response.ok) {
        console.log('Upload erfolgreich');
      } else {
        console.error('Fehler beim Upload');
      }
    }).catch(err => {
      console.error('Fehler beim Hochladen:', err);
    });
    this.loadImages();
  }

  loadImages() {
    fetch('/api/images')
      .then(res => res.json())
      .then(data => {
        this.images = data;
      });
  }

  deleteImage(filename: string) {
    fetch(`/api/images/${filename}`, {
      method: 'DELETE'
    }).then(() => {
      this.loadImages(); // Liste neu laden
    });
  }

}