"use strict";

/* ============================================================
   CONFIGURACIÓN
============================================================ */

// CAMBIAR POR LA URL REAL DE TU API EN RENDER

const API_URL = "https://cartadigitalapi.onrender.com";


// GitHub

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


/* ============================================================
   INICIO
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("logo").src =
        URL_LOGO + "?v=" + Date.now();

    configurarEventos();

    cargarProductos();

});


/* ============================================================
   EVENTOS
============================================================ */

function configurarEventos() {

    document
        .getElementById("buscarProducto")
        .addEventListener("input", mostrarProductos);


    document
        .getElementById("btnCarrito")
        .addEventListener("click", abrirCarrito);


    document
        .getElementById("cerrarCarrito")
        .addEventListener("click", cerrarCarrito);


    document
        .getElementById("cerrarCompuesto")
        .addEventListener("click", cerrarCompuesto);


    document
        .getElementById("confirmarCompuesto")
        .addEventListener(
            "click",
            confirmarCompuesto
        );


    document
        .getElementById("cerrarCliente")
        .addEventListener(
            "click",
            cerrarCliente
        );


    document
        .getElementById("btnContinuarPedido")
        .addEventListener(
            "click",
            abrirDatosCliente
        );


    document
        .getElementById("btnEnviarPedido")
        .addEventListener(
            "click",
            enviarPedido
        );


    document
        .getElementById("cerrarExito")
        .addEventListener(
            "click",
            () => {
                document
                    .getElementById("modalExito")
                    .classList.add("oculto");
            }
        );


    document
        .getElementById("cerrarImagen")
        .addEventListener(
            "click",
            cerrarVisor
        );


    document
        .getElementById("visorImagen")
        .addEventListener(
            "click",
            event => {

                if (
                    event.target.id === "visorImagen"
                ) {
                    cerrarVisor();
                }

            }
        );

}


/* ============================================================
   PRODUCTOS
============================================================ */

async function cargarProductos() {

    try {

        const respuesta = await fetch(
            URL_PRODUCTOS + "?v=" + Date.now()
        );

        if (!respuesta.ok) {
            throw new Error(
                "HTTP " + respuesta.status
            );
        }

        productos = await respuesta.json();

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

        document.getElementById(
            "productos"
        ).innerHTML = `
            <div class="mensaje-pedido">
                No se pudo cargar la carta.
            </div>
        `;

    }

}


/* ============================================================
   RUBROS
============================================================ */

function generarRubros() {

    const contenedor =
        document.getElementById("rubros");

    contenedor.innerHTML = "";


    const rubros = {};

    productos.forEach(producto => {

        if (!rubros[producto.rubro_id]) {

            rubros[producto.rubro_id] = {
                id: producto.rubro_id,
                nombre: producto.rubro
            };

        }

    });


    const botonTodos =
        document.createElement("button");

    botonTodos.className =
        "boton-rubro activo";

    botonTodos.textContent =
        "Todos";

    botonTodos.addEventListener(
        "click",
        () => {

            rubroActivo = null;

            marcarRubroActivo(
                botonTodos
            );

            mostrarProductos();

        }
    );

    contenedor.appendChild(
        botonTodos
    );


    Object.values(rubros).forEach(rubro => {

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

    });

}


/* ============================================================
   RUBRO ACTIVO
============================================================ */

function marcarRubroActivo(botonSeleccionado) {

    document
        .querySelectorAll(".boton-rubro")
        .forEach(boton => {

            boton.classList.remove(
                "activo"
            );

        });


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

    const texto =
        document
            .getElementById("buscarProducto")
            .value
            .trim()
            .toLowerCase();


    contenedor.innerHTML = "";


    const filtrados =
        productos.filter(producto => {

            if (
                rubroActivo !== null &&
                producto.rubro_id !== rubroActivo
            ) {
                return false;
            }

            if (
                texto &&
                !producto.nombre
                    .toLowerCase()
                    .includes(texto)
            ) {
                return false;
            }

            return true;

        });


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

                imagen.src =
                    URL_LOGO;

            };


            imagen.addEventListener(
                "click",
                () => {

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

            boton.textContent =
                producto.es_compuesto
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

            contenedor.appendChild(
                tarjeta
            );

        }
    );

}


/* ============================================================
   IMAGEN
============================================================ */

function obtenerImagen(producto) {

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

    return URL_LOGO;
}


