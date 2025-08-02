import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DataViewModule } from 'primeng/dataview';
import { CommonModule } from '@angular/common';
import { FileUploadHandlerEvent, FileUploadModule, FileUpload} from 'primeng/fileupload';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-admin-images',
  templateUrl: './admin-images.html',
  styleUrls: ['./admin-images.css'],
  standalone: true,
  imports: [ DataViewModule, FileUploadModule, FileUpload,CommonModule,
             ButtonDirective
           ]
})
export class AdminImagesComponent {
  @Input() images: any[] = [];
  @Output() upload = new EventEmitter<File>();
  @Output() delete = new EventEmitter<string>();

  onUpload(event: FileUploadHandlerEvent, fileUpload: FileUpload) {
    for (let file of event.files) {
      this.upload.emit(file);
    }
    fileUpload.clear();
  }
}