import { Component, HostListener, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { marked } from 'marked';
import { Subscription } from 'rxjs';
import { User } from '../../../../interfaces/user.iterface';
import { AuthService } from '../../../../services/auth.service';
import { RagService } from './service/rag.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rag',
  standalone: false,
  templateUrl: './rag.component.html',
  styleUrls: ['./rag.component.css'],
})
export class RAGComponent implements OnInit, OnDestroy {
  prompt: string = '';
  isLoading = false;
  private userSubscription: Subscription | undefined;

  currentUserRole: 'User' | 'Premium' | 'Administrador' | null = null;
  readonly MAX_CONVERSATIONS_FOR_USER_ROLE = 5;

  conversations: { from: 'user' | 'bot'; text: string; timestamp?: string; }[][] = [[]];
  conversationTitles: string[] = [];
  conversationHistoryIds: string[] = [];
  selectedConversationIndex = -1;

  menuOpenIndex: number | null = null;

  showRenameModal = false;
  renameModalIndex: number | null = null;
  currentTitleForRename: string = '';
  newTitleForRename: string = '';

  showDeleteModal = false;
  deleteModalIndex: number | null = null;
  titleForDelete: string = '';

  constructor(
    private chatService: RagService,
    private elementRef: ElementRef,
    private authService: AuthService,
    private router: Router
  ) { }

