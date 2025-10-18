import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppData, Image, Article} from '../pricegroup.model';
import { AccordionModule } from 'primeng/accordion';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonDirective } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ArticleItemComponent } from './article-item/article-item';
import { Select } from 'primeng/select';


@Component({
  selector: 'app-admin-articles',
  imports: [AccordionModule, ToggleSwitchModule, CommonModule, FormsModule,
            ButtonDirective, InputTextModule, TextareaModule, ArticleItemComponent,
            Select, InputNumberModule
           ],
  templateUrl: './admin-articles.html',
  styleUrl: './admin-articles.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminArticlesComponent {
  @Input() appData!: AppData;
  @Input() images: Image[] = [];

  @Output() addGroup = new EventEmitter<void>();
  @Output() deleteGroup = new EventEmitter<number>();
  @Output() addArticle = new EventEmitter<number>();
  @Output() removeArticle = new EventEmitter<{ groupIndex: number, articleIndex: number }>();

  constructor(private cdr: ChangeDetectorRef) {}

  private touchGroups() {
    // neue Referenz, damit CD sicher feuert (wichtig bei OnPush-Children)
    this.appData = { ...this.appData, groups: [...this.appData.groups] };
    this.cdr.markForCheck();
  }

  onGroupTypeChanged(group: any) {
    if (group.type === 'becher') {
      // 1. mind. einen Artikel haben
      if (!group.articles || group.articles.length === 0) {
        const first = new Article();
        // sinnvolle Defaults
        first.name = group.title ?? '';
        first.price = Number.isFinite(Number(first.price)) ? Number(first.price) : 0;

        // neue Array-Referenz setzen
        group.articles = [first];
      } else {
        // vorhandenes 0. Element als neue Referenz schreiben (immutabel)
        const a0 = group.articles[0];
        const parsedPrice = Number(a0?.price);
        const becher = Object.assign(new Article(), a0, {
          name: a0?.name || group.title || '',
          price: Number.isFinite(parsedPrice) ? parsedPrice : 0
        });
        group.articles = [becher, ...group.articles.slice(1)];
      }
    } else {
      // von becher -> kugel: hier musst du nichts erzwingen,
      // aber Referenz anstoßen, falls UI sofort umschalten soll
      group.articles = [...(group.articles ?? [])];
    }

    this.touchGroups(); // UI sofort updaten
  }

  triggerAddGroup() {
    this.addGroup.emit();
  }

  triggerDeleteGroup(index: number) {
    this.deleteGroup.emit(index);
  }

  triggerAddArticle(index: number) {
    this.addArticle.emit(index);
  }

  triggerRemoveArticle(groupIndex: number, articleIndex: number) {
    this.removeArticle.emit({ groupIndex, articleIndex });
  }
}
