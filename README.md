# RehabAI - Plataforma de IA Conversacional (TFG)

RehabAI es el frontend de un Trabajo de Fin de Grado (TFG) desarrollado con Angular. La plataforma ofrece una interfaz de usuario interactiva para conversar con múltiples modelos de Inteligencia Artificial, incluyendo Gemini, Llama3 y un modelo RAG (Retrieval Augmented Generation).

El proyecto cuenta con un sistema completo de autenticación de usuarios, gestión de roles (Usuario, Premium, Administrador), un panel de administración para la gestión de usuarios y funcionalidades específicas para cada rol, como un límite de conversaciones para usuarios estándar o la capacidad de subir documentos para el modelo RAG por parte de los administradores.

## ✨ Características Principales

* **Autenticación de Usuarios**: Sistema completo de registro e inicio de sesión con validación de formularios reactivos.
* **Gestión de Sesiones**: Uso de tokens JWT para la gestión de sesiones, con un interceptor para añadir automáticamente el token a las peticiones HTTP.
* **Sistema de Roles**:
    * **User**: Rol base con funcionalidades limitadas (ej. máximo de 5 conversaciones con Gemini).
    * **Premium**: Rol con acceso a funcionalidades extendidas y temas visuales exclusivos.
    * **Administrador**: Acceso total, incluyendo el panel de gestión de usuarios y la carga de PDFs para el modelo RAG.
* **Interfaces de Chat con IA**:
    * **Gemini**: Interacción directa con el modelo Gemini de Google.
    * **Llama3**: Interacción con el modelo Llama3 de Meta.
    * **RAG**: Modelo de Generación Aumentada por Recuperación que responde basándose en documentos previamente cargados.
* **Gestión de Conversaciones**: Los usuarios pueden crear, renombrar, eliminar y navegar entre sus conversaciones pasadas con cada IA.
* **Panel de Administración**:
    * Visualización y filtrado de todos los usuarios registrados.
    * Edición del nombre y rol de los usuarios.
    * Eliminación de usuarios con modal de confirmación.
* **Rutas Protegidas**: Uso de Guards de Angular (`AuthGuard`, `AdminRoleGuard`) para proteger rutas y funcionalidades según el estado de autenticación y el rol del usuario.
* **Gestión de Perfil**: Los usuarios pueden actualizar su nombre y cambiar su contraseña.
* **Sistema de Suscripción**: Página de pago para que los usuarios puedan actualizar su cuenta a Premium y cancelar su suscripción.
* **Diseño Responsivo**: La interfaz se adapta correctamente a dispositivos de escritorio y móviles.

## 🛠️ Tecnologías Utilizadas

* **Framework**: Angular v19.1
* **Lenguaje**: TypeScript v5.7
* **Gestión de Estado**: RxJS para la programación reactiva y `BehaviorSubject` para el estado del usuario.
* **Estilos**: CSS con variables para un sistema de temas flexible (roles User, Premium, Administrador).
* **Iconos**: Font Awesome.
* **Renderizado de Markdown**: La librería `marked` para mostrar las respuestas de las IAs formateadas.
* **Testing**: Karma y Jasmine para pruebas unitarias.

## 📂 Estructura del Proyecto

El proyecto sigue la estructura estándar de Angular CLI, con algunas carpetas clave:
Markdown

# RehabAI - Plataforma de IA Conversacional (TFG)

RehabAI es el frontend de un Trabajo de Fin de Grado (TFG) desarrollado con Angular. La plataforma ofrece una interfaz de usuario interactiva para conversar con múltiples modelos de Inteligencia Artificial, incluyendo Gemini, Llama3 y un modelo RAG (Retrieval Augmented Generation).

El proyecto cuenta con un sistema completo de autenticación de usuarios, gestión de roles (Usuario, Premium, Administrador), un panel de administración para la gestión de usuarios y funcionalidades específicas para cada rol, como un límite de conversaciones para usuarios estándar o la capacidad de subir documentos para el modelo RAG por parte de los administradores.

## ✨ Características Principales

* **Autenticación de Usuarios**: Sistema completo de registro e inicio de sesión con validación de formularios reactivos.
* **Gestión de Sesiones**: Uso de tokens JWT para la gestión de sesiones, con un interceptor para añadir automáticamente el token a las peticiones HTTP.
* **Sistema de Roles**:
    * **User**: Rol base con funcionalidades limitadas (ej. máximo de 5 conversaciones con Gemini).
    * **Premium**: Rol con acceso a funcionalidades extendidas y temas visuales exclusivos.
    * **Administrador**: Acceso total, incluyendo el panel de gestión de usuarios y la carga de PDFs para el modelo RAG.
* **Interfaces de Chat con IA**:
    * **Gemini**: Interacción directa con el modelo Gemini de Google.
    * **Llama3**: Interacción con el modelo Llama3 de Meta.
    * **RAG**: Modelo de Generación Aumentada por Recuperación que responde basándose en documentos previamente cargados.
* **Gestión de Conversaciones**: Los usuarios pueden crear, renombrar, eliminar y navegar entre sus conversaciones pasadas con cada IA.
* **Panel de Administración**:
    * Visualización y filtrado de todos los usuarios registrados.
    * Edición del nombre y rol de los usuarios.
    * Eliminación de usuarios con modal de confirmación.
