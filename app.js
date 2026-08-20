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

let cantidadesCompuesto = {};

let medioPagoSeleccionado = "Efectivo";
/* ============================================================
   INICIO
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const logo =
            document.getElementById(
                "logo"
            );

        if (logo) {

            logo.src =
                URL_LOGO +
                "?v=" +
                Date.now();

        }

        configurarEventos();

        cargarProductos();

    }
);


/* ============================================================
   EVENTOS
============================================================ */

function configurarEventos() {


    /* ========================================================
       BUSCAR PRODUCTO
    ======================================================== */

    const buscarProducto =
        document.getElementById(
            "buscarProducto"
        );

    if (buscarProducto) {

        buscarProducto.addEventListener(
            "input",
            mostrarProductos
        );

    }


    /* ========================================================
       CARRITO
    ======================================================== */

    const btnCarrito =
        document.getElementById(
            "btnCarrito"
        );

    if (btnCarrito) {

        btnCarrito.addEventListener(
            "click",
            abrirCarrito
        );

    }


    const cerrarCarritoBtn =
        document.getElementById(
            "cerrarCarrito"
        );

    if (cerrarCarritoBtn) {

        cerrarCarritoBtn.addEventListener(
            "click",
            cerrarCarrito
        );

    }


    /* ========================================================
       COMPUESTO
    ======================================================== */

    const cerrarCompuestoBtn =
        document.getElementById(
            "cerrarCompuesto"
        );

    if (cerrarCompuestoBtn) {

        cerrarCompuestoBtn.addEventListener(
            "click",
            cerrarCompuesto
        );

    }


    const confirmarCompuestoBtn =
        document.getElementById(
            "confirmarCompuesto"
        );

    if (confirmarCompuestoBtn) {

        confirmarCompuestoBtn.addEventListener(
            "click",
            confirmarCompuesto
        );

    }


    /* ========================================================
       CLIENTE
    ======================================================== */
    /* ========================================================
       MEDIOS DE PAGO
    ======================================================== */

    const btnPagoEfectivo =
        document.getElementById(
            "btnPagoEfectivo"
        );

    const btnPagoTransferencia =
        document.getElementById(
            "btnPagoTransferencia"
        );

    const btnPagoQR =
        document.getElementById(
            "btnPagoQR"
        );


    if (btnPagoEfectivo) {

        btnPagoEfectivo.addEventListener(
            "click",
            () => {

                seleccionarMedioPago(
                    "Efectivo"
                );

            }
        );

    }


    if (btnPagoTransferencia) {

        btnPagoTransferencia.addEventListener(
            "click",
            () => {

                seleccionarMedioPago(
                    "Transferencia"
                );

            }
        );

    }


    if (btnPagoQR) {

        btnPagoQR.addEventListener(
            "click",
            () => {

                seleccionarMedioPago(
                    "Mercado Pago QR"
                );

            }
        );

    }


    const btnCopiarAlias =
        document.getElementById(
            "btnCopiarAlias"
        );


    if (btnCopiarAlias) {

        btnCopiarAlias.addEventListener(
            "click",
            copiarAlias
        );

    }
    const cerrarClienteBtn =
        document.getElementById(
            "cerrarCliente"
        );

    if (cerrarClienteBtn) {

        cerrarClienteBtn.addEventListener(
            "click",
            cerrarCliente
        );

    }


    const continuarPedidoBtn =
        document.getElementById(
            "btnContinuarPedido"
        );

    if (continuarPedidoBtn) {

        continuarPedidoBtn.addEventListener(
            "click",
            abrirDatosCliente
        );

    }


    const enviarPedidoBtn =
        document.getElementById(
            "btnEnviarPedido"
        );

    if (enviarPedidoBtn) {

        enviarPedidoBtn.addEventListener(
            "click",
            enviarPedido
        );

    }


    /* ========================================================
       ÉXITO
    ======================================================== */

    const cerrarExitoBtn =
        document.getElementById(
            "cerrarExito"
        );

    if (cerrarExitoBtn) {

        cerrarExitoBtn.addEventListener(
            "click",
            () => {

                const modal =
                    document.getElementById(
                        "modalExito"
                    );

                if (modal) {

                    modal.classList.add(
                        "oculto"
                    );

                }

            }
        );

    }


    /* ========================================================
       VISOR DE IMÁGENES
    ======================================================== */

    const cerrarImagen =
        document.getElementById(
            "cerrarImagen"
        );

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
        document.getElementById(
            "visorImagen"
        );

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


    /* ========================================================
       ESCAPE
    ======================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                cerrarVisor();

                cerrarCompuesto();

                cerrarCarrito();

                cerrarCliente();

            }

        }
    );

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


        productos =
            await respuesta.json();


        console.log(
            "Productos recibidos:",
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
            document.getElementById(
                "productos"
            );


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
        document.getElementById(
            "rubros"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML = "";


    const rubros = {};


    productos.forEach(
        producto => {

            if (
                !rubros[
                    producto.rubro_id
                ]
            ) {

                rubros[
                    producto.rubro_id
                ] = {

                    id:
                        producto.rubro_id,

                    nombre:
                        producto.rubro

                };

            }

        }
    );


    /* ========================================================
       TODOS
    ======================================================== */

    const botonTodos =
        document.createElement(
            "button"
        );


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


    /* ========================================================
       RUBROS
    ======================================================== */

    Object.values(rubros).forEach(
        rubro => {

            const boton =
                document.createElement(
                    "button"
                );


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
        .querySelectorAll(
            ".boton-rubro"
        )
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
        document.getElementById(
            "productos"
        );


    if (!contenedor) {

        return;

    }


    const campoBusqueda =
        document.getElementById(
            "buscarProducto"
        );


    const texto =
        campoBusqueda
            ? campoBusqueda.value
                .trim()
                .toLowerCase()
            : "";


    contenedor.innerHTML = "";


    const filtrados =
        productos.filter(
            producto => {

                if (
                    rubroActivo !== null &&
                    Number(
                        producto.rubro_id
                    ) !==
                    Number(
                        rubroActivo
                    )
                ) {

                    return false;

                }


                if (
                    texto &&
                    !String(
                        producto.nombre
                    )
                    .toLowerCase()
                    .includes(
                        texto
                    )
                ) {

                    return false;

                }


                return true;

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
                document.createElement(
                    "article"
                );


            tarjeta.className =
                "producto";


            /* =================================================
               IMAGEN
            ================================================= */

            const imagen =
                document.createElement(
                    "img"
                );


            imagen.className =
                "producto-imagen";


            imagen.alt =
                producto.nombre;


            imagen.src =
                obtenerImagen(
                    producto
                );


            imagen.onerror = () => {

                imagen.onerror =
                    null;


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


            /* =================================================
               INFORMACIÓN
            ================================================= */

            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "producto-info";


            const nombre =
                document.createElement(
                    "div"
                );


            nombre.className =
                "producto-nombre";


            nombre.textContent =
                producto.nombre;


            const precio =
                document.createElement(
                    "div"
                );


            precio.className =
                "producto-precio";


            precio.textContent =
                formatearPrecio(
                    producto.precio
                );


            const boton =
                document.createElement(
                    "button"
                );


            boton.className =
                "producto-boton";



           boton.textContent =
                Number(
                    producto.cant_min || 0
                ) > 0
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


            info.appendChild(
                nombre
            );


            info.appendChild(
                precio
            );


            info.appendChild(
                boton
            );


            tarjeta.appendChild(
                imagen
            );


            tarjeta.appendChild(
                info
            );


            contenedor.appendChild(
                tarjeta
            );

        }
    );

}


/* ============================================================
   IMAGEN
============================================================ */

function obtenerImagen(
    producto
) {

    if (
        producto.url &&
        producto.url.trim() !== ""
    ) {

        return (
            URL_FOTOS +
            encodeURIComponent(
                producto.url.trim()
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

function agregarProducto(
    producto
) {

    const esCompuesto =
        Number(
            producto.cant_min || 0
        ) > 0;

    if (
        esCompuesto
    ) {

        if (
            !Array.isArray(
                producto.hijos
            ) ||
            producto.hijos.length === 0
        ) {

            mostrarMensaje(
                "Este producto compuesto no tiene opciones configuradas."
            );

            return;
        }

        abrirCompuesto(
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
                Number(
                    producto.precio
                ),

            cantidad:
                1,

            subtotal:
                Number(
                    producto.precio
                ),

            compuesto:
                false

        });

    }


    actualizarCarritoUI();

}


/* ============================================================
   COMPUESTO
============================================================ */

function abrirCompuesto(
    producto
) {

    productoCompuestoActual =
        producto;


    cantidadesCompuesto = {};


    if (
        !Array.isArray(
            producto.hijos
        )
    ) {

        mostrarMensaje(
            "Este producto no tiene opciones configuradas."
        );

        return;

    }


    producto.hijos.forEach(
        hijo => {

            cantidadesCompuesto[
                hijo.id
            ] = 0;

        }
    );


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
            generarTextoReglas(
                producto
            );

    }


    mostrarOpcionesCompuesto();


    const modal =
        document.getElementById(
            "modalCompuesto"
        );


    if (modal) {

        modal.classList.remove(
            "oculto"
        );

    }

}


/* ============================================================
   REGLAS COMPUESTO
============================================================ */

function generarTextoReglas(
    producto
) {

    const min =
        Number(
            producto.cant_min || 0
        );


    const max =
        Number(
            producto.cant_max || 0
        );


    if (
        min &&
        max &&
        min === max
    ) {

        return (
            `Elegí ${min} opciones.`
        );

    }


    if (
        min &&
        max
    ) {

        return (
            `Elegí entre ${min} y ${max} opciones.`
        );

    }


    if (min) {

        return (
            `Elegí al menos ${min} opciones.`
        );

    }


    if (max) {

        return (
            `Elegí hasta ${max} opciones.`
        );

    }


    return (
        "Elegí las opciones que quieras."
    );

}


/* ============================================================
   OPCIONES COMPUESTO
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


    productoCompuestoActual.hijos.forEach(
        hijo => {

            const fila =
                document.createElement(
                    "div"
                );


            fila.className =
                "opcion-compuesto";


            const nombre =
                document.createElement(
                    "div"
                );


            nombre.className =
                "opcion-nombre";


            nombre.textContent =
                hijo.nombre;


            const menos =
                document.createElement(
                    "button"
                );


            menos.type =
                "button";


            menos.textContent =
                "−";


            const cantidad =
                document.createElement(
                    "span"
                );


            cantidad.className =
                "opcion-cantidad";


            cantidad.textContent =
                cantidadesCompuesto[
                    hijo.id
                ];


            const mas =
                document.createElement(
                    "button"
                );


            mas.type =
                "button";


            mas.textContent =
                "+";


            menos.addEventListener(
                "click",
                () => {

                    if (
                        cantidadesCompuesto[
                            hijo.id
                        ] > 0
                    ) {

                        cantidadesCompuesto[
                            hijo.id
                        ]--;


                        cantidad.textContent =
                            cantidadesCompuesto[
                                hijo.id
                            ];


                        actualizarTotalOpciones();

                    }

                }
            );


            mas.addEventListener(
                "click",
                () => {

                    const total =
                        obtenerTotalOpciones();


                    const max =
                        Number(
                            productoCompuestoActual
                                .cant_max || 0
                        );


                    if (
                        max &&
                        total >= max
                    ) {

                        mostrarMensaje(
                            `Máximo permitido: ${max}`
                        );

                        return;

                    }


                    cantidadesCompuesto[
                        hijo.id
                    ]++;


                    cantidad.textContent =
                        cantidadesCompuesto[
                            hijo.id
                        ];


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
    );


    actualizarTotalOpciones();

}


/* ============================================================
   TOTAL OPCIONES
============================================================ */

function obtenerTotalOpciones() {

    return Object.values(
        cantidadesCompuesto
    ).reduce(
        (
            total,
            cantidad
        ) =>
            total +
            Number(
                cantidad
            ),
        0
    );

}


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
   CONFIRMAR COMPUESTO
============================================================ */

function confirmarCompuesto() {

    const producto =
        productoCompuestoActual;


    if (!producto) {

        return;

    }


    const total =
        obtenerTotalOpciones();


    const min =
        Number(
            producto.cant_min || 0
        );


    const max =
        Number(
            producto.cant_max || 0
        );


    if (
        min &&
        total < min
    ) {

        mostrarMensaje(
            `Debés seleccionar al menos ${min} opciones.`
        );

        return;

    }


    if (
        max &&
        total > max
    ) {

        mostrarMensaje(
            `No podés seleccionar más de ${max} opciones.`
        );

        return;

    }


    if (total === 0) {

        mostrarMensaje(
            "Seleccioná al menos una opción."
        );

        return;

    }


    const partes = [];


    producto.hijos.forEach(
        hijo => {

            const cantidad =
                cantidadesCompuesto[
                    hijo.id
                ];


            if (cantidad > 0) {

                partes.push(
                    `${cantidad} ${hijo.nombre}`
                );

            }

        }
    );


    const nombreFinal =
        `${producto.nombre} (${partes.join(", ")})`;


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
            Number(
                producto.precio
            ),

        cantidad:
            1,

        subtotal:
            Number(
                producto.precio
            ),

        compuesto:
            true,

        hijos:
            {
                ...cantidadesCompuesto
            }

    });


    cerrarCompuesto();

    actualizarCarritoUI();

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


    cantidadesCompuesto = {};

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
                item.cantidad,
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
   CALCULAR SUBTOTAL
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
                document.createElement(
                    "div"
                );


            fila.className =
                "item-carrito";


            const izquierda =
                document.createElement(
                    "div"
                );


            const nombre =
                document.createElement(
                    "div"
                );


            nombre.className =
                "item-carrito-nombre";


            nombre.textContent =
                item.nombre;


            const detalle =
                document.createElement(
                    "div"
                );


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
                document.createElement(
                    "div"
                );


            controles.className =
                "item-carrito-controles";


            const menos =
                document.createElement(
                    "button"
                );


            menos.type =
                "button";


            menos.textContent =
                "−";


            const cantidad =
                document.createElement(
                    "span"
                );


            cantidad.textContent =
                item.cantidad;


            const mas =
                document.createElement(
                    "button"
                );


            mas.type =
                "button";


            mas.textContent =
                "+";


            const eliminar =
                document.createElement(
                    "button"
                );


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
            formatearPrecio(
                subtotal
            );

    }


    const totalElemento =
        document.getElementById(
            "totalCarrito"
        );


    if (totalElemento) {

        totalElemento.textContent =
            formatearPrecio(
                subtotal
            );

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
            formatearPrecio(
                total
            );

    }


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
        obtenerValor(
            "clienteNombre"
        );


    const telefono =
        obtenerValor(
            "clienteTelefono"
        );


    const calle =
        obtenerValor(
            "clienteCalle"
        );


    const altura =
        obtenerValor(
            "clienteAltura"
        );


    const localidad =
        obtenerValor(
            "clienteLocalidad"
        );


    const montoEfectivo =
        Number(
            obtenerValor(
                "montoEfectivo"
            ) || 0
        );


    const total =
        calcularSubtotal();


    /* ========================================================
       VALIDACIONES
    ======================================================== */

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
        montoEfectivo > 0 &&
        montoEfectivo < total
    ) {

        mostrarMensaje(
            "El efectivo informado es menor al total."
        );

        return;

    }


    /* ========================================================
       ITEMS
    ======================================================== */

    const items =
        carrito.map(
            item => ({

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

            })
        );


    /* ========================================================
       PEDIDO
    ======================================================== */

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

        medio_pago:
            "EFECTIVO",

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
        "PEDIDO A ENVIAR:"
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

        /* ====================================================
           ENVIAR A FASTAPI
        ==================================================== */

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


        /* ====================================================
           DATOS DEVUELTOS POR LA API
        ==================================================== */

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


        /* ====================================================
           CERRAR DATOS CLIENTE
        ==================================================== */

        cerrarCliente();


        /* ====================================================
           VACIAR CARRITO
        ==================================================== */

        carrito = [];


        actualizarCarritoUI();


        /* ====================================================
           MOSTRAR NÚMERO PEDIDO
        ==================================================== */

        const numeroPedido =
            document.getElementById(
                "numeroPedido"
            );


        if (numeroPedido) {

            numeroPedido.textContent =
                "#" +
                numero;

        }


        /* ====================================================
           LINK DE SEGUIMIENTO
        ==================================================== */

        crearLinkSeguimiento(
            seguimientoUrl,
            numeroPedido
        );


        /* ====================================================
           MOSTRAR MODAL ÉXITO
        ==================================================== */

        const modalExito =
            document.getElementById(
                "modalExito"
            );


        if (modalExito) {

            modalExito.classList.remove(
                "oculto"
            );

        }


        /* ====================================================
           LIMPIAR FORMULARIO
        ==================================================== */

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
   CREAR LINK SEGUIMIENTO
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
            document.createElement(
                "a"
            );


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

function obtenerValor(
    id
) {

    const elemento =
        document.getElementById(
            id
        );


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
                document.getElementById(
                    id
                );


            if (elemento) {

                elemento.value =
                    "";

            }

        }
    );

}


/* ============================================================
   MENSAJE
============================================================ */

function mostrarMensaje(
    texto
) {

    const mensaje =
        document.getElementById(
            "mensajePedido"
        );


    if (!mensaje) {

        alert(
            texto
        );

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
