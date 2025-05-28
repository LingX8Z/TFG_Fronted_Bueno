import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class RagService {
  private readonly chatbot = 'rag';
  private readonly apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getConversationHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/chat-history/${this.chatbot}`);
  }

  // Crear conversación
  createConversation(chatbotName: string, title: string): Observable<any> {
    return this.http.post('http://localhost:3000/chat-history/new', {
      chatbotName,
      title,
    });
  }

  renameConversation(historyId: string, newTitle: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/chat-history/${historyId}/rename`, {
      title: newTitle,
    });
  }

  deleteConversation(historyId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/chat-history/${historyId}`);
  }

  sendPromptWithHistory(prompt: string): Observable<{ response: string }> {
    return this.http.post<{ response: string }>(`${this.apiUrl}/chat/rag/ask`, { prompt });
  }

  addMessage(historyId: string, sender: 'user' | 'bot', text: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat-history/add-message`, {
      historyId,
      sender,
      text,
    });
  }

  sendPromptToAllPdfs(prompt: string): Observable<{ response: string }> {
  return this.http.post<{ response: string }>(
    `${this.apiUrl}/rag/ask`,
    { prompt }
  );
}

}
