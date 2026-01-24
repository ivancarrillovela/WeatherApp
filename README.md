# Proyecto IONIC: Weather is sweet yeah!

Esta aplicación es una moderna App del Tiempo construida con **Ionic** y **Angular**, desarrollada para el curso de _"Desarrollo de Interfaces (2DAM)"_. Sigue estrictos principios de **Diseño Atómico** y aprovecha la **API de OpenWeather** para proporcionar datos meteorológicos precisos.

![Implementación Actual](./design/current_implementation.png)

## 📋 Características

| Función                | Descripción                                    |
| :--------------------- | :--------------------------------------------- |
| **Tiempo Actual**      | Temperatura, condiciones, viento, humedad, UV. |
| **Pronóstico 5 Días**  | Resumen diario con máximas y mínimas.          |
| **Desglose Por Horas** | Detalles cada 3 horas.                         |
| **Geolocalización**    | Detección automática de ubicación.             |
| **Multilenguaje**      | Interfaz en **Español** e **Inglés**.          |

## 🛠 Stack Tecnológico

- **Framework**: [Ionic 7+](https://ionicframework.com/) (Componentes Standalone)
- **Lógica**: [Angular 17+](https://angular.io/) (TypeScript)
- **Estilos**: SCSS (Atomic Design)
- **API**: [OpenWeather Map](https://openweathermap.org/)
- **Build**: Angular CLI / Ionic CLI

## 🚀 Guía del Desarrollador

### Requisitos Previos

- **Node.js** (LTS)
- **Ionic CLI**: `npm install -g @ionic/cli`

### 📦 Instalación

1.  **Clonar el repositorio**:

    ```bash
    git clone <url_del_repositorio>
    cd WeatherApp
    ```

2.  **Instalar Dependencias**:

    ```bash
    npm install
    ```

3.  **Configuración de Entorno**:

    > [!IMPORTANT]
    > Necesitas una clave API válida de OpenWeather para que la app funcione.
    - Edita `src/environments/environment.ts`:

    ```typescript
    export const environment = {
      production: false,
      openWeather: {
        apiKey: "TU_CLAVE_API_AQUI",
        baseUrl: "https://api.openweathermap.org/data/2.5",
        geoUrl: "http://api.openweathermap.org/geo/1.0",
      },
    };
    ```

### ▶️ Ejecutar la Aplicación

| Comando                       | Descripción                                              |
| :---------------------------- | :------------------------------------------------------- |
| `ionic serve`                 | Inicia servidor de desarrollo en `http://localhost:8100` |
| `ionic build`                 | Compila la aplicación para producción                    |
| `ionic capacitor add android` | Añade plataforma Android                                 |

## 📂 Estructura del Proyecto (Diseño Atómico)

El proyecto organiza sus componentes siguiendo la metodología Atomic Design:

- **📂 atoms**: Componentes indivisibles (iconos, títulos).
- **📂 molecules**: Grupos de átomos (items de lista, barras de búsqueda).
- **📂 organisms**: Secciones completas (cabeceras, grids de clima).
- **📂 templates**: Estructuras de página.

## 🎨 Documentación de Diseño

> [!TIP]
> Puedes consultar la guía de estilos completa y los mockups en la carpeta de diseño.

Consulta [DESIGN.md](./design/DESIGN.md) para ver detalles sobre:

- Paleta de Colores
- Tipografía
- Mockups de UI

## 👤 Autor

**Iván Carrillo**
_Desarrollo de Interfaces - 2DAM_
