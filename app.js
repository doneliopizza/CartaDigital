"use strict";

/* ============================================================
   CONFIGURACIÓN
============================================================ */

const API_URL =
    "https://posapi.doneliopizzeria.com.ar";

const URL_CARTA_PRODUCTOS =
    API_URL + "/carta/productos";

const URL_GITHUB_FOTOS =
    "https://raw.githubusercontent.com/doneliopizza/CartaDigital/main/fotos/";

const URL_LOGO =
    URL_GITHUB_FOTOS + "logo.png";

const ALIAS_TRANSFERENCIA =
    "donelio.pizza";


/* ============================================================
   ESTADO
============================================================ */

let productos = [];

let rubroActivo = null;

let carrito = [];

let productoCompuestoActual = null;

/*
   seleccionCompuesto: { [grupo_id]: { [componente_id]: cantidad } }
   — igual estructura que usa el POS internamente, así el
   cálculo de precio (mitad y mitad / adicionales) es el
   mismo criterio en los dos lados.
*/
let seleccionCompuesto = {};

let medioPagoSeleccionado = "EFECTIVO";


/* ============================================================
   INICIO
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    const logo = document.getElementById("logo");

    if (logo) {
        logo.src = URL_LOGO + "?v=" + Date.now();
    }

    configurarEventos();
    configurarMediosPago();
    cargarProductos();
});


/* ============================================================
   EVENTOS
============================================================ */

function configurarEventos() {

    const buscarProducto = document.getElementById("buscarProducto");
    if (buscarProducto) buscarProducto.addEventListener("input", mostrarProductos);

    const btnCarrito = document.getElementById("btnCarrito");
    if (btnCarrito) btnCarrito.addEventListener("click", abrirCarrito);

    const cerrarCarritoBtn = document.getElementById("cerrarCarrito");
    if (cerrarCarritoBtn) cerrarCarritoBtn.addEventListener("click", cerrarCarrito);

    const cerrarCompuestoBtn = document.getElementById("cerrarCompuesto");
    if (cerrarCompuestoBtn) cerrarCompuestoBtn.addEventListener("click", cerrarCompuesto);

    const confirmarCompuestoBtn = document.getElementById("confirmarCompuesto");
    if (confirmarCompuestoBtn) confirmarCompuestoBtn.addEventListener("click", confirmarCompuesto);

    const cerrarClienteBtn = document.getElementById("cerrarCliente");
    if (cerrarClienteBtn) cerrarClienteBtn.addEventListener("click", cerrarCliente);

    const continuarPedidoBtn = document.getElementById("btnContinuarPedido");
    if (continuarPedidoBtn) continuarPedidoBtn.addEventListener("click", abrirDatosCliente);

    const enviarPedidoBtn = document.getElementById("btnEnviarPedido");
    if (enviarPedidoBtn) enviarPedidoBtn.addEventListener("click", enviarPedido);

    const cerrarExitoBtn = document.getElementById("cerrarExito");
    if (cerrarExitoBtn) {
        cerrarExitoBtn.addEventListener("click", () => {
            const modal = document.getElementById("modalExito");
            if (modal) modal.classList.add("oculto");
        });
    }

    const cerrarImagen = document.getElementById("cerrarImagen");
    if (cerrarImagen) {
        cerrarImagen.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            cerrarVisor();
        });
    }

    const visorImagen = document.getElementById("visorImagen");
    if (visorImagen) {
        visorImagen.addEventListener("click", event => {
            if (event.target === visorImagen) cerrarVisor();
        });
    }

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            cerrarVisor();
            cerrarCompuesto();
            cerrarCarrito();
            cerrarCliente();
        }
    });
}


/* ============================================================
   MEDIOS DE PAGO
   ========================================================= */

