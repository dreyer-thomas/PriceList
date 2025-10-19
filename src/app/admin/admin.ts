import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppData, Article, PriceGroup } from '../pricegroup.model';
import { AdminService } from './admin.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TabsModule } from 'primeng/tabs';
import { ButtonDirective } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { AccordionModule } from 'primeng/accordion';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { AdminGeneralComponent } from '../admin-general/admin-general';
import { AdminImagesComponent } from '../admin-images/admin-images';
import { AdminArticlesComponent } from '../admin-articles/admin-articles';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  imports: [CommonModule, FormsModule, TabsModule, ButtonDirective, 
            ToggleSwitchModule, AccordionModule, InputTextModule, TextareaModule, InputNumberModule,
            AdminGeneralComponent, AdminImagesComponent, AdminArticlesComponent
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

  removeArticle(event: { groupIndex: number; articleIndex: number }) {
    this.appData.groups[event.groupIndex].articles.splice(event.articleIndex, 1);
  }

  addGroup() {
    const g = new PriceGroup();
      g.title = '';
      g.active = true;
      g.type = 'kugel';
      g.price = 0;
      g.articles = [];
      g.column = 'left';

      const newGroups = [...this.appData.groups, g];

      // AppData als neue Referenz erzeugen (wichtig für OnPush-Child)
      this.appData = new AppData(
        newGroups,
        this.appData.hidePrices,
        this.appData.hideDescription,
        this.appData.footerText,
        // falls du twoColumnCupsLandscape ergänzt hast:
        this.appData.landscapeMode ?? false
      );
  }

  deleteGroup(index: number) {
    const newGroups = this.appData.groups.filter((_, i) => i !== index);

    this.appData = new AppData(
      newGroups,
      this.appData.hidePrices,
      this.appData.hideDescription,
      this.appData.footerText,
      this.appData.landscapeMode ?? false
    );
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


  upload(file: File) {
    // Hier kommt jeder einzelne File aus dem emit an
    const formData = new FormData();
    formData.append('image', file);

    fetch('/api/images', {
      method: 'POST',
      body: formData
    }).then(res => {
      if (res.ok) {
        console.log('Upload erfolgreich');
        this.loadImages(); // ggf. reload
      } else {
        console.error('Fehler beim Upload');
      }
    }).catch(err => console.error('Fehler:', err));
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


}