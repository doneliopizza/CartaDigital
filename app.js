"use strict";

/* ============================================================
CONFIGURACIÓN
============================================================ */

const API_URL =
"https://lightpos-api.doneliopizzeria.com.ar";

const URL_GITHUB =
"https://raw.githubusercontent.com/doneliopizza/CartaDigital/main";

const URL_PRODUCTOS =
API_URL + "/carta/productos/";

const URL_FOTOS =
URL_GITHUB + "/fotos/";

const URL_LOGO =
URL_FOTOS + "logo.png";

/*

* WhatsApp de la pizzería.
* Se usa solamente para generar el mensaje.
  */
  const WHATSAPP =
  "54117067389";

/* ============================================================
ESTADO
============================================================ */

let productos = [];

let rubroActivo = null;

let carrito = [];

/*

* Producto compuesto actualmente abierto.
  */
  let productoCompuestoActual = null;

/*

* Estructura:

{
grupo_id: {
opcion_id: cantidad
}
}
*/
let seleccionesGrupos = {};

/*

* Medio de pago actual.
  */
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


/* ========================================================
   BUSCAR
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
   VISOR
======================================================== */

const cerrarImagen =
    document.getElementById(
        "cerrarImagen"
    );

if (cerrarImagen) {

    cerrarImagen.addEventListener(
        "click",
        event => {

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
        event => {

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
MEDIOS DE PAGO
============================================================ */

function configurarMediosPago() {


const btnEfectivo =
    document.getElementById(
        "btnPagoEfectivo"
    );

const btnTransferencia =
    document.getElementById(
        "btnPagoTransferencia"
    );

const btnQR =
    document.getElementById(
        "btnPagoQR"
    );


if (btnEfectivo) {

    btnEfectivo.addEventListener(
        "click",
        () => {

            seleccionarMedioPago(
                "EFECTIVO"
            );

        }
    );

}


if (btnTransferencia) {

    btnTransferencia.addEventListener(
        "click",
        () => {

            seleccionarMedioPago(
                "TRANSFERENCIA"
            );

        }
    );

}


if (btnQR) {

    btnQR.addEventListener(
        "click",
        () => {

            seleccionarMedioPago(
                "MERCADO_PAGO_QR"
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


seleccionarMedioPago(
    "EFECTIVO"
);


}

/* ============================================================
SELECCIONAR MEDIO DE PAGO
============================================================ */

function seleccionarMedioPago(
medio
) {


medioPagoSeleccionado =
    medio;


const botones = [
    document.getElementById(
        "btnPagoEfectivo"
    ),
    document.getElementById(
        "btnPagoTransferencia"
    ),
    document.getElementById(
        "btnPagoQR"
    )
];


const opciones = [
    document.getElementById(
        "opcionEfectivo"
    ),
    document.getElementById(
        "opcionTransferencia"
    ),
    document.getElementById(
        "opcionQR"
    )
];


botones.forEach(
    boton => {

        if (boton) {

            boton.classList.remove(
                "activo"
            );

        }

    }
);


opciones.forEach(
    opcion => {

        if (opcion) {

            opcion.classList.add(
                "oculto"
            );

        }

    }
);


if (
    medio ===
    "EFECTIVO"
) {

    const boton =
        document.getElementById(
            "btnPagoEfectivo"
        );

    const opcion =
        document.getElementById(
            "opcionEfectivo"
        );

    if (boton) {

        boton.classList.add(
            "activo"
        );

    }

    if (opcion) {

        opcion.classList.remove(
            "oculto"
        );

    }

}


if (
    medio ===
    "TRANSFERENCIA"
) {

    const boton =
        document.getElementById(
            "btnPagoTransferencia"
        );

    const opcion =
        document.getElementById(
            "opcionTransferencia"
        );

    if (boton) {

        boton.classList.add(
            "activo"
        );

    }

    if (opcion) {

        opcion.classList.remove(
            "oculto"
        );

    }

}


if (
    medio ===
    "MERCADO_PAGO_QR"
) {

    const boton =
        document.getElementById(
            "btnPagoQR"
        );

    const opcion =
        document.getElementById(
            "opcionQR"
        );

    if (boton) {

        boton.classList.add(
            "activo"
        );

    }

    if (opcion) {

        opcion.classList.remove(
            "oculto"
        );

    }

}


}

/* ============================================================
COPIAR ALIAS
============================================================ */

async function copiarAlias() {


const elemento =
    document.getElementById(
        "aliasTransferencia"
    );

const mensaje =
    document.getElementById(
        "mensajeAlias"
    );


if (!elemento) {

    return;

}


const alias =
    elemento.textContent.trim();


try {

    await navigator.clipboard.writeText(
        alias
    );

    if (mensaje) {

        mensaje.textContent =
            "✓ Alias copiado correctamente.";

        setTimeout(
            () => {

                mensaje.textContent =
                    "";

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
            "No se pudo copiar el alias.";

    }

}


}

/* ============================================================
PRODUCTOS
============================================================ */

async function cargarProductos() {


try {

    console.log(
        "Cargando productos desde:",
        URL_PRODUCTOS
    );


    const respuesta =
        await fetch(
            URL_PRODUCTOS +
            "?v=" +
            Date.now(),
            {
                method: "GET",
                cache: "no-store"
            }
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
     * Permitimos tanto:
     *
     * [
     *   {...}
     * ]
     *
     * como:
     *
     * {
     *   productos: [...]
     * }
     */

    if (Array.isArray(datos)) {

        productos =
            datos;

    } else if (
        Array.isArray(
            datos.productos
        )
    ) {

        productos =
            datos.productos;

    } else {

        throw new Error(
            "Formato de productos inválido."
        );

    }


    /*
     * Carta pública:
     * solamente productos activos.
     */

    productos =
        productos.filter(
            producto =>
                producto.activo !== false
        );


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


contenedor.innerHTML =
    "";


const rubros =
    {};


productos.forEach(
    producto => {

        if (
            producto.rubro_id === null ||
            producto.rubro_id === undefined
        ) {

            return;

        }


        const id =
            Number(
                producto.rubro_id
            );


        if (!rubros[id]) {

            rubros[id] = {

                id:
                    id,

                nombre:
                    producto.rubro ||
                    "Sin rubro"

            };

        }

    }
);


const rubrosOrdenados =
    Object.values(
        rubros
    ).sort(
        (
            a,
            b
        ) =>
            a.id - b.id
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

rubrosOrdenados.forEach(
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


contenedor.innerHTML =
    "";


const filtrados =
    productos
        .filter(
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
                        producto.nombre ||
                        ""
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
        )
        .sort(
            (
                a,
                b
            ) => {

                const rubroA =
                    Number(
                        a.rubro_id || 0
                    );

                const rubroB =
                    Number(
                        b.rubro_id || 0
                    );


                if (
                    rubroA !==
                    rubroB
                ) {

                    return (
                        rubroA -
                        rubroB
                    );

                }


                return String(
                    a.nombre ||
                    ""
                ).localeCompare(
                    String(
                        b.nombre ||
                        ""
                    ),
                    "es",
                    {
                        sensitivity:
                            "base"
                    }
                );

            }
        );


if (
    !filtrados.length
) {

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


        imagen.onerror =
            () => {

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
           INFO
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


        const descripcion =
            document.createElement(
                "div"
            );


        descripcion.className =
            "producto-descripcion";


        descripcion.textContent =
            producto.descripcion ||
            "";


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
            esProductoCompuesto(
                producto
            )
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


        if (
            producto.descripcion
        ) {

            info.appendChild(
                descripcion
            );

        }


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


/*
 * Nueva API:
 *
 * imagen_url
 */

if (
    producto.imagen_url &&
    String(
        producto.imagen_url
    ).trim() !== ""
) {

    const url =
        String(
            producto.imagen_url
        ).trim();


    /*
     * Si la API ya devuelve
     * una URL completa.
     */

    if (
        url.startsWith(
            "http://"
        ) ||
        url.startsWith(
            "https://"
        )
    ) {

        return (
            url +
            (
                url.includes("?")
                    ? "&"
                    : "?"
            ) +
            "v=" +
            Date.now()
        );

    }


    /*
     * Si devuelve solamente
     * el nombre del archivo,
     * lo buscamos en GitHub.
     */

    return (
        URL_FOTOS +
        encodeURIComponent(
            url
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
¿ES COMPUESTO?
============================================================ */

function esProductoCompuesto(
producto
) {


return (
    producto.es_compuesto === true ||
    producto.tipo_producto ===
        "COMPUESTO"
);


}

/* ============================================================
AGREGAR PRODUCTO
============================================================ */

async function agregarProducto(
producto
) {


if (
    esProductoCompuesto(
        producto
    )
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
            false,

        grupos:
            []

    });

}


actualizarCarritoUI();


}

/* ============================================================
CARGAR GRUPOS DEL COMPUESTO
============================================================ */

async function cargarGruposProducto(
productoId
) {


const url =
    API_URL +
    "/productos/" +
    encodeURIComponent(
        productoId
    ) +
    "/grupos-completos?v=" +
    Date.now();


console.log(
    "Cargando grupos:",
    url
);


const respuesta =
    await fetch(
        url,
        {
            method: "GET",
            cache: "no-store"
        }
    );


if (!respuesta.ok) {

    let detalle =
        "No se pudieron cargar las opciones.";

    try {

        const datos =
            await respuesta.json();

        if (datos.detail) {

            detalle =
                datos.detail;

        }

    } catch {

        /* Nada */

    }


    throw new Error(
        detalle
    );

}


return await respuesta.json();


}

/* ============================================================
ABRIR COMPUESTO
============================================================ */

async function abrirCompuesto(
producto
) {


try {

    productoCompuestoActual =
        producto;


    seleccionesGrupos =
        {};


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


    const datos =
        await cargarGruposProducto(
            producto.id
        );


    /*
     * Guardamos los grupos recibidos
     * directamente en el producto actual.
     */

    productoCompuestoActual.grupos =
        Array.isArray(
            datos.grupos
        )
            ? datos.grupos
            : [];


    if (
        !productoCompuestoActual.grupos.length
    ) {

        throw new Error(
            "Este producto no tiene grupos de opciones configurados."
        );

    }


    productoCompuestoActual.grupos.forEach(
        grupo => {

            seleccionesGrupos[
                grupo.id
            ] = {};

            grupo.opciones =
                Array.isArray(
                    grupo.opciones
                )
                    ? grupo.opciones
                    : [];

            grupo.opciones.forEach(
                opcion => {

                    seleccionesGrupos[
                        grupo.id
                    ][
                        opcion.id
                    ] = 0;

                }
            );

        }
    );


    if (reglas) {

        reglas.textContent =
            generarTextoReglasGrupos(
                productoCompuestoActual.grupos
            );

    }


    mostrarGruposCompuesto();


} catch (error) {

    console.error(
        "Error cargando compuesto:",
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
TEXTO DE REGLAS
============================================================ */

function generarTextoReglasGrupos(
grupos
) {


if (
    !Array.isArray(
        grupos
    ) ||
    !grupos.length
) {

    return "";

}


return grupos
    .map(
        grupo => {

            const min =
                Number(
                    grupo.minimo_selecciones ||
                    0
                );

            const max =
                Number(
                    grupo.maximo_selecciones ||
                    0
                );


            let texto =
                grupo.nombre || "";


            if (
                min &&
                max &&
                min === max
            ) {

                texto +=
                    ` — elegí ${min}`;

            } else if (
                min &&
                max
            ) {

                texto +=
                    ` — entre ${min} y ${max}`;

            } else if (
                min
            ) {

                texto +=
                    ` — mínimo ${min}`;

            } else if (
                max
            ) {

                texto +=
                    ` — máximo ${max}`;

            }


            return texto;

        }
    )
    .join(
        " | "
    );


}

/* ============================================================
MOSTRAR GRUPOS
============================================================ */

function mostrarGruposCompuesto() {


const contenedor =
    document.getElementById(
        "opcionesCompuesto"
    );


if (!contenedor) {

    return;

}


contenedor.innerHTML =
    "";


const grupos =
    productoCompuestoActual
        ?.grupos || [];


grupos.forEach(
    grupo => {

        const bloque =
            document.createElement(
                "div"
            );


        bloque.className =
            "grupo-compuesto";


        const titulo =
            document.createElement(
                "h3"
            );


        titulo.textContent =
            grupo.nombre;


        bloque.appendChild(
            titulo
        );


        if (
            grupo.descripcion
        ) {

            const descripcion =
                document.createElement(
                    "p"
                );


            descripcion.textContent =
                grupo.descripcion;


            bloque.appendChild(
                descripcion
            );

        }


        const opciones =
            document.createElement(
                "div"
            );


        opciones.className =
            "opciones-grupo";


        grupo.opciones.forEach(
            opcion => {

                const fila =
                    crearFilaOpcion(
                        grupo,
                        opcion
                    );


                opciones.appendChild(
                    fila
                );

            }
        );


        bloque.appendChild(
            opciones
        );


        contenedor.appendChild(
            bloque
        );

    }
);


}

/* ============================================================
CREAR FILA DE OPCIÓN
============================================================ */

function crearFilaOpcion(
grupo,
opcion
) {


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
    opcion.nombre;


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
    obtenerCantidadOpcion(
        grupo.id,
        opcion.id
    );


const mas =
    document.createElement(
        "button"
    );


mas.type =
    "button";

mas.textContent =
    "+";


/*
 * Obligatorio visual.
 */

if (
    opcion.obligatorio
) {

    const obligatorio =
        document.createElement(
            "small"
        );

    obligatorio.textContent =
        "Obligatorio";

    obligatorio.className =
        "opcion-obligatoria";

    nombre.appendChild(
        obligatorio
    );

}


menos.addEventListener(
    "click",
    () => {

        cambiarCantidadOpcion(
            grupo,
            opcion,
            -1
        );

        cantidad.textContent =
            obtenerCantidadOpcion(
                grupo.id,
                opcion.id
            );

    }
);


mas.addEventListener(
    "click",
    () => {

        cambiarCantidadOpcion(
            grupo,
            opcion,
            1
        );

        cantidad.textContent =
            obtenerCantidadOpcion(
                grupo.id,
                opcion.id
            );

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


return fila;


}

/* ============================================================
OBTENER CANTIDAD
============================================================ */

function obtenerCantidadOpcion(
grupoId,
opcionId
) {


return Number(
    seleccionesGrupos?.[
        grupoId
    ]?.[
        opcionId
    ] || 0
);


}

/* ============================================================
TOTAL DE UN GRUPO
============================================================ */

function obtenerTotalGrupo(
grupoId
) {


const opciones =
    seleccionesGrupos?.[
        grupoId
    ] || {};


return Object.values(
    opciones
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

/* ============================================================
CAMBIAR CANTIDAD
============================================================ */

function cambiarCantidadOpcion(
grupo,
opcion,
cambio
) {


const actual =
    obtenerCantidadOpcion(
        grupo.id,
        opcion.id
    );


const nuevo =
    Math.max(
        0,
        actual + cambio
    );


/*
 * Si estamos agregando,
 * respetamos máximo del grupo.
 */

if (
    cambio > 0
) {

    const maxGrupo =
        Number(
            grupo.maximo_selecciones ||
            0
        );


    const totalActual =
        obtenerTotalGrupo(
            grupo.id
        );


    if (
        maxGrupo &&
        totalActual >= maxGrupo
    ) {

        mostrarMensaje(
            `Máximo permitido en "${grupo.nombre}": ${maxGrupo}.`
        );

        return;

    }


    /*
     * Máximo específico
     * de la opción.
     */

    const maxOpcion =
        Number(
            opcion.maximo_cantidad ||
            0
        );


    if (
        maxOpcion &&
        nuevo > maxOpcion
    ) {

        mostrarMensaje(
            `Máximo permitido para ${opcion.nombre}: ${maxOpcion}.`
        );

        return;

    }


    /*
     * Si no permite repetir,
     * máximo 1.
     */

    if (
        opcion.permite_repetir === false &&
        nuevo > 1
    ) {

        mostrarMensaje(
            `${opcion.nombre} no permite repetirse.`
        );

        return;

    }

}


seleccionesGrupos[
    grupo.id
][
    opcion.id
] =
    nuevo;


}

/* ============================================================
VALIDAR GRUPOS
============================================================ */

function validarGruposCompuesto() {


const grupos =
    productoCompuestoActual
        ?.grupos || [];


for (
    const grupo of grupos
) {

    const total =
        obtenerTotalGrupo(
            grupo.id
        );


    const min =
        Number(
            grupo.minimo_selecciones ||
            0
        );


    const max =
        Number(
            grupo.maximo_selecciones ||
            0
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
            `En "${grupo.nombre}" podés seleccionar como máximo ${max}.`
        );

        return false;

    }


    /*
     * Validación de opciones obligatorias.
     */

    for (
        const opcion of grupo.opciones
    ) {

        if (
            opcion.obligatorio
        ) {

            const cantidad =
                obtenerCantidadOpcion(
                    grupo.id,
                    opcion.id
                );


            const minimoOpcion =
                Number(
                    opcion.minimo_cantidad ||
                    0
                );


            const minimoReal =
                Math.max(
                    1,
                    minimoOpcion
                );


            if (
                cantidad <
                minimoReal
            ) {

                mostrarMensaje(
                    `Debés seleccionar "${opcion.nombre}" en "${grupo.nombre}".`
                );

                return false;

            }

        }

    }

}


return true;


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


const gruposSeleccionados =
    [];


const partesNombre =
    [];


producto.grupos.forEach(
    grupo => {

        const opcionesSeleccionadas =
            [];


        grupo.opciones.forEach(
            opcion => {

                const cantidad =
                    obtenerCantidadOpcion(
                        grupo.id,
                        opcion.id
                    );


                if (
                    cantidad > 0
                ) {

                    opcionesSeleccionadas.push({

                        opcion_id:
                            opcion.id,

                        componente_id:
                            opcion.componente_id,

                        nombre:
                            opcion.nombre,

                        cantidad:
                            cantidad

                    });


                    partesNombre.push(
                        `${cantidad} ${opcion.nombre}`
                    );

                }

            }
        );


        if (
            opcionesSeleccionadas.length
        ) {

            gruposSeleccionados.push({

                grupo_id:
                    grupo.id,

                grupo_nombre:
                    grupo.nombre,

                opciones:
                    opcionesSeleccionadas

            });

        }

    }
);


if (
    !gruposSeleccionados.length
) {

    mostrarMensaje(
        "Seleccioná las opciones del producto."
    );

    return;

}


const nombreFinal =
    `${producto.nombre} (${partesNombre.join(", ")})`;


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

    grupos:
        gruposSeleccionados

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


seleccionesGrupos =
    {};


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
            item.subtotal ||
            0
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


contenedor.innerHTML =
    "";


if (
    !carrito.length
) {

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


if (
    !carrito.length
) {

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
ENVIAR PEDIDO POR WHATSAPP
============================================================ */

function enviarPedido() {


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


/* ========================================================
   CONSTRUIR MENSAJE
======================================================== */

const mensaje =
    construirMensajeWhatsApp({

        nombre,
        telefono,
        calle,
        altura,
        localidad,
        montoEfectivo,
        total

    });


console.log(
    "MENSAJE WHATSAPP:",
    mensaje
);


/* ========================================================
   ABRIR WHATSAPP
======================================================== */

const url =
    "https://wa.me/" +
    WHATSAPP +
    "?text=" +
    encodeURIComponent(
        mensaje
    );


window.open(
    url,
    "_blank"
);


/*
 * No guardamos nada en la API.
 *
 * WhatsApp pasa a ser el canal
 * donde la pizzería recibe el pedido.
 */


}

/* ============================================================
CONSTRUIR MENSAJE WHATSAPP
============================================================ */

function construirMensajeWhatsApp(
datos
) {


const lineas = [];


lineas.push(
    "🍕 *NUEVO PEDIDO*"
);


lineas.push(
    ""
);


lineas.push(
    "*CLIENTE*"
);


lineas.push(
    `Nombre: ${datos.nombre}`
);


lineas.push(
    `Teléfono: ${datos.telefono}`
);


lineas.push(
    ""
);


lineas.push(
    "*ENTREGA*"
);


lineas.push(
    `Dirección: ${datos.calle} ${datos.altura}`
);


lineas.push(
    `Localidad: ${datos.localidad}`
);


lineas.push(
    ""
);


lineas.push(
    "*PEDIDO*"
);


carrito.forEach(
    item => {

        lineas.push(
            `${item.cantidad} x ${item.nombre} — ${formatearPrecio(item.subtotal)}`
        );

    }
);


lineas.push(
    ""
);


lineas.push(
    `*TOTAL: ${formatearPrecio(datos.total)}*`
);


lineas.push(
    ""
);


lineas.push(
    "*MEDIO DE PAGO*"
);


lineas.push(
    obtenerNombreMedioPago(
        medioPagoSeleccionado
    )
);


if (
    medioPagoSeleccionado ===
    "EFECTIVO"
) {

    if (
        datos.montoEfectivo > 0
    ) {

        lineas.push(
            `Abona con: ${formatearPrecio(datos.montoEfectivo)}`
        );


        const vuelto =
            datos.montoEfectivo -
            datos.total;


        if (
            vuelto >= 0
        ) {

            lineas.push(
                `Vuelto: ${formatearPrecio(vuelto)}`
            );

        }

    }

}


return lineas.join(
    "\n"
);


}

/* ============================================================
NOMBRE MEDIO DE PAGO
============================================================ */

function obtenerNombreMedioPago(
medio
) {


if (
    medio ===
    "TRANSFERENCIA"
) {

    return "Transferencia";

}


if (
    medio ===
    "MERCADO_PAGO_QR"
) {

    return "Mercado Pago QR";

}


return "Efectivo";


}

/* ============================================================
INPUT
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
    elemento.value ||
    ""
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


seleccionarMedioPago(
    "EFECTIVO"
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
VISOR
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
