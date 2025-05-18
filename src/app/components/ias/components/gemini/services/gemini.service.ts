import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private apiUrl = 'http://localhost:3000/chat/generate'; // Ajusta si tu backend tiene otra URL o puerto
  private saveHistoryUrl = 'http://localhost:3000/chat-history/save'; // URL para guardar el historial

  constructor(private http: HttpClient) {}

  // Enviar el mensaje al backend y obtener la respuesta de la IA
  sendPromptWithHistory(prompt: string): Observable<{ response: string }> {
    return this.http.post<{ response: string }>(this.apiUrl, { prompt });
  }

  addMessage(
    historyId: string,
    sender: 'user' | 'bot',
    text: string
  ): Observable<any> {
    return this.http.post('http://localhost:3000/chat-history/add-message', {
      historyId,
      sender,
      text,
    });
  }

  

  // Guardar los mensajes en el historial
  saveMessage(
    message: string,
    isUserMessage: boolean,
    chatbotName: string
  ): Observable<any> {
    return this.http.post(this.saveHistoryUrl, {
      message,
      isUserMessage,
      chatbotName,
    });
  }

  // Cargar historial
  getConversationHistory(chatbotName: string): Observable<any[]> {
    return this.http.get<any[]>(
      `http://localhost:3000/chat-history/${chatbotName}`
    );
  }

  // Crear conversación
  createConversation(chatbotName: string, title: string): Observable<any> {
    return this.http.post('http://localhost:3000/chat-history/new', {
      chatbotName,
      title,
    });
  }

  renameConversation(historyId: string, newTitle: string): Observable<any> {
  return this.http.patch(`http://localhost:3000/chat-history/${historyId}/rename`, {
    title: newTitle,
  });
}

deleteConversation(historyId: string): Observable<any> {
  return this.http.delete(`http://localhost:3000/chat-history/${historyId}`);
}

}
