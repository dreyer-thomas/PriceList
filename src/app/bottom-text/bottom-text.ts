import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-bottom-text',
  imports: [CommonModule],
  templateUrl: './bottom-text.html',
  styleUrl: './bottom-text.css'
})
export class BottomText {
  private _text: string = '';
  safeHtml: SafeHtml = '';
  
  constructor(private sanitizer: DomSanitizer) {}

@Input()
  set text(value: string) {
    this._text = value;
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this._text);
  }
  get text(): string {
    return this._text;
  }
}
