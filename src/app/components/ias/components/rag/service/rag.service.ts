import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RagService {
  private readonly chatbot = 'rag';

  constructor(private http: HttpClient) {}

  // Obtener historial de conversaciones del chatbot RAG
  getConversationHistory(chatbot: string = this.chatbot): Observable<any[]> {
    return this.http.get<any[]>(`/api/chat/${chatbot}/history`);
  }

  // Crear una nueva conversación
  createConversation(chatbot: string = this.chatbot, title: string): Observable<any> {
    return this.http.post(`/api/chat/${chatbot}/history`, { title });
  }

  // Renombrar una conversación
  renameConversation(historyId: string, newTitle: string): Observable<any> {
    return this.http.patch(`/api/chat/history/${historyId}`, { title: newTitle });
  }

  // Eliminar una conversación
  deleteConversation(historyId: string): Observable<any> {
    return this.http.delete(`/api/chat/history/${historyId}`);
  }

  // Enviar prompt y recibir respuesta desde RAG
  sendPromptWithHistory(prompt: string): Observable<{ response: string }> {
    return this.http.post<{ response: string }>(`/api/chat/${this.chatbot}/ask`, { prompt });
  }

  // Agregar un mensaje a la conversación
  addMessage(historyId: string, sender: 'user' | 'bot', text: string): Observable<any> {
    return this.http.post(`/api/chat/history/${historyId}/message`, {
      sender,
      text,
    });
  }
}