function configurarMediosPago() {

    const btnEfectivo = document.getElementById("btnPagoEfectivo");
    const btnTransferencia = document.getElementById("btnPagoTransferencia");
    const btnQR = document.getElementById("btnPagoQR");

    if (btnEfectivo) btnEfectivo.addEventListener("click", () => seleccionarMedioPago("EFECTIVO"));
    if (btnTransferencia) btnTransferencia.addEventListener("click", () => seleccionarMedioPago("TRANSFERENCIA"));
    if (btnQR) btnQR.addEventListener("click", () => seleccionarMedioPago("MERCADO_PAGO_QR"));

    const btnCopiarAlias = document.getElementById("btnCopiarAlias");
    if (btnCopiarAlias) btnCopiarAlias.addEventListener("click", copiarAlias);

    const aliasElemento = document.getElementById("aliasTransferencia");
    if (aliasElemento) aliasElemento.textContent = ALIAS_TRANSFERENCIA;

    seleccionarMedioPago("EFECTIVO");
}

function seleccionarMedioPago(medio) {

    medioPagoSeleccionado = medio;

    const btnEfectivo = document.getElementById("btnPagoEfectivo");
    const btnTransferencia = document.getElementById("btnPagoTransferencia");
    const btnQR = document.getElementById("btnPagoQR");

    const opcionEfectivo = document.getElementById("opcionEfectivo");
    const opcionTransferencia = document.getElementById("opcionTransferencia");
    const opcionQR = document.getElementById("opcionQR");

    [btnEfectivo, btnTransferencia, btnQR].forEach(b => b && b.classList.remove("activo"));
    [opcionEfectivo, opcionTransferencia, opcionQR].forEach(o => o && o.classList.add("oculto"));

    if (medio === "EFECTIVO") {
        if (btnEfectivo) btnEfectivo.classList.add("activo");
        if (opcionEfectivo) opcionEfectivo.classList.remove("oculto");
    }

    if (medio === "TRANSFERENCIA") {
        if (btnTransferencia) btnTransferencia.classList.add("activo");
        if (opcionTransferencia) opcionTransferencia.classList.remove("oculto");
    }

    if (medio === "MERCADO_PAGO_QR") {
        if (btnQR) btnQR.classList.add("activo");
        if (opcionQR) opcionQR.classList.remove("oculto");
    }
}

async function copiarAlias() {

    const mensaje = document.getElementById("mensajeAlias");

    try {

        await navigator.clipboard.writeText(ALIAS_TRANSFERENCIA);

        if (mensaje) {
            mensaje.textContent = "✓ Alias copiado correctamente.";
            setTimeout(() => { mensaje.textContent = ""; }, 3000);
        }

    } catch (error) {

        console.error("Error copiando alias:", error);

        if (mensaje) mensaje.textContent = "No se pudo copiar. Copialo manualmente: " + ALIAS_TRANSFERENCIA;
    }
}


/* ============================================================
   PRODUCTOS (desde la caché pública de la API)
   ========================================================= */

async function cargarProductos() {

    try {

        const respuesta = await fetch(URL_CARTA_PRODUCTOS);

        if (!respuesta.ok) throw new Error("HTTP " + respuesta.status);

        productos = await respuesta.json();

        generarRubros();
        mostrarProductos();

    } catch (error) {

        console.error("Error cargando productos:", error);

        const contenedor = document.getElementById("productos");

        if (contenedor) {
            contenedor.innerHTML = `<div class="mensaje-pedido">No se pudo cargar la carta.</div>`;
        }
    }
}


/* ============================================================
   RUBROS
   ========================================================= */