/* ============================================================
   AGREGAR PRODUCTO
============================================================ */

function agregarProducto(producto) {

    if (
        producto.es_compuesto &&
        Array.isArray(producto.hijos)
    ) {

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

function agregarSimple(producto) {

    const existente =
        carrito.find(
            item =>
                item.producto_id === producto.id &&
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
                Number(producto.precio),

            cantidad:
                1,

            subtotal:
                Number(producto.precio),

            compuesto:
                false

        });

    }


    actualizarCarritoUI();

}


/* ============================================================
   COMPUESTO
============================================================ */

function abrirCompuesto(producto) {

    productoCompuestoActual =
        producto;

    cantidadesCompuesto = {};


    producto.hijos.forEach(
        hijo => {

            cantidadesCompuesto[
                hijo.id
            ] = 0;

        }
    );


    document.getElementById(
        "compuestoTitulo"
    ).textContent =
        producto.nombre;


    document.getElementById(
        "compuestoReglas"
    ).textContent =
        generarTextoReglas(
            producto
        );


    mostrarOpcionesCompuesto();


    document
        .getElementById("modalCompuesto")
        .classList.remove("oculto");

}


/* ============================================================
   REGLAS COMPUESTO
============================================================ */

function generarTextoReglas(producto) {

    const min =
        Number(producto.cant_min || 0);

    const max =
        Number(producto.cant_max || 0);


    if (min && max && min === max) {

        return `Elegí ${min} opciones.`;

    }

    if (min && max) {

        return `Elegí entre ${min} y ${max} opciones.`;

    }

    if (min) {

        return `Elegí al menos ${min} opciones.`;

    }

    if (max) {

        return `Elegí hasta ${max} opciones.`;

    }

    return "Elegí las opciones que quieras.";

}


/* ============================================================
   OPCIONES COMPUESTO
============================================================ */

function mostrarOpcionesCompuesto() {

    const contenedor =
        document.getElementById(
            "opcionesCompuesto"
        );

    contenedor.innerHTML = "";


    productoCompuestoActual.hijos.forEach(
        hijo => {

            const fila =
                document.createElement("div");

            fila.className =
                "opcion-compuesto";


            const nombre =
                document.createElement("div");

            nombre.className =
                "opcion-nombre";

            nombre.textContent =
                hijo.nombre;


            const menos =
                document.createElement("button");

            menos.textContent =
                "−";


            const cantidad =
                document.createElement("span");

            cantidad.className =
                "opcion-cantidad";

            cantidad.textContent =
                cantidadesCompuesto[
                    hijo.id
                ];


            const mas =
                document.createElement("button");

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


            fila.appendChild(nombre);
            fila.appendChild(menos);
            fila.appendChild(cantidad);
            fila.appendChild(mas);

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
        (total, cantidad) =>
            total + Number(cantidad),
        0
    );

}


function actualizarTotalOpciones() {

    document.getElementById(
        "totalOpciones"
    ).textContent =
        obtenerTotalOpciones();

}


/* ============================================================
   CONFIRMAR COMPUESTO
============================================================ */

function confirmarCompuesto() {

    const producto =
        productoCompuestoActual;


    const total =
        obtenerTotalOpciones();


    const min =
        Number(producto.cant_min || 0);

    const max =
        Number(producto.cant_max || 0);


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
            Number(producto.precio),

        cantidad:
            1,

        subtotal:
            Number(producto.precio),

        compuesto:
            true,

        hijos:
            { ...cantidadesCompuesto }

    });


    cerrarCompuesto();

    actualizarCarritoUI();

}


/* ============================================================
   CERRAR COMPUESTO
============================================================ */

function cerrarCompuesto() {

    document
        .getElementById(
            "modalCompuesto"
        )
        .classList.add("oculto");

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
            (total, item) =>
                total + item.cantidad,
            0
        );


    document.getElementById(
        "cantidadCarrito"
    ).textContent =
        cantidad;


    renderizarCarrito();

}


function calcularSubtotal() {

    return carrito.reduce(
        (total, item) =>
            total + item.subtotal,
        0
    );

}


