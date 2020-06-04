import { DownloadService } from './../download.service';
import { UploadService } from './../upload.service';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  @ViewChild('fileUpload', {static: false}) fileUpload: ElementRef;
  filesCert  = [];
  progressCert = 0;
  progressDownCert = 0;
  loadedCert = false;
  urlCert: string;
  nameCert: string;
  constructor(
    private downloadService: DownloadService,
    private uploadService: UploadService) {}

  

  onClickCert() {
    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.onchange = () => {
    for (let index = 0; index < fileUpload.files.length; index++) {
     const file = fileUpload.files[index];
     this.filesCert.push({ data: file, inProgress: false, progress: 0});
    }

    this.uploadFiles();
    };

    fileUpload.click();
  }

  getProgressCert(): number {
    return this.progressCert;
  }

  setProgressCert(value: number) {
    this.progressCert = value;
  }

  uploadFile(file) {
    const formData = new FormData();
    this.progressDownCert = 0;
    formData.append('file', file.data);
    file.inProgress = true;
    this.uploadService.upload(formData).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            file.progress = Math.round(event.loaded * 100 / event.total);
            console.log('progress value', this.progressCert, event);
            this.setProgressCert(file.progress);
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
          this.loadedCert = true;
          this.urlCert = event.body.link;
          this.nameCert = file.data.name;
          console.log(this.urlCert);
        }
      });
  }

  private uploadFiles() {
    this.fileUpload.nativeElement.value = '';
    this.filesCert.forEach(file => {
      console.log('Cargar fichero');
      this.uploadFile(file);
    });

    this.filesCert = [];
  }

  downloadCert() {
    this.downloadService
      .download(this.urlCert)
      .pipe(
        map(event => {
          switch (event.type) {
            case HttpEventType.Sent:
              break;
            case HttpEventType.DownloadProgress:
              // tslint:disable-next-line: variable-name
              const progressDown = Math.round(event.loaded * 100 / event.total);
              console.log('progress download value', event.loaded, progressDown);
              return progressDown;
              break;
            case HttpEventType.Response:
              console.log('evento response');
              return event.body;
          }
        }),
      )
      .subscribe(data => {
        console.log('Descarga');
        if (typeof (data) === 'number') {
          this.progressDownCert = data;
        }

        if (typeof (data) === 'object') {
          saveAs(data, 'upv-descarga');
          this.progressDownCert = 1;
        }

      }
        );
  }

  removeCert() {
    this.loadedCert = false;
    this.setProgressCert(0);
    this.progressDownCert = 0;
    this.filesCert = [];
  }

}