function generarRubros() {

    const contenedor = document.getElementById("rubros");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    const rubros = {};

    productos.forEach(producto => {

        const id = Number(producto.rubro_id);

        if (!rubros[id]) {
            rubros[id] = { id, nombre: producto.rubro };
        }
    });

    const rubrosOrdenados = Object.values(rubros)
        .sort((a, b) => Number(a.id) - Number(b.id));

    const botonTodos = document.createElement("button");

    botonTodos.className = "boton-rubro activo";
    botonTodos.textContent = "Todos";

    botonTodos.addEventListener("click", () => {
        rubroActivo = null;
        marcarRubroActivo(botonTodos);
        mostrarProductos();
    });

    contenedor.appendChild(botonTodos);

    rubrosOrdenados.forEach(rubro => {

        const boton = document.createElement("button");

        boton.className = "boton-rubro";
        boton.textContent = rubro.nombre;

        boton.addEventListener("click", () => {
            rubroActivo = rubro.id;
            marcarRubroActivo(boton);
            mostrarProductos();
        });

        contenedor.appendChild(boton);
    });
}

function marcarRubroActivo(botonSeleccionado) {

    document.querySelectorAll(".boton-rubro").forEach(b => b.classList.remove("activo"));

    botonSeleccionado.classList.add("activo");
}


/* ============================================================
   MOSTRAR PRODUCTOS
   ========================================================= */

function mostrarProductos() {

    const contenedor = document.getElementById("productos");

    if (!contenedor) return;

    const campoBusqueda = document.getElementById("buscarProducto");

    const texto = campoBusqueda ? campoBusqueda.value.trim().toLowerCase() : "";

    contenedor.innerHTML = "";

    const filtrados = productos
        .filter(producto => {

            if (rubroActivo !== null && Number(producto.rubro_id) !== Number(rubroActivo)) {
                return false;
            }

            if (texto && !String(producto.nombre).toLowerCase().includes(texto)) {
                return false;
            }

            return true;
        })
        .sort((a, b) => {

            const rubroA = Number(a.rubro_id);
            const rubroB = Number(b.rubro_id);

            if (rubroA !== rubroB) return rubroA - rubroB;

            return String(a.nombre || "").localeCompare(
                String(b.nombre || ""), "es", { sensitivity: "base" }
            );
        });

    if (!filtrados.length) {

        contenedor.innerHTML = `<p>No se encontraron productos.</p>`;

        return;
    }

    filtrados.forEach(producto => {

        const tarjeta = document.createElement("article");
        tarjeta.className = "producto";

        const imagen = document.createElement("img");
        imagen.className = "producto-imagen";
        imagen.alt = producto.nombre;
        imagen.src = obtenerImagen(producto);

        imagen.onerror = () => {
            imagen.onerror = null;
            imagen.src = URL_LOGO;
        };

        imagen.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            abrirVisor(imagen.src, producto.nombre);
        });

        const info = document.createElement("div");
        info.className = "producto-info";

        const nombre = document.createElement("div");
        nombre.className = "producto-nombre";
        nombre.textContent = producto.nombre;

        const descripcion = document.createElement("div");
        descripcion.className = "producto-descripcion";
        descripcion.textContent = producto.descripcion || "";

        const precio = document.createElement("div");
        precio.className = "producto-precio";
        precio.textContent = formatearPrecio(producto.precio);

        const boton = document.createElement("button");
        boton.className = "producto-boton";
        boton.textContent = producto.es_compuesto ? "Elegir opciones" : "Agregar";

        boton.addEventListener("click", () => agregarProducto(producto));

        info.appendChild(nombre);
        if (producto.descripcion) info.appendChild(descripcion);
        info.appendChild(precio);
        info.appendChild(boton);

        tarjeta.appendChild(imagen);
        tarjeta.appendChild(info);

        contenedor.appendChild(tarjeta);
    });
}

function obtenerImagen(producto) {

    // Convención: la foto es siempre el ID del producto + .jpg
    return URL_GITHUB_FOTOS + producto.id + ".jpg";
}


/* ============================================================
   AGREGAR PRODUCTO
   ========================================================= */

function agregarProducto(producto) {

    if (producto.es_compuesto) {

        if (!Array.isArray(producto.grupos) || !producto.grupos.length) {

            mostrarMensaje("Este producto compuesto no tiene opciones configuradas.");

            return;
        }

        abrirCompuesto(producto);

        return;
    }

    agregarSimple(producto);
}

