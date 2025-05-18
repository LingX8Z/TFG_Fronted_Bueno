import { Component, HostListener, ElementRef, OnInit } from '@angular/core';
import { GeminiService } from './services/gemini.service';
import { marked } from 'marked';
// Asegúrate de que el módulo que declara GeminiComponent (o GeminiComponent si fuera standalone)
// importa FormsModule y CommonModule.

@Component({
  selector: 'app-gemini',
  standalone: false,
  templateUrl: './gemini.component.html',
  styleUrls: ['./gemini.component.css'],
})
export class GeminiComponent implements OnInit {
  prompt: string = '';
  isLoading = false;

  conversations: {
    from: 'user' | 'bot';
    text: string;
    timestamp?: string;
  }[][] = [[]];
  conversationTitles: string[] = [];
  conversationHistoryIds: string[] = [];
  selectedConversationIndex = 0;

  menuOpenIndex: number | null = null;

  // --- Propiedades para Modales Integrados ---
  // Rename Modal
  showRenameModal = false;
  renameModalIndex: number | null = null;
  currentTitleForRename: string = ''; // Para mostrar el título actual en el placeholder o texto
  newTitleForRename: string = ''; // Vinculado al input del modal

  // Delete Modal
  showDeleteModal = false;
  deleteModalIndex: number | null = null;
  titleForDelete: string = ''; // Para mostrar en el mensaje de confirmación

  constructor(
    private chatService: GeminiService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.loadConversations();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Lógica para cerrar el menú de tres puntos si se hace clic fuera
    if (this.menuOpenIndex !== null) {
      const target = event.target as HTMLElement;
      const menuButton = this.elementRef.nativeElement.querySelector(
        `.conversation-item-wrapper:nth-child(${
          this.menuOpenIndex + 1
        }) .options-button`
      );
      const menuDropdown = this.elementRef.nativeElement.querySelector(
        `.conversation-item-wrapper:nth-child(${
          this.menuOpenIndex + 1
        }) .conversation-menu`
      );

      let clickedInsideMenuComponent = false;
      if (menuButton && menuButton.contains(target)) {
        clickedInsideMenuComponent = true;
      }
      if (menuDropdown && menuDropdown.contains(target)) {
        clickedInsideMenuComponent = true;
      }

      if (!clickedInsideMenuComponent) {
        this.closeMenu();
      }
    }

    // Lógica para cerrar modales si se hace clic en el overlay (opcional, si no se maneja en el HTML)
    // Por ahora, el HTML maneja el cierre al hacer clic en el overlay.
  }

  loadConversations() {
    const chatbotName = 'geminis';
    this.chatService.getConversationHistory(chatbotName).subscribe({
      next: (conversations) => {
        if (conversations && conversations.length > 0) {
          this.conversationTitles = conversations.map((c) => c.title);
          this.conversations = conversations.map((c) => {
            const orderedMessages = c.messages;
            console.log('Mensajes en el orden recibido desde el backend:');
            console.log(c.messages.map((m: any) => m.sender + ': ' + m.text));

            return orderedMessages.map((m: any) => ({
              from: m.sender,
              text:
                m.sender === 'bot' && m.text
                  ? (marked.parse(m.text) as string)
                  : m.text,
              timestamp: m.timestamp,
            }));
          });

          this.conversationHistoryIds = conversations.map((c) => c._id);
          this.selectedConversationIndex = 0;
        } else {
          this.startNewConversation(true);
        }
      },
      error: (err) => {
        console.error('Error cargando conversaciones:', err);
        this.startNewConversation(true);
      },
    });
  }

  sendMessage() {
    const userMsg = this.prompt.trim();
    if (!userMsg) return;

    if (
      this.conversationTitles.length === 0 ||
      this.selectedConversationIndex < 0 ||
      !this.conversations[this.selectedConversationIndex]
    ) {
      console.warn(
        'Intentando enviar mensaje sin conversación seleccionada o existente.'
      );
      this.isLoading = false;
      return;
    }
    const historyId =
      this.conversationHistoryIds[this.selectedConversationIndex];
    if (!historyId) {
      console.error(
        'No se encontró historyId para la conversación seleccionada.'
      );
      this.isLoading = false;
      return;
    }

    this.conversations[this.selectedConversationIndex].push({
      from: 'user',
      text: userMsg,
      timestamp: new Date().toISOString(),
    });
    this.prompt = '';
    this.isLoading = true;

    this.chatService.sendPromptWithHistory(userMsg).subscribe({
      next: (res) => {
        const botResponse = res.response;
        const botResponseHtml = marked.parse(botResponse) as string;
        this.conversations[this.selectedConversationIndex].push({
          from: 'bot',
          text: botResponseHtml,
          timestamp: new Date().toISOString(),
        });
        this.chatService.addMessage(historyId, 'user', userMsg).subscribe({
          next: () => {
            this.chatService
              .addMessage(historyId, 'bot', botResponse)
              .subscribe({
                next: () => (this.isLoading = false),
                error: () => {
                  console.error('Error al guardar respuesta del bot');
                  this.isLoading = false;
                },
              });
          },
          error: () => {
            console.error('Error al guardar mensaje del usuario');
            this.isLoading = false;
          },
        });
      },
      error: () => {
        this.conversations[this.selectedConversationIndex].push({
          from: 'bot',
          text: '❌ Error al comunicarse con el asistente.',
          timestamp: new Date().toISOString(),
        });
        this.isLoading = false;
      },
    });
  }

