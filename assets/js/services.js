/* ============================================================
 * CATÁLOGO DE SERVICIOS — edita este archivo para cambiar la web
 * ============================================================
 *
 * La página genera automáticamente las tarjetas, los filtros y el
 * carrito a partir de estas dos listas. No hace falta tocar el HTML.
 *
 * CATEGORÍAS
 *   id        identificador interno (sin espacios ni tildes)
 *   name      nombre visible en los filtros
 *   icon      icono de Bootstrap Icons (https://icons.getbootstrap.com)
 *   title     frase destacada que aparece al filtrar por la categoría
 *   intro     texto breve de presentación de la categoría
 *
 * SERVICIOS
 *   id        identificador único (no lo cambies si ya hay clientes
 *             con el servicio guardado en su carrito)
 *   category  id de una de las categorías de arriba
 *   icon      icono de Bootstrap Icons
 *   name      nombre del servicio
 *   summary   descripción corta (1–2 frases)
 *   includes  lista opcional de puntos que incluye el servicio
 *   price     opcional: texto libre, p. ej. "Desde 60 €". Si no se
 *             indica, se muestra "Presupuesto sin compromiso".
 *   popular   opcional: true para marcarlo como "Más solicitado"
 */

window.SERVICE_CATEGORIES = [
    {
        id: "sociedades",
        name: "Sociedades",
        icon: "bi-building",
        title: "Orden, criterio y claridad en la gestión",
        intro: "Contabilidad clara y decisiones con datos reales: detecto desviaciones, corrijo errores y propongo mejoras prácticas."
    },
    {
        id: "autonomos",
        name: "Autónomos",
        icon: "bi-briefcase",
        title: "Cuando algo no cuadra, conviene revisarlo",
        intro: "Reviso tu sistema fiscal y tu facturación para simplificar la gestión, evitar pagos de más y cumplir con tranquilidad."
    },
    {
        id: "particulares",
        name: "Particulares",
        icon: "bi-person",
        title: "Antes de pagar o firmar, conviene entender",
        intro: "Reviso requerimientos, multas, inspecciones o despidos, explico opciones y te ayudo a decidir con calma."
    },
    {
        id: "facturas",
        name: "Facturas y Hacienda",
        icon: "bi-receipt",
        title: "Facturas y programas de Hacienda, sin sobrecostes",
        intro: "Verificación de facturas y ayuda con los programas oficiales de Hacienda, de forma sencilla."
    }
];