function agregarSimple(producto) {

    const existente = carrito.find(
        item => item.producto_id === producto.id && !item.compuesto
    );

    if (existente) {

        existente.cantidad++;
        existente.subtotal = existente.cantidad * existente.precio;

    } else {

        carrito.push({
            key: "P_" + producto.id,
            producto_id: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precio),
            cantidad: 1,
            subtotal: Number(producto.precio),
            compuesto: false,
            opciones: []
        });
    }

    actualizarCarritoUI();
}


/* ============================================================
   COMPUESTO — vía Grupos reales (soporta mitad-y-mitad y
   adicionales, no solo "elegir cantidades sueltas")
   ========================================================= */

function abrirCompuesto(producto) {

    productoCompuestoActual = producto;

    seleccionCompuesto = {};

    producto.grupos.forEach(grupo => {
        seleccionCompuesto[grupo.id] = {};
    });

    const titulo = document.getElementById("compuestoTitulo");
    if (titulo) titulo.textContent = producto.nombre;

    renderGruposCompuesto();

    const modal = document.getElementById("modalCompuesto");
    if (modal) modal.classList.remove("oculto");
}

function totalSeleccionadoEnGrupo(grupoId) {

    return Object.values(seleccionCompuesto[grupoId] || {})
        .reduce((suma, cantidad) => suma + cantidad, 0);
}

function renderGruposCompuesto() {

    const contenedor = document.getElementById("opcionesCompuesto");
    const reglas = document.getElementById("compuestoReglas");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (reglas) reglas.textContent = "";

    productoCompuestoActual.grupos.forEach(grupo => {

        const bloque = document.createElement("div");
        bloque.className = "grupo-compuesto";

        const encabezado = document.createElement("div");
        encabezado.className = "grupo-compuesto-titulo";

        const total = totalSeleccionadoEnGrupo(grupo.id);

        encabezado.textContent =
            grupo.nombre + " — " + generarTextoReglas(grupo, total);

        bloque.appendChild(encabezado);

        grupo.opciones.forEach(opcion => {

            const fila = document.createElement("div");
            fila.className = "opcion-compuesto";

            const nombre = document.createElement("div");
            nombre.className = "opcion-nombre";
            nombre.textContent = opcion.nombre;

            const menos = document.createElement("button");
            menos.type = "button";
            menos.textContent = "−";

            const cantidadSpan = document.createElement("span");
            cantidadSpan.className = "opcion-cantidad";
            cantidadSpan.textContent = seleccionCompuesto[grupo.id][opcion.componente_id] || 0;

            const mas = document.createElement("button");
            mas.type = "button";
            mas.textContent = "+";

            menos.addEventListener("click", () => {

                const actual = seleccionCompuesto[grupo.id][opcion.componente_id] || 0;

                if (actual > 0) {
                    seleccionCompuesto[grupo.id][opcion.componente_id] = actual - 1;
                    renderGruposCompuesto();
                }
            });

            mas.addEventListener("click", () => {

                const actual = seleccionCompuesto[grupo.id][opcion.componente_id] || 0;

                const maxOpcion = opcion.maximo_cantidad || 0;

                if (maxOpcion > 0 && actual >= maxOpcion) {
                    mostrarMensaje(`Máximo ${maxOpcion} de esta opción`);
                    return;
                }

                const totalGrupo = totalSeleccionadoEnGrupo(grupo.id);
                const maxGrupo = grupo.maximo_selecciones || 0;

                if (maxGrupo > 0 && totalGrupo >= maxGrupo) {
                    mostrarMensaje(`"${grupo.nombre}" ya llegó a su máximo (${maxGrupo})`);
                    return;
                }

                seleccionCompuesto[grupo.id][opcion.componente_id] = actual + 1;
                renderGruposCompuesto();
            });

            fila.appendChild(nombre);
            fila.appendChild(menos);
            fila.appendChild(cantidadSpan);
            fila.appendChild(mas);

            bloque.appendChild(fila);
        });

        contenedor.appendChild(bloque);
    });
}

