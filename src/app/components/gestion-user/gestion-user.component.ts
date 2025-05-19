import { Component, OnInit } from '@angular/core';
import { User } from '../../interfaces/user.iterface';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-gestion-user',
  standalone: false,
  templateUrl: './gestion-user.component.html',
  styleUrls: ['./gestion-user.component.css']
})
export class GestionUserComponent implements OnInit {
  users: User[] = [];

  // Modal de edición
  isEditModalOpen = false;
  editableUser: Partial<User> = {};

  // Nuevo modal de confirmación
  isDeleteModalOpen = false;
  userToDelete: User | null = null;

  constructor(private userService: AuthService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  deleteUser(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }

  openEditModal(user: User): void {
    this.editableUser = { ...user }; // Clonamos para evitar mutación directa
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
          this.loadUsers();
          this.closeEditModal();
        },
        error: (err) => console.error('Error al actualizar usuario', err)
      });
    }
  }

  // Al hacer clic en "Eliminar"
  openDeleteModal(user: User): void {
    this.userToDelete = user;
    this.isDeleteModalOpen = true;
  }
  // Confirmar eliminación
  confirmDelete(): void {
    if (this.userToDelete?._id) {
      this.userService.deleteUser(this.userToDelete._id).subscribe({
        next: () => {
          this.loadUsers();
          this.cancelDelete(); // cerrar el modal
        },
        error: (err) => {
          console.error('Error al eliminar usuario', err);
          this.cancelDelete();
        }
      });
    }
  }

  // Cancelar modal
  cancelDelete(): void {
    this.isDeleteModalOpen = false;
    this.userToDelete = null;
  }
}