function renderizarCarrito() {

    const contenedor =
        document.getElementById(
            "listaCarrito"
        );

    contenedor.innerHTML = "";


    if (!carrito.length) {

        contenedor.innerHTML =
            "<p>Tu pedido está vacío.</p>";

    }


    carrito.forEach(
        (item, index) => {

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
                `${item.cantidad} x ${formatearPrecio(item.precio)}`;


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

            menos.textContent =
                "−";


            const cantidad =
                document.createElement("span");

            cantidad.textContent =
                item.cantidad;


            const mas =
                document.createElement("button");

            mas.textContent =
                "+";


            const eliminar =
                document.createElement("button");

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


    document.getElementById(
        "subtotalCarrito"
    ).textContent =
        formatearPrecio(subtotal);


    document.getElementById(
        "totalCarrito"
    ).textContent =
        formatearPrecio(subtotal);

}


/* ============================================================
   ABRIR CARRITO
============================================================ */

function abrirCarrito() {

    renderizarCarrito();

    document
        .getElementById(
            "modalCarrito"
        )
        .classList.remove(
            "oculto"
        );

}


function cerrarCarrito() {

    document
        .getElementById(
            "modalCarrito"
        )
        .classList.add(
            "oculto"
        );

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


    document.getElementById(
        "totalConfirmacion"
    ).textContent =
        formatearPrecio(
            calcularSubtotal()
        );


    document
        .getElementById(
            "modalCliente"
        )
        .classList.remove(
            "oculto"
        );

}


function cerrarCliente() {

    document
        .getElementById(
            "modalCliente"
        )
        .classList.add(
            "oculto"
        );

}


/* ============================================================
   ENVIAR PEDIDO
============================================================ */

async function enviarPedido() {

    const nombre =
        document
            .getElementById(
                "clienteNombre"
            )
            .value
            .trim();


    const telefono =
        document
            .getElementById(
                "clienteTelefono"
            )
            .value
            .trim();


    const calle =
        document
            .getElementById(
                "clienteCalle"
            )
            .value
            .trim();


    const altura =
        document
            .getElementById(
                "clienteAltura"
            )
            .value
            .trim();


    const localidad =
        document
            .getElementById(
                "clienteLocalidad"
            )
            .value
            .trim();


    const montoEfectivo =
        Number(
            document
                .getElementById(
                    "montoEfectivo"
                )
                .value || 0
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
        montoEfectivo > 0 &&
        montoEfectivo < total
    ) {

        mostrarMensaje(
            "El efectivo informado es menor al total."
        );

        return;

    }


    const items =
        carrito.map(
            item => ({

                producto_id:
                    item.producto_id,

                cantidad:
                    item.cantidad,

                precio_unitario:
                    item.precio,

                subtotal:
                    item.subtotal,

                compuesto:
                    item.compuesto,

                hijos:
                    item.compuesto
                        ? item.hijos
                        : {}

            })
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
        "PEDIDO A ENVIAR:",
        pedido
    );


    const boton =
        document.getElementById(
            "btnEnviarPedido"
        );


    boton.disabled = true;

    boton.textContent =
        "ENVIANDO...";


    try {

        const respuesta =
            await fetch(
                API_URL + "/pedidos",
                {

                    method: "POST",

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


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.detail ||
                "No se pudo registrar el pedido."
            );

        }


        cerrarCliente();


        carrito = [];

        actualizarCarritoUI();


        document.getElementById(
            "numeroPedido"
        ).textContent =
            "#" + datos.pedido_id;


        document
            .getElementById(
                "modalExito"
            )
            .classList.remove(
                "oculto"
            );


        limpiarFormulario();


    } catch (error) {

        console.error(
            error
        );

        mostrarMensaje(
            "No se pudo enviar el pedido. Intentá nuevamente."
        );

    } finally {

        boton.disabled = false;

        boton.textContent =
            "ENVIAR PEDIDO";

    }

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

            document
                .getElementById(id)
                .value = "";

        }
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
   IMÁGENES
============================================================ */

function abrirVisor(
    src,
    alt
) {

    document.getElementById(
        "imagenGrande"
    ).src = src;

    document.getElementById(
        "imagenGrande"
    ).alt = alt;


    document
        .getElementById(
            "visorImagen"
        )
        .classList.remove(
            "oculto"
        );

}


function cerrarVisor() {

    document
        .getElementById(
            "visorImagen"
        )
        .classList.add(
            "oculto"
        );

}


/* ============================================================
   FORMATO PRECIO
============================================================ */

function formatearPrecio(valor) {

    return new Intl.NumberFormat(
        "es-AR",
        {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0
        }
    ).format(
        Number(valor || 0)
    );

}
