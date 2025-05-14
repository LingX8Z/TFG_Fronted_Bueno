import { Component } from '@angular/core';
import { GeminiService } from './services/gemini.service';

@Component({
  selector: 'app-gemini',
  standalone: false,
  templateUrl: './gemini.component.html',
  styleUrls: ['./gemini.component.css']
})
export class GeminiComponent {
  prompt: string = '';
  isLoading = false;

  // Múltiples conversaciones
  conversations: { from: 'user' | 'bot', text: string }[][] = [[]];
  conversationTitles: string[] = ['Conversación 1'];
  selectedConversationIndex = 0;

  constructor(private chatService: GeminiService) {}

  sendMessage() {
    const userMsg = this.prompt.trim();
    if (!userMsg) return;

    const chatbotName = 'geminis';

    // Agregar mensaje del usuario
    this.conversations[this.selectedConversationIndex].push({ from: 'user', text: userMsg });
    this.prompt = '';
    this.isLoading = true;

    // Enviar al backend y procesar respuesta
    this.chatService.sendPromptWithHistory(userMsg).subscribe({
      next: (res) => {
        const botResponse = res.response;
        this.conversations[this.selectedConversationIndex].push({ from: 'bot', text: botResponse });

        // Guardar respuesta
        this.chatService.saveMessage(botResponse, false, chatbotName).subscribe({
          next: () => (this.isLoading = false),
          error: () => {
            console.error('Error al guardar respuesta');
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.conversations[this.selectedConversationIndex].push({
          from: 'bot',
          text: '❌ Error al comunicarse con el asistente.'
        });
        this.isLoading = false;
      }
    });
  }

  // 🆕 Crear nueva conversación
  startNewConversation() {
    const index = this.conversations.length + 1;
    this.conversations.push([]);
    this.conversationTitles.push(`Conversación ${index}`);
    this.selectedConversationIndex = this.conversations.length - 1;
  }

  // 🔁 Seleccionar conversación
  selectConversation(index: number) {
    this.selectedConversationIndex = index;
  }

  
}
