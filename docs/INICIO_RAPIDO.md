# 🚀 INICIO RÁPIDO - Sistema de Reservas

## ⚡ Puesta en Marcha (3 pasos)

### 1️⃣ Migraciones (Ya ejecutado ✅)

```bash
php artisan migrate
```

### 2️⃣ Crear Usuarios de Prueba (Ya ejecutado ✅)

```bash
php artisan db:seed --class=DemoSeeder
```

### 3️⃣ Iniciar Aplicación

```bash
# Terminal 1 - Laravel Backend
php artisan serve

# Terminal 2 - Frontend (Nueva ventana)
npm run dev
```

---

## 🔑 Credenciales de Acceso

### 👨‍💼 Administrador

```
URL: http://localhost:8000/login
Email: admin@reservas.com
Password: admin123
```

### 🚛 Transportista

```
URL: http://localhost:8000/login
Email: transportista@reservas.com
Password: transportista123
```

---

## 📋 Checklist de Funcionalidades

### Panel Admin

- [x] CRUD de Usuarios (Nombre, RUT, Email, Contraseña)
- [x] Generar Horarios (slots de 30 min desde 8:00)
- [x] Gestionar Cupos (2 por horario)
- [x] Ver Todas las Reservas
- [x] Activar/Desactivar Horarios

### Panel Transportista

- [x] Crear Reserva con:
    - Selección de hora
    - Nombre transportista
    - Patente camión
    - N° Booking (con validación)
- [x] Ver Mis Reservas
- [x] Cancelar Reservas

### Reglas de Negocio

- [x] 2 cupos por cada 30 minutos desde las 8:00
- [x] Si booking existe → hasta 2 cupos
- [x] Si booking NO existe → solo 1 cupo
- [x] Cancelación libera cupos automáticamente

---

## 🎯 Flujo de Uso Recomendado

### Primera Vez (Como Admin):

1. Login como admin
2. Ir a `/admin/time-slots`
3. Seleccionar fecha de hoy o futura
4. Click "Generar Horarios"
5. ✅ Sistema crea 20 slots automáticamente

### Hacer una Reserva (Como Transportista):

1. Login como transportista
2. Click "Nueva Reserva"
3. Seleccionar fecha (con horarios generados)
4. Ingresar booking: "BK12345"
5. Completar datos y seleccionar horario
6. ✅ Reserva creada

### Ver y Gestionar:

- Transportista: `/reservations/my-reservations`
- Admin: `/admin/reservations`

---

## 🔧 Comandos Útiles

```bash
# Ver rutas
php artisan route:list

# Crear nuevo usuario manualmente
php artisan tinker
> User::create(['name'=>'Nuevo','rut'=>'33333333-3','email'=>'nuevo@test.com','password'=>Hash::make('123456'),'role'=>'transportista']);

# Limpiar caché
php artisan cache:clear
php artisan config:clear

# Compilar frontend para producción
npm run build
```

---

## 📁 Archivos Importantes

```
Backend:
- routes/web.php (Todas las rutas)
- app/Http/Controllers/ReservationController.php
- app/Http/Controllers/Admin/*

Frontend:
- resources/js/pages/reservations/create.tsx
- resources/js/pages/admin/dashboard.tsx

Base de Datos:
- database/migrations/2025_01_02_*
```

---

## ⚠️ Solución de Problemas

### Error: "Target class does not exist"

```bash
php artisan optimize:clear
composer dump-autoload
```

### Frontend no carga:

```bash
npm install
npm run dev
```

### Base de datos:

```bash
# Reiniciar migraciones (⚠️ BORRA DATOS)
php artisan migrate:fresh --seed
```

---

## 📞 Documentación Completa

Ver archivos:

- `SISTEMA_RESERVAS.md` - Documentación detallada
- `IMPLEMENTACION_COMPLETA.md` - Resumen de implementación

---

**Sistema listo para usar** ✅  
**Todos los módulos implementados** ✅  
**Usuarios de prueba creados** ✅
