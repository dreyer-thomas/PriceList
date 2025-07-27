import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Article } from '../../pricegroup.model';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { ButtonDirective } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-article-item',
  templateUrl: './article-item.html',
  styleUrls: ['./article-item.css'],
  imports: [ToggleSwitchModule,CommonModule, FormsModule, Select,
            ButtonDirective, InputTextModule, TextareaModule
  ]
})
export class ArticleItemComponent {
  @Input() article!: Article;
  @Input() images: { name: string; file: string; url: string }[] = [];
  @Input() groupIndex!: number;
  @Input() articleIndex!: number;
  @Output() remove = new EventEmitter<{ groupIndex: number, articleIndex: number }>();

  onRemove() {
    this.remove.emit({ groupIndex: this.groupIndex, articleIndex: this.articleIndex });
  }
}