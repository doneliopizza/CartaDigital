"use strict";


/* ============================================================
   CONFIGURACIÓN
============================================================ */

const API_URL =
    "https://cartadigitalapi.onrender.com";

const URL_PEDIDOS =
    API_URL + "/pedidos/activos";


/* ============================================================
   ESTADOS
============================================================ */

const ESTADOS = {

    1: {
        nombre: "En preparación"
    },

    2: {
        nombre: "Listo"
    },

    3: {
        nombre: "Enviar delivery"
    },

    4: {
        nombre: "Finalizado"
    }

};


/* ============================================================
   ELEMENTOS
============================================================ */

const columna1 =
    document.getElementById("columna1");

const columna2 =
    document.getElementById("columna2");

const columna3 =
    document.getElementById("columna3");

const columna4 =
    document.getElementById("columna4");

const cantidadPedidos =
    document.getElementById(
        "cantidadPedidos"
    );

const ultimaActualizacion =
    document.getElementById(
        "ultimaActualizacion"
    );

const indicadorConexion =
    document.getElementById(
        "indicadorConexion"
    );

const textoConexion =
    document.getElementById(
        "textoConexion"
    );

const btnActualizar =
    document.getElementById(
        "btnActualizar"
    );

const modal =
    document.getElementById(
        "modal"
    );

const modalContenido =
    document.getElementById(
        "modalContenido"
    );

const cerrarModal =
    document.getElementById(
        "cerrarModal"
    );


/* ============================================================
   ESCAPAR HTML
============================================================ */

