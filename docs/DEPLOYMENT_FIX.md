# Fix para Errores de Despliegue en Producción

## Error 1: Class "config" does not exist

### Síntoma

```
PHP Fatal error: Uncaught ReflectionException: Class "config" does not exist
Target class [config] does not exist.
```

### Causa

Este error ocurre cuando los archivos de caché de configuración están corruptos o desactualizados después del despliegue.

---

## Error 2: Call to undefined function iconv_strlen()

### Síntoma

```
PHP Fatal error: Uncaught Error: Call to undefined function Symfony\Polyfill\Mbstring\iconv_strlen()
thrown in vendor/symfony/polyfill-mbstring/Mbstring.php on line 522
```

### Causa

Falta la extensión PHP `mbstring` o `iconv` en el servidor. Laravel requiere estas extensiones.

### Solución Inmediata

#### Opción 1: Habilitar extensión en cPanel

1. Ve a **cPanel → Select PHP Version** (o "MultiPHP Manager")
2. Click en **"Extensions"** o **"PHP Extensions"**
3. Activa las siguientes extensiones:
    - ✅ **mbstring**
    - ✅ **iconv**
    - ✅ **tokenizer**
    - ✅ **xml**
    - ✅ **ctype**
    - ✅ **json**
    - ✅ **bcmath**
    - ✅ **openssl**
4. Guarda los cambios

#### Opción 2: Habilitar mediante php.ini

Si tienes acceso al archivo `php.ini` (o `.user.ini` en algunos hostings):

1. **Ubicar el archivo php.ini**
    - En cPanel: Busca `php.ini` en el directorio raíz o en `/home/usuario/public_html/`
    - Algunos hostings usan `.user.ini` en lugar de `php.ini`
    - Verifica la ruta con: `php --ini`

2. **Editar el archivo php.ini**

    Busca las líneas de extensiones y asegúrate de que estén **SIN punto y coma** al inicio:

    ```ini
    extension=mbstring
    extension=iconv
    extension=tokenizer
    extension=xml
    extension=ctype
    extension=json
    extension=pdo_mysql
    extension=openssl
    extension=bcmath
    extension=fileinfo
    extension=curl
    ```

    Si las líneas tienen `;` al inicio (ejemplo: `;extension=mbstring`), **quita el punto y coma** para habilitarlas.

    **Si no ves ninguna línea de `extension=`**, agrega estas líneas al final del archivo:

    ```ini
    extension=mbstring.so
    extension=iconv.so
    extension=tokenizer.so
    extension=xml.so
    extension=ctype.so
    extension=json.so
    extension=pdo_mysql.so
    extension=openssl.so
    extension=bcmath.so
    extension=fileinfo.so
    extension=curl.so
    ```

    **Nota**: En algunos servidores la extensión `.so` no es necesaria, solo usa `extension=mbstring`

3. **Si el archivo no existe, créalo**

    Crea un archivo llamado `.user.ini` en la raíz de tu aplicación:

    ```bash
    # En /home/teparatr/public_html/bcms_reservas/
    nano .user.ini
    ```

    Agrega estas líneas:

    ```ini
    extension=mbstring.so
    extension=iconv.so
    ```

4. **Reiniciar PHP-FPM** (si tienes acceso)
    ```bash
    # Varía según el servidor
    sudo systemctl restart php8.2-fpm
    # O reinicia desde cPanel
    ```

#### Opción 3: Crear archivo PHP para verificar extensiones (Sin acceso SSH)

Si **NO tienes acceso a SSH/Terminal** en cPanel, crea este archivo PHP para verificar:

1. **Crear archivo `check-extensions.php`** en la raíz de tu sitio:

