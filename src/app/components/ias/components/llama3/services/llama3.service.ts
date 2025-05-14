import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Llama3Service {

  private apiUrl = 'http://localhost:3000/ollama/generate';

  constructor(private http: HttpClient) {}

  sendPrompt(prompt: string): Observable<any> {
    return this.http.post(this.apiUrl, { prompt });
  }
}