  startNewConversation(isInitialLoad: boolean = false) {
    const chatbotName = 'geminis';
    let newIndex = 1;
    let potentialTitle = `Conversación ${newIndex}`;
    while (this.conversationTitles.includes(potentialTitle)) {
      newIndex++;
      potentialTitle = `Conversación ${newIndex}`;
    }
    const title = potentialTitle;

    this.chatService.createConversation(chatbotName, title).subscribe({
      next: (newConv) => {
        this.conversations.push([]);
        this.conversationTitles.push(title);
        this.conversationHistoryIds.push(newConv._id);
        this.selectedConversationIndex = this.conversationTitles.length - 1;
        if (
          !isInitialLoad &&
          this.conversations[this.selectedConversationIndex].length === 0
        ) {
          // Opcional: Añadir mensaje de bienvenida
        }
      },
      error: (err) => console.error('Error al crear nueva conversación:', err),
    });
  }

  selectConversation(index: number) {
    if (index >= 0 && index < this.conversationTitles.length) {
      this.selectedConversationIndex = index;
      this.closeMenu();
    } else {
      console.warn('Índice de conversación inválido:', index);
    }
  }

  // --- Métodos para el menú de tres puntos ---
  toggleMenu(index: number, event: MouseEvent) {
    event.stopPropagation();
    this.menuOpenIndex = this.menuOpenIndex === index ? null : index;
  }

  closeMenu() {
    this.menuOpenIndex = null;
  }

  // --- Lógica para RENAME MODAL ---
  openRenameConversationModal(index: number, currentTitle: string) {
    this.renameModalIndex = index;
    this.currentTitleForRename = currentTitle;
    this.newTitleForRename = currentTitle; // Pre-rellena el input con el título actual
    this.showRenameModal = true;
    this.closeMenu(); // Cierra el menú de tres puntos
  }

  confirmRenameConversation() {
    if (
      this.renameModalIndex !== null &&
      this.newTitleForRename &&
      this.newTitleForRename.trim() !== '' &&
      this.newTitleForRename.trim() !== this.currentTitleForRename
    ) {
      const historyId = this.conversationHistoryIds[this.renameModalIndex];
      const titleToSet = this.newTitleForRename.trim();
      this.chatService.renameConversation(historyId, titleToSet).subscribe({
        next: () => {
          if (this.renameModalIndex !== null) {
            // Chequeo de nulidad por si acaso
            this.conversationTitles[this.renameModalIndex] = titleToSet;
          }
          this.cancelRenameConversation(); // Cierra y resetea
        },
        error: (err) => {
          console.error('Error al renombrar conversación:', err);
          // Aquí podrías mostrar un mensaje de error en el modal o como un toast
          this.cancelRenameConversation(); // Cierra igualmente en caso de error
        },
      });
    } else if (this.newTitleForRename.trim() === this.currentTitleForRename) {
      this.cancelRenameConversation(); // No hay cambios, solo cierra
    } else {
      // Título inválido (vacío), podrías mostrar un error en el modal
      console.warn('El nuevo título no puede estar vacío.');
    }
  }

  cancelRenameConversation() {
    this.showRenameModal = false;
    this.renameModalIndex = null;
    this.newTitleForRename = '';
    this.currentTitleForRename = '';
  }

  // --- Lógica para DELETE MODAL ---
  openDeleteConversationModal(index: number, title: string) {
    this.deleteModalIndex = index;
    this.titleForDelete = title;
    this.showDeleteModal = true;
    this.closeMenu(); // Cierra el menú de tres puntos
  }

  confirmDeleteConversation() {
    if (this.deleteModalIndex !== null) {
      const historyId = this.conversationHistoryIds[this.deleteModalIndex];
      const indexToDelete = this.deleteModalIndex;

      this.chatService.deleteConversation(historyId).subscribe({
        next: () => {
          this.conversations.splice(indexToDelete, 1);
          this.conversationTitles.splice(indexToDelete, 1);
          this.conversationHistoryIds.splice(indexToDelete, 1);

          if (this.conversationTitles.length === 0) {
            this.startNewConversation();
          } else if (this.selectedConversationIndex === indexToDelete) {
            this.selectedConversationIndex = Math.max(0, indexToDelete - 1);
            if (
              this.conversationTitles.length > 0 &&
              this.selectedConversationIndex >= this.conversationTitles.length
            ) {
              this.selectedConversationIndex =
                this.conversationTitles.length - 1;
            } else if (this.conversationTitles.length === 0) {
              // El startNewConversation se encargará
            }
          } else if (this.selectedConversationIndex > indexToDelete) {
            this.selectedConversationIndex--;
          }
          this.cancelDeleteConversation(); // Cierra y resetea
        },
        error: (err) => {
          console.error('Error al eliminar conversación:', err);
          this.cancelDeleteConversation(); // Cierra igualmente en caso de error
        },
      });
    }
  }

  cancelDeleteConversation() {
    this.showDeleteModal = false;
    this.deleteModalIndex = null;
    this.titleForDelete = '';
  }

  // Para prevenir que el click dentro del modal lo cierre (si el overlay tiene un (click))
  stopPropagationModal(event: MouseEvent) {
    event.stopPropagation();
  }
}
