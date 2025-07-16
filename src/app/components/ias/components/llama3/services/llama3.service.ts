import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Llama3Service {
  private apiUrl = 'https://tfgbackend-production-35c6.up.railway.app/generate';
  private historyUrl = 'https://tfgbackend-production-35c6.up.railway.app/chat-history';
  private currentHistoryId: string | null = null;

  constructor(private http: HttpClient) {}

  //  Enviar mensaje al backend y obtener respuesta del modelo LLaMA 3
  sendPrompt(prompt: string): Observable<{ response: string }> {
    return this.http.post<{ response: string }>(this.apiUrl, { prompt });
  }

  //  Guardar mensaje (user o bot) en la conversación
  saveMessage(historyId: string, sender: 'user' | 'bot', text: string): Observable<any> {
    return this.http.post(`${this.historyUrl}/add-message`, {
      historyId,
      sender,
      text
    });
  }

  //  Obtener historial de conversaciones para llama3
  getConversationHistory(chatbotName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.historyUrl}/${chatbotName}`);
  }

  //  Crear nueva conversación
  createConversation(chatbotName: string, title: string): Observable<any> {
    return this.http.post(`${this.historyUrl}/new`, {
      chatbotName,
      title
    });
  }

  //  Renombrar conversación
  renameConversation(historyId: string, newTitle: string): Observable<any> {
    return this.http.patch(`${this.historyUrl}/${historyId}/rename`, {
      title: newTitle
    });
  }

  //  Eliminar conversación
  deleteConversation(historyId: string): Observable<any> {
    return this.http.delete(`${this.historyUrl}/${historyId}`);
  }

  //  Control interno de historyId actual
  setHistoryId(id: string): void {
    this.currentHistoryId = id;
  }

  getHistoryId(): string | null {
    return this.currentHistoryId;
  }
}
