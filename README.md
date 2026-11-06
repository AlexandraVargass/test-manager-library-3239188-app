# test-manager-library-3239188-app

> **Prueba técnica · Ficha ADSO 3239188**  
> Frontend interactivo SPA en **React** para *Manager Library*.

Este repositorio contiene la aplicación cliente web interactiva construida con React y Vite, diseñada para consumir la API de Laravel bajo las reglas del negocio y roles de usuario.

---

## Características
* **Autenticación con JWT:** Almacenamiento seguro del token con caducidad de 8 horas y control de vistas por rol (`admin` / `librarian`).
* **Catálogo de Libros:** Búsqueda en tiempo real, filtro por categorías, conteo de existencias y modal de alta para administradores.
* **Directorio de Socios:** Consulta y registro con validación de documento de identidad único.
* **Préstamos y Devoluciones:** Selector de 1 a 3 libros por socio, cálculo dinámico de estados (`Abierto`, `Cerrado`, `Vencido`) y devolución individual de ejemplares.
* **Mora y Alertas:** Vista dedicada para libros vencidos con cálculo de días de retraso.
* **Reportes:** Módulo exclusivo para administradores con selector de rango de fechas de los libros más prestados.

---

## Ejecución en Local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar servidor de desarrollo
```bash
npm run dev
```

La aplicación quedará disponible en `http://localhost:3000` con proxy automático hacia la API de Laravel en `http://localhost:8000`.
