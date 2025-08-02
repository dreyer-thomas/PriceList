import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppData } from '../pricegroup.model';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-admin-general',
  templateUrl: './admin-general.html',
  styleUrls: ['./admin-general.css'],
  imports: [CommonModule, FormsModule, ToggleSwitchModule]
})
export class AdminGeneralComponent {
  @Input() images: any[] = [];
  @Input() appData: AppData = {} as AppData;
}
