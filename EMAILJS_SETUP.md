# Configuración de EmailJS para Envío de Correos

Este proyecto utiliza **EmailJS** para enviar correos automáticamente a `josemanuelduquematoso@gmail.com` cuando los clientes completan una solicitud de consulta.

## Pasos para Configurar

### 1. Crear una Cuenta en EmailJS
- Ve a https://www.emailjs.com/
- Regístrate de forma gratuita con tu correo
- Confirma tu email

### 2. Obtener tu Public Key
- En el dashboard de EmailJS, ve a **Account** > **API Keys**
- Copia tu **Public Key** (por ejemplo: `abc123def456...`)
- Abre el archivo `emailjs-config.js` y pon tu Public Key en esta línea:
```javascript
window.EMAILJS_PUBLIC_KEY = "tu_public_key";
```

### 3. Configurar un Servicio de Correo (Gmail)
- En EmailJS, ve a **Email Services**
- Haz click en "Create New Service"
- Selecciona **Gmail**
- Sigue las instrucciones para conectar tu cuenta de Gmail
  - Usa: `josemanuelduquematoso@gmail.com`
  - Se abrirá Google para autorizar el acceso
- Anota el **Service ID** (por ejemplo: `service_abc123...`)
- Ponlo en `emailjs-config.js`:
```javascript
window.EMAILJS_SERVICE_ID = "service_abc123...";
```

### 4. Crear una Plantilla de Correo (Email Template)
- En EmailJS, ve a **Email Templates**
- Haz click en "Create New Template"
- Configura así:

**Template Name:** `duque_consulta_form`

**Email Settings:**
- **To Email:** `{{to_email}}`
- **From Name:** `{{from_name}}`
- **From Email:** Deja en blanco o usa noreply@emailjs.com
- **Reply To:** `{{from_email}}`

**Email Subject:**
```
Nueva Solicitud de Consulta - {{from_name}}
```

**Email Content:**
```
¡Hola José Manuel!

Has recibido una nueva solicitud de consulta:

DATOS DEL CLIENTE:
—————————————————
Nombre: {{from_name}}
Email: {{from_email}}
Teléfono: {{phone}}

MENSAJE:
—————————————————
{{message}}

SERVICIOS SOLICITADOS:
—————————————————
{{services}}

—————————————————
Puedes responder directamente al cliente en: {{from_email}}

---
Este correo fue enviado automáticamente desde tu página web.
```

- Guarda la plantilla
- Copia el **Template ID** (por ejemplo: `template_abc123...`)
- Ponlo en `emailjs-config.js`:
```javascript
window.EMAILJS_TEMPLATE_ID = "template_abc123...";
```
- Además de `{{message}}` y `{{services}}`, el formulario envía `{{client_type}}` (Sociedad / Autónomo / Particular), `{{modality}}` (Presencial / En remoto / Indiferente) y `{{reply_to}}`, por si quieres usarlos en la plantilla. El perfil y la modalidad ya van incluidos dentro de `{{message}}`.
- Si EmailJS no está disponible o falla, el formulario ofrece al cliente enviar la solicitud desde su propio correo con todo ya rellenado.

### 5. Crear Plantilla para Confirmación al Cliente (Opcional)
Para enviar un correo de confirmación al cliente que completa el formulario, puedes crear otra plantilla:

**Template Name:** `duque_consulta_confirmation`

**Email Settings:**
- **To Email:** `{{user_email}}`
- **From Name:** `Servicios y Consultas Duque S.L.`

**Email Subject:**
```
Solicitud de Consulta Recibida ✓
```

**Email Content:**
```
¡Hola {{from_name}}!

Hemos recibido tu solicitud de consulta correctamente.

Te responderemos lo antes posible en el email: josemanuelduquematoso@gmail.com

Detalles de tu solicitud:
———————————————
Servicios solicitados:
{{services}}

Mensaje:
{{message}}

———————————————
Muchas gracias por confiar en nosotros.

Servicios y Consultas Duque S.L.
```

## Verificar la Configuración

Después de completar todos los pasos:

1. Abre tu página web en un navegador
2. Llena el formulario de contacto
3. Haz click en "Enviar mensaje"
4. Deberías ver una notificación de éxito
5. Revisa tu email en `josemanuelduquematoso@gmail.com`

## Límites y Consideraciones

- **Plan Gratuito de EmailJS:** 200 correos/mes (suficiente para la mayoría de pequeños negocios)
- **Seguridad:** Nunca publiques tu Public Key en repositorios públicos si trabajas con información sensible
- **Privacidad:** Los datos del cliente se envían a través de los servidores de EmailJS, así que revisa sus términos de privacidad

## Solución de Problemas

### Error: "emailjs is not defined"
- **Verifica el orden de los scripts:** En el `<head>` de `index.html`, `emailjs-config.js` se carga primero, después la librería de EmailJS del CDN y por último `assets/js/app.js`, que inicializa EmailJS automáticamente
- **Comprueba la consola:** Abre el inspector (F12) → Pestaña **Console** para ver si hay errores de carga
- **Verifica que EmailJS esté disponible:** Abre **Network** (F12) y comprueba que el script `email.min.js` de EmailJS se cargó correctamente (estado 200). Los bloqueadores de publicidad a veces lo impiden

### El correo no se envía
- Verifica que tu Public Key y Service ID sean correctos
- Confirma que tu cuenta de Gmail está correctamente autorizada en EmailJS
- Revisa la consola del navegador (F12) para ver mensajes de error

### Los correos van a Spam
- Configura SPF/DKIM en emailjs.com para mejorar la entregabilidad
- Revisa los filtros de spam de Gmail

## Alternativa: Sin EmailJS

Si prefieres no usar EmailJS, puedes usar un servidor backend tradicional. En ese caso:
1. Configura un backend con Node.js/Express o Python/Flask
2. Crea un endpoint que reciba los datos del formulario
3. Usa `nodemailer` (Node.js) o `smtplib` (Python) para enviar correos
4. Modifica el JavaScript para enviar datos a tu backend en lugar de a EmailJS
