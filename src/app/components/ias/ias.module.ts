import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAsComponent } from './ias.component';
import { IasRoutingModule } from './ias.routing.module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Llama3Component } from './components/llama3/llama3.component';
import { GeminiComponent } from './components/gemini/gemini.component';
import { RAGComponent } from './components/rag/rag.component';



@NgModule({
  declarations: [
    IAsComponent,
    Llama3Component,
    GeminiComponent,
    RAGComponent
  ],
  imports: [
    CommonModule,
    IasRoutingModule,
    FormsModule ,
    RouterModule,

  ]
})
export class IasModule { }