function escaparHTML(valor) {

    if (valor === null ||
        valor === undefined) {

        return "";

    }

    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* ============================================================
   FORMATEAR DINERO
============================================================ */

function dinero(valor) {

    const numero =
        Number(valor || 0);

    return numero.toLocaleString(
        "es-AR",
        {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0
        }
    );

}


/* ============================================================
   FORMATEAR FECHA
============================================================ */

function fecha(valor) {

    if (!valor) {

        return "";

    }

    const fechaObjeto =
        new Date(valor);

    if (
        Number.isNaN(
            fechaObjeto.getTime()
        )
    ) {

        return "";

    }

    return fechaObjeto.toLocaleString(
        "es-AR",
        {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* ============================================================
   CONEXIÓN ONLINE
============================================================ */

function conexionOK() {

    indicadorConexion.classList.remove(
        "offline"
    );

    indicadorConexion.classList.add(
        "online"
    );

    textoConexion.textContent =
        "Conectado";

}


/* ============================================================
   CONEXIÓN OFFLINE
============================================================ */

function conexionError() {

    indicadorConexion.classList.remove(
        "online"
    );

    indicadorConexion.classList.add(
        "offline"
    );

    textoConexion.textContent =
        "Sin conexión";

}


/* ============================================================
   CREAR TARJETA
============================================================ */

function crearPedidoHTML(pedido) {

    const cliente =
        extraerCliente(
            pedido
        );

    const direccion =
        pedido.direccion_entrega ||
        "Sin dirección";

    const detalle =
        pedido.detalle || [];


    let productosHTML = "";


    for (const item of detalle) {

        const cantidad =
            Number(
                item.cantidad || 0
            );

        const nombre =
            item.nombre_producto ||
            `Producto #${item.producto_id}`;

        productosHTML += `

            <div class="producto-linea">

                <span class="producto-nombre">

                    ${escaparHTML(nombre)}

                </span>

                <span class="producto-cantidad">

                    x${cantidad}

                </span>

            </div>

        `;

    }


    if (!productosHTML) {

        productosHTML = `
            <div class="vacio">
                Sin detalle
            </div>
        `;

    }


    return `

        <article
            class="pedido"
            data-id="${pedido.id}"
        >

            <div class="pedido-header">

                <span class="numero-pedido">

                    #${escaparHTML(
                        pedido.numero_pedido ||
                        pedido.id
                    )}

                </span>

                <span class="total">

                    ${dinero(pedido.total)}

                </span>

            </div>


            <div class="cliente">

                👤
                ${escaparHTML(cliente.nombre)}

            </div>


            <div class="direccion">

                📍
                ${escaparHTML(direccion)}

            </div>


            <div class="productos">

                ${productosHTML}

            </div>


            <div class="pago">

                💳
                ${escaparHTML(
                    pedido.medio_pago ||
                    "No informado"
                )}

                ${
                    pedido.fecha_inicio
                    ? ` · 🕐 ${fecha(pedido.fecha_inicio)}`
                    : ""
                }

            </div>

        </article>

    `;

}


/* ============================================================
   EXTRAER CLIENTE
============================================================ */

function extraerCliente(pedido) {

    let nombre =
        "Cliente Web";

    let telefono =
        "";


    const observaciones =
        pedido.observaciones || "";


    const lineas =
        observaciones.split(
            "\n"
        );


    for (
        const linea of lineas
    ) {

        if (
            linea.startsWith(
                "Cliente:"
            )
        ) {

            nombre =
                linea
                    .replace(
                        "Cliente:",
                        ""
                    )
                    .trim();

        }


        if (
            linea.startsWith(
                "Teléfono:"
            )
        ) {

            telefono =
                linea
                    .replace(
                        "Teléfono:",
                        ""
                    )
                    .trim();

        }

    }


    return {

        nombre,
        telefono

    };

}


/* ============================================================
   ABRIR DETALLE
============================================================ */

function abrirPedido(pedido) {

    const cliente =
        extraerCliente(
            pedido
        );

    const detalle =
        pedido.detalle || [];


    let productosHTML = "";


    for (const item of detalle) {

        productosHTML += `

            <div class="modal-producto">

                <span>

                    ${item.cantidad} x

                    ${escaparHTML(
                        item.nombre_producto ||
                        `Producto #${item.producto_id}`
                    )}

                </span>

                <strong>

                    ${dinero(item.subtotal)}

                </strong>

            </div>

        `;

    }


    modalContenido.innerHTML = `

        <div class="modal-titulo">

            Pedido #${escaparHTML(
                pedido.numero_pedido ||
                pedido.id
            )}

        </div>


        <div class="modal-info">

            <strong>
                👤 Cliente
            </strong>

            <br>

            ${escaparHTML(
                cliente.nombre
            )}

            ${
                cliente.telefono
                ? `<br>📞 ${escaparHTML(cliente.telefono)}`
                : ""
            }

            <br><br>

            <strong>
                📍 Dirección
            </strong>

            <br>

            ${escaparHTML(
                pedido.direccion_entrega ||
                "Sin dirección"
            )}

            <br><br>

            <strong>
                💳 Medio de pago
            </strong>

            <br>

            ${escaparHTML(
                pedido.medio_pago ||
                "No informado"
            )}

        </div>


        <h3>
            🛒 Productos
        </h3>


        ${productosHTML}


        <div class="modal-total">

            Total:
            ${dinero(pedido.total)}

        </div>

    `;


    modal.classList.remove(
        "oculto"
    );

}


/* ============================================================
   CERRAR MODAL
============================================================ */

function cerrarDetalle() {

    modal.classList.add(
        "oculto"
    );

}


cerrarModal.addEventListener(
    "click",
    cerrarDetalle
);


modal.addEventListener(
    "click",
    function(event) {

        if (
            event.target === modal
        ) {

            cerrarDetalle();

        }

    }
);


/* ============================================================
   RENDER
============================================================ */

function mostrarPedidos(pedidos) {

    columna1.innerHTML = "";
    columna2.innerHTML = "";
    columna3.innerHTML = "";
    columna4.innerHTML = "";


    const contadores = {

        1: 0,
        2: 0,
        3: 0,
        4: 0

    };


    for (
        const pedido of pedidos
    ) {

        const estado =
            Number(
                pedido.estado_cocina_id
            );


        if (
            ![1,2,3,4]
                .includes(estado)
        ) {

            continue;

        }


        contadores[estado]++;


        const html =
            crearPedidoHTML(
                pedido
            );


        let columna;


        if (estado === 1)
            columna = columna1;

        if (estado === 2)
            columna = columna2;

        if (estado === 3)
            columna = columna3;

        if (estado === 4)
            columna = columna4;


        columna.insertAdjacentHTML(
            "beforeend",
            html
        );


        const tarjeta =
            columna.lastElementChild;


        tarjeta.addEventListener(
            "click",
            function() {

                abrirPedido(
                    pedido
                );

            }
        );

    }


    mostrarVacio(
        columna1
    );

    mostrarVacio(
        columna2
    );

    mostrarVacio(
        columna3
    );

    mostrarVacio(
        columna4
    );


    document.getElementById(
        "contador1"
    ).textContent =
        contadores[1];

    document.getElementById(
        "contador2"
    ).textContent =
        contadores[2];

    document.getElementById(
        "contador3"
    ).textContent =
        contadores[3];

    document.getElementById(
        "contador4"
    ).textContent =
        contadores[4];


    cantidadPedidos.textContent =
        contadores[1] +
        contadores[2] +
        contadores[3] +
        contadores[4];

}


/* ============================================================
   MOSTRAR VACÍO
============================================================ */

function mostrarVacio(columna) {

    if (
        columna.children.length === 0
    ) {

        columna.innerHTML = `

            <div class="vacio">

                No hay pedidos

            </div>

        `;

    }

}


/* ============================================================
   CARGAR PEDIDOS
============================================================ */

async function cargarPedidos() {

    try {

        const respuesta =
            await fetch(
                URL_PEDIDOS +
                "?t=" +
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


        const pedidos =
            datos.pedidos || [];


        mostrarPedidos(
            pedidos
        );


        conexionOK();


        ultimaActualizacion.textContent =
            new Date().toLocaleTimeString(
                "es-AR",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );


    } catch (error) {

        console.error(
            "Error cargando pedidos:",
            error
        );

        conexionError();

    }

}


/* ============================================================
   BOTÓN ACTUALIZAR
============================================================ */

btnActualizar.addEventListener(
    "click",
    cargarPedidos
);


/* ============================================================
   INICIO
============================================================ */

cargarPedidos();


/* ============================================================
   ACTUALIZACIÓN AUTOMÁTICA
============================================================ */

setInterval(
    cargarPedidos,
    10000
);
