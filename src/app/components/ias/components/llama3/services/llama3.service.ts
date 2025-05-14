import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Llama3Service {
  private apiUrl = 'http://localhost:3000/ollama/generate';
  private historyUrl = 'http://localhost:3000/chat-history';
  private currentHistoryId: string | null = null;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // asegúrate de guardar el JWT ahí
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  createConversation(): Observable<any> {
    const body = { chatbotName: 'llama3', title: 'Conversación Llama3' };
    return this.http.post(`${this.historyUrl}/new`, body, {
      headers: this.getAuthHeaders()
    });
  }

  sendPrompt(prompt: string): Observable<any> {
    return this.http.post(this.apiUrl, { prompt });
  }

  saveMessage(historyId: string, sender: 'user' | 'bot', text: string): Observable<any> {
  return this.http.post('http://localhost:3000/chat-history/add-message', {
    historyId,
    sender,
    text
  });
}


  getHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.historyUrl}/llama3`, {
      headers: this.getAuthHeaders()
    });
  }

  setHistoryId(id: string) {
    this.currentHistoryId = id;
  }

  getHistoryId(): string | null {
    return this.currentHistoryId;
  }
}