function generarTextoReglas(grupo, total) {

    const min = Number(grupo.minimo_selecciones || 0);
    const max = Number(grupo.maximo_selecciones || 0);

    if (min && max && min === max) return `${total} / elegí ${min}`;
    if (min && max) return `${total} / entre ${min} y ${max}`;
    if (min) return `${total} / al menos ${min}`;
    if (max) return `${total} / hasta ${max}`;

    return `${total} elegidos`;
}

function confirmarCompuesto() {

    const producto = productoCompuestoActual;

    if (!producto) return;

    for (const grupo of producto.grupos) {

        const total = totalSeleccionadoEnGrupo(grupo.id);

        if (total < Number(grupo.minimo_selecciones || 0)) {
            mostrarMensaje(`"${grupo.nombre}" necesita al menos ${grupo.minimo_selecciones} selección/es`);
            return;
        }

        if (grupo.maximo_selecciones > 0 && total > Number(grupo.maximo_selecciones)) {
            mostrarMensaje(`"${grupo.nombre}" admite como máximo ${grupo.maximo_selecciones}`);
            return;
        }
    }

    const opcionesElegidas = [];
    const partesNombre = [];

    let precioEfectivo = Number(producto.precio);
    let huboMaximo = false;
    let sumaMaximos = 0;
    let sumaAdicionales = 0;

    producto.grupos.forEach(grupo => {

        grupo.opciones.forEach(opcion => {

            const cantidad = seleccionCompuesto[grupo.id][opcion.componente_id] || 0;

            if (cantidad > 0) {

                opcionesElegidas.push({
                    componente_id: opcion.componente_id,
                    nombre: opcion.nombre,
                    cantidad
                });

                partesNombre.push(`${cantidad} ${opcion.nombre}`);

                if (grupo.modo_precio === "MAXIMO") {

                    huboMaximo = true;

                    if (opcion.precio > sumaMaximos) sumaMaximos = opcion.precio;

                } else if (grupo.modo_precio === "SUMA") {

                    sumaAdicionales += opcion.precio * cantidad;
                }
            }
        });
    });

    if (huboMaximo) precioEfectivo = sumaMaximos;

    precioEfectivo += sumaAdicionales;

    const nombreFinal =
        partesNombre.length
            ? `${producto.nombre} (${partesNombre.join(", ")})`
            : producto.nombre;

    carrito.push({
        key: "COMP_" + producto.id + "_" + Date.now(),
        producto_id: producto.id,
        nombre: nombreFinal,
        precio: precioEfectivo,
        cantidad: 1,
        subtotal: precioEfectivo,
        compuesto: true,
        opciones: opcionesElegidas
    });

    cerrarCompuesto();
    actualizarCarritoUI();
}

function cerrarCompuesto() {

    const modal = document.getElementById("modalCompuesto");
    if (modal) modal.classList.add("oculto");

    productoCompuestoActual = null;
    seleccionCompuesto = {};
}


/* ============================================================
   CARRITO
   ========================================================= */

function actualizarCarritoUI() {

    const cantidad = carrito.reduce((total, item) => total + item.cantidad, 0);

    const cantidadCarrito = document.getElementById("cantidadCarrito");
    if (cantidadCarrito) cantidadCarrito.textContent = cantidad;

    renderizarCarrito();
}

function calcularSubtotal() {

    return carrito.reduce((total, item) => total + Number(item.subtotal || 0), 0);
}

