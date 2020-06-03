import { UploadService } from './../upload.service';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  @ViewChild('fileUpload', {static: false}) fileUpload: ElementRef;
  files  = [];
  progress = 0;
  loaded = false;
  url: string;
  constructor(private uploadService: UploadService) {}

  onClick() {
    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.onchange = () => {
    for (let index = 0; index < fileUpload.files.length; index++) {
     const file = fileUpload.files[index];
     this.files.push({ data: file, inProgress: false, progress: 0});
    }

    this.uploadFiles();
    };

    fileUpload.click();
  }

  getProgress(): number {
    return this.progress;
  }

  setProgress(value: number) {
    this.progress = value;
  }

  uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file.data);
    file.inProgress = true;
    this.uploadService.upload(formData).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            file.progress = Math.round(event.loaded * 100 / event.total);
            console.log('progress value', this.progress, event);
            this.progress = file.progress;
            break;
          case HttpEventType.Response:
            console.log('evento response');
            return event;
        }
      }),
      catchError((error: HttpErrorResponse) => {
        file.inProgress = false;
        return of(`${file.data.name} upload failed.`);
      })).subscribe((event: any) => {
        if (typeof (event) === 'object') {
          this.loaded = true;
          this.url = event.body.link;
          console.log(this.url);
        }
      });
  }

  private uploadFiles() {
    this.fileUpload.nativeElement.value = '';
    this.files.forEach(file => {
      console.log("Cargar fichero");
      this.uploadFile(file);
    });

    this.files = [];
}


}
