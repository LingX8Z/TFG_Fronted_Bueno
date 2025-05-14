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
  messages: { from: 'user' | 'bot', text: string }[] = [];
  isLoading = false;

  constructor(private chatService: GeminiService) {}

  sendMessage() {
    if (!this.prompt.trim()) return;

    const userMsg = this.prompt;
    const chatbotName = 'geminis';  // Nombre del chatbot (ajústalo según el chatbot actual)

    // Agrega el mensaje del usuario a la vista
    this.messages.push({ from: 'user', text: userMsg });
    this.prompt = '';
    this.isLoading = true;

    // Enviar el mensaje al backend para obtener la respuesta de la IA y guardar la conversación
    this.chatService.sendPromptWithHistory(userMsg).subscribe({
      next: (res) => {
        this.messages.push({ from: 'bot', text: res.response });

        // Guardar la respuesta de la IA en el historial
        this.chatService.saveMessage(res.response, false, chatbotName).subscribe({
          next: () => {
            this.isLoading = false;
          },
          error: () => {
            console.error('Error al guardar la respuesta de la IA');
            this.isLoading = false;
          },
        });
      },
      error: () => {
        this.messages.push({ from: 'bot', text: '❌ Error al comunicarse con el asistente.' });
        this.isLoading = false;
      }
    });
  }
}
