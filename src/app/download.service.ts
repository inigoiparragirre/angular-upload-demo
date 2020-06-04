import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class DownloadService {

  constructor(private http: HttpClient) {}

  download(url: string): Observable<HttpEvent<Blob>> {
    return this.http.get(url, {
      responseType: 'blob',
      observe: 'events',
      reportProgress: true
    });
  }
}