   // Método del ciclo de vida que se ejecuta al iniciar el componente. Determina el rol del usuario y carga las conversaciones.
  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe((user: User | null) => {
      const role = user?.roles as 'User' | 'Premium' | 'Administrador' || 'User';
      this.currentUserRole = ['User', 'Premium', 'Administrador'].includes(role) ? role : 'User';
      this.loadConversations();
    });
  }

    // Método del ciclo de vida que se ejecuta al destruir el componente. Libera la suscripción del usuario.
  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

   // Getter que indica si el usuario tiene un rol con privilegios (Premium o Administrador).
  get isPrivilegedUser(): boolean {
    return this.currentUserRole === 'Premium' || this.currentUserRole === 'Administrador';
  }

    // Listener que cierra el menú contextual si se hace clic fuera del menú activo.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.menuOpenIndex !== null) {
      const target = event.target as HTMLElement;
      const menuItemWrapper = this.elementRef.nativeElement.querySelector(
        `.conversation-item-wrapper[data-original-index='${this.menuOpenIndex}']`
      );
      if (menuItemWrapper) {
        const menuButton = menuItemWrapper.querySelector('.options-button');
        const menuDropdown = menuItemWrapper.querySelector('.conversation-menu');
        if (
          !(menuButton && menuButton.contains(target)) &&
          !(menuDropdown && menuDropdown.contains(target))
        ) {
          this.closeMenu();
        }
      } else {
        this.closeMenu();
      }
    }
  }

   // Carga el historial de conversaciones desde el backend. Si no hay ninguna, intenta crear una nueva.
  loadConversations() {
    this.chatService.getConversationHistory().subscribe({
      next: (apiConvs) => {
        if (apiConvs.length > 0) {
          this.conversationTitles = apiConvs.map((c) => c.title);
          this.conversations = apiConvs.map((c) =>
            (c.messages || []).map((m: any) => ({
              from: m.sender,
              text: m.sender === 'bot' ? marked.parse(m.text) as string : m.text,
              timestamp: m.timestamp,
            }))
          );
          this.conversationHistoryIds = apiConvs.map((c) => c._id);
          this.selectedConversationIndex = 0;
        } else {
          if (!(this.currentUserRole === 'User' && this.conversationTitles.length >= this.MAX_CONVERSATIONS_FOR_USER_ROLE)) {
            this.startNewConversation(true);
          }
        }
      },
      error: () => {
        if (!(this.currentUserRole === 'User' && this.conversationTitles.length >= this.MAX_CONVERSATIONS_FOR_USER_ROLE)) {
          this.startNewConversation(true);
        }
      },
    });
  }

    // Envía un mensaje del usuario al asistente RAG y maneja la respuesta, incluyendo el guardado en el historial.
  sendMessage() {
    const userMsg = this.prompt.trim();
    if (!userMsg) return;

    if (
      this.selectedConversationIndex < 0 ||
      this.selectedConversationIndex >= this.conversationTitles.length ||
      !this.conversations[this.selectedConversationIndex]
    ) {
      if (!(this.currentUserRole === 'User' && this.conversationTitles.length >= this.MAX_CONVERSATIONS_FOR_USER_ROLE)) {
        this.startNewConversationAndSend(userMsg);
      } else {
        alert('Límite de conversaciones alcanzado.');
        this.isLoading = false;
      }
      return;
    }

    const historyId = this.conversationHistoryIds[this.selectedConversationIndex];
    this.conversations[this.selectedConversationIndex].push({
      from: 'user',
      text: userMsg,
      timestamp: new Date().toISOString(),
    });
    const currentPrompt = this.prompt;
    this.prompt = '';
    this.isLoading = true;

    this.chatService.sendPromptToAllPdfs(userMsg).subscribe({

      next: (res) => {
        const botResponseHtml = marked.parse(res.response) as string;
        this.conversations[this.selectedConversationIndex].push({
          from: 'bot',
          text: botResponseHtml,
          timestamp: new Date().toISOString(),
        });

        this.chatService.addMessage(historyId, 'user', userMsg).subscribe(() => {
          this.chatService.addMessage(historyId, 'bot', res.response).subscribe({
            next: () => (this.isLoading = false),
            error: () => (this.isLoading = false),
          });
        });
      },
      error: () => {
        const errorMsg = '❌ Error al comunicarse con el asistente.';

        // Agrega el mensaje de error visualmente
        this.conversations[this.selectedConversationIndex].push({
          from: 'bot',
          text: errorMsg,
          timestamp: new Date().toISOString(),
        });

        // Guarda el mensaje del usuario y también el error en el historial
        this.chatService.addMessage(historyId, 'user', userMsg).subscribe();
        this.chatService.addMessage(historyId, 'bot', errorMsg).subscribe({
          complete: () => (this.isLoading = false),
          error: () => (this.isLoading = false),
        });

        this.prompt = currentPrompt;
      }

    });
  }

  // Crea una nueva conversación y envía el primer mensaje proporcionado.
  startNewConversationAndSend(initialMessage: string) {
    if (this.currentUserRole === 'User' && this.conversationTitles.length >= this.MAX_CONVERSATIONS_FOR_USER_ROLE) {
      this.prompt = initialMessage;
      alert("Has alcanzado el límite de conversaciones.");
      return;
    }

    let i = 1;
    let title = `Conversación ${i}`;
    while (this.conversationTitles.includes(title)) {
      title = `Conversación ${++i}`;
    }

    this.chatService.createConversation('rag', title).subscribe({
      next: (newConv) => {
        this.conversations.push([]);
        this.conversationTitles.push(title);
        this.conversationHistoryIds.push(newConv._id);
        this.selectedConversationIndex = this.conversationTitles.length - 1;
        this.prompt = initialMessage;
        this.sendMessage();
      },
      error: () => {
        this.prompt = initialMessage;
        this.isLoading = false;
      },
    });
  }

   // Crea una nueva conversación vacía. Si es la carga inicial, evita mostrar alertas.
  startNewConversation(initialLoad = false) {
    if (this.currentUserRole === 'User' && this.conversationTitles.length >= this.MAX_CONVERSATIONS_FOR_USER_ROLE) {
      if (!initialLoad) alert('Límite de conversaciones alcanzado.');
      return;
    }

    let i = 1;
    let title = `Conversación ${i}`;
    while (this.conversationTitles.includes(title)) {
      title = `Conversación ${++i}`;
    }

    this.chatService.createConversation('rag', title).subscribe({
      next: (newConv) => {
        this.conversations.push([]);
        this.conversationTitles.push(title);
        this.conversationHistoryIds.push(newConv._id);
        this.selectedConversationIndex = this.conversationTitles.length - 1;
      },
      error: (err) => console.error('Error al crear conversación:', err),
    });
  }

  // Selecciona una conversación según su índice.
  selectConversation(index: number) {
    if (index >= 0 && index < this.conversationTitles.length) {
      this.selectedConversationIndex = index;
      this.closeMenu();
    }
  }

  // Alterna la visibilidad del menú contextual para una conversación específica.
  toggleMenu(index: number, event: MouseEvent) {
    event.stopPropagation();
    this.menuOpenIndex = this.menuOpenIndex === index ? null : index;
  }

  // Cierra cualquier menú contextual abierto.
  closeMenu() {
    this.menuOpenIndex = null;
  }

  // Abre el modal de renombrado para una conversación específica.
  openRenameConversationModal(index: number, currentTitle: string) {
    this.renameModalIndex = index;
    this.currentTitleForRename = currentTitle;
    this.newTitleForRename = currentTitle;
    this.showRenameModal = true;
    this.closeMenu();
  }

  // Confirma el cambio de nombre de una conversación y lo actualiza en el backend.
  confirmRenameConversation() {
    if (
      this.renameModalIndex !== null &&
      this.newTitleForRename &&
      this.newTitleForRename.trim() !== this.currentTitleForRename
    ) {
      const title = this.newTitleForRename.trim();
      const historyId = this.conversationHistoryIds[this.renameModalIndex];

      this.chatService.renameConversation(historyId, title).subscribe({
        next: () => {
          this.conversationTitles[this.renameModalIndex!] = title;
          this.cancelRenameConversation();
        },
        error: () => this.cancelRenameConversation(),
      });
    } else {
      this.cancelRenameConversation();
    }
  }

  // Navega a la vista de subida de archivos PDF.
  uploadPDF(){
    this.router.navigate(['upload'])
  }

  // Cancela el proceso de renombrado de conversación y cierra el modal.
  cancelRenameConversation() {
    this.showRenameModal = false;
    this.renameModalIndex = null;
    this.newTitleForRename = '';
    this.currentTitleForRename = '';
  }

  // Abre el modal de confirmación para eliminar una conversación específica.
  openDeleteConversationModal(index: number, title: string) {
    this.deleteModalIndex = index;
    this.titleForDelete = title;
    this.showDeleteModal = true;
    this.closeMenu();
  }

  // Elimina una conversación del historial y actualiza la selección activa.
  confirmDeleteConversation() {
    if (this.deleteModalIndex !== null) {
      const index = this.deleteModalIndex;
      const historyId = this.conversationHistoryIds[index];

      this.chatService.deleteConversation(historyId).subscribe({
        next: () => {
          this.conversations.splice(index, 1);
          this.conversationTitles.splice(index, 1);
          this.conversationHistoryIds.splice(index, 1);

          if (this.conversationTitles.length === 0) {
            this.startNewConversation();
          } else if (this.selectedConversationIndex === index) {
            this.selectedConversationIndex = Math.max(0, index - 1);
          } else if (this.selectedConversationIndex > index) {
            this.selectedConversationIndex--;
          }
          this.cancelDeleteConversation();
        },
        error: () => this.cancelDeleteConversation(),
      });
    }
  }

  // Cancela la eliminación de una conversación y cierra el modal.
  cancelDeleteConversation() {
    this.showDeleteModal = false;
    this.deleteModalIndex = null;
    this.titleForDelete = '';
  }

  // Previene que un clic dentro del modal se propague al documento, evitando cierres accidentales.
  stopPropagationModal(event: MouseEvent) {
    event.stopPropagation();
  }
}
