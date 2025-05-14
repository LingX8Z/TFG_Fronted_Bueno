import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Llama3Service } from './services/llama3.service';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-llama3',
  standalone: false,
  templateUrl: './llama3.component.html',
  styleUrl: './llama3.component.css'
})
export class Llama3Component {
  prompt: string = '';
  chatHistory: Message[] = [];
  loading: boolean = false;

  constructor(private llama3Service: Llama3Service) {}

  sendPrompt() {
    if (!this.prompt.trim()) return;

    this.chatHistory.push({ sender: 'user', text: this.prompt });
    this.loading = true;

    this.llama3Service.sendPrompt(this.prompt).subscribe({
      next: (res) => {
        this.chatHistory.push({ sender: 'bot', text: res.response });
        this.prompt = '';
        this.loading = false;
      },
      error: () => {
        this.chatHistory.push({ sender: 'bot', text: '❌ Error al comunicarse con el servidor.' });
        this.loading = false;
      }
    });
  }
}