function renderizarCarrito() {

    const contenedor = document.getElementById("listaCarrito");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (!carrito.length) {
        contenedor.innerHTML = "<p>Tu pedido está vacío.</p>";
    }

    carrito.forEach((item, index) => {

        const fila = document.createElement("div");
        fila.className = "item-carrito";

        const izquierda = document.createElement("div");

        const nombre = document.createElement("div");
        nombre.className = "item-carrito-nombre";
        nombre.textContent = item.nombre;

        const detalle = document.createElement("div");
        detalle.className = "item-carrito-detalle";
        detalle.textContent = `${item.cantidad} x ${formatearPrecio(item.precio)}`;

        izquierda.appendChild(nombre);
        izquierda.appendChild(detalle);

        const controles = document.createElement("div");
        controles.className = "item-carrito-controles";

        const menos = document.createElement("button");
        menos.type = "button";
        menos.textContent = "−";

        const cantidad = document.createElement("span");
        cantidad.textContent = item.cantidad;

        const mas = document.createElement("button");
        mas.type = "button";
        mas.textContent = "+";

        const eliminar = document.createElement("button");
        eliminar.type = "button";
        eliminar.textContent = "×";
        eliminar.className = "eliminar-item";

        menos.addEventListener("click", () => {

            item.cantidad--;

            if (item.cantidad <= 0) {
                carrito.splice(index, 1);
            } else {
                item.subtotal = item.cantidad * item.precio;
            }

            actualizarCarritoUI();
        });

        mas.addEventListener("click", () => {
            item.cantidad++;
            item.subtotal = item.cantidad * item.precio;
            actualizarCarritoUI();
        });

        eliminar.addEventListener("click", () => {
            carrito.splice(index, 1);
            actualizarCarritoUI();
        });

        controles.appendChild(menos);
        controles.appendChild(cantidad);
        controles.appendChild(mas);
        controles.appendChild(eliminar);

        fila.appendChild(izquierda);
        fila.appendChild(controles);

        contenedor.appendChild(fila);
    });

    const subtotal = calcularSubtotal();

    const subtotalElemento = document.getElementById("subtotalCarrito");
    if (subtotalElemento) subtotalElemento.textContent = formatearPrecio(subtotal);

    const totalElemento = document.getElementById("totalCarrito");
    if (totalElemento) totalElemento.textContent = formatearPrecio(subtotal);
}

function abrirCarrito() {

    renderizarCarrito();

    const modal = document.getElementById("modalCarrito");
    if (modal) modal.classList.remove("oculto");
}

function cerrarCarrito() {

    const modal = document.getElementById("modalCarrito");
    if (modal) modal.classList.add("oculto");
}


/* ============================================================
   DATOS CLIENTE
   ========================================================= */

function abrirDatosCliente() {

    if (!carrito.length) {
        alert("Agregá al menos un producto.");
        return;
    }

    cerrarCarrito();

    const total = calcularSubtotal();

    const totalConfirmacion = document.getElementById("totalConfirmacion");
    if (totalConfirmacion) totalConfirmacion.textContent = formatearPrecio(total);

    seleccionarMedioPago("EFECTIVO");
    inicializarProgramarPedido();

    const modal = document.getElementById("modalCliente");
    if (modal) modal.classList.remove("oculto");
}


/* ============================================================
   PROGRAMAR PEDIDO — "Ahora" o elegir hora dentro del horario
   ============================================================ */

let pedidoProgramado = false;

async function inicializarProgramarPedido() {

    const btnAhora = document.getElementById("btnPedirAhora");
    const btnProgramar = document.getElementById("btnProgramarPedido");
    const opcionProgramar = document.getElementById("opcionProgramar");

    if (!btnAhora || !btnProgramar) return;

    pedidoProgramado = false;

    btnAhora.addEventListener("click", () => {

        pedidoProgramado = false;

        btnAhora.classList.add("activo");
        btnProgramar.classList.remove("activo");

        if (opcionProgramar) opcionProgramar.classList.add("oculto");
    });

    btnProgramar.addEventListener("click", async () => {

        pedidoProgramado = true;

        btnProgramar.classList.add("activo");
        btnAhora.classList.remove("activo");

        if (opcionProgramar) opcionProgramar.classList.remove("oculto");

        await cargarHorariosDisponibles();
    });

    // Chequear si está abierto ahora — si no, forzar "Programar"

    try {

        const respuesta = await fetch(`${API_URL}/horarios/estado-publico`);
        const estado = await respuesta.json();

        if (!estado.abierto) {

            btnProgramar.click();
        }

    } catch (error) {

        console.error("ERROR CONSULTANDO ESTADO DEL LOCAL:", error);
    }
}