window.SERVICES = [
    /* ---------- Sociedades ---------- */
    {
        id: "soc-conciliacion",
        category: "sociedades",
        icon: "bi-arrow-left-right",
        name: "Conciliación de cuentas",
        summary: "Reviso la contabilidad y la comparo con bancos, proveedores y clientes para detectar y corregir discrepancias.",
        includes: ["Cuadre con extractos bancarios", "Saldos de clientes y proveedores", "Informe de diferencias"],
        popular: true
    },
    {
        id: "soc-rentabilidad",
        category: "sociedades",
        icon: "bi-graph-up-arrow",
        name: "Análisis de rentabilidad",
        summary: "Informes financieros para saber si la empresa gana o pierde dinero, con una explicación clara de los resultados.",
        includes: ["Cuenta de resultados explicada", "Márgenes por actividad", "Propuestas de mejora"]
    },
    {
        id: "soc-errores",
        category: "sociedades",
        icon: "bi-tools",
        name: "Corrección de errores contables",
        summary: "Identifico y ajusto errores en los registros contables y actualizo los libros y el software de gestión.",
        includes: ["Revisión de asientos", "Ajustes y regularizaciones", "Libros actualizados"]
    },
    {
        id: "soc-organizacion",
        category: "sociedades",
        icon: "bi-diagram-3",
        name: "Organización empresarial",
        summary: "Preparo la documentación, actualizo registros y planifico procesos internos para facilitar la toma de decisiones.",
        includes: ["Orden documental", "Procesos internos", "Calendario de obligaciones"]
    },

    /* ---------- Autónomos ---------- */
    {
        id: "aut-revision",
        category: "autonomos",
        icon: "bi-search",
        name: "Revisión fiscal",
        summary: "Analizo tu facturación y tus gastos para elegir el régimen fiscal más conveniente, con simulación de impuestos.",
        includes: ["Comparativa de regímenes", "Simulación de impuestos", "Recomendación personalizada"],
        popular: true
    },
    {
        id: "aut-costes",
        category: "autonomos",
        icon: "bi-piggy-bank",
        name: "Optimización de costes",
        summary: "Reviso tus gastos y servicios contratados y te propongo qué reducir o cancelar.",
        includes: ["Revisión de suscripciones y contratos", "Propuesta de ahorro"]
    },
    {
        id: "aut-asesoramiento",
        category: "autonomos",
        icon: "bi-chat-square-text",
        name: "Asesoramiento fiscal",
        summary: "Te explico tus obligaciones fiscales, los plazos de presentación y cómo evitar sanciones según tu actividad.",
        includes: ["Obligaciones y plazos", "Prevención de sanciones"]
    },
    {
        id: "aut-optimizacion",
        category: "autonomos",
        icon: "bi-percent",
        name: "Optimización fiscal",
        summary: "Identifico gastos deducibles y aplico estrategias legales para reducir la base imponible y ahorrar.",
        includes: ["Gastos deducibles", "Estrategias de ahorro legal"]
    },
    {
        id: "aut-formacion",
        category: "autonomos",
        icon: "bi-mortarboard",
        name: "Formación fiscal",
        summary: "Sesión práctica para emitir facturas, registrar gastos y cumplir con Hacienda, con ejemplos de tu sector.",
        includes: ["Sesión práctica", "Ejemplos de tu sector"]
    },

    /* ---------- Particulares ---------- */
    {
        id: "par-requerimientos",
        category: "particulares",
        icon: "bi-envelope-paper",
        name: "Revisión de requerimientos",
        summary: "Analizo notificaciones oficiales, te explico qué significan y redacto la respuesta para Hacienda u otros organismos.",
        includes: ["Explicación de la notificación", "Redacción de la respuesta"],
        popular: true
    },
    {
        id: "par-multas",
        category: "particulares",
        icon: "bi-shield-exclamation",
        name: "Multas e inspecciones",
        summary: "Reviso la notificación, preparo alegaciones y te acompaño durante el proceso de inspección.",
        includes: ["Preparación de alegaciones", "Acompañamiento en la inspección"]
    },
    {
        id: "par-despidos",
        category: "particulares",
        icon: "bi-person-x",
        name: "Despidos y finiquitos",
        summary: "Reviso tu contrato, calculo el finiquito y te explico tus derechos y los pasos a seguir.",
        includes: ["Cálculo del finiquito", "Revisión del contrato", "Pasos a seguir"]
    },
    {
        id: "par-escritos",
        category: "particulares",
        icon: "bi-file-earmark-text",
        name: "Revisión de escritos",
        summary: "Analizo contratos, facturas y documentos antes de que firmes o pagues, y te aviso de posibles riesgos.",
        includes: ["Explicación de cláusulas", "Aviso de riesgos"]
    },

    /* ---------- Facturas y Hacienda ---------- */
    {
        id: "fac-registro",
        category: "facturas",
        icon: "bi-journal-check",
        name: "Registro de facturas",
        summary: "Registro simple y seguro de tus facturas, ordenado y listo para Hacienda."
    },
    {
        id: "fac-verificacion",
        category: "facturas",
        icon: "bi-patch-check",
        name: "Verificación de facturas",
        summary: "Reviso facturas emitidas y recibidas, compruebo su validez y su compatibilidad con los programas de Hacienda."
    },
    {
        id: "fac-modelos",
        category: "facturas",
        icon: "bi-file-earmark-spreadsheet",
        name: "Modelos fiscales",
        summary: "Te ayudo a presentar modelos fiscales, a usar los programas de Hacienda y a resolver incidencias."
    },
    {
        id: "fac-formacion",
        category: "facturas",
        icon: "bi-laptop",
        name: "Formación en factura electrónica",
        summary: "Aprende a manejar facturas electrónicas y programas de gestión fiscal paso a paso."
    }
];
