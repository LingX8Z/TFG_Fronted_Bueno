import { Component, HostListener, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Llama3Service } from './services/llama3.service';
import { AuthService } from '../../../../services/auth.service';
import { Subscription } from 'rxjs';
import { marked } from 'marked';
import { User } from '../../../../interfaces/user.iterface';

@Component({
  selector: 'app-llama3',
  standalone: false,
  templateUrl: './llama3.component.html',
  styleUrls: ['./llama3.component.css']
})
export class Llama3Component implements OnInit, OnDestroy {
  prompt: string = '';
  isLoading = false;

  currentUserRole: 'User' | 'Premium' | 'Administrador' | null = null;
  readonly MAX_CONVERSATIONS_FOR_USER_ROLE = 5;

  conversations: { from: 'user' | 'bot'; text: string; timestamp?: string }[][] = [[]];
  conversationTitles: string[] = [];
  conversationHistoryIds: string[] = [];
  selectedConversationIndex = -1;

  menuOpenIndex: number | null = null;
  showRenameModal = false;
  renameModalIndex: number | null = null;
  currentTitleForRename = '';
  newTitleForRename = '';

  showDeleteModal = false;
  deleteModalIndex: number | null = null;
  titleForDelete = '';

  private userSubscription: Subscription | undefined;

  constructor(
    private llamaService: Llama3Service,
    private authService: AuthService,
    private elementRef: ElementRef
  ) { }

