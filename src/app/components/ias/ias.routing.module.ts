import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IAsComponent } from './ias.component';
import { Llama3Component } from './components/llama3/llama3.component';
import { GeminiComponent } from './components/gemini/gemini.component';
import { AuthGuard } from '../../guards/auth.guard';
import { RAGComponent } from './components/rag/rag.component';
import { AdminRoleGuard } from '../../guards/admin-role.guard';
import { UploadPDFComponent } from './components/rag/components/upload-pdf/upload-pdf.component';

const routes: Routes = [
  {
    path: '',
    component: IAsComponent,
  },
  {
    path: 'RAG',
    component: RAGComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'upload',
    component: UploadPDFComponent,
    canActivate: [AdminRoleGuard, AuthGuard]
  },
  {
    path: 'llama3',
    component: Llama3Component,
    canActivate: [AuthGuard]
  },
  {
    path: 'gemini',
    component: GeminiComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IasRoutingModule { }
