import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class RagService {
  private readonly chatbot = 'rag';
  private readonly apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // Obtiene el historial de conversaciones para el chatbot RAG
  getConversationHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/chat-history/${this.chatbot}`);
  }

  // Crea una nueva conversación con el nombre del chatbot y un título
  createConversation(chatbotName: string, title: string): Observable<any> {
    return this.http.post('http://localhost:3000/chat-history/new', {
      chatbotName,
      title,
    });
  }

  // Cambia el título de una conversación existente por su ID
  renameConversation(historyId: string, newTitle: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/chat-history/${historyId}/rename`, {
      title: newTitle,
    });
  }

  // Elimina una conversación del historial por su ID
  deleteConversation(historyId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/chat-history/${historyId}`);
  }

  // Envía un prompt con historial para procesamiento por parte del modelo RAG
  sendPromptWithHistory(prompt: string): Observable<{ response: string }> {
    return this.http.post<{ response: string }>(`${this.apiUrl}/chat/rag/ask`, { prompt });
  }

  // Añade un mensaje (de usuario o bot) a una conversación específica en el historial
  addMessage(historyId: string, sender: 'user' | 'bot', text: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat-history/add-message`, {
      historyId,
      sender,
      text,
    });
  }

  // Envía un prompt que será respondido en base a todos los PDFs subidos por el usuario
  sendPromptToAllPdfs(prompt: string): Observable<{ response: string }> {
    return this.http.post<{ response: string }>(
      `${this.apiUrl}/rag/ask`,
      { prompt }
    );
  }

  // Sube un archivo PDF al backend para ser utilizado en el sistema RAG
  uploadPdf(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('pdfs', file); // El nombre debe coincidir con el manejador FilesInterceptor('pdfs', ...)

    return this.http.post(`${this.apiUrl}/rag/upload-and-ask`, formData);
  }


}
