import { Component } from '@angular/core';
import { GeminiService } from './services/gemini.service';

@Component({
  selector: 'app-gemini',
  standalone: false,
  templateUrl: './gemini.component.html',
  styleUrls: ['./gemini.component.css'],
})
export class GeminiComponent {
  prompt: string = '';
  isLoading = false;

  // Múltiples conversaciones
  conversations: { from: 'user' | 'bot'; text: string }[][] = [[]];
  conversationTitles: string[] = ['Conversación 1'];
  conversationHistoryIds: string[] = [];
  selectedConversationIndex = 0;

  constructor(private chatService: GeminiService) {}

  ngOnInit() {
    this.loadConversations();
  }

  loadConversations() {
  const chatbotName = 'geminis';

  this.chatService.getConversationHistory(chatbotName).subscribe({
    next: (conversations) => {
      this.conversationTitles = conversations.map((c) => c.title);
      this.conversations = conversations.map((c) =>
        c.messages.map((m: any) => ({
          from: m.sender === 'user' ? 'user' : 'bot',
          text: m.text,
        }))
      );
      this.conversationHistoryIds = conversations.map((c) => c._id);
      this.selectedConversationIndex = 0; // Selecciona la primera por defecto
    },
    error: (err) => {
      console.error('Error cargando conversaciones:', err);
    },
  });
}


 sendMessage() {
  const userMsg = this.prompt.trim();
  if (!userMsg) return;

  const chatbotName = 'geminis';
  const historyId = this.conversationHistoryIds[this.selectedConversationIndex];

  // Agregar mensaje del usuario en la UI
  this.conversations[this.selectedConversationIndex].push({
    from: 'user',
    text: userMsg,
  });
  this.prompt = '';
  this.isLoading = true;

  // Enviar prompt a la IA
  this.chatService.sendPromptWithHistory(userMsg).subscribe({
    next: (res) => {
      const botResponse = res.response;
      this.conversations[this.selectedConversationIndex].push({
        from: 'bot',
        text: botResponse,
      });

      // Guardar mensajes en el historial correcto
      this.chatService.addMessage(historyId, 'user', userMsg).subscribe();
      this.chatService.addMessage(historyId, 'bot', botResponse).subscribe({
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
        text: '❌ Error al comunicarse con el asistente.',
      });
      this.isLoading = false;
    },
  });
}


  // 🆕 Crear nueva conversación
  startNewConversation() {
  const chatbotName = 'geminis';
  const index = this.conversations.length + 1;
  const title = `Conversación ${index}`;

  this.chatService.createConversation(chatbotName, title).subscribe({
    next: (newConv) => {
      this.conversations.push([]);
      this.conversationTitles.push(title);
      this.conversationHistoryIds.push(newConv._id);
      this.selectedConversationIndex = this.conversations.length - 1;
    },
    error: (err) => {
      console.error('Error al crear nueva conversación:', err);
    }
  });
}


  // 🔁 Seleccionar conversación
  selectConversation(index: number) {
    this.selectedConversationIndex = index;
  }
}
