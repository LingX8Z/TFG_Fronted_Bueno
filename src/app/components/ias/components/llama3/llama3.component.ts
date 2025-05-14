import { Component, OnInit } from '@angular/core';
import { Llama3Service } from './services/llama3.service';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-llama3',
  standalone: false,
  templateUrl: './llama3.component.html',
  styleUrls: ['./llama3.component.css']
})
export class Llama3Component implements OnInit {
  prompt: string = '';
  loading: boolean = false;
  historyIds: string[] = ['']; // Se alinea con `conversations` y `conversationTitles`


  conversations: Message[][] = [[]];
  conversationTitles: string[] = ['Conversación 1'];
  selectedConversationIndex: number = 0;
  

  constructor(private llama3Service: Llama3Service) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.llama3Service.getHistory().subscribe({
      next: (messages) => {
        const parsed: Message[] = messages.map(msg => ({
          sender: msg.isUserMessage ? 'user' : 'bot',
          text: msg.message
        }));

        // Rellenamos la primera conversación
        this.conversations[0] = parsed;
      },
      error: () => {
        console.error('❌ Error al cargar el historial de llama3');
      }
    });
  }
sendPrompt(): void {
  if (!this.prompt.trim()) return;

  const userText = this.prompt;
  const userMessage: Message = { sender: 'user', text: userText };
  this.conversations[this.selectedConversationIndex].push(userMessage);
  this.prompt = '';
  this.loading = true;

  const historyId = this.llama3Service.getHistoryId();
  if (!historyId) {
    console.error('❌ No hay historyId asignado');
    return;
  }

  this.llama3Service.saveMessage(historyId, 'user', userText).subscribe();

  this.llama3Service.sendPrompt(userText).subscribe({
    next: (res) => {
      const botText = res.response;
      const botMessage: Message = { sender: 'bot', text: botText };
      this.conversations[this.selectedConversationIndex].push(botMessage);

      this.llama3Service.saveMessage(historyId, 'bot', botText).subscribe({
        complete: () => (this.loading = false),
        error: () => {
          console.error('❌ Error al guardar la respuesta del bot');
          this.loading = false;
        }
      });
    },
    error: () => {
      const errorMessage: Message = {
        sender: 'bot',
        text: '❌ Error al comunicarse con el servidor.'
      };
      this.conversations[this.selectedConversationIndex].push(errorMessage);
      this.loading = false;
    }
  });
}

  formatMessage(text: string): string {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\* \*\*(.+?)\*\*/g, '<br><strong>• $1</strong>')
      .replace(/\* (.+)/g, '• $1');
  }

  startNewConversation(): void {
  this.llama3Service.createConversation().subscribe({
    next: (res) => {
      this.llama3Service.setHistoryId(res._id);
      const index = this.conversations.length + 1;
      this.conversationTitles.push(`Conversación ${index}`);
      this.conversations.push([]);
      this.selectedConversationIndex = this.conversations.length - 1;
    },
    error: () => {
      console.error('❌ Error al crear la nueva conversación');
    }
  });
}


  selectConversation(index: number): void {
    this.selectedConversationIndex = index;
  }
}