async function cargarHorariosDisponibles() {

    const select = document.getElementById("horaProgramada");
    const mensajeSinTurnos = document.getElementById("mensajeSinTurnos");

    if (!select) return;

    select.innerHTML = "";

    try {

        const respuesta = await fetch(`${API_URL}/horarios/turnos-hoy-publico`);
        const turnos = await respuesta.json();

        const ahora = new Date();

        const opciones = [];

        turnos.forEach(turno => {

            const [hIni, mIni] = turno.hora_apertura.split(":").map(Number);
            const [hFin, mFin] = turno.hora_cierre.split(":").map(Number);

            let cursor = new Date(ahora);
            cursor.setHours(hIni, mIni, 0, 0);

            const fin = new Date(ahora);
            fin.setHours(hFin, mFin, 0, 0);

            if (fin <= cursor) fin.setDate(fin.getDate() + 1); // cruza medianoche

            while (cursor < fin) {

                if (cursor > ahora) {

                    opciones.push(
                        cursor.toTimeString().slice(0, 5)
                    );
                }

                cursor = new Date(cursor.getTime() + 15 * 60000);
            }
        });

        if (!opciones.length) {

            if (mensajeSinTurnos) mensajeSinTurnos.style.display = "block";

            select.innerHTML = `<option value="">—</option>`;

            return;
        }

        if (mensajeSinTurnos) mensajeSinTurnos.style.display = "none";

        select.innerHTML = opciones
            .map(hora => `<option value="${hora}">${hora}</option>`)
            .join("");

    } catch (error) {

        console.error("ERROR CARGANDO HORARIOS DISPONIBLES:", error);
    }
}

function cerrarCliente() {

    const modal = document.getElementById("modalCliente");
    if (modal) modal.classList.add("oculto");
}


/* ============================================================
   ENVIAR PEDIDO
   ========================================================= */

async function enviarPedido() {

    const nombre = obtenerValor("clienteNombre");
    const telefono = obtenerValor("clienteTelefono");
    const calle = obtenerValor("clienteCalle");
    const altura = obtenerValor("clienteAltura");
    const localidad = obtenerValor("clienteLocalidad");
    const montoEfectivo = Number(obtenerValor("montoEfectivo") || 0);

    const total = calcularSubtotal();

    if (!nombre) return mostrarMensaje("Ingresá tu nombre.");
    if (!telefono) return mostrarMensaje("Ingresá tu teléfono.");
    if (!calle) return mostrarMensaje("Ingresá la calle.");
    if (!altura) return mostrarMensaje("Ingresá la altura.");
    if (!localidad) return mostrarMensaje("Ingresá la localidad.");

    if (medioPagoSeleccionado === "EFECTIVO" && montoEfectivo > 0 && montoEfectivo < total) {
        return mostrarMensaje("El efectivo informado es menor al total.");
    }

    const items = carrito.map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        opciones: item.compuesto
            ? item.opciones.map(o => ({
                componente_id: o.componente_id,
                cantidad: o.cantidad,
                observaciones: null
            }))
            : []
    }));

    const horaProgramadaSelect = document.getElementById("horaProgramada");

    const horaProgramada =
        pedidoProgramado && horaProgramadaSelect
            ? horaProgramadaSelect.value
            : null;

    if (pedidoProgramado && !horaProgramada) {

        return mostrarMensaje("Elegí a qué hora querés el pedido.");
    }

    const pedido = {
        nombre,
        telefono,
        direccion_entrega: `${calle} ${altura} - ${localidad}`,
        medio_pago: medioPagoSeleccionado,
        monto_efectivo: montoEfectivo || null,
        observaciones:
            medioPagoSeleccionado === "EFECTIVO" && montoEfectivo > 0
                ? `Paga con: ${formatearPrecio(montoEfectivo)}`
                : null,
        hora_programada: horaProgramada,
        items
    };

    const boton = document.getElementById("btnEnviarPedido");

    if (boton) {
        boton.disabled = true;
        boton.textContent = "ENVIANDO...";
    }

    try {

        const respuesta = await fetch(API_URL + "/carta/pedidos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pedido)
        });

        let datos;

        try {
            datos = await respuesta.json();
        } catch {
            datos = {};
        }

        if (!respuesta.ok) {
            throw new Error(datos.detail || "No se pudo registrar el pedido.");
        }

        cerrarCliente();

        carrito = [];
        actualizarCarritoUI();

        const numeroPedido = document.getElementById("numeroPedido");
        if (numeroPedido) numeroPedido.textContent = "#" + datos.numero_pedido;

        crearLinkSeguimiento(datos.token, numeroPedido);

        const modalExito = document.getElementById("modalExito");
        if (modalExito) modalExito.classList.remove("oculto");

        limpiarFormulario();

    } catch (error) {

        console.error("ERROR ENVIANDO PEDIDO:", error);

        mostrarMensaje(error.message || "No se pudo enviar el pedido. Intentá nuevamente.");

    } finally {

        if (boton) {
            boton.disabled = false;
            boton.textContent = "ENVIAR PEDIDO";
        }
    }
}

