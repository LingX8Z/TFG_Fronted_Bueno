import { Component, HostListener, ElementRef, OnInit, OnDestroy } from '@angular/core'; // Added OnDestroy
import { GeminiService } from './services/gemini.service';
import { marked } from 'marked';
import { Observable, Subscription } from 'rxjs'; // Added Subscription
import { User } from '../../../../interfaces/user.iterface'; // Your User interface
import { AuthService } from '../../../../services/auth.service';

// Asegúrate de que el módulo que declara GeminiComponent (o GeminiComponent si fuera standalone)
// importa FormsModule y CommonModule.

@Component({
  selector: 'app-gemini',
  standalone: false,
  templateUrl: './gemini.component.html',
  styleUrls: ['./gemini.component.css'],
})
export class GeminiComponent implements OnInit, OnDestroy { // Implements OnDestroy
  prompt: string = '';
  isLoading = false;

  // user$: Observable<User | null>; // Changed from user to user$ to indicate it's an observable
  private userSubscription: Subscription | undefined; // For managing subscription

  // --- Role-based properties ---
  currentUserRole: 'User' | 'Premium' | 'Administrador' | null = null;
  readonly MAX_CONVERSATIONS_FOR_USER_ROLE = 5;

  conversations: {
    from: 'user' | 'bot';
    text: string;
    timestamp?: string;
  }[][] = [[]];
  conversationTitles: string[] = [];
  conversationHistoryIds: string[] = [];
  selectedConversationIndex = -1; // Initialize to -1 for no selection initially

  menuOpenIndex: number | null = null;

  // --- Propiedades para Modales Integrados ---
  showRenameModal = false;
  renameModalIndex: number | null = null;
  currentTitleForRename: string = '';
  newTitleForRename: string = '';

  showDeleteModal = false;
  deleteModalIndex: number | null = null;
  titleForDelete: string = '';