```php
<?php
// check-extensions.php
echo "<!DOCTYPE html>";
echo "<html><head>";
echo "<style>";
echo "body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }";
echo ".container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }";
echo ".extension { padding: 10px; margin: 5px 0; border-radius: 4px; }";
echo ".active { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }";
echo ".missing { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }";
echo "h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }";
echo "h2 { color: #555; margin-top: 20px; }";
echo ".critical { font-weight: bold; }";
echo "</style>";
echo "</head><body>";
echo "<div class='container'>";

echo "<h1>🔍 Verificación de Extensiones PHP para Laravel 11</h1>";

// Versión de PHP
echo "<h2>Versión de PHP</h2>";
echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";

// Extensiones requeridas
$required_extensions = [
    'mbstring' => '⚠️ CRÍTICO - Requerido para el error actual',
    'iconv' => '⚠️ CRÍTICO - Requerido para el error actual',
    'tokenizer' => 'Obligatoria',
    'xml' => 'Obligatoria',
    'dom' => 'Obligatoria',
    'ctype' => 'Obligatoria',
    'json' => 'Obligatoria',
    'pdo' => 'Obligatoria',
    'pdo_mysql' => 'Obligatoria',
    'openssl' => 'Obligatoria',
    'bcmath' => 'Obligatoria',
    'fileinfo' => 'Obligatoria',
    'curl' => 'Obligatoria',
    'filter' => 'Obligatoria',
    'hash' => 'Obligatoria',
    'session' => 'Obligatoria',
    'zip' => 'Recomendada',
    'gd' => 'Recomendada',
];

echo "<h2>Estado de Extensiones</h2>";

$missing_extensions = [];
$active_extensions = [];

foreach ($required_extensions as $ext => $description) {
    $is_loaded = extension_loaded($ext);
    $class = $is_loaded ? 'extension active' : 'extension missing';
    $status = $is_loaded ? '✅ ACTIVA' : '❌ NO INSTALADA';
    $critical = (strpos($description, 'CRÍTICO') !== false) ? ' critical' : '';

    if ($is_loaded) {
        $active_extensions[] = $ext;
    } else {
        $missing_extensions[] = $ext;
    }

    echo "<div class='$class$critical'>";
    echo "<strong>$ext:</strong> $status - <em>$description</em>";
    echo "</div>";
}

// Resumen
echo "<h2>📊 Resumen</h2>";
echo "<p><strong>Extensiones activas:</strong> " . count($active_extensions) . "/" . count($required_extensions) . "</p>";

if (count($missing_extensions) > 0) {
    echo "<div class='extension missing'>";
    echo "<h3>⚠️ EXTENSIONES FALTANTES:</h3>";
    echo "<ul>";
    foreach ($missing_extensions as $ext) {
        echo "<li><strong>$ext</strong></li>";
    }
    echo "</ul>";
    echo "<p><strong>Acción requerida:</strong> Habilita estas extensiones en cPanel → Select PHP Version → Extensions</p>";
    echo "</div>";
} else {
    echo "<div class='extension active'>";
    echo "<h3>✅ Todas las extensiones están instaladas correctamente</h3>";
    echo "</div>";
}

// Información adicional
echo "<h2>📁 Información del Sistema</h2>";
echo "<p><strong>Archivo php.ini cargado:</strong> " . php_ini_loaded_file() . "</p>";
echo "<p><strong>Directorio de configuración adicional:</strong> " . php_ini_scanned_files() . "</p>";

echo "</div></body></html>";
?>
```

2. **Subir el archivo** a `/home/teparatr/public_html/bcms_reservas/check-extensions.php`

3. **Acceder desde el navegador:**

    ```
    https://tu-dominio.com/check-extensions.php
    ```

4. **El archivo mostrará:**
    - ✅ Extensiones activas en verde
    - ❌ Extensiones faltantes en rojo
    - Las extensiones críticas (mbstring, iconv) resaltadas
    - Versión de PHP
    - Ruta del php.ini

5. **Después de verificar, ELIMINA el archivo** por seguridad:
    ```
    Borra check-extensions.php del servidor
    ```

#### Opción 4: Contactar a soporte del hosting

Si no tienes acceso a cPanel o las extensiones no aparecen:

```
Solicita que habiliten las extensiones PHP:
- mbstring
- iconv
- Todas las extensiones requeridas por Laravel 11
```

#### Verificar extensiones instaladas

```bash
php -m | grep -E 'mbstring|iconv'
```

#### Verificar qué archivo php.ini está usando

```bash
php --ini
```

---

## Solución General para Errores de Despliegue

## Solución

Ejecuta estos comandos en el servidor de producción (en orden):

### 1. Limpiar todos los cachés

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### 2. Regenerar el autoloader de Composer

```bash
composer dump-autoload
```

### 3. Volver a cachear la configuración (solo en producción)

```bash
php artisan config:cache
php artisan route:cache
```

### 4. Verificar permisos

Asegúrate de que los siguientes directorios tengan permisos de escritura:

```bash
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
```

### 5. Verificar ownership

Si usas Apache/Nginx, asegúrate de que el usuario web sea el propietario:

```bash
# Reemplaza 'www-data' con el usuario de tu servidor (puede ser 'apache', 'nginx', etc.)
chown -R www-data:www-data storage/
chown -R www-data:www-data bootstrap/cache/
```

## Comandos Rápidos (Copiar y pegar)

### Para cPanel o acceso SSH estándar:

```bash
cd /home/teparatr/public_html/bcms_reservas
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
composer dump-autoload
php artisan config:cache
php artisan route:cache
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
```