function crearLinkSeguimiento(token, numeroPedidoElemento) {

    if (!token) {
        console.warn("La API no devolvió un token de seguimiento.");
        return;
    }

    let enlace = document.getElementById("linkSeguimiento");

    if (!enlace) {

        enlace = document.createElement("a");
        enlace.id = "linkSeguimiento";
        enlace.target = "_blank";
        enlace.rel = "noopener noreferrer";

        if (numeroPedidoElemento && numeroPedidoElemento.parentNode) {
            numeroPedidoElemento.parentNode.appendChild(enlace);
        }
    }

    enlace.href = "./seguimiento.html?t=" + encodeURIComponent(token);
    enlace.textContent = "📦 Ver seguimiento del pedido";
    enlace.style.display = "block";
    enlace.style.marginTop = "15px";
    enlace.style.textAlign = "center";
    enlace.style.fontWeight = "bold";
    enlace.style.cursor = "pointer";
}


/* ============================================================
   HELPERS
   ========================================================= */

function obtenerValor(id) {

    const elemento = document.getElementById(id);

    if (!elemento) return "";

    return String(elemento.value || "").trim();
}

function limpiarFormulario() {

    ["clienteNombre", "clienteTelefono", "clienteCalle", "clienteAltura", "clienteLocalidad", "montoEfectivo"]
        .forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.value = "";
        });

    seleccionarMedioPago("EFECTIVO");
}

function mostrarMensaje(texto) {

    const mensaje = document.getElementById("mensajePedido");

    if (!mensaje) {
        alert(texto);
        return;
    }

    mensaje.textContent = texto;

    setTimeout(() => { mensaje.textContent = ""; }, 4000);
}

function abrirVisor(src, alt) {

    const visor = document.getElementById("visorImagen");
    const imagen = document.getElementById("imagenGrande");

    if (!visor || !imagen) return;

    imagen.src = src;
    imagen.alt = alt || "";

    visor.classList.remove("oculto");
    document.body.classList.add("visor-abierto");
}

function cerrarVisor() {

    const visor = document.getElementById("visorImagen");

    if (!visor) return;

    visor.classList.add("oculto");
    document.body.classList.remove("visor-abierto");

    const imagen = document.getElementById("imagenGrande");

    if (imagen) {
        imagen.src = "";
        imagen.alt = "";
    }
}

function formatearPrecio(valor) {

    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    }).format(Number(valor || 0));
}