  constructor(
    private chatService: GeminiService,
    private elementRef: ElementRef,
    private authService: AuthService
  ) {
    // this.user$ = this.authService.currentUser$; // Assign observable
  }

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(
      (user: User | null) => {
        if (user && user.roles) {
          // Ensure the role from user.rol matches one of the expected types
          const role = user.roles as 'User' | 'Premium' | 'Administrador';
          if (['User', 'Premium', 'Administrador'].includes(role)) {
            this.currentUserRole = role;
          } else {
            console.warn(`Rol desconocido recibido: ${user.roles}. Asignando 'User' por defecto.`);
            this.currentUserRole = 'User'; // Default or error handling
          }
        } else {
          this.currentUserRole = 'User'; // Default if no user or no role (or handle as unauthenticated)
          console.log('No user logged in or role not defined, defaulting to User role.');
        }
        console.log('Current User Role:', this.currentUserRole);
        // Load conversations after role is determined (or at least initiated)
        this.loadConversations();
      }
    );
  }

  ngOnDestroy() { // Clean up subscription
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // Getter para saber si el usuario tiene un rol "elevado"
  get isPrivilegedUser(): boolean {
    return this.currentUserRole === 'Premium' || this.currentUserRole === 'Administrador';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.menuOpenIndex !== null) {
      const target = event.target as HTMLElement;
      // Query for the specific menu and button that is open
      // This assumes menuOpenIndex corresponds to an item that is currently rendered.
      const menuItemWrapper = this.elementRef.nativeElement.querySelector(
        `.conversation-item-wrapper[data-original-index='${this.menuOpenIndex}']`
      );

      if (menuItemWrapper) {
        const menuButton = menuItemWrapper.querySelector('.options-button');
        const menuDropdown = menuItemWrapper.querySelector('.conversation-menu');

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
      } else {
        // Fallback or if the element isn't found (e.g., list changed rapidly)
        this.closeMenu();
      }
    }
  }

  loadConversations() {
    // Ensure role is known before loading, or handle default behavior
    if (this.currentUserRole === null) {
        // console.warn('Role not yet determined. Delaying conversation load or using default.');
        // Optionally, you could wait or queue this call, but for now,
        // it will proceed, and the template will adapt once the role is set.
    }

    const chatbotName = 'geminis'; // Consider making this configurable or user-specific
    this.chatService.getConversationHistory(chatbotName).subscribe({
      next: (apiConversations) => { // Renamed to avoid conflict
        if (apiConversations && apiConversations.length > 0) {
          this.conversationTitles = apiConversations.map((c) => c.title);
          this.conversations = apiConversations.map((c) => {
            const orderedMessages = c.messages || []; // Ensure messages is an array
            // console.log('Mensajes en el orden recibido desde el backend:');
            // console.log(orderedMessages.map((m: any) => m.sender + ': ' + m.text));
            return orderedMessages.map((m: any) => ({
              from: m.sender,
              text:
                m.sender === 'bot' && m.text
                  ? (marked.parse(m.text) as string)
                  : m.text,
              timestamp: m.timestamp,
            }));
          });
          this.conversationHistoryIds = apiConversations.map((c) => c._id);
          this.selectedConversationIndex = 0; // Select the first one
        } else {
          // No existing conversations, try to start a new one if allowed
          if (!(this.currentUserRole === 'User' && this.conversationTitles.length >= this.MAX_CONVERSATIONS_FOR_USER_ROLE)) {
             this.startNewConversation(true);
          } else {
            this.conversations = [[]];
            this.conversationTitles = [];
            this.conversationHistoryIds = [];
            this.selectedConversationIndex = -1; // No conversation to select
          }
        }
      },
      error: (err) => {
        console.error('Error cargando conversaciones:', err);
        // Attempt to start new if error and allowed
         if (!(this.currentUserRole === 'User' && this.conversationTitles.length >= this.MAX_CONVERSATIONS_FOR_USER_ROLE)) {
            this.startNewConversation(true);
         } else {
            this.conversations = [[]];
            this.conversationTitles = [];
            this.conversationHistoryIds = [];
            this.selectedConversationIndex = -1;
         }
      },
    });
  }

  sendMessage() {
    const userMsg = this.prompt.trim();
    if (!userMsg) return;

    // Check if a conversation is selected and valid
    if (
      this.selectedConversationIndex < 0 ||
      this.selectedConversationIndex >= this.conversationTitles.length ||
      !this.conversations[this.selectedConversationIndex]
    ) {
      // If no valid conversation is selected, try to start a new one and send the message
      // This is useful if the user types a message when no chat is active
      if (!(this.currentUserRole === 'User' && this.conversationTitles.length >= this.MAX_CONVERSATIONS_FOR_USER_ROLE)) {
        this.startNewConversationAndSend(userMsg);
      } else {
        console.warn('Límite de conversaciones alcanzado para el rol User o no hay conversación seleccionada.');
        alert('Por favor, selecciona una conversación o crea una nueva si tu plan lo permite.');
        this.isLoading = false;
      }
      return;
    }

    const historyId = this.conversationHistoryIds[this.selectedConversationIndex];
    if (!historyId) {
      console.error('No se encontró historyId para la conversación seleccionada.');
      this.isLoading = false;
      return;
    }

    this.conversations[this.selectedConversationIndex].push({
      from: 'user',
      text: userMsg,
      timestamp: new Date().toISOString(),
    });
    const currentPrompt = this.prompt;
    this.prompt = '';
    this.isLoading = true;

    this.chatService.sendPromptWithHistory(userMsg).subscribe({
      next: (res) => {
        const botResponse = res.response;
        const botResponseHtml = marked.parse(botResponse) as string;
        if (this.conversations[this.selectedConversationIndex]) {
            this.conversations[this.selectedConversationIndex].push({
              from: 'bot',
              text: botResponseHtml,
              timestamp: new Date().toISOString(),
            });
        }
        // Save messages to backend
        this.chatService.addMessage(historyId, 'user', userMsg).subscribe({
          next: () => {
            this.chatService.addMessage(historyId, 'bot', botResponse).subscribe({
              next: () => (this.isLoading = false),
              error: (err) => {
                console.error('Error al guardar respuesta del bot:', err);
                this.isLoading = false;
              },
            });
          },
          error: (err) => {
            console.error('Error al guardar mensaje del usuario:', err);
            this.isLoading = false;
          },
        });
      },
      error: (err) => {
        if (this.conversations[this.selectedConversationIndex]) {
            this.conversations[this.selectedConversationIndex].push({
              from: 'bot',
              text: '❌ Error al comunicarse con el asistente.',
              timestamp: new Date().toISOString(),
            });
        }
        console.error('Error al enviar prompt:', err);
        this.prompt = currentPrompt; // Restore prompt on error
        this.isLoading = false;
      },
    });
  }

  startNewConversationAndSend(initialMessage: string) {
    if (this.currentUserRole === 'User' && this.conversationTitles.length >= this.MAX_CONVERSATIONS_FOR_USER_ROLE) {
        console.warn('Usuario "User" ha alcanzado el límite de conversaciones.');
        this.prompt = initialMessage; // Devolver el mensaje al input
        this.isLoading = false;
        alert("Has alcanzado el límite de 5 conversaciones para tu tipo de cuenta.");
        return;
    }

    const chatbotName = 'geminis';
    let newIndex = 1;
    let potentialTitle = `Conversación ${newIndex}`;
    while (this.conversationTitles.includes(potentialTitle)) {
        newIndex++;
        potentialTitle = `Conversación ${newIndex}`;
    }
    const title = potentialTitle;

    this.isLoading = true;
    this.chatService.createConversation(chatbotName, title).subscribe({
        next: (newConv) => {
            this.conversations.push([]);
            this.conversationTitles.push(title);
            this.conversationHistoryIds.push(newConv._id);
            this.selectedConversationIndex = this.conversationTitles.length - 1;

            // Ahora que la conversación está creada y seleccionada, envía el mensaje
            this.prompt = initialMessage;
            this.sendMessage(); // Llamar a sendMessage que ahora encontrará una conversación válida
        },
        error: (err) => {
            console.error('Error al crear nueva conversación:', err);
            this.isLoading = false;
            this.prompt = initialMessage; // Devolver el mensaje si falla la creación
        },
    });
  }

  startNewConversation(isInitialLoad: boolean = false) {
    if (this.currentUserRole === 'User' && this.conversationTitles.length >= this.MAX_CONVERSATIONS_FOR_USER_ROLE) {
      console.warn('Usuario "User" ha alcanzado el límite de conversaciones.');
      if (!isInitialLoad) { // Solo mostrar alerta si es una acción del usuario, no en carga inicial
          alert("Has alcanzado el límite de 5 conversaciones para tu tipo de cuenta.");
      }
      return;
    }

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
        if (isInitialLoad && this.conversationTitles.length === 0 && this.conversations.length === 1 && this.conversations[0].length === 0) {
          // Si es la carga inicial y era la única "conversación vacía" de inicialización, la reemplazamos
          this.conversations[0] = []; // Asegurar que esté vacío
          this.conversationTitles[0] = title;
          this.conversationHistoryIds[0] = newConv._id;
          this.selectedConversationIndex = 0;
        } else {
          // Añadir como nueva
          this.conversations.push([]);
          this.conversationTitles.push(title);
          this.conversationHistoryIds.push(newConv._id);
          this.selectedConversationIndex = this.conversationTitles.length - 1;
        }
      },
      error: (err) => console.error('Error al crear nueva conversación:', err),
    });
  }

  selectConversation(index: number) {
    // 'index' viene del *ngFor, que itera sobre `conversationTitles | slice...`
    // Este 'index' es el índice correcto en el array original `conversationTitles`
    // porque `slice:0:limit` no cambia los índices de los elementos que SÍ muestra.
    if (index >= 0 && index < this.conversationTitles.length) {
      this.selectedConversationIndex = index;
      this.closeMenu();
    } else {
      console.warn('Índice de conversación inválido al seleccionar:', index, 'Títulos actuales:', this.conversationTitles.length);
      // Si el índice no es válido (quizás por un cambio rápido de datos), deseleccionar.
      // this.selectedConversationIndex = -1;
    }
  }

  toggleMenu(index: number, event: MouseEvent) {
    event.stopPropagation();
    // 'index' es el índice del array original gracias a cómo funciona el slice en el template.
    this.menuOpenIndex = this.menuOpenIndex === index ? null : index;
  }

  closeMenu() {
    this.menuOpenIndex = null;
  }

  openRenameConversationModal(index: number, currentTitle: string) {
    this.renameModalIndex = index; // Este 'index' es el del array original.
    this.currentTitleForRename = currentTitle;
    this.newTitleForRename = currentTitle;
    this.showRenameModal = true;
    this.closeMenu();
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
            this.conversationTitles[this.renameModalIndex] = titleToSet;
          }
          this.cancelRenameConversation();
        },
        error: (err) => {
          console.error('Error al renombrar conversación:', err);
          this.cancelRenameConversation();
        },
      });
    } else if (this.newTitleForRename.trim() === this.currentTitleForRename) {
      this.cancelRenameConversation();
    } else {
      console.warn('El nuevo título no puede estar vacío.');
      // Opcional: mostrar error en el modal
    }
  }

  cancelRenameConversation() {
    this.showRenameModal = false;
    this.renameModalIndex = null;
    this.newTitleForRename = '';
    this.currentTitleForRename = '';
  }

  openDeleteConversationModal(index: number, title: string) {
    this.deleteModalIndex = index; // Este 'index' es el del array original.
    this.titleForDelete = title;
    this.showDeleteModal = true;
    this.closeMenu();
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
            if (!(this.currentUserRole === 'User' && this.conversationTitles.length >= this.MAX_CONVERSATIONS_FOR_USER_ROLE)) {
                this.startNewConversation();
            } else {
                this.selectedConversationIndex = -1; // No hay nada que seleccionar
            }
          } else if (this.selectedConversationIndex === indexToDelete) {
            // Si se eliminó la activa, seleccionar la anterior, o la primera si la eliminada era la 0.
            this.selectedConversationIndex = Math.max(0, indexToDelete - 1);
          } else if (this.selectedConversationIndex > indexToDelete) {
            // Si se eliminó una anterior a la activa, ajustar el índice de la activa.
            this.selectedConversationIndex--;
          }
          // Si selectedConversationIndex quedó fuera de rango (ej. < 0), el template lo manejará.
          this.cancelDeleteConversation();
        },
        error: (err) => {
          console.error('Error al eliminar conversación:', err);
          this.cancelDeleteConversation();
        },
      });
    }
  }

  cancelDeleteConversation() {
    this.showDeleteModal = false;
    this.deleteModalIndex = null;
    this.titleForDelete = '';
  }

  stopPropagationModal(event: MouseEvent) {
    event.stopPropagation();
  }
}

