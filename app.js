```javascript
"use strict";

/* ============================================================
   CONFIGURACIÓN
============================================================ */

const API_URL =
    "https://api.doneliopizzeria.com.ar";

const URL_GITHUB =
    "https://raw.githubusercontent.com/doneliopizza/CartaDigital/main";

const URL_PRODUCTOS =
    API_URL + "/productos";

const URL_FOTOS =
    URL_GITHUB + "/fotos/";

const URL_LOGO =
    URL_FOTOS + "logo.png";


/* ============================================================
   ESTADO
============================================================ */

let productos = [];

let rubroActivo = null;

let carrito = [];

let productoCompuestoActual = null;

let gruposCompuestoActual = [];

let seleccionesCompuesto = {};

let medioPagoSeleccionado = "EFECTIVO";


/* ============================================================
   INICIO
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const logo =
            document.getElementById("logo");

        if (logo) {

            logo.src =
                URL_LOGO +
                "?v=" +
                Date.now();

        }

        configurarEventos();

        configurarMediosPago();

        cargarProductos();

    }
);


/* ============================================================
   EVENTOS
============================================================ */

function configurarEventos() {

    const buscarProducto =
        document.getElementById("buscarProducto");

    if (buscarProducto) {

        buscarProducto.addEventListener(
            "input",
            mostrarProductos
        );

    }


    const btnCarrito =
        document.getElementById("btnCarrito");

    if (btnCarrito) {

        btnCarrito.addEventListener(
            "click",
            abrirCarrito
        );

    }


    const cerrarCarritoBtn =
        document.getElementById("cerrarCarrito");

    if (cerrarCarritoBtn) {

        cerrarCarritoBtn.addEventListener(
            "click",
            cerrarCarrito
        );

    }


    const cerrarCompuestoBtn =
        document.getElementById("cerrarCompuesto");

    if (cerrarCompuestoBtn) {

        cerrarCompuestoBtn.addEventListener(
            "click",
            cerrarCompuesto
        );

    }


    const confirmarCompuestoBtn =
        document.getElementById("confirmarCompuesto");

    if (confirmarCompuestoBtn) {

        confirmarCompuestoBtn.addEventListener(
            "click",
            confirmarCompuesto
        );

    }


    const cerrarClienteBtn =
        document.getElementById("cerrarCliente");

    if (cerrarClienteBtn) {

        cerrarClienteBtn.addEventListener(
            "click",
            cerrarCliente
        );

    }


    const continuarPedidoBtn =
        document.getElementById("btnContinuarPedido");

    if (continuarPedidoBtn) {

        continuarPedidoBtn.addEventListener(
            "click",
            abrirDatosCliente
        );

    }


    const enviarPedidoBtn =
        document.getElementById("btnEnviarPedido");

    if (enviarPedidoBtn) {

        enviarPedidoBtn.addEventListener(
            "click",
            enviarPedido
        );

    }


    const cerrarExitoBtn =
        document.getElementById("cerrarExito");

    if (cerrarExitoBtn) {

        cerrarExitoBtn.addEventListener(
            "click",
            () => {

                const modal =
                    document.getElementById("modalExito");

                if (modal) {

                    modal.classList.add("oculto");

                }

            }
        );

    }


    const cerrarImagen =
        document.getElementById("cerrarImagen");

    if (cerrarImagen) {

        cerrarImagen.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                cerrarVisor();

            }
        );

    }


    const visorImagen =
        document.getElementById("visorImagen");

    if (visorImagen) {

        visorImagen.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    visorImagen
                ) {

                    cerrarVisor();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                cerrarVisor();

                cerrarCompuesto();

                cerrarCarrito();

                cerrarCliente();

            }

        }
    );

}


/* ============================================================
   MEDIOS DE PAGO
============================================================ */

function configurarMediosPago() {

    const btnEfectivo =
        document.getElementById("btnPagoEfectivo");

    const btnTransferencia =
        document.getElementById("btnPagoTransferencia");

    const btnQR =
        document.getElementById("btnPagoQR");


    if (btnEfectivo) {

        btnEfectivo.addEventListener(
            "click",
            () => {

                seleccionarMedioPago("EFECTIVO");

            }
        );

    }


    if (btnTransferencia) {

        btnTransferencia.addEventListener(
            "click",
            () => {

                seleccionarMedioPago("TRANSFERENCIA");

            }
        );

    }


    if (btnQR) {

        btnQR.addEventListener(
            "click",
            () => {

                seleccionarMedioPago("MERCADO_PAGO_QR");

            }
        );

    }


    const btnCopiarAlias =
        document.getElementById("btnCopiarAlias");

    if (btnCopiarAlias) {

        btnCopiarAlias.addEventListener(
            "click",
            copiarAlias
        );

    }


    seleccionarMedioPago("EFECTIVO");

}


/* ============================================================
   SELECCIONAR MEDIO DE PAGO
============================================================ */

function seleccionarMedioPago(medio) {

    medioPagoSeleccionado =
        medio;


    const btnEfectivo =
        document.getElementById("btnPagoEfectivo");

    const btnTransferencia =
        document.getElementById("btnPagoTransferencia");

    const btnQR =
        document.getElementById("btnPagoQR");


    const opcionEfectivo =
        document.getElementById("opcionEfectivo");

    const opcionTransferencia =
        document.getElementById("opcionTransferencia");

    const opcionQR =
        document.getElementById("opcionQR");


    [
        btnEfectivo,
        btnTransferencia,
        btnQR
    ].forEach(
        boton => {

            if (boton) {

                boton.classList.remove("activo");

            }

        }
    );


    [
        opcionEfectivo,
        opcionTransferencia,
        opcionQR
    ].forEach(
        opcion => {

            if (opcion) {

                opcion.classList.add("oculto");

            }

        }
    );


    if (medio === "EFECTIVO") {

        if (btnEfectivo) {

            btnEfectivo.classList.add("activo");

        }

        if (opcionEfectivo) {

            opcionEfectivo.classList.remove("oculto");

        }

    }


    if (medio === "TRANSFERENCIA") {

        if (btnTransferencia) {

            btnTransferencia.classList.add("activo");

        }

        if (opcionTransferencia) {

            opcionTransferencia.classList.remove("oculto");

        }

    }


    if (medio === "MERCADO_PAGO_QR") {

        if (btnQR) {

            btnQR.classList.add("activo");

        }

        if (opcionQR) {

            opcionQR.classList.remove("oculto");

        }

    }

}


/* ============================================================
   COPIAR ALIAS
============================================================ */

async function copiarAlias() {

    const elemento =
        document.getElementById("aliasTransferencia");

    const mensaje =
        document.getElementById("mensajeAlias");


    if (!elemento) {

        return;

    }


    const alias =
        elemento.textContent.trim();


    try {

        await navigator.clipboard.writeText(alias);

        if (mensaje) {

            mensaje.textContent =
                "✓ Alias copiado correctamente.";

            setTimeout(
                () => {

                    mensaje.textContent = "";

                },
                3000
            );

        }

    } catch (error) {

        console.error(
            "Error copiando alias:",
            error
        );

        if (mensaje) {

            mensaje.textContent =
                "No se pudo copiar el alias. Copialo manualmente.";

        }

    }

}


/* ============================================================
   PRODUCTOS
============================================================ */

async function cargarProductos() {

    try {

        const respuesta =
            await fetch(
                URL_PRODUCTOS +
                "?v=" +
                Date.now()
            );


        if (!respuesta.ok) {

            throw new Error(
                "HTTP " +
                respuesta.status
            );

        }


        const datos =
            await respuesta.json();


        /*
         * La API puede devolver directamente
         * un array o un objeto con "productos".
         */

        if (Array.isArray(datos)) {

            productos = datos;

        } else if (
            datos &&
            Array.isArray(datos.productos)
        ) {

            productos =
                datos.productos;

        } else {

            productos = [];

        }


        console.log(
            "Productos recibidos desde LightPOS API:",
            productos
        );


        generarRubros();

        mostrarProductos();


    } catch (error) {

        console.error(
            "Error cargando productos:",
            error
        );


        const contenedor =
            document.getElementById("productos");


        if (contenedor) {

            contenedor.innerHTML = `
                <div class="mensaje-pedido">
                    No se pudo cargar la carta.
                </div>
            `;

        }

    }

}


/* ============================================================
   RUBROS
============================================================ */

function generarRubros() {

    const contenedor =
        document.getElementById("rubros");


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML = "";


    const rubros = {};


    productos.forEach(
        producto => {

            const id =
                Number(producto.rubro_id);


            if (!rubros[id]) {

                rubros[id] = {

                    id:
                        id,

                    nombre:
                        producto.rubro

                };

            }

        }
    );


    const rubrosOrdenados =
        Object.values(rubros)
            .sort(
                (a, b) =>
                    Number(a.id) -
                    Number(b.id)
            );


    const botonTodos =
        document.createElement("button");


    botonTodos.className =
        "boton-rubro activo";


    botonTodos.textContent =
        "Todos";


    botonTodos.addEventListener(
        "click",
        () => {

            rubroActivo =
                null;

            marcarRubroActivo(
                botonTodos
            );

            mostrarProductos();

        }
    );


    contenedor.appendChild(
        botonTodos
    );


    rubrosOrdenados.forEach(
        rubro => {

            const boton =
                document.createElement("button");


            boton.className =
                "boton-rubro";


            boton.textContent =
                rubro.nombre;


            boton.addEventListener(
                "click",
                () => {

                    rubroActivo =
                        rubro.id;

                    marcarRubroActivo(
                        boton
                    );

                    mostrarProductos();

                }
            );


            contenedor.appendChild(
                boton
            );

        }
    );

}


/* ============================================================
   RUBRO ACTIVO
============================================================ */

function marcarRubroActivo(
    botonSeleccionado
) {

    document
        .querySelectorAll(".boton-rubro")
        .forEach(
            boton => {

                boton.classList.remove(
                    "activo"
                );

            }
        );


    botonSeleccionado.classList.add(
        "activo"
    );

}


/* ============================================================
   MOSTRAR PRODUCTOS
============================================================ */

function mostrarProductos() {

    const contenedor =
        document.getElementById("productos");


    if (!contenedor) {

        return;

    }


    const campoBusqueda =
        document.getElementById("buscarProducto");


    const texto =
        campoBusqueda
            ? campoBusqueda.value
                .trim()
                .toLowerCase()
            : "";


    contenedor.innerHTML = "";


    const filtrados =
        productos
            .filter(
                producto => {

                    if (
                        rubroActivo !== null &&
                        Number(producto.rubro_id) !==
                        Number(rubroActivo)
                    ) {

                        return false;

                    }


                    if (
                        texto &&
                        !String(producto.nombre)
                            .toLowerCase()
                            .includes(texto)
                    ) {

                        return false;

                    }


                    return true;

                }
            )
            .sort(
                (a, b) => {

                    const rubroA =
                        Number(a.rubro_id);

                    const rubroB =
                        Number(b.rubro_id);


                    if (
                        rubroA !== rubroB
                    ) {

                        return rubroA - rubroB;

                    }


                    return String(
                        a.nombre || ""
                    ).localeCompare(
                        String(
                            b.nombre || ""
                        ),
                        "es",
                        {
                            sensitivity:
                                "base"
                        }
                    );

                }
            );


    if (!filtrados.length) {

        contenedor.innerHTML = `
            <p>
                No se encontraron productos.
            </p>
        `;

        return;

    }


    filtrados.forEach(
        producto => {

            const tarjeta =
                document.createElement("article");


            tarjeta.className =
                "producto";


            const imagen =
                document.createElement("img");


            imagen.className =
                "producto-imagen";


            imagen.alt =
                producto.nombre;


            imagen.src =
                obtenerImagen(producto);


            imagen.onerror = () => {

                imagen.onerror = null;

                imagen.src =
                    URL_LOGO;

            };


            imagen.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    abrirVisor(
                        imagen.src,
                        producto.nombre
                    );

                }
            );


            const info =
                document.createElement("div");


            info.className =
                "producto-info";


            const nombre =
                document.createElement("div");


            nombre.className =
                "producto-nombre";


            nombre.textContent =
                producto.nombre;


            const precio =
                document.createElement("div");


            precio.className =
                "producto-precio";


            precio.textContent =
                formatearPrecio(
                    producto.precio
                );


            const boton =
                document.createElement("button");


            boton.className =
                "producto-boton";


            /*
             * Ya no usamos solamente cant_min
             * para determinar si es compuesto.
             *
             * tipo_producto es la fuente principal.
             * Dejamos cant_min como compatibilidad
             * con productos viejos.
             */

            const esCompuesto =
                esProductoCompuesto(producto);


            boton.textContent =
                esCompuesto
                    ? "Elegir opciones"
                    : "Agregar";


            boton.addEventListener(
                "click",
                () => {

                    agregarProducto(
                        producto
                    );

                }
            );


            info.appendChild(nombre);

            info.appendChild(precio);

            info.appendChild(boton);

            tarjeta.appendChild(imagen);

            tarjeta.appendChild(info);

            contenedor.appendChild(tarjeta);

        }
    );

}


/* ============================================================
   DETECTAR PRODUCTO COMPUESTO
============================================================ */

function esProductoCompuesto(producto) {

    const tipo =
        String(
            producto.tipo_producto || ""
        ).toUpperCase();


    /*
     * Compatibilidad con distintos valores
     * que pueda tener la API.
     */

    if (
        tipo === "COMPUESTO" ||
        tipo === "COMBO" ||
        tipo === "VARIEDAD" ||
        tipo === "PRODUCTO_COMPUESTO"
    ) {

        return true;

    }


    /*
     * Compatibilidad con la estructura anterior.
     */

    if (
        Number(producto.cant_min || 0) > 0
    ) {

        return true;

    }


    /*
     * Si la API ya trae grupos,
     * también lo consideramos compuesto.
     */

    if (
        Array.isArray(producto.grupos) &&
        producto.grupos.length > 0
    ) {

        return true;

    }


    return false;

}


/* ============================================================
   IMAGEN
============================================================ */

function obtenerImagen(producto) {

    if (
        producto.url &&
        String(producto.url).trim() !== ""
    ) {

        return (
            URL_FOTOS +
            encodeURIComponent(
                String(producto.url).trim()
            ) +
            "?v=" +
            Date.now()
        );

    }


    return (
        URL_LOGO +
        "?v=" +
        Date.now()
    );

}


/* ============================================================
   AGREGAR PRODUCTO
============================================================ */

async function agregarProducto(
    producto
) {

    if (
        esProductoCompuesto(producto)
    ) {

        await abrirCompuesto(
            producto
        );

        return;

    }


    agregarSimple(
        producto
    );

}


/* ============================================================
   PRODUCTO SIMPLE
============================================================ */

function agregarSimple(
    producto
) {

    const existente =
        carrito.find(
            item =>
                item.producto_id ===
                    producto.id &&
                !item.compuesto
        );


    if (existente) {

        existente.cantidad++;

        existente.subtotal =
            existente.cantidad *
            existente.precio;

    } else {

        carrito.push({

            key:
                "P_" +
                producto.id,

            producto_id:
                producto.id,

            nombre:
                producto.nombre,

            precio:
                Number(producto.precio || 0),

            cantidad:
                1,

            subtotal:
                Number(producto.precio || 0),

            compuesto:
                false

        });

    }


    actualizarCarritoUI();

}


/* ============================================================
   CARGAR GRUPOS DESDE LIGHTPOS API
============================================================ */

async function obtenerGruposProducto(
    productoId
) {

    const respuesta =
        await fetch(
            API_URL +
            "/productos/" +
            encodeURIComponent(productoId) +
            "/grupos-completos?v=" +
            Date.now()
        );


    let datos = null;


    try {

        datos =
            await respuesta.json();

    } catch {

        datos = null;

    }


    if (!respuesta.ok) {

        throw new Error(
            datos?.detail ||
            "No se pudieron cargar las opciones del producto."
        );

    }


    return datos;

}


/* ============================================================
   ABRIR COMPUESTO
============================================================ */

async function abrirCompuesto(
    producto
) {

    productoCompuestoActual =
        producto;


    gruposCompuestoActual = [];

    seleccionesCompuesto = {};


    const titulo =
        document.getElementById(
            "compuestoTitulo"
        );


    if (titulo) {

        titulo.textContent =
            producto.nombre;

    }


    const reglas =
        document.getElementById(
            "compuestoReglas"
        );


    if (reglas) {

        reglas.textContent =
            "Cargando opciones...";

    }


    const modal =
        document.getElementById(
            "modalCompuesto"
        );


    if (modal) {

        modal.classList.remove(
            "oculto"
        );

    }


    try {

        const datos =
            await obtenerGruposProducto(
                producto.id
            );


        if (
            !datos ||
            !Array.isArray(datos.grupos)
        ) {

            throw new Error(
                "La API no devolvió grupos para este producto."
            );

        }


        gruposCompuestoActual =
            datos.grupos
                .filter(
                    grupo =>
                        grupo &&
                        (
                            grupo.activo === undefined ||
                            grupo.activo === true
                        )
                );


        if (
            !gruposCompuestoActual.length
        ) {

            cerrarCompuesto();

            mostrarMensaje(
                "Este producto no tiene grupos configurados."
            );

            return;

        }


        inicializarSeleccionesCompuesto();


        mostrarReglasGrupos();

        mostrarOpcionesCompuesto();


    } catch (error) {

        console.error(
            "Error cargando grupos del producto:",
            error
        );


        cerrarCompuesto();


        mostrarMensaje(
            error.message ||
            "No se pudieron cargar las opciones."
        );

    }

}


/* ============================================================
   INICIALIZAR SELECCIONES
============================================================ */

function inicializarSeleccionesCompuesto() {

    seleccionesCompuesto = {};


    gruposCompuestoActual.forEach(
        grupo => {

            seleccionesCompuesto[
                grupo.id
            ] = {};


            if (
                !Array.isArray(
                    grupo.opciones
                )
            ) {

                return;

            }


            grupo.opciones.forEach(
                opcion => {

                    /*
                     * Usamos componente_id como clave.
                     * Esto permite trabajar igual con opciones
                     * manuales y automáticas.
                     */

                    seleccionesCompuesto[
                        grupo.id
                    ][
                        opcion.componente_id
                    ] = 0;

                }
            );

        }
    );

}


/* ============================================================
   REGLAS DE GRUPOS
============================================================ */

function mostrarReglasGrupos() {

    const reglas =
        document.getElementById(
            "compuestoReglas"
        );


    if (!reglas) {

        return;

    }


    const textos = [];


    gruposCompuestoActual.forEach(
        grupo => {

            const min =
                Number(
                    grupo.minimo_selecciones || 0
                );

            const max =
                Number(
                    grupo.maximo_selecciones || 0
                );


            let texto =
                grupo.nombre;


            if (
                min &&
                max &&
                min === max
            ) {

                texto +=
                    `: elegí ${min}.`;

            } else if (
                min &&
                max
            ) {

                texto +=
                    `: entre ${min} y ${max}.`;

            } else if (min) {

                texto +=
                    `: al menos ${min}.`;

            } else if (max) {

                texto +=
                    `: hasta ${max}.`;

            }


            textos.push(texto);

        }
    );


    reglas.textContent =
        textos.join(" ");

}


/* ============================================================
   MOSTRAR OPCIONES COMPUESTO
============================================================ */

function mostrarOpcionesCompuesto() {

    const contenedor =
        document.getElementById(
            "opcionesCompuesto"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML = "";


    gruposCompuestoActual.forEach(
        grupo => {

            const bloque =
                document.createElement("div");


            bloque.className =
                "grupo-compuesto";


            const titulo =
                document.createElement("h3");


            titulo.textContent =
                grupo.nombre;


            bloque.appendChild(
                titulo
            );


            if (
                grupo.descripcion
            ) {

                const descripcion =
                    document.createElement("p");


                descripcion.textContent =
                    grupo.descripcion;


                bloque.appendChild(
                    descripcion
                );

            }


            if (
                !Array.isArray(
                    grupo.opciones
                ) ||
                !grupo.opciones.length
            ) {

                const sinOpciones =
                    document.createElement("p");


                sinOpciones.textContent =
                    "No hay opciones disponibles.";


                bloque.appendChild(
                    sinOpciones
                );


                contenedor.appendChild(
                    bloque
                );


                return;

            }


            grupo.opciones.forEach(
                opcion => {

                    crearFilaOpcion(
                        grupo,
                        opcion,
                        bloque
                    );

                }
            );


            contenedor.appendChild(
                bloque
            );

        }
    );


    actualizarTotalOpciones();

}


/* ============================================================
   CREAR FILA DE OPCIÓN
============================================================ */

function crearFilaOpcion(
    grupo,
    opcion,
    contenedor
) {

    const fila =
        document.createElement("div");


    fila.className =
        "opcion-compuesto";


    const nombre =
        document.createElement("div");


    nombre.className =
        "opcion-nombre";


    nombre.textContent =
        opcion.nombre;


    /*
     * En modo MAXIMO mostramos el precio
     * para que el cliente sepa qué está eligiendo.
     */

    if (
        String(grupo.modo_precio || "")
            .toUpperCase() ===
        "MAXIMO"
    ) {

        const precio =
            document.createElement("small");


        precio.textContent =
            " " +
            formatearPrecio(
                opcion.precio
            );


        nombre.appendChild(
            precio
        );

    }


    const menos =
        document.createElement("button");


    menos.type =
        "button";


    menos.textContent =
        "−";


    const cantidad =
        document.createElement("span");


    cantidad.className =
        "opcion-cantidad";


    cantidad.textContent =
        obtenerCantidadOpcion(
            grupo.id,
            opcion.componente_id
        );


    const mas =
        document.createElement("button");


    mas.type =
        "button";


    mas.textContent =
        "+";


    menos.addEventListener(
        "click",
        () => {

            const actual =
                obtenerCantidadOpcion(
                    grupo.id,
                    opcion.componente_id
                );


            if (actual <= 0) {

                return;

            }


            establecerCantidadOpcion(
                grupo.id,
                opcion.componente_id,
                actual - 1
            );


            cantidad.textContent =
                actual - 1;


            actualizarTotalOpciones();

        }
    );


    mas.addEventListener(
        "click",
        () => {

            const actual =
                obtenerCantidadOpcion(
                    grupo.id,
                    opcion.componente_id
                );


            const totalGrupo =
                obtenerTotalGrupo(
                    grupo.id
                );


            const maxGrupo =
                Number(
                    grupo.maximo_selecciones || 0
                );


            if (
                maxGrupo &&
                totalGrupo >= maxGrupo
            ) {

                mostrarMensaje(
                    `Máximo permitido en "${grupo.nombre}": ${maxGrupo}.`
                );

                return;

            }


            const maxOpcion =
                Number(
                    opcion.maximo_cantidad || 0
                );


            /*
             * Si maximo_cantidad = 0,
             * lo tratamos como sin límite.
             */

            if (
                maxOpcion &&
                actual >= maxOpcion
            ) {

                mostrarMensaje(
                    `Máximo permitido para ${opcion.nombre}: ${maxOpcion}.`
                );

                return;

            }


            establecerCantidadOpcion(
                grupo.id,
                opcion.componente_id,
                actual + 1
            );


            cantidad.textContent =
                actual + 1;


            actualizarTotalOpciones();

        }
    );


    fila.appendChild(
        nombre
    );

    fila.appendChild(
        menos
    );

    fila.appendChild(
        cantidad
    );

    fila.appendChild(
        mas
    );


    contenedor.appendChild(
        fila
    );

}


/* ============================================================
   OBTENER CANTIDAD OPCIÓN
============================================================ */

function obtenerCantidadOpcion(
    grupoId,
    componenteId
) {

    if (
        !seleccionesCompuesto[grupoId]
    ) {

        return 0;

    }


    return Number(
        seleccionesCompuesto[grupoId][componenteId] || 0
    );

}


/* ============================================================
   ESTABLECER CANTIDAD OPCIÓN
============================================================ */

function establecerCantidadOpcion(
    grupoId,
    componenteId,
    cantidad
) {

    if (
        !seleccionesCompuesto[grupoId]
    ) {

        seleccionesCompuesto[grupoId] = {};

    }


    seleccionesCompuesto[
        grupoId
    ][
        componenteId
    ] =
        Math.max(
            0,
            Number(cantidad || 0)
        );

}


/* ============================================================
   TOTAL DEL GRUPO
============================================================ */

function obtenerTotalGrupo(
    grupoId
) {

    if (
        !seleccionesCompuesto[grupoId]
    ) {

        return 0;

    }


    return Object.values(
        seleccionesCompuesto[grupoId]
    ).reduce(
        (
            total,
            cantidad
        ) =>
            total +
            Number(cantidad || 0),
        0
    );

}


/* ============================================================
   TOTAL OPCIONES
============================================================ */

function obtenerTotalOpciones() {

    return gruposCompuestoActual.reduce(
        (
            total,
            grupo
        ) =>
            total +
            obtenerTotalGrupo(
                grupo.id
            ),
        0
    );

}


/* ============================================================
   ACTUALIZAR TOTAL OPCIONES
============================================================ */

function actualizarTotalOpciones() {

    const elemento =
        document.getElementById(
            "totalOpciones"
        );


    if (elemento) {

        elemento.textContent =
            obtenerTotalOpciones();

    }

}


/* ============================================================
   VALIDAR GRUPOS
============================================================ */

function validarGruposCompuesto() {

    for (
        const grupo
        of gruposCompuestoActual
    ) {

        const total =
            obtenerTotalGrupo(
                grupo.id
            );


        const min =
            Number(
                grupo.minimo_selecciones || 0
            );

        const max =
            Number(
                grupo.maximo_selecciones || 0
            );


        if (
            min &&
            total < min
        ) {

            mostrarMensaje(
                `En "${grupo.nombre}" debés seleccionar al menos ${min}.`
            );

            return false;

        }


        if (
            max &&
            total > max
        ) {

            mostrarMensaje(
                `En "${grupo.nombre}" no podés seleccionar más de ${max}.`
            );

            return false;

        }

    }


    return true;

}


/* ============================================================
   CALCULAR PRECIO DEL COMPUESTO
============================================================ */

function calcularPrecioCompuesto() {

    const producto =
        productoCompuestoActual;


    let precioBase =
        Number(
            producto.precio || 0
        );


    /*
     * Por defecto el producto conserva
     * su precio normal.
     */

    for (
        const grupo
        of gruposCompuestoActual
    ) {

        const modo =
            String(
                grupo.modo_precio || "INCLUIDO"
            ).toUpperCase();


        if (
            modo !== "MAXIMO"
        ) {

            continue;

        }


        let precioMaximo =
            0;


        const selecciones =
            seleccionesCompuesto[
                grupo.id
            ] || {};


        Object.entries(
            selecciones
        ).forEach(
            (
                [
                    componenteId,
                    cantidad
                ]
            ) => {

                if (
                    Number(cantidad) <= 0
                ) {

                    return;

                }


                const opcion =
                    grupo.opciones?.find(
                        item =>
                            Number(
                                item.componente_id
                            ) ===
                            Number(
                                componenteId
                            )
                    );


                if (!opcion) {

                    return;

                }


                precioMaximo =
                    Math.max(
                        precioMaximo,
                        Number(
                            opcion.precio || 0
                        )
                    );

            }
        );


        precioBase =
            Math.max(
                precioBase,
                precioMaximo
            );

    }


    return precioBase;

}


/* ============================================================
   CONSTRUIR DETALLE DEL COMPUESTO
============================================================ */

function construirDetalleCompuesto() {

    const partes = [];


    gruposCompuestoActual.forEach(
        grupo => {

            const selecciones =
                seleccionesCompuesto[
                    grupo.id
                ] || {};


            const opciones =
                [];


            Object.entries(
                selecciones
            ).forEach(
                (
                    [
                        componenteId,
                        cantidad
                    ]
                ) => {

                    if (
                        Number(cantidad) <= 0
                    ) {

                        return;

                    }


                    const opcion =
                        grupo.opciones?.find(
                            item =>
                                Number(
                                    item.componente_id
                                ) ===
                                Number(
                                    componenteId
                                )
                        );


                    if (!opcion) {

                        return;

                    }


                    opciones.push({

                        componente_id:
                            opcion.componente_id,

                        nombre:
                            opcion.nombre,

                        cantidad:
                            Number(cantidad),

                        precio:
                            Number(
                                opcion.precio || 0
                            )

                    });

                }
            );


            if (opciones.length) {

                partes.push({

                    grupo_id:
                        grupo.id,

                    grupo_nombre:
                        grupo.nombre,

                    opciones:
                        opciones

                });

            }

        }
    );


    return partes;

}


/* ============================================================
   NOMBRE DEL COMPUESTO
============================================================ */

function construirNombreCompuesto() {

    const partes = [];


    gruposCompuestoActual.forEach(
        grupo => {

            const selecciones =
                seleccionesCompuesto[
                    grupo.id
                ] || {};


            const nombres = [];


            Object.entries(
                selecciones
            ).forEach(
                (
                    [
                        componenteId,
                        cantidad
                    ]
                ) => {

                    if (
                        Number(cantidad) <= 0
                    ) {

                        return;

                    }


                    const opcion =
                        grupo.opciones?.find(
                            item =>
                                Number(
                                    item.componente_id
                                ) ===
                                Number(
                                    componenteId
                                )
                        );


                    if (!opcion) {

                        return;

                    }


                    if (
                        Number(cantidad) === 1
                    ) {

                        nombres.push(
                            opcion.nombre
                        );

                    } else {

                        nombres.push(
                            `${cantidad} ${opcion.nombre}`
                        );

                    }

                }
            );


            if (nombres.length) {

                partes.push(
                    `${grupo.nombre}: ${nombres.join(", ")}`
                );

            }

        }
    );


    if (!partes.length) {

        return productoCompuestoActual.nombre;

    }


    return (
        productoCompuestoActual.nombre +
        " (" +
        partes.join(" | ") +
        ")"
    );

}


/* ============================================================
   CONFIRMAR COMPUESTO
============================================================ */

function confirmarCompuesto() {

    const producto =
        productoCompuestoActual;


    if (!producto) {

        return;

    }


    if (
        !validarGruposCompuesto()
    ) {

        return;

    }


    const total =
        obtenerTotalOpciones();


    if (total === 0) {

        mostrarMensaje(
            "Seleccioná al menos una opción."
        );

        return;

    }


    const precio =
        calcularPrecioCompuesto();


    const nombreFinal =
        construirNombreCompuesto();


    const detalle =
        construirDetalleCompuesto();


    carrito.push({

        key:
            "COMP_" +
            producto.id +
            "_" +
            Date.now(),

        producto_id:
            producto.id,

        nombre:
            nombreFinal,

        precio:
            precio,

        cantidad:
            1,

        subtotal:
            precio,

        compuesto:
            true,

        grupos:
            detalle,

        /*
         * Compatibilidad:
         * dejamos una representación plana
         * de las cantidades.
         */

        hijos:
            obtenerMapaCantidadesPlano()

    });


    cerrarCompuesto();

    actualizarCarritoUI();

}


/* ============================================================
   MAPA PLANO DE CANTIDADES
============================================================ */

function obtenerMapaCantidadesPlano() {

    const resultado = {};


    gruposCompuestoActual.forEach(
        grupo => {

            const selecciones =
                seleccionesCompuesto[
                    grupo.id
                ] || {};


            Object.entries(
                selecciones
            ).forEach(
                (
                    [
                        componenteId,
                        cantidad
                    ]
                ) => {

                    if (
                        Number(cantidad) > 0
                    ) {

                        resultado[
                            componenteId
                        ] =
                            Number(cantidad);

                    }

                }
            );

        }
    );


    return resultado;

}


/* ============================================================
   CERRAR COMPUESTO
============================================================ */

function cerrarCompuesto() {

    const modal =
        document.getElementById(
            "modalCompuesto"
        );


    if (modal) {

        modal.classList.add(
            "oculto"
        );

    }


    productoCompuestoActual =
        null;


    gruposCompuestoActual = [];

    seleccionesCompuesto = {};

}


/* ============================================================
   CARRITO
============================================================ */

function actualizarCarritoUI() {

    const cantidad =
        carrito.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.cantidad || 0
                ),
            0
        );


    const cantidadCarrito =
        document.getElementById(
            "cantidadCarrito"
        );


    if (cantidadCarrito) {

        cantidadCarrito.textContent =
            cantidad;

    }


    renderizarCarrito();

}


/* ============================================================
   SUBTOTAL
============================================================ */

function calcularSubtotal() {

    return carrito.reduce(
        (
            total,
            item
        ) =>
            total +
            Number(
                item.subtotal || 0
            ),
        0
    );

}


/* ============================================================
   RENDERIZAR CARRITO
============================================================ */

function renderizarCarrito() {

    const contenedor =
        document.getElementById(
            "listaCarrito"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML = "";


    if (!carrito.length) {

        contenedor.innerHTML =
            "<p>Tu pedido está vacío.</p>";

    }


    carrito.forEach(
        (
            item,
            index
        ) => {

            const fila =
                document.createElement("div");


            fila.className =
                "item-carrito";


            const izquierda =
                document.createElement("div");


            const nombre =
                document.createElement("div");


            nombre.className =
                "item-carrito-nombre";


            nombre.textContent =
                item.nombre;


            const detalle =
                document.createElement("div");


            detalle.className =
                "item-carrito-detalle";


            detalle.textContent =
                `${item.cantidad} x ${formatearPrecio(
                    item.precio
                )}`;


            izquierda.appendChild(
                nombre
            );


            izquierda.appendChild(
                detalle
            );


            const controles =
                document.createElement("div");


            controles.className =
                "item-carrito-controles";


            const menos =
                document.createElement("button");


            menos.type =
                "button";


            menos.textContent =
                "−";


            const cantidad =
                document.createElement("span");


            cantidad.textContent =
                item.cantidad;


            const mas =
                document.createElement("button");


            mas.type =
                "button";


            mas.textContent =
                "+";


            const eliminar =
                document.createElement("button");


            eliminar.type =
                "button";


            eliminar.textContent =
                "×";


            eliminar.className =
                "eliminar-item";


            menos.addEventListener(
                "click",
                () => {

                    item.cantidad--;


                    if (
                        item.cantidad <= 0
                    ) {

                        carrito.splice(
                            index,
                            1
                        );

                    } else {

                        item.subtotal =
                            item.cantidad *
                            item.precio;

                    }


                    actualizarCarritoUI();

                }
            );


            mas.addEventListener(
                "click",
                () => {

                    item.cantidad++;

                    item.subtotal =
                        item.cantidad *
                        item.precio;

                    actualizarCarritoUI();

                }
            );


            eliminar.addEventListener(
                "click",
                () => {

                    carrito.splice(
                        index,
                        1
                    );

                    actualizarCarritoUI();

                }
            );


            controles.appendChild(
                menos
            );

            controles.appendChild(
                cantidad
            );

            controles.appendChild(
                mas
            );

            controles.appendChild(
                eliminar
            );


            fila.appendChild(
                izquierda
            );

            fila.appendChild(
                controles
            );


            contenedor.appendChild(
                fila
            );

        }
    );


    const subtotal =
        calcularSubtotal();


    const subtotalElemento =
        document.getElementById(
            "subtotalCarrito"
        );


    if (subtotalElemento) {

        subtotalElemento.textContent =
            formatearPrecio(subtotal);

    }


    const totalElemento =
        document.getElementById(
            "totalCarrito"
        );


    if (totalElemento) {

        totalElemento.textContent =
            formatearPrecio(subtotal);

    }

}


/* ============================================================
   ABRIR CARRITO
============================================================ */

function abrirCarrito() {

    renderizarCarrito();


    const modal =
        document.getElementById(
            "modalCarrito"
        );


    if (modal) {

        modal.classList.remove(
            "oculto"
        );

    }

}


/* ============================================================
   CERRAR CARRITO
============================================================ */

function cerrarCarrito() {

    const modal =
        document.getElementById(
            "modalCarrito"
        );


    if (modal) {

        modal.classList.add(
            "oculto"
        );

    }

}


/* ============================================================
   DATOS CLIENTE
============================================================ */

function abrirDatosCliente() {

    if (!carrito.length) {

        alert(
            "Agregá al menos un producto."
        );

        return;

    }


    cerrarCarrito();


    const total =
        calcularSubtotal();


    const totalConfirmacion =
        document.getElementById(
            "totalConfirmacion"
        );


    if (totalConfirmacion) {

        totalConfirmacion.textContent =
            formatearPrecio(total);

    }


    seleccionarMedioPago(
        "EFECTIVO"
    );


    const modal =
        document.getElementById(
            "modalCliente"
        );


    if (modal) {

        modal.classList.remove(
            "oculto"
        );

    }

}


/* ============================================================
   CERRAR CLIENTE
============================================================ */

function cerrarCliente() {

    const modal =
        document.getElementById(
            "modalCliente"
        );


    if (modal) {

        modal.classList.add(
            "oculto"
        );

    }

}


/* ============================================================
   ENVIAR PEDIDO
============================================================ */

async function enviarPedido() {

    const nombre =
        obtenerValor("clienteNombre");


    const telefono =
        obtenerValor("clienteTelefono");


    const calle =
        obtenerValor("clienteCalle");


    const altura =
        obtenerValor("clienteAltura");


    const localidad =
        obtenerValor("clienteLocalidad");


    const montoEfectivo =
        Number(
            obtenerValor(
                "montoEfectivo"
            ) || 0
        );


    const total =
        calcularSubtotal();


    if (!nombre) {

        mostrarMensaje(
            "Ingresá tu nombre."
        );

        return;

    }


    if (!telefono) {

        mostrarMensaje(
            "Ingresá tu teléfono."
        );

        return;

    }


    if (!calle) {

        mostrarMensaje(
            "Ingresá la calle."
        );

        return;

    }


    if (!altura) {

        mostrarMensaje(
            "Ingresá la altura."
        );

        return;

    }


    if (!localidad) {

        mostrarMensaje(
            "Ingresá la localidad."
        );

        return;

    }


    if (
        medioPagoSeleccionado ===
        "EFECTIVO"
    ) {

        if (
            montoEfectivo > 0 &&
            montoEfectivo < total
        ) {

            mostrarMensaje(
                "El efectivo informado es menor al total."
            );

            return;

        }

    }


    /*
     * IMPORTANTE:
     *
     * Los grupos se mandan completos dentro del item
     * compuesto para que LightPOS pueda reconstruir
     * exactamente qué eligió el cliente.
     */

    const items =
        carrito.map(
            item => {

                const resultado = {

                    producto_id:
                        item.producto_id,

                    cantidad:
                        item.cantidad,

                    precio_unitario:
                        Number(
                            item.precio
                        ),

                    subtotal:
                        Number(
                            item.subtotal
                        ),

                    compuesto:
                        Boolean(
                            item.compuesto
                        ),

                    hijos:
                        item.compuesto
                            ? item.hijos
                            : {}

                };


                if (
                    item.compuesto &&
                    Array.isArray(item.grupos)
                ) {

                    resultado.grupos =
                        item.grupos;

                }


                return resultado;

            }
        );


    const pedido = {

        cliente: {

            nombre:
                nombre,

            telefono:
                telefono,

            calle:
                calle,

            altura:
                altura,

            localidad:
                localidad

        },


        nombre:
            nombre,

        telefono:
            telefono,

        direccion_entrega:
            `${calle} ${altura} - ${localidad}`,

        observaciones:
            `Cliente: ${nombre} | Teléfono: ${telefono}`,

        medio_pago:
            medioPagoSeleccionado,

        monto_efectivo:
            montoEfectivo,

        subtotal:
            total,

        total:
            total,

        items:
            items

    };


    console.log(
        "================================"
    );

    console.log(
        "PEDIDO A ENVIAR A LIGHTPOS API:"
    );

    console.log(
        pedido
    );

    console.log(
        "================================"
    );


    const boton =
        document.getElementById(
            "btnEnviarPedido"
        );


    if (boton) {

        boton.disabled =
            true;

        boton.textContent =
            "ENVIANDO...";

    }


    try {

        const respuesta =
            await fetch(
                API_URL +
                "/pedidos",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            pedido
                        )

                }
            );


        let datos;


        try {

            datos =
                await respuesta.json();

        } catch {

            datos = {};

        }


        if (!respuesta.ok) {

            throw new Error(
                datos.detail ||
                "No se pudo registrar el pedido."
            );

        }


        console.log(
            "PEDIDO REGISTRADO:",
            datos
        );


        const idPedido =
            datos.pedido_id ??
            datos.id ??
            "";


        const numero =
            datos.numero_pedido ??
            idPedido;


        const seguimientoUrl =
            datos.seguimiento_url ??
            "";


        cerrarCliente();


        carrito = [];


        actualizarCarritoUI();


        const numeroPedido =
            document.getElementById(
                "numeroPedido"
            );


        if (numeroPedido) {

            numeroPedido.textContent =
                "#" +
                numero;

        }


        crearLinkSeguimiento(
            seguimientoUrl,
            numeroPedido
        );


        const modalExito =
            document.getElementById(
                "modalExito"
            );


        if (modalExito) {

            modalExito.classList.remove(
                "oculto"
            );

        }


        limpiarFormulario();


    } catch (error) {

        console.error(
            "ERROR ENVIANDO PEDIDO:",
            error
        );


        mostrarMensaje(
            error.message ||
            "No se pudo enviar el pedido. Intentá nuevamente."
        );


    } finally {

        if (boton) {

            boton.disabled =
                false;

            boton.textContent =
                "ENVIAR PEDIDO";

        }

    }

}


/* ============================================================
   LINK SEGUIMIENTO
============================================================ */

function crearLinkSeguimiento(
    url,
    numeroPedidoElemento
) {

    if (!url) {

        console.warn(
            "La API no devolvió seguimiento_url."
        );

        return;

    }


    let enlace =
        document.getElementById(
            "linkSeguimiento"
        );


    if (!enlace) {

        enlace =
            document.createElement("a");


        enlace.id =
            "linkSeguimiento";


        enlace.target =
            "_blank";


        enlace.rel =
            "noopener noreferrer";


        if (
            numeroPedidoElemento &&
            numeroPedidoElemento.parentNode
        ) {

            numeroPedidoElemento.parentNode.appendChild(
                enlace
            );

        }

    }


    enlace.href =
        url;


    enlace.textContent =
        "📦 Ver seguimiento del pedido";


    enlace.style.display =
        "block";


    enlace.style.marginTop =
        "15px";


    enlace.style.textAlign =
        "center";


    enlace.style.fontWeight =
        "bold";


    enlace.style.cursor =
        "pointer";

}


/* ============================================================
   OBTENER VALOR INPUT
============================================================ */

function obtenerValor(id) {

    const elemento =
        document.getElementById(id);


    if (!elemento) {

        return "";

    }


    return String(
        elemento.value || ""
    ).trim();

}


/* ============================================================
   LIMPIAR FORMULARIO
============================================================ */

function limpiarFormulario() {

    [
        "clienteNombre",
        "clienteTelefono",
        "clienteCalle",
        "clienteAltura",
        "clienteLocalidad",
        "montoEfectivo"

    ].forEach(
        id => {

            const elemento =
                document.getElementById(id);


            if (elemento) {

                elemento.value =
                    "";

            }

        }
    );


    seleccionarMedioPago(
        "EFECTIVO"
    );

}


/* ============================================================
   MENSAJE
============================================================ */

function mostrarMensaje(texto) {

    const mensaje =
        document.getElementById(
            "mensajePedido"
        );


    if (!mensaje) {

        alert(texto);

        return;

    }


    mensaje.textContent =
        texto;


    setTimeout(
        () => {

            mensaje.textContent =
                "";

        },
        4000
    );

}


/* ============================================================
   VISOR DE IMÁGENES
============================================================ */

function abrirVisor(
    src,
    alt
) {

    const visor =
        document.getElementById(
            "visorImagen"
        );


    const imagen =
        document.getElementById(
            "imagenGrande"
        );


    if (
        !visor ||
        !imagen
    ) {

        return;

    }


    imagen.src =
        src;


    imagen.alt =
        alt || "";


    visor.classList.remove(
        "oculto"
    );


    document.body.classList.add(
        "visor-abierto"
    );

}


/* ============================================================
   CERRAR VISOR
============================================================ */

function cerrarVisor() {

    const visor =
        document.getElementById(
            "visorImagen"
        );


    if (!visor) {

        return;

    }


    visor.classList.add(
        "oculto"
    );


    document.body.classList.remove(
        "visor-abierto"
    );


    const imagen =
        document.getElementById(
            "imagenGrande"
        );


    if (imagen) {

        imagen.src =
            "";

        imagen.alt =
            "";

    }

}


/* ============================================================
   FORMATO PRECIO
============================================================ */

function formatearPrecio(
    valor
) {

    return new Intl.NumberFormat(
        "es-AR",
        {

            style:
                "currency",

            currency:
                "ARS",

            maximumFractionDigits:
                0

        }
    ).format(
        Number(
            valor || 0
        )
    );

}
```
