/* ============================================================
 * Servicios y Consultas Duque — lógica de la página
 * Catálogo, filtros, carrito (guardado en el navegador),
 * panel lateral, formulario y envío con EmailJS.
 * Los servicios se definen en assets/js/services.js
 * ============================================================ */
(function () {
    "use strict";

    var CATEGORIES = window.SERVICE_CATEGORIES || [];
    var SERVICES = window.SERVICES || [];
    var STORAGE_KEY = "duque-cart";
    var THEME_KEY = "duque-theme";
    var CONTACT_EMAIL = window.RECIPIENT_EMAIL || "info@duqueconsultoria.es";
    var DEFAULT_PRICE = "Presupuesto sin compromiso";

    var serviceById = {};
    SERVICES.forEach(function (s) { serviceById[s.id] = s; });
    var categoryById = {};
    CATEGORIES.forEach(function (c) { categoryById[c.id] = c; });

    var state = {
        cart: loadCart(),
        filter: "all",
        query: ""
    };

    /* ---------- Utilidades ---------- */
    function $(sel, root) { return (root || document).querySelector(sel); }
    function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

    function escapeHtml(str) {
        return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function normalize(str) {
        return String(str || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    }

    function plural(n, one, many) { return n === 1 ? one : many; }

    function loadCart() {
        try {
            var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            return Array.isArray(saved) ? saved.filter(function (id) { return serviceById[id]; }) : [];
        } catch (e) {
            return [];
        }
    }

    function saveCart() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart)); } catch (e) { /* modo privado */ }
    }

    function inCart(id) { return state.cart.indexOf(id) !== -1; }

    function cartServices() {
        return state.cart.map(function (id) { return serviceById[id]; }).filter(Boolean);
    }

    /* ---------- Notificaciones ---------- */
    var toastBox = $("#toasts");

    function toast(message, opts) {
        opts = opts || {};
        var type = opts.type || "info";
        var icon = { success: "bi-check-circle-fill", error: "bi-exclamation-circle", info: "bi-info-circle" }[type];
        var el = document.createElement("div");
        el.className = "toast toast--" + type;
        el.innerHTML = '<i class="bi ' + icon + '" aria-hidden="true"></i><span class="toast__text"></span>';
        el.querySelector(".toast__text").textContent = message;

        if (opts.action) {
            var btn = document.createElement("button");
            btn.type = "button";
            btn.className = "toast__action";
            btn.textContent = opts.action.label;
            btn.addEventListener("click", function () { opts.action.onClick(); dismiss(); });
            el.appendChild(btn);
        }

        // Máximo 3 notificaciones a la vez
        while (toastBox.children.length >= 3) toastBox.removeChild(toastBox.firstChild);
        toastBox.appendChild(el);

        var timer = setTimeout(dismiss, opts.duration || 3500);
        function dismiss() {
            clearTimeout(timer);
            el.classList.add("is-leaving");
            setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 250);
        }
    }

    /* ---------- Carrito ---------- */
    function addService(id) {
        if (!serviceById[id] || inCart(id)) return;
        state.cart.push(id);
        commit();
        toast("«" + serviceById[id].name + "» añadido a tu solicitud", {
            type: "success",
            action: { label: "Ver", onClick: openDrawer }
        });
    }

    function removeService(id, silent) {
        var idx = state.cart.indexOf(id);
        if (idx === -1) return;
        state.cart.splice(idx, 1);
        commit();
        if (!silent) {
            toast("«" + serviceById[id].name + "» quitado", {
                action: {
                    label: "Deshacer",
                    onClick: function () {
                        if (!inCart(id)) { state.cart.splice(Math.min(idx, state.cart.length), 0, id); commit(); }
                    }
                }
            });
        }
    }

    function toggleService(id) {
        if (inCart(id)) removeService(id); else addService(id);
    }

    function clearCart() {
        if (!state.cart.length) return;
        var backup = state.cart.slice();
        state.cart = [];
        commit();
        toast("Solicitud vaciada", {
            action: { label: "Deshacer", onClick: function () { state.cart = backup; commit(); } }
        });
    }

    function commit() {
        saveCart();
        renderCartUI();
    }

    /* ---------- Render: filtros ---------- */
    var filtersEl = $("#filters");
    var gridEl = $("#services-grid");
    var emptyEl = $("#services-empty");
    var introEl = $("#category-intro");

    function renderFilters() {
        var items = [{ id: "all", name: "Todos", icon: "bi-grid", count: SERVICES.length }].concat(
            CATEGORIES.map(function (c) {
                return {
                    id: c.id, name: c.name, icon: c.icon,
                    count: SERVICES.filter(function (s) { return s.category === c.id; }).length
                };
            })
        );

        filtersEl.innerHTML = items.map(function (f) {
            return '<button type="button" class="filter" data-filter="' + escapeHtml(f.id) + '" aria-pressed="' + (state.filter === f.id) + '">' +
                '<i class="bi ' + escapeHtml(f.icon) + '" aria-hidden="true"></i>' +
                escapeHtml(f.name) +
                ' <span class="filter__count">' + f.count + "</span></button>";
        }).join("");
    }

    function setFilter(id) {
        state.filter = categoryById[id] ? id : "all";
        $all(".filter", filtersEl).forEach(function (b) {
            b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === state.filter));
        });
        renderServices();
    }

    /* ---------- Render: tarjetas ---------- */
    function matches(s) {
        if (state.filter !== "all" && s.category !== state.filter) return false;
        if (!state.query) return true;
        var cat = categoryById[s.category];
        var haystack = normalize([s.name, s.summary, (s.includes || []).join(" "), cat ? cat.name : ""].join(" "));
        return normalize(state.query).split(/\s+/).every(function (word) { return haystack.indexOf(word) !== -1; });
    }

    function serviceCard(s, i) {
        var cat = categoryById[s.category] || { name: "" };
        var selected = inCart(s.id);
        var includes = (s.includes || []).map(function (item) {
            return '<li><i class="bi bi-check2" aria-hidden="true"></i><span>' + escapeHtml(item) + "</span></li>";
        }).join("");

        return '<article class="service' + (selected ? " is-selected" : "") + '" data-id="' + escapeHtml(s.id) + '" style="animation-delay:' + Math.min(i * 35, 300) + 'ms">' +
            '<div class="service__top">' +
                '<span class="service__icon"><i class="bi ' + escapeHtml(s.icon || cat.icon || "bi-briefcase") + '" aria-hidden="true"></i></span>' +
                '<div class="service__tags">' +
                    (s.popular ? '<span class="tag tag--popular">Más solicitado</span>' : "") +
                    '<span class="tag">' + escapeHtml(cat.name) + "</span>" +
                "</div>" +
            "</div>" +
            '<h3 class="service__name">' + escapeHtml(s.name) + "</h3>" +
            '<p class="service__summary">' + escapeHtml(s.summary) + "</p>" +
            (includes ? '<ul class="service__includes">' + includes + "</ul>" : "") +
            '<div class="service__foot">' +
                '<span class="service__price">' + (s.price ? "<strong>" + escapeHtml(s.price) + "</strong>Orientativo" : "<strong>A medida</strong>" + DEFAULT_PRICE) + "</span>" +
                addButton(s, selected) +
            "</div>" +
        "</article>";
    }

    function addButton(s, selected) {
        return '<button type="button" class="add-btn" data-toggle="' + escapeHtml(s.id) + '" aria-pressed="' + selected + '" aria-label="' +
            escapeHtml((selected ? "Quitar " : "Añadir ") + s.name + (selected ? " de" : " a") + " mi solicitud") + '">' +
            (selected
                ? '<span class="label-added"><i class="bi bi-check-lg" aria-hidden="true"></i> Añadido</span><span class="label-remove"><i class="bi bi-x-lg" aria-hidden="true"></i> Quitar</span>'
                : '<i class="bi bi-plus-lg" aria-hidden="true"></i> Añadir') +
            "</button>";
    }

    function renderServices() {
        var list = SERVICES.filter(matches);
        gridEl.innerHTML = list.map(serviceCard).join("");
        emptyEl.hidden = list.length > 0;

        var cat = categoryById[state.filter];
        if (cat && !state.query) {
            introEl.innerHTML = '<i class="bi ' + escapeHtml(cat.icon) + '" aria-hidden="true"></i><div><h3>' +
                escapeHtml(cat.title) + "</h3><p>" + escapeHtml(cat.intro) + "</p></div>";
            introEl.hidden = false;
        } else if (state.query) {
            introEl.innerHTML = '<i class="bi bi-search" aria-hidden="true"></i><div><h3>' + list.length + " " +
                plural(list.length, "resultado", "resultados") + " para «" + escapeHtml(state.query) + "»</h3>" +
                "<p>" + (state.filter !== "all" ? "En " + escapeHtml(categoryById[state.filter].name) + ". " : "") +
                'Borra la búsqueda para ver todos los servicios.</p></div>';
            introEl.hidden = false;
        } else {
            introEl.hidden = true;
        }
    }

    // Actualiza solo el estado de las tarjetas visibles (sin volver a animarlas)
    function refreshCards() {
        $all(".service", gridEl).forEach(function (card) {
            var s = serviceById[card.getAttribute("data-id")];
            var selected = inCart(s.id);
            card.classList.toggle("is-selected", selected);
            var oldBtn = card.querySelector(".add-btn");
            var hadFocus = document.activeElement === oldBtn;
            oldBtn.outerHTML = addButton(s, selected);
            if (hadFocus) card.querySelector(".add-btn").focus();
        });
    }

    /* ---------- Render: carrito, panel y formulario ---------- */
    var drawerGroups = $("#drawer-groups");
    var drawerEmpty = $("#drawer-empty");
    var drawerFoot = $("#drawer-foot");
    var chipsEl = $("#form-chips");
    var chipsEmpty = $("#form-selection-empty");
    var cartBar = $("#cart-bar");
    var lastCount = state.cart.length;

    function renderCartUI() {
        var items = cartServices();
        var n = items.length;

        // Contadores
        $all("[data-cart-count]").forEach(function (el) {
            el.textContent = n;
            if (n !== lastCount && el.classList.contains("badge")) {
                el.classList.remove("bump");
                void el.offsetWidth; // reinicia la animación
                el.classList.add("bump");
            }
        });
        lastCount = n;
        $("#cart-open").setAttribute("aria-label", "Mi solicitud: " + n + " " + plural(n, "servicio", "servicios"));
        $("#cart-bar-label").textContent = plural(n, "servicio seleccionado", "servicios seleccionados");

        // Panel lateral agrupado por categoría
        drawerEmpty.hidden = n > 0;
        drawerFoot.hidden = n === 0;
        drawerGroups.innerHTML = CATEGORIES.map(function (c) {
            var group = items.filter(function (s) { return s.category === c.id; });
            if (!group.length) return "";
            return '<section class="drawer-group"><h3 class="drawer-group__title"><i class="bi ' + escapeHtml(c.icon) + '" aria-hidden="true"></i>' +
                escapeHtml(c.name) + "</h3>" +
                group.map(function (s) {
                    return '<div class="drawer-item">' +
                        '<span class="drawer-item__icon"><i class="bi ' + escapeHtml(s.icon || c.icon) + '" aria-hidden="true"></i></span>' +
                        '<div class="drawer-item__text"><strong>' + escapeHtml(s.name) + "</strong><small>" + escapeHtml(s.price || DEFAULT_PRICE) + "</small></div>" +
                        '<button type="button" class="drawer-item__remove" data-remove="' + escapeHtml(s.id) + '" aria-label="Quitar ' + escapeHtml(s.name) + '">' +
                        '<i class="bi bi-trash3" aria-hidden="true"></i></button>' +
                    "</div>";
                }).join("") +
            "</section>";
        }).join("");

        // Resumen en el formulario
        chipsEl.innerHTML = items.map(function (s) {
            return '<li class="chip">' + escapeHtml(s.name) +
                '<button type="button" data-remove="' + escapeHtml(s.id) + '" aria-label="Quitar ' + escapeHtml(s.name) + '">' +
                '<i class="bi bi-x-lg" aria-hidden="true"></i></button></li>';
        }).join("");
        chipsEmpty.hidden = n > 0;
        $("#f-mensaje-hint").textContent = n > 0 ? "(opcional)" : "(obligatorio si no eliges servicios)";

        refreshCards();
        updateCartBar();
    }

    /* ---------- Barra flotante ---------- */
    var contactVisible = false;

    function updateCartBar() {
        var show = state.cart.length > 0 && !contactVisible && !drawerOpen;
        cartBar.classList.toggle("is-visible", show);
        cartBar.inert = !show;
        cartBar.setAttribute("aria-hidden", String(!show));
        document.body.classList.toggle("has-cart-bar", show);
    }

    /* ---------- Panel lateral (drawer) ---------- */
    var drawer = $("#cart-drawer");
    var backdrop = $("#drawer-backdrop");
    var drawerOpen = false;
    var lastFocus = null;

    function openDrawer() {
        if (drawerOpen) return;
        drawerOpen = true;
        lastFocus = document.activeElement;
        drawer.hidden = false;
        backdrop.hidden = false;
        document.body.classList.add("no-scroll");
        requestAnimationFrame(function () {
            drawer.classList.add("is-open");
            backdrop.classList.add("is-open");
        });
        $("#cart-close").focus();
        updateCartBar();
    }

    function closeDrawer(restoreFocus) {
        if (!drawerOpen) return;
        drawerOpen = false;
        drawer.classList.remove("is-open");
        backdrop.classList.remove("is-open");
        document.body.classList.remove("no-scroll");
        setTimeout(function () {
            if (!drawerOpen) { drawer.hidden = true; backdrop.hidden = true; }
        }, 350);
        if (restoreFocus !== false && lastFocus && document.contains(lastFocus)) lastFocus.focus();
        updateCartBar();
    }

    function trapFocus(e) {
        if (!drawerOpen || e.key !== "Tab") return;
        var focusables = $all('button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])', drawer)
            .filter(function (el) { return el.offsetParent !== null; });
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function goToContact() {
        closeDrawer(false);
        document.getElementById("contacto").scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(function () { $("#f-nombre").focus({ preventScroll: true }); }, 500);
    }

    function goToServices(filter) {
        closeDrawer(false);
        if (filter) setFilter(filter);
        document.getElementById("servicios").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    /* ---------- Formulario ---------- */
    var form = $("#contact-form");
    var submitBtn = $("#submit-btn");
    var successEl = $("#form-success");
    var fallbackEl = $("#form-fallback");
    var triedSubmit = false;

    var fields = {
        nombre: $("#f-nombre"),
        email: $("#f-email"),
        telefono: $("#f-telefono"),
        perfil: $("#f-perfil"),
        mensaje: $("#f-mensaje"),
        privacidad: $("#f-privacidad")
    };

    function setError(name, message) {
        var input = fields[name];
        var box = input.closest(".field");
        var err = $("#f-" + name + "-error");
        box.classList.toggle("has-error", !!message);
        err.textContent = message || "";
        if (message) {
            input.setAttribute("aria-invalid", "true");
            input.setAttribute("aria-describedby", err.id);
        } else {
            input.removeAttribute("aria-invalid");
        }
        return !message;
    }

    function validate() {
        var ok = true;
        var nombre = fields.nombre.value.trim();
        var email = fields.email.value.trim();
        var tel = fields.telefono.value.trim();
        var msg = fields.mensaje.value.trim();

        ok = setError("nombre", nombre.length < 2 ? "Escribe tu nombre." : "") && ok;
        ok = setError("email", !email ? "Escribe tu email para poder responderte."
            : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? "Revisa el email, parece incompleto (ej.: nombre@correo.es)." : "") && ok;
        ok = setError("telefono", tel && !/^[+()\d\s.-]{6,20}$/.test(tel) ? "Revisa el teléfono: solo números, espacios y +." : "") && ok;
        ok = setError("mensaje", !state.cart.length && msg.length < 10
            ? "Elige al menos un servicio o cuéntame brevemente tu caso (mín. 10 caracteres)." : "") && ok;
        ok = setError("privacidad", !fields.privacidad.checked ? "Necesito tu permiso para responderte." : "") && ok;
        return ok;
    }

    function formData() {
        var modalidad = (form.querySelector('input[name="modalidad"]:checked') || {}).value || "Indiferente";
        var services = cartServices().map(function (s) {
            return s.name + " (" + (categoryById[s.category] || {}).name + ")";
        });
        return {
            nombre: fields.nombre.value.trim(),
            email: fields.email.value.trim(),
            telefono: fields.telefono.value.trim(),
            perfil: fields.perfil.value,
            modalidad: modalidad,
            mensaje: fields.mensaje.value.trim(),
            services: services
        };
    }

    function buildMessage(d) {
        var parts = [];
        if (d.mensaje) parts.push(d.mensaje);
        if (d.services.length) parts.push("Servicios solicitados:\n- " + d.services.join("\n- "));
        parts.push("Perfil: " + (d.perfil || "No indicado") + "\nModalidad preferida: " + d.modalidad);
        return parts.join("\n\n");
    }

    function mailtoLink(d) {
        var subject = "Solicitud de presupuesto - " + d.nombre;
        var body = "Nombre: " + d.nombre + "\nEmail: " + d.email + "\nTeléfono: " + (d.telefono || "No proporcionado") + "\n\n" + buildMessage(d);
        return "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    }

    function setLoading(loading) {
        submitBtn.disabled = loading;
        submitBtn.innerHTML = loading
            ? '<span class="spinner" aria-hidden="true"></span><span>Enviando…</span>'
            : '<i class="bi bi-send" aria-hidden="true"></i><span>Enviar solicitud</span>';
    }

    function showFallback(d) {
        fallbackEl.innerHTML = '<strong>No se ha podido enviar automáticamente.</strong> ' +
            'Tus datos siguen aquí. Puedes <a href="' + escapeHtml(mailtoLink(d)) + '">enviarla desde tu correo</a> ' +
            'con todo ya rellenado, o escribirme por WhatsApp.';
        fallbackEl.hidden = false;
    }

    function showSuccess(d) {
        $("#success-name").textContent = d.nombre;
        $("#success-email").textContent = d.email;
        $("#success-list").innerHTML = cartServices().map(function (s) { return "<li>" + escapeHtml(s.name) + "</li>"; }).join("");
        form.hidden = true;
        $("#form-selection").hidden = true;
        successEl.hidden = false;
        successEl.focus();

        state.cart = [];
        commit();
        form.reset();
        triedSubmit = false;
        updateCounter();
    }

    function emailReady() {
        return typeof window.emailjs !== "undefined" && window.EMAILJS_PUBLIC_KEY && window.EMAILJS_SERVICE_ID && window.EMAILJS_TEMPLATE_ID;
    }

    function onSubmit(e) {
        e.preventDefault();
        triedSubmit = true;
        fallbackEl.hidden = true;

        if (!validate()) {
            var firstError = form.querySelector(".has-error input, .has-error textarea, .has-error select");
            if (firstError) firstError.focus();
            toast("Revisa los campos marcados en rojo", { type: "error" });
            return;
        }

        var d = formData();

        if (!emailReady()) {
            showFallback(d);
            toast("El envío automático no está disponible ahora mismo", { type: "error" });
            return;
        }

        setLoading(true);
        window.emailjs.send(window.EMAILJS_SERVICE_ID, window.EMAILJS_TEMPLATE_ID, {
            to_email: window.RECIPIENT_EMAIL || CONTACT_EMAIL,
            from_name: d.nombre,
            from_email: d.email,
            reply_to: d.email,
            phone: d.telefono || "No proporcionado",
            message: buildMessage(d),
            services: d.services.length ? d.services.join("\n") : "Consulta personalizada",
            client_type: d.perfil || "No indicado",
            modality: d.modalidad
        }).then(function () {
            setLoading(false);
            toast("¡Solicitud enviada correctamente!", { type: "success" });
            showSuccess(d);
        }, function (err) {
            setLoading(false);
            if (window.console) console.error("EmailJS:", err);
            showFallback(d);
            toast("No se pudo enviar. Te dejo una alternativa debajo del botón.", { type: "error", duration: 5000 });
        });
    }

    function updateCounter() {
        $("#f-mensaje-count").textContent = fields.mensaje.value.length + " / " + fields.mensaje.maxLength;
    }

    /* ---------- Cabecera, navegación y tema ---------- */
    var header = $("#header");
    var navMenu = $("#nav-menu");
    var navToggle = $("#nav-toggle");
    var scrollTopBtn = $("#scroll-top");
    var themeBtn = $("#theme-toggle");

    function setMenu(open) {
        navMenu.classList.toggle("is-open", open);
        navToggle.setAttribute("aria-expanded", String(open));
        navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
        navToggle.innerHTML = '<i class="bi ' + (open ? "bi-x-lg" : "bi-list") + '" aria-hidden="true"></i>';
    }

    function applyTheme(theme) {
        var dark = theme === "dark";
        document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
        themeBtn.innerHTML = '<i class="bi ' + (dark ? "bi-sun" : "bi-moon-stars") + '" aria-hidden="true"></i>';
        themeBtn.setAttribute("aria-label", dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    }

    function onScroll() {
        var y = window.scrollY;
        header.classList.toggle("is-scrolled", y > 10);
        scrollTopBtn.classList.toggle("is-visible", y > 600);
    }

    function observeSections() {
        if (!("IntersectionObserver" in window)) return;
        var links = $all(".nav__link");
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                links.forEach(function (a) {
                    a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
                });
            });
        }, { rootMargin: "-45% 0px -50% 0px" });
        ["inicio", "servicios", "como-trabajo", "sobre-mi", "contacto"].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) spy.observe(el);
        });

        // Oculta la barra flotante cuando el formulario ya está a la vista
        new IntersectionObserver(function (entries) {
            contactVisible = entries[0].isIntersecting;
            updateCartBar();
        }, { threshold: 0.15 }).observe(document.getElementById("contacto"));
    }

    /* ---------- Eventos ---------- */
    function bindEvents() {
        // Filtros y búsqueda
        filtersEl.addEventListener("click", function (e) {
            var btn = e.target.closest("[data-filter]");
            if (btn) setFilter(btn.getAttribute("data-filter"));
        });

        var searchTimer;
        $("#service-search").addEventListener("input", function (e) {
            clearTimeout(searchTimer);
            var value = e.target.value.trim();
            searchTimer = setTimeout(function () { state.query = value; renderServices(); }, 150);
        });

        // Añadir / quitar desde las tarjetas
        gridEl.addEventListener("click", function (e) {
            var btn = e.target.closest("[data-toggle]");
            if (btn) toggleService(btn.getAttribute("data-toggle"));
        });

        // Quitar desde el panel o los chips
        document.addEventListener("click", function (e) {
            var rm = e.target.closest("[data-remove]");
            if (rm) {
                var inDrawer = drawer.contains(rm);
                var pos = $all("[data-remove]", drawer).indexOf(rm);
                removeService(rm.getAttribute("data-remove"));
                if (inDrawer) {
                    // Mantiene el foco dentro del panel tras quitar un elemento
                    var rest = $all("[data-remove]", drawer);
                    (rest[Math.min(pos, rest.length - 1)] || $("#drawer-browse")).focus();
                }
                return;
            }
            if (e.target.closest("[data-open-cart]")) openDrawer();
        });

        // Panel lateral
        $("#cart-open").addEventListener("click", openDrawer);
        $("#cart-close").addEventListener("click", function () { closeDrawer(); });
        backdrop.addEventListener("click", function () { closeDrawer(); });
        $("#cart-clear").addEventListener("click", clearCart);
        $("#cart-checkout").addEventListener("click", goToContact);
        $("#drawer-browse").addEventListener("click", function () { goToServices(); });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                if (drawerOpen) closeDrawer();
                else if (navMenu.classList.contains("is-open")) { setMenu(false); navToggle.focus(); }
            }
            trapFocus(e);
        });

        // Menú móvil
        navToggle.addEventListener("click", function () { setMenu(!navMenu.classList.contains("is-open")); });
        navMenu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
        document.addEventListener("click", function (e) {
            if (navMenu.classList.contains("is-open") && !e.target.closest(".nav")) setMenu(false);
        });

        // Tema
        themeBtn.addEventListener("click", function () {
            var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
            applyTheme(next);
            try { localStorage.setItem(THEME_KEY, next); } catch (err) { /* sin almacenamiento */ }
        });

        // Formulario
        form.addEventListener("submit", onSubmit);
        form.addEventListener("input", function (e) {
            if (e.target === fields.mensaje) updateCounter();
            if (triedSubmit) validate();
        });
        form.addEventListener("change", function () { if (triedSubmit) validate(); });
        $("#new-request").addEventListener("click", function () {
            successEl.hidden = true;
            form.hidden = false;
            $("#form-selection").hidden = false;
            goToServices();
        });

        // Enlaces del pie a categorías
        $("#footer-categories").addEventListener("click", function (e) {
            var btn = e.target.closest("[data-goto-filter]");
            if (btn) goToServices(btn.getAttribute("data-goto-filter"));
        });

        window.addEventListener("scroll", onScroll, { passive: true });

        // Sincroniza el carrito entre pestañas abiertas
        window.addEventListener("storage", function (e) {
            if (e.key === STORAGE_KEY) { state.cart = loadCart(); renderCartUI(); }
        });
    }

    /* ---------- Inicio ---------- */
    function init() {
        if (typeof window.emailjs !== "undefined" && window.EMAILJS_PUBLIC_KEY) {
            try { window.emailjs.init({ publicKey: window.EMAILJS_PUBLIC_KEY }); }
            catch (e) { if (window.console) console.error("EmailJS init:", e); }
        }

        applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
        $("#year").textContent = new Date().getFullYear();
        $("#footer-categories").innerHTML = CATEGORIES.map(function (c) {
            return '<li><button type="button" data-goto-filter="' + escapeHtml(c.id) + '">' + escapeHtml(c.name) + "</button></li>";
        }).join("");

        renderFilters();
        renderServices();
        renderCartUI();
        updateCounter();
        bindEvents();
        observeSections();
        onScroll();
    }

    init();
})();
