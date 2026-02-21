// ============================================================
// CONFIGURACIÓN DE EMAILJS - EDITA ESTE ARCHIVO
// ============================================================
// 
// Sigue los pasos en EMAILJS_SETUP.md para obtener estos valores
//

// Tu Public Key de EmailJS (obtén en: https://dashboard.emailjs.com/admin/account)
window.EMAILJS_PUBLIC_KEY = "VT2KVevyIaZWbvoPG";

// Tu Service ID (obtén en: https://dashboard.emailjs.com/admin/services)
window.EMAILJS_SERVICE_ID = "service_test";

// Tu Template ID (obtén en: https://dashboard.emailjs.com/admin/templates)
window.EMAILJS_TEMPLATE_ID = "template_test";

// Email destinatario (donde recibirás las consultas)
window.RECIPIENT_EMAIL = "josemanuelduquematoso@gmail.com";

// Exportar configuración para uso en index.html
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EMAILJS_PUBLIC_KEY: window.EMAILJS_PUBLIC_KEY,
        EMAILJS_SERVICE_ID: window.EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID: window.EMAILJS_TEMPLATE_ID,
        RECIPIENT_EMAIL: window.RECIPIENT_EMAIL
    };
}
