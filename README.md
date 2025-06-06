# Nombre del Proyecto (Boston)

Este es un proyecto full-stack que consiste en un frontend desarrollado con Next.js y un backend con Node.js, Express, y Prisma. La aplicación parece ser un sistema de gestión para una institución educativa.

## Arquitectura

El proyecto está dividido en dos directorios principales:

-   `frontend/`: Contiene la aplicación de Next.js.
-   `backend/`: Contiene la API RESTful de Node.js.

### Tecnologías Utilizadas

#### Frontend
-   **Framework**: [Next.js](https://nextjs.org/)
-   **UI**: [Material-UI (MUI)](https://mui.com/)
-   **Lenguaje**: JavaScript
-   **Validación de Esquemas**: [Zod](https://zod.dev/)

#### Backend
-   **Framework**: [Express.js](https://expressjs.com/)
-   **ORM**: [Prisma](https://www.prisma.io/) (La interacción con la base de datos se entabla mediante mysql2, Prisma es exclusivamente para migraciones.)
-   **Base de Datos**: MySQL
-   **Autenticación**: JSON Web Tokens (JWT)
-   **Lenguaje**: JavaScript

## Cómo Empezar

Sigue estas instrucciones para tener el proyecto funcionando en tu máquina local.

### Prerrequisitos

-   Node.js (v18 o superior recomendado)
-   npm, yarn, o pnpm
-   Una instancia de base de datos MySQL en ejecución.

### Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd <NOMBRE_DEL_PROYECTO>
    ```

2.  **Configura el Backend:**
    -   Navega al directorio del backend: `cd backend`
    -   Instala las dependencias: `npm install`
    -   Crea un archivo `.env` y configúralo con los datos de tu base de datos y otras variables:
        ```env
        DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
        JWT_SECRET="tu_secreto_jwt"
        PORT=3000
        ```
    -   Ejecuta las migraciones de la base de datos: `npx prisma migrate dev`
    -   (Opcional) Puebla la base de datos con datos iniciales, necesario para "settings": `npx prisma db seed`

3.  **Configura el Frontend:**
    -   Navega al directorio del frontend: `cd ../frontend`
    -   Instala las dependencias: `npm install`
    -   Crea un archivo `.env.local` si la aplicación necesita variables de entorno, por ejemplo, para la URL de la API del backend:
        ```env
        NEXT_PUBLIC_API_URL=http://localhost:3000/api
        ```

### Ejecutando la Aplicación

1.  **Inicia el Backend:**
    -   Desde el directorio `backend/`:
        ```bash
        npm run dev
        ```
    -   El servidor del backend estará corriendo en `http://localhost:3000` (o el puerto que hayas configurado).

2.  **Inicia el Frontend:**
    -   Desde el directorio `frontend/`:
        ```bash
        npm run dev
        ```
    -   La aplicación del frontend estará disponible en `http://localhost:1234`.

## Scripts Disponibles

### Backend (`backend/package.json`)
-   `npm run dev`: Inicia el servidor en modo de desarrollo con recarga automática.
-   `npm start`: Inicia el servidor en modo de producción.
-   `npm run verify`: Ejecuta tests de sintaxis e importaciones.

### Frontend (`frontend/package.json`)
-   `npm run dev`: Inicia el servidor de desarrollo de Next.js.
-   `npm run build`: Compila la aplicación para producción.
-   `npm start`: Inicia un servidor de producción de Next.js.
-   `npm run lint`: Ejecuta el linter de ESLint.
