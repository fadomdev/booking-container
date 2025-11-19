# Sistema de Reservas de Horarios

Sistema web de gestión de reservas de horarios con configuración dinámica, desarrollado con Laravel 11 y React.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
composer install
npm install

# Configurar base de datos
cp .env.example .env
php artisan key:generate
php artisan migrate --seed

# Compilar assets
npm run build

# Iniciar servidor
php artisan serve
```

## 📚 Documentación

Toda la documentación del proyecto se encuentra en la carpeta [`docs/`](./docs/):

- **[Índice de Documentación](./docs/README.md)** - Punto de inicio para toda la documentación
- **[Sistema de Reservas](./docs/SISTEMA_RESERVAS.md)** - Descripción general del sistema
- **[Inicio Rápido](./docs/INICIO_RAPIDO.md)** - Guía de instalación paso a paso
- **[Ejemplos de Uso](./docs/EJEMPLOS_DE_USO.md)** - Casos de uso prácticos

## 🛠️ Stack Tecnológico

- **Backend:** Laravel 11 (PHP 8.2+)
- **Frontend:** React 18 + TypeScript + Inertia.js
- **Base de Datos:** SQLite (desarrollo) / MySQL, PostgreSQL (producción)
- **UI:** Tailwind CSS + shadcn/ui
- **Build:** Vite

## ✨ Características Principales

- ✅ Configuración dinámica de horarios y cupos
- ✅ Gestión de reservas con múltiples cupos
- ✅ Validación externa de bookings (API)
- ✅ Panel administrativo completo
- ✅ Sistema de bloqueo de fechas
- ✅ Notificaciones por correo
- ✅ Autenticación con 2FA
- ✅ Interfaz responsive y moderna

## 👤 Usuarios por Defecto

Después de ejecutar las migraciones con seed:

**Administrador:**

- Email: `admin@example.com`
- Password: `password`

**Cliente:**

- Email: `client@example.com`
- Password: `password`

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Modo desarrollo con hot reload
php artisan serve        # Servidor de desarrollo

# Producción
npm run build           # Compilar assets para producción

# Testing
php artisan test        # Ejecutar tests
php artisan test:booking {numero}  # Probar validación de booking

# Base de datos
php artisan migrate:fresh --seed   # Reiniciar BD con datos de prueba
php artisan db:seed                # Solo ejecutar seeders
```

## 📝 Variables de Entorno

Copia `.env.example` a `.env` y configura:

```env
# Aplicación
APP_NAME="Sistema de Reservas"
APP_URL=http://localhost:8000

# Base de datos
DB_CONNECTION=sqlite
# DB_DATABASE=/path/to/database.sqlite

# API Externa de Bookings
BOOKING_API_URL=https://bcms.tp3developers.cl/services/agenda.php
BOOKING_API_KEY=tp3Dev2k25!
BOOKING_API_TIMEOUT=10
BOOKING_API_ENABLED=true

# Email (opcional)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
```

## 🤝 Contribuir

1. Revisa la documentación en [`docs/`](./docs/)
2. Crea una rama para tu feature
3. Escribe tests para nuevas funcionalidades
4. Envía un pull request

## 📄 Licencia

Este proyecto es privado y confidencial.

---

Para más información, consulta la [documentación completa](./docs/README.md).