### Si tienes problemas de permisos:

```bash
# Primero intenta limpiar sin cachear
php artisan config:clear
php artisan cache:clear
composer dump-autoload

# NO ejecutes config:cache si hay problemas de permisos
# Deja que Laravel cargue la configuración sin caché en ese caso
```

## Notas Importantes

1. **NUNCA** ejecutes `php artisan config:cache` en desarrollo (local), solo en producción
2. El archivo `.env` debe existir y tener los valores correctos
3. Si el error persiste, verifica que el archivo `.env` no tenga valores con comillas sin escapar
4. Asegúrate de que `APP_ENV=production` en el archivo `.env`

## Verificación Post-Fix

Después de ejecutar los comandos, verifica que el sitio funcione:

```bash
# Prueba que la aplicación responda
curl https://tu-dominio.com

# Verifica los logs por errores
tail -f storage/logs/laravel.log
```

---

## Extensiones PHP Requeridas por Laravel 11

Asegúrate de que el servidor tenga todas estas extensiones habilitadas:

### Obligatorias

- ✅ PHP >= 8.2
- ✅ BCMath PHP Extension
- ✅ Ctype PHP Extension
- ✅ cURL PHP Extension
- ✅ DOM PHP Extension
- ✅ Fileinfo PHP Extension
- ✅ JSON PHP Extension
- ✅ **Mbstring PHP Extension** ⚠️ (ERROR ACTUAL)
- ✅ OpenSSL PHP Extension
- ✅ PCRE PHP Extension
- ✅ PDO PHP Extension
- ✅ Tokenizer PHP Extension
- ✅ XML PHP Extension

### Recomendadas

- ✅ **iconv PHP Extension** ⚠️ (ERROR ACTUAL)
- ✅ Zip PHP Extension
- ✅ GD PHP Extension (para manipulación de imágenes)

### Cómo verificar en servidor

```bash
php -m
```

### Comando para verificar extensiones específicas

```bash
php -m | grep -E 'mbstring|iconv|tokenizer|xml|ctype|json|bcmath|openssl|pdo'
```

### Verificar extensiones una por una

```bash
# Verificar mbstring (CRÍTICO)
php -r "echo extension_loaded('mbstring') ? 'mbstring: ACTIVA ✅' : 'mbstring: NO INSTALADA ❌'; echo PHP_EOL;"

# Verificar iconv (CRÍTICO)
php -r "echo extension_loaded('iconv') ? 'iconv: ACTIVA ✅' : 'iconv: NO INSTALADA ❌'; echo PHP_EOL;"

# Verificar tokenizer
php -r "echo extension_loaded('tokenizer') ? 'tokenizer: ACTIVA ✅' : 'tokenizer: NO INSTALADA ❌'; echo PHP_EOL;"

# Verificar xml
php -r "echo extension_loaded('xml') ? 'xml: ACTIVA ✅' : 'xml: NO INSTALADA ❌'; echo PHP_EOL;"

# Verificar ctype
php -r "echo extension_loaded('ctype') ? 'ctype: ACTIVA ✅' : 'ctype: NO INSTALADA ❌'; echo PHP_EOL;"

# Verificar json
php -r "echo extension_loaded('json') ? 'json: ACTIVA ✅' : 'json: NO INSTALADA ❌'; echo PHP_EOL;"

# Verificar PDO
php -r "echo extension_loaded('pdo') ? 'pdo: ACTIVA ✅' : 'pdo: NO INSTALADA ❌'; echo PHP_EOL;"

# Verificar openssl
php -r "echo extension_loaded('openssl') ? 'openssl: ACTIVA ✅' : 'openssl: NO INSTALADA ❌'; echo PHP_EOL;"
```

### Script completo para verificar todas las extensiones

```bash
#!/bin/bash
echo "=== Verificando extensiones PHP para Laravel 11 ==="
echo ""

extensions=("mbstring" "iconv" "tokenizer" "xml" "dom" "ctype" "json" "pdo" "pdo_mysql" "openssl" "bcmath" "fileinfo" "curl")

for ext in "${extensions[@]}"; do
    php -r "echo extension_loaded('$ext') ? '$ext: ACTIVA ✅' : '$ext: NO INSTALADA ❌'; echo PHP_EOL;"
done

echo ""
echo "=== Versión de PHP ==="
php -v | head -n 1
```

### Comando rápido (copiar y pegar)

```bash
for ext in mbstring iconv tokenizer xml dom ctype json pdo pdo_mysql openssl bcmath fileinfo curl; do php -r "echo extension_loaded('$ext') ? '$ext: ✅' : '$ext: ❌'; echo PHP_EOL;"; done
```
