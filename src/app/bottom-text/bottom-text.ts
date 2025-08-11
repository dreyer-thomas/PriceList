import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bottom-text',
  imports: [CommonModule],
  templateUrl: './bottom-text.html',
  styleUrl: './bottom-text.css'
})
export class BottomText {
   @Input() text: string = '';
}
