import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppData, Article, PriceGroup } from '../pricegroup.model';
import { AdminService } from './admin.service';
import { Select } from 'primeng/select';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TabsModule } from 'primeng/tabs';
import { ButtonDirective } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DataViewModule } from 'primeng/dataview';
import { FileUploadHandlerEvent, FileUploadModule, FileUpload} from 'primeng/fileupload';
import { AccordionModule } from 'primeng/accordion';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  imports: [CommonModule, FormsModule, Select, TabsModule, ButtonDirective, 
            ToggleSwitchModule, DataViewModule, FileUploadModule,
            AccordionModule, InputTextModule, TextareaModule, InputNumberModule
          ]
})
export class AdminComponent {
  appData: AppData = new AppData();
  private readonly apiUrl = '/api/preisgruppen';

  previewUrl?: string;
  images: { name: string; file: string; url: string }[] = [];

  activeTab: string = 'allgemein';

  tabs = [
    { label: 'Allgemein', value: 'allgemein' },
    { label: 'Artikel', value: 'artikel' },
    { label: 'Bilder', value: 'bilder' }
  ];

  constructor(private service: AdminService) {
    this.load();
  }

  ngOnInit() {
    this.loadImages();
  }

  load() {
    this.service.getPriceGroups().subscribe((data) => {
      this.appData = data;

      this.appData.groups.forEach(group => {
        if (!group.articles) {
          group.articles = [];
        }

        // echte Article-Instanzen herstellen
        group.articles = group.articles.map(a => {
          const article = new Article();
          Object.assign(article, a);
          return article;
        });

        // Bechergruppe absichern
        if (group.type === 'becher') {
          if (group.articles.length === 0) {
            group.articles = [new Article()];
          }

          // Preis
          const parsedPrice = Number(group.articles[0].price);
          group.articles[0].price = isNaN(parsedPrice) ? 0 : parsedPrice;
        }
      });
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

  onUpload(file: File) {
    const formData = new FormData();
    formData.append('image', file);

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

  upload(event: FileUploadHandlerEvent, fileUpload: FileUpload)
  {
    for (let file of event.files) {
      this.onUpload(file);
    }
    // Liste im UI leeren
    fileUpload.clear();
  }

  loadImages() {
    fetch('/api/images')
      .then(res => res.json())
      .then(data => {
        this.images = data.map((filename: string) => ({
          name: filename,
          file: filename,
          url: '/images/' + filename
        }));
      });
  }

  deleteImage(filename: string) {
    fetch(`/api/images/${filename}`, {
      method: 'DELETE'
    }).then(() => {
      this.loadImages(); // Liste neu laden
    });
  }

  onGroupTypeChanged(group: PriceGroup) {
    if (group.type === 'becher') {
      if (!group.articles || group.articles.length === 0) {
        group.articles = [new Article()];
      }
      // Nur setzen, wenn leer
      if (!group.articles[0].name) {
        group.articles[0].name = group.title;
      }
    }
  }

  onGroupTitleChanged(group: PriceGroup) {
    if (group.type === 'becher' && group.articles.length) {
      group.articles[0].name = group.title;
    }
  }

  getSelectedImage(): { name: string; url: string } | undefined {
    return this.images.find(i => i.file === this.appData.appLogo);
  }

}