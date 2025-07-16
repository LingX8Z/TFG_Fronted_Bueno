import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private apiUrl = 'https://tfgbackend-production-35c6.up.railway.app/generate'; // Ajusta si tu backend tiene otra URL o puerto
  private saveHistoryUrl = 'https://tfgbackend-production-35c6.up.railway.app/chat-history/save'; // URL para guardar el historial

  constructor(private http: HttpClient) {}

  // Envía un mensaje al backend y recibe la respuesta generada por la IA
sendPromptWithHistory(prompt: string): Observable<{ response: string }> {
  return this.http.post<{ response: string }>(this.apiUrl, { prompt });
}

// Añade un mensaje (de usuario o bot) a una conversación existente en el historial
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

// Guarda un mensaje en el historial general, asociado al chatbot correspondiente
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

// Obtiene el historial de conversaciones para un chatbot específico
getConversationHistory(chatbotName: string): Observable<any[]> {
  return this.http.get<any[]>(
    `http://localhost:3000/chat-history/${chatbotName}`
  );
}

// Crea una nueva conversación con un título y nombre de chatbot
createConversation(chatbotName: string, title: string): Observable<any> {
  return this.http.post('http://localhost:3000/chat-history/new', {
    chatbotName,
    title,
  });
}

// Cambia el título de una conversación existente
renameConversation(historyId: string, newTitle: string): Observable<any> {
  return this.http.patch(`http://localhost:3000/chat-history/${historyId}/rename`, {
    title: newTitle,
  });
}

// Elimina una conversación del historial por su ID
deleteConversation(historyId: string): Observable<any> {
  return this.http.delete(`http://localhost:3000/chat-history/${historyId}`);
}


}
