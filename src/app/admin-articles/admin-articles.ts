import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppData, Image} from '../pricegroup.model';
import { AccordionModule } from 'primeng/accordion';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonDirective } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-admin-articles',
  imports: [AccordionModule, ToggleSwitchModule, CommonModule, FormsModule,
            Select, ButtonDirective, InputTextModule, TextareaModule
           ],
  templateUrl: './admin-articles.html',
  styleUrl: './admin-articles.css'
})
export class AdminArticlesComponent {
  @Input() appData!: AppData;
  @Input() images: Image[] = [];

  @Output() addGroup = new EventEmitter<void>();
  @Output() deleteGroup = new EventEmitter<number>();
  @Output() addArticle = new EventEmitter<number>();
  @Output() removeArticle = new EventEmitter<{ groupIndex: number, articleIndex: number }>();

  onGroupTypeChanged(group: any) {
    // ggf. Logik hier
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
