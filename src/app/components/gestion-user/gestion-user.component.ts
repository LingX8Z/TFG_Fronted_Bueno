import { Component, OnInit } from '@angular/core';
import { User } from '../../interfaces/user.iterface'; // Asegúrate que la ruta es correcta
import { AuthService } from '../../services/auth.service'; // Asegúrate que la ruta es correcta

@Component({
  selector: 'app-gestion-user',
  standalone: false,
  templateUrl: './gestion-user.component.html',
  styleUrls: ['./gestion-user.component.css']
})
export class GestionUserComponent implements OnInit {
  users: User[] = []; // Lista original de usuarios
  filteredUsers: User[] = []; // Lista de usuarios a mostrar en la tabla

  // Propiedades para los filtros
  filterName: string = '';
  filterEmail: string = '';
  filterRole: string = ''; // Vacío significa "Todos los roles"

  // Opciones para el desplegable de roles (puedes hacerlo más dinámico si prefieres)
  roleOptions: string[] = ['User', 'Premium', 'Administrador'];

  // Modal de edición
  isEditModalOpen = false;
  editableUser: Partial<User> = {};

  // Modal de confirmación para eliminar
  isDeleteModalOpen = false;
  userToDelete: User | null = null;

  constructor(private userService: AuthService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilters(); // Aplicar filtros una vez cargados los usuarios
      },
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  applyFilters(): void {
    let tempUsers = [...this.users]; // Empezar con todos los usuarios

    // Filtrar por nombre (insensible a mayúsculas/minúsculas)
    if (this.filterName.trim() !== '') {
      tempUsers = tempUsers.filter(user =>
        user.fullName.toLowerCase().includes(this.filterName.trim().toLowerCase())
      );
    }

    // Filtrar por email (insensible a mayúsculas/minúsculas)
    if (this.filterEmail.trim() !== '') {
      tempUsers = tempUsers.filter(user =>
        user.email.toLowerCase().includes(this.filterEmail.trim().toLowerCase())
      );
    }

    // Filtrar por rol
    if (this.filterRole) { // Si se ha seleccionado un rol (no es cadena vacía)
      tempUsers = tempUsers.filter(user => user.roles === this.filterRole);
    }

    this.filteredUsers = tempUsers;
  }

  // --- Métodos de Modales (sin cambios relevantes para el filtrado) ---
  deleteUser(id: string): void { // Este método ya no se usa directamente desde el template
    // La lógica ahora está en confirmDelete
    console.warn('deleteUser(id) llamado, pero la lógica principal está en confirmDelete()');
  }

  openEditModal(user: User): void {
    this.editableUser = { ...user };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editableUser = {};
  }

  submitEdit(): void {
    if (this.editableUser._id) {
      this.userService.updateUserDetails(this.editableUser._id, {
        fullName: this.editableUser.fullName!,
        roles: this.editableUser.roles!
      }).subscribe({
        next: () => {
          this.loadUsers(); // Recargar y aplicar filtros
          this.closeEditModal();
        },
        error: (err) => console.error('Error al actualizar usuario', err)
      });
    }
  }

  openDeleteModal(user: User): void {
    this.userToDelete = user;
    this.isDeleteModalOpen = true;
  }

  confirmDelete(): void {
    if (this.userToDelete?._id) {
      this.userService.deleteUser(this.userToDelete._id).subscribe({
        next: () => {
          this.loadUsers(); // Recargar y aplicar filtros
          this.cancelDelete();
        },
        error: (err) => {
          console.error('Error al eliminar usuario', err);
          this.cancelDelete();
        }
      });
    }
  }

  cancelDelete(): void {
    this.isDeleteModalOpen = false;
    this.userToDelete = null;
  }
}