  // Método del ciclo de vida que se ejecuta al iniciar el componente. Determina el rol del usuario y carga las conversaciones.
  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      if (user && user.roles) {
        const role = user.roles as 'User' | 'Premium' | 'Administrador';
        this.currentUserRole = ['User', 'Premium', 'Administrador'].includes(role) ? role : 'User';
      } else {
        this.currentUserRole = 'User';
      }
      this.loadConversations();
    });
  }

  // Método del ciclo de vida que se ejecuta al destruir el componente. Cancela la suscripción al observable del usuario.
  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  // Getter que indica si el usuario tiene un rol con privilegios (Premium o Administrador).
  get isPrivilegedUser(): boolean {
    return this.currentUserRole === 'Premium' || this.currentUserRole === 'Administrador';
  }

  // Listener que detecta clics globales en el documento para cerrar el menú contextual si el clic fue fuera de él.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.menuOpenIndex !== null) {
      const target = event.target as HTMLElement;
      const wrapper = this.elementRef.nativeElement.querySelector(
        `.conversation-item-wrapper[data-original-index="${this.menuOpenIndex}"]`
      );
      const button = wrapper?.querySelector('.options-button');
      const menu = wrapper?.querySelector('.conversation-menu');

      if (!button?.contains(target) && !menu?.contains(target)) {
        this.closeMenu();
      }
    }
  }

  // Carga el historial de conversaciones del modelo Llama3 desde el backend.
  loadConversations(): void {
    const chatbotName = 'llama3';
    this.llamaService.getConversationHistory(chatbotName).subscribe({
      next: (data) => {
        console.log('📥 Conversaciones cargadas desde el backend:', data);
        this.conversationTitles = data.map((c) => c.title);
        this.conversations = data.map((c) =>
          c.messages.map((m: any) => ({
            from: m.sender,
            text: m.sender === 'bot' ? marked.parse(m.text) : m.text,
            timestamp: m.timestamp,
          }))
        );
        this.conversationHistoryIds = data.map((c) => c._id);
        this.selectedConversationIndex = this.conversationTitles.length > 0 ? 0 : -1;

        if (this.conversationTitles.length === 0) {
          this.startNewConversation(true);
        }
      },
      error: () => {
        console.error('❌ Error al cargar conversaciones de Llama3');
      }
    });
  }

  // Envía el mensaje del usuario y procesa la respuesta del bot. También guarda ambos mensajes en el historial.
  sendMessage(): void {
    const msg = this.prompt.trim();
    if (!msg) return;

    if (this.selectedConversationIndex < 0 || !this.conversationHistoryIds[this.selectedConversationIndex]) {
      if (this.currentUserRole === 'User' && this.conversationTitles.length >= this.MAX_CONVERSATIONS_FOR_USER_ROLE) {
        alert('Has alcanzado el límite de conversaciones.');
        return;
      }
      this.startNewConversationAndSend(msg);
      return;
    }

    const historyId = this.conversationHistoryIds[this.selectedConversationIndex];
    this.conversations[this.selectedConversationIndex].push({
      from: 'user',
      text: msg,
      timestamp: new Date().toISOString()
    });
    this.prompt = '';
    this.isLoading = true;

    this.llamaService.sendPrompt(msg).subscribe({
      next: (res) => {
        const botResp = marked.parse(res.response) as string;
        this.conversations[this.selectedConversationIndex].push({
          from: 'bot',
          text: botResp,
          timestamp: new Date().toISOString()
        });
        this.llamaService.saveMessage(historyId, 'user', msg).subscribe();
        this.llamaService.saveMessage(historyId, 'bot', res.response).subscribe({
          complete: () => (this.isLoading = false),
          error: () => (this.isLoading = false)
        });
      },
      error: () => {
        this.conversations[this.selectedConversationIndex].push({
          from: 'bot',
          text: '❌ Error al comunicarse con el servidor.',
          timestamp: new Date().toISOString()
        });
        this.isLoading = false;
      }
    });
  }

  // Inicia una nueva conversación y envía el mensaje inicial proporcionado.
  startNewConversationAndSend(initialMessage: string): void {
    this.startNewConversation(false, initialMessage);
  }

  // Crea una nueva conversación vacía. Puede recibir un mensaje inicial para enviar automáticamente.
  startNewConversation(isInitialLoad: boolean = false, firstMsg?: string): void {
    if (this.currentUserRole === 'User' && this.conversationTitles.length >= this.MAX_CONVERSATIONS_FOR_USER_ROLE) {
      if (!isInitialLoad) alert('Límite de conversaciones alcanzado.');
      return;
    }

    const index = this.conversationTitles.length + 1;
    const title = `Conversación ${index}`;

    this.llamaService.createConversation('llama3', title).subscribe({
      next: (conv) => {
        this.conversationTitles.push(title);
        this.conversations.push([]);
        this.conversationHistoryIds.push(conv._id);
        this.selectedConversationIndex = this.conversationTitles.length - 1;

        if (firstMsg) {
          this.prompt = firstMsg;
          this.sendMessage();
        }
      },
      error: () => console.error('❌ Error al crear nueva conversación')
    });
  }

  // Selecciona una conversación del historial según el índice recibido.
  selectConversation(index: number): void {
    this.selectedConversationIndex = index;
    this.closeMenu();
  }

  // Alterna la visibilidad del menú contextual de una conversación específica.
  toggleMenu(index: number, event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpenIndex = this.menuOpenIndex === index ? null : index;
  }

  // Cierra cualquier menú contextual abierto.
  closeMenu(): void {
    this.menuOpenIndex = null;
  }

  // Abre el modal para cambiar el nombre de una conversación.
  openRenameConversationModal(index: number, currentTitle: string): void {
    this.renameModalIndex = index;
    this.currentTitleForRename = currentTitle;
    this.newTitleForRename = currentTitle;
    this.showRenameModal = true;
    this.closeMenu();
  }

  // Confirma y aplica el nuevo nombre de la conversación seleccionada.
  confirmRenameConversation(): void {
    if (
      this.renameModalIndex !== null &&
      this.newTitleForRename.trim() &&
      this.newTitleForRename.trim() !== this.currentTitleForRename
    ) {
      const historyId = this.conversationHistoryIds[this.renameModalIndex];
      this.llamaService.renameConversation(historyId, this.newTitleForRename.trim()).subscribe({
        next: () => {
          this.conversationTitles[this.renameModalIndex!] = this.newTitleForRename.trim();
          this.cancelRenameConversation();
        },
        error: () => {
          console.error('❌ Error al renombrar conversación');
          this.cancelRenameConversation();
        }
      });
    } else {
      this.cancelRenameConversation();
    }
  }

  // Cancela el proceso de renombrar la conversación y cierra el modal.
  cancelRenameConversation(): void {
    this.showRenameModal = false;
    this.renameModalIndex = null;
    this.newTitleForRename = '';
    this.currentTitleForRename = '';
  }

  // Abre el modal de confirmación para eliminar una conversación específica.
  openDeleteConversationModal(index: number, title: string): void {
    this.deleteModalIndex = index;
    this.titleForDelete = title;
    this.showDeleteModal = true;
    this.closeMenu();
  }

  // Elimina la conversación seleccionada del historial y actualiza la selección activa.
  confirmDeleteConversation(): void {
    if (this.deleteModalIndex !== null) {
      const historyId = this.conversationHistoryIds[this.deleteModalIndex];
      this.llamaService.deleteConversation(historyId).subscribe({
        next: () => {
          this.conversationTitles.splice(this.deleteModalIndex!, 1);
          this.conversations.splice(this.deleteModalIndex!, 1);
          this.conversationHistoryIds.splice(this.deleteModalIndex!, 1);

          if (this.conversationTitles.length === 0) {
            this.selectedConversationIndex = -1;
            if (this.currentUserRole !== 'User') this.startNewConversation(true);
          } else {
            this.selectedConversationIndex = Math.max(0, this.selectedConversationIndex - 1);
          }

          this.cancelDeleteConversation();
        },
        error: () => {
          console.error('❌ Error al eliminar conversación');
          this.cancelDeleteConversation();
        }
      });
    }
  }

  // Cancela la operación de eliminación de la conversación y cierra el modal.
  cancelDeleteConversation(): void {
    this.showDeleteModal = false;
    this.deleteModalIndex = null;
    this.titleForDelete = '';
  }

  // Da formato al texto del mensaje usando HTML básico para listas y saltos de línea.
  formatMessage(text: string): string {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\* \*\*(.+?)\*\*/g, '<br><strong>• $1</strong>')
      .replace(/\* (.+)/g, '• $1');
  }

  // Previene que el clic dentro del modal propague eventos al documento (evita que se cierre por error).
  stopPropagationModal(event: MouseEvent): void {
    event.stopPropagation();
  }
}