* **Rutas Protegidas**: Uso de Guards de Angular (`AuthGuard`, `AdminRoleGuard`) para proteger rutas y funcionalidades según el estado de autenticación y el rol del usuario.
* **Gestión de Perfil**: Los usuarios pueden actualizar su nombre y cambiar su contraseña.
* **Sistema de Suscripción**: Página de pago para que los usuarios puedan actualizar su cuenta a Premium y cancelar su suscripción.
* **Diseño Responsivo**: La interfaz se adapta correctamente a dispositivos de escritorio y móviles.

## 🛠️ Tecnologías Utilizadas

* **Framework**: Angular v19.1
* **Lenguaje**: TypeScript v5.7
* **Gestión de Estado**: RxJS para la programación reactiva y `BehaviorSubject` para el estado del usuario.
* **Estilos**: CSS con variables para un sistema de temas flexible (roles User, Premium, Administrador).
* **Iconos**: Font Awesome.
* **Renderizado de Markdown**: La librería `marked` para mostrar las respuestas de las IAs formateadas.
* **Testing**: Karma y Jasmine para pruebas unitarias.

## 📂 Estructura del Proyecto

El proyecto sigue la estructura estándar de Angular CLI, con algunas carpetas clave:

/src
├── /app
│   ├── /components
│   │   ├── /gestion-user     # Panel de administración
│   │   ├── /gestionar-micuenta # Perfil de usuario
│   │   ├── /home             # Página de inicio
│   │   ├── /ias              # Módulo perezoso (lazy-loaded) para los chats
│   │   │   ├── /components   # Contiene los componentes de cada IA (Gemini, Llama3, RAG)
│   │   │   └── ias.module.ts # Declaración y enrutamiento del módulo
│   │   ├── /pago-premium     # Página para gestionar la suscripción
│   │   └── /sobre-mi         # Página de información
│   ├── /guards               # Contiene AdminRoleGuard y AuthGuard
│   ├── /interfaces           # Define la interfaz de Usuario
│   ├── /services             # Lógica de negocio y llamadas a la API (Auth, Gemini, etc.)
│   └── /shared               # Módulos y componentes compartidos (Header, Footer, Login)
├── /assets
└── /environments
## 🚀 Instalación y Puesta en Marcha

Para ejecutar este proyecto en tu entorno local, sigue estos pasos:

### Prerrequisitos

* Node.js (v18.19.1 o superior)
* npm (v7.5.6 o superior)
* Angular CLI (v19.1.6)

### Pasos

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/TFG_Fronted_Bueno.git](https://github.com/tu-usuario/TFG_Fronted_Bueno.git)
    cd TFG_Fronted_Bueno
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Backend (Importante):**
    Este proyecto es solo el frontend y requiere un backend para funcionar. Asegúrate de que el servidor backend esté en ejecución y accesible en `http://localhost:3000`, ya que todos los servicios apuntan a esa URL.

4.  **Iniciar el servidor de desarrollo:**
    ```bash
    npm start
    ```
    o usando el CLI de Angular:
    ```bash
    ng serve
    ```
    Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente si cambias alguno de los archivos de origen.

### Otros Scripts Disponibles

* **Construir para producción**:
    ```bash
    npm run build
    ```
    Los artefactos de la compilación se almacenarán en el directorio `dist/`.

* **Ejecutar pruebas unitarias**:
    ```bash
    npm test
    ```
    Esto ejecutará las pruebas con Karma y Jasmine.

## 🗺️ Rutas y Navegación

La aplicación cuenta con las siguientes rutas principales, algunas de ellas protegidas por guards:

| Ruta | Componente | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `/`, `/home` | `HomeComponent` | Público | Página de inicio y presentación. |
| `/login` | `LoginComponent` | Público | Formulario de inicio de sesión y registro. |
| `/sobreMi` | `SobreMiComponent` | Público | Página de información sobre el autor. |
| `/premiumPage` | `PagoPremiumComponent` | Requiere Login (`AuthGuard`) | Página para suscribirse o gestionar la suscripción Premium. |
| `/gestionarMiCuenta` | `GestionarMicuentaComponent` | Requiere Login | Permite al usuario editar sus datos personales. |
| `/gestionUser` | `GestionUserComponent` | Solo Administradores (`AdminRoleGuard`) | Panel para la gestión de todos los usuarios. |
| `/ias` | `IAsComponent` | Requiere Login | Módulo principal que contiene las interfaces de chat con las IAs. |
| `/ias/gemini` | `GeminiComponent` | Requiere Login (`AuthGuard`) | Chat con el modelo Gemini. |
| `/ias/llama3` | `Llama3Component` | Requiere Login (`AuthGuard`) | Chat con el modelo Llama 3. |
| `/ias/RAG` | `RAGComponent` | Requiere Login (`AuthGuard`) | Chat con el modelo RAG. |
| `/ias/upload` | `UploadPDFComponent` | Solo Administradores (`AdminRoleGuard`) | Formulario para subir archivos PDF para el modelo RAG. |
| `/error` | `ErrorComponent` | Público | Página de error mostrada cuando se intenta acceder a una ruta sin permisos. |

## 🤝 Contribuciones

Este es un proyecto académico y, por el momento, no se buscan contribuciones externas. Sin embargo, si tienes alguna sugerencia o encuentras un error, no dudes en abrir un *issue*.

## 👨‍💻 Autor

* **Lingxiao Zheng** - Desarrollador principal.
    * GitHub: [@LingX8Z](https://github.com/LingX8Z)
    * LinkedIn: [Lingxiao Zheng](https://es.linkedin.com/in/lingxiao-zheng-28aa1831b?trk=people-guest_people_search-card)
