// src/app/upload-pdf/upload-pdf.component.ts
import { Component } from '@angular/core';
import { RagService } from '../../service/rag.service'; // Asegúrate que la ruta sea correcta

@Component({
  selector: 'app-upload-pdf',
  standalone: false, // Si no es standalone, asegúrate que esté declarado en un NgModule
  templateUrl: './upload-pdf.component.html',
  styleUrls: ['./upload-pdf.component.css']
})
export class UploadPDFComponent {
  selectedFile: File | null = null;
  errorMessage: string = '';
  fileName: string = 'Ningún archivo seleccionado'; // Para mostrar el nombre del archivo

  constructor(private ragService: RagService) { } // Cambiado RagService a ragService (convención)

  onFileSelected(event: any): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file: File = fileInput.files[0];
      if (file && file.type === 'application/pdf') {
        this.selectedFile = file;
        this.fileName = file.name; // Actualiza el nombre del archivo
        this.errorMessage = '';
      } else {
        this.selectedFile = null;
        this.fileName = 'Ningún archivo seleccionado'; // Resetea si no es PDF
        this.errorMessage = 'Por favor selecciona un archivo PDF válido.';
      }
    } else {
      this.selectedFile = null;
      this.fileName = 'Ningún archivo seleccionado';
      // No es necesario un mensaje de error aquí si simplemente se deselecciona.
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    if (!this.selectedFile) {
      this.errorMessage = 'Debes seleccionar un archivo PDF.';
      return;
    }

    // Muestra un mensaje de "subiendo..."
    this.errorMessage = 'Subiendo archivo...';

    this.ragService.uploadPdf(this.selectedFile).subscribe({
      next: (res) => {
        console.log('✅ Subido correctamente:', res);
        this.errorMessage = '¡Archivo subido con éxito!'; // Mensaje de éxito
        this.selectedFile = null; // Limpia la selección
        this.fileName = 'Ningún archivo seleccionado'; // Resetea el nombre
        // Podrías querer resetear el input de archivo aquí si es necesario
        // const fileInput = document.getElementById('pdfFile') as HTMLInputElement;
        // if (fileInput) fileInput.value = '';
      },
      error: (err) => {
        console.error('❌ Error al subir:', err);
        this.errorMessage = `Error al subir el archivo: ${err.error.message || 'Error desconocido'}`;
      }

    });
  }
}
