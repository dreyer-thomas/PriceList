import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppData } from '../pricegroup.model';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { EditorModule } from 'primeng/editor';

@Component({
  selector: 'app-admin-general',
  templateUrl: './admin-general.html',
  styleUrls: ['./admin-general.css'],
  imports: [CommonModule, FormsModule, ToggleSwitchModule, EditorModule]
})
export class AdminGeneralComponent {
  @Input() images: any[] = [];
  @Input() appData: AppData = {} as AppData;

  //Inform parents on changes
  @Output() appDataChange = new EventEmitter<AppData>();

  onTwoColsToggle(value: boolean) {
    // neue Referenz erzeugen (wichtig für OnPush-Siblings)
    const updated: AppData = { ...this.appData, landscapeMode: value };
    this.appData = updated;
    this.appDataChange.emit(updated);
  }
}
