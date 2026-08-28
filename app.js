"use strict";

/* ============================================================
CONFIGURACIÓN
============================================================ */

/*

* ESTA ES LA API DE LIGHTPOS
*
* La Carta Digital NO accede directamente a PostgreSQL.
*
* Flujo:
*
* Carta Digital
* ```
   ↓
  ```
* LightPOS API
* ```
   ↓
  ```
* Cache / PostgreSQL
*

*/

const API_URL =
"https://api.doneliopizzeria.com.ar";

/* ============================================================
GITHUB - FOTOS / LOGO
============================================================ */

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

/*

* Producto compuesto actualmente abierto.
  */
  let productoCompuestoActual = null;

/*

* Grupos del producto compuesto.
  */
  let gruposCompuesto = [];

/*

* Selecciones:

{
grupoId: {
componenteId: cantidad
}
}

*/
let seleccionesCompuesto = {};

/*

* Medio de pago.
  */
  let medioPagoSeleccionado = "EFECTIVO";

/* ============================================================
INICIO
============================================================ */

document.addEventListener(
"DOMContentLoaded",
() => {

```
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
```

);

/* ============================================================
EVENTOS
============================================================ */

function configurarEventos() {

```
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
            event.key === "Escape"
        ) {

            cerrarVisor();

            cerrarCompuesto();

            cerrarCarrito();

            cerrarCliente();

        }

    }
);
```

}

/* ============================================================
MEDIOS DE PAGO
============================================================ */

function configurarMediosPago() {

```
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
```

}

/* ============================================================
SELECCIONAR MEDIO DE PAGO
============================================================ */

function seleccionarMedioPago(
medio
) {

```
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

    if (botones[0]) {

        botones[0].classList.add(
            "activo"
        );

    }

    if (opciones[0]) {

        opciones[0].classList.remove(
            "oculto"
        );

    }

}


if (
    medio ===
    "TRANSFERENCIA"
) {

    if (botones[1]) {

        botones[1].classList.add(
            "activo"
        );

    }

    if (opciones[1]) {

        opciones[1].classList.remove(
            "oculto"
        );

    }

}


if (
    medio ===
    "MERCADO_PAGO_QR"
) {

    if (botones[2]) {

        botones[2].classList.add(
            "activo"
        );

    }

    if (opciones[2]) {

        opciones[2].classList.remove(
            "oculto"
        );

    }

}
```

}

/* ============================================================
COPIAR ALIAS
============================================================ */

async function copiarAlias() {

```
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
            "No se pudo copiar el alias. Copialo manualmente.";

    }

}
```

}

/* ============================================================
PRODUCTOS
============================================================ */

async function cargarProductos() {

```
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
     * LightPOS puede devolver:
     *
     * [
     *     {...},
     *     {...}
     * ]
     *
     * o:
     *
     * {
     *     "productos": [...]
     * }
     *
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
            "Formato de productos inválido"
        );

    }


    console.log(
        "Productos recibidos desde LightPOS:",
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
```

}

/* ============================================================
RUBROS
============================================================ */

function generarRubros() {

```
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
                    producto.rubro_nombre ||
                    "Sin categoría"

            };

        }

    }
);


const rubrosOrdenados =
    Object.values(rubros)
        .sort(
            (
                a,
                b
            ) =>
                Number(a.id) -
                Number(b.id)
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
```

}

/* ============================================================
RUBRO ACTIVO
============================================================ */

function marcarRubroActivo(
botonSeleccionado
) {

```
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
```

}

/* ============================================================
MOSTRAR PRODUCTOS
============================================================ */

function mostrarProductos() {

```
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
        )
        .sort(
            (
                a,
                b
            ) => {

                const rubroA =
                    Number(
                        a.rubro_id
                    );

                const rubroB =
                    Number(
                        b.rubro_id
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


                const nombreA =
                    String(
                        a.nombre ||
                        ""
                    );

                const nombreB =
                    String(
                        b.nombre ||
                        ""
                    );


                return nombreA.localeCompare(
                    nombreB,
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


        const esCompuesto =
            productoEsCompuesto(
                producto
            );


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
```

}

/* ============================================================
DETECTAR PRODUCTO COMPUESTO
============================================================ */

function productoEsCompuesto(
producto
) {

```
if (
    producto.es_compuesto === true
) {

    return true;

}


if (
    Number(
        producto.es_compuesto
    ) === 1
) {

    return true;

}


if (
    String(
        producto.tipo_producto ||
        ""
    ).toUpperCase() ===
    "COMPUESTO"
) {

    return true;

}


if (
    Number(
        producto.cant_min || 0
    ) > 0
) {

    return true;

}


return false;
```

}

/* ============================================================
IMAGEN
============================================================ */

function obtenerImagen(
producto
) {

```
if (
    producto.url &&
    String(
        producto.url
    ).trim() !== ""
) {

    return (
        URL_FOTOS +
        encodeURIComponent(
            String(
                producto.url
            ).trim()
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
```

}

/* ============================================================
AGREGAR PRODUCTO
============================================================ */

async function agregarProducto(
producto
) {

```
if (
    productoEsCompuesto(
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
```

}

/* ============================================================
PRODUCTO SIMPLE
============================================================ */

function agregarSimple(
producto
) {

```
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
                producto.precio || 0
            ),

        cantidad:
            1,

        subtotal:
            Number(
                producto.precio || 0
            ),

        compuesto:
            false

    });

}


actualizarCarritoUI();
```

}

/* ============================================================
ABRIR COMPUESTO
============================================================ */

async function abrirCompuesto(
producto
) {

```
productoCompuestoActual =
    producto;


gruposCompuesto =
    [];


seleccionesCompuesto =
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


try {

    /*
     * ======================================================
     * NUEVA API LIGHTPOS
     *
     * La Carta NO consulta BD.
     *
     * LightPOS resuelve:
     *
     * productos_grupos
     * productos_grupo_opciones
     * plantillas
     * categorías automáticas
     *
     * y devuelve todo junto.
     * ======================================================
     */

    const respuesta =
        await fetch(
            API_URL +
            "/productos/" +
            encodeURIComponent(
                producto.id
            ) +
            "/grupos-completos?v=" +
            Date.now()
        );


    if (!respuesta.ok) {

        let errorDatos = {};

        try {

            errorDatos =
                await respuesta.json();

        } catch {

            errorDatos = {};

        }


        throw new Error(
            errorDatos.detail ||
            "No se pudieron cargar las opciones del producto."
        );

    }


    const datos =
        await respuesta.json();


    gruposCompuesto =
        Array.isArray(
            datos.grupos
        )
            ? datos.grupos
            : [];


    if (
        !gruposCompuesto.length
    ) {

        cerrarCompuesto();

        mostrarMensaje(
            "Este producto compuesto no tiene grupos configurados."
        );

        return;

    }


    /*
     * Inicializar selecciones.
     */

    gruposCompuesto.forEach(
        grupo => {

            seleccionesCompuesto[
                grupo.id
            ] = {};

            grupo.opciones =
                Array.isArray(
                    grupo.opciones
                )
                    ? grupo.opciones
                    : [];

        }
    );


    generarReglasGrupos();

    mostrarOpcionesCompuesto();


} catch (error) {

    console.error(
        "Error cargando grupos:",
        error
    );


    cerrarCompuesto();


    mostrarMensaje(
        error.message ||
        "No se pudieron cargar las opciones."
    );

}
```

}

/* ============================================================
REGLAS DE GRUPOS
============================================================ */

function generarReglasGrupos() {

```
const elemento =
    document.getElementById(
        "compuestoReglas"
    );


if (!elemento) {

    return;

}


const textos =
    gruposCompuesto.map(
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


            if (
                min &&
                max &&
                min === max
            ) {

                return (
                    `${grupo.nombre}: elegí ${min}`
                );

            }


            if (
                min &&
                max
            ) {

                return (
                    `${grupo.nombre}: entre ${min} y ${max}`
                );

            }


            if (min) {

                return (
                    `${grupo.nombre}: mínimo ${min}`
                );

            }


            if (max) {

                return (
                    `${grupo.nombre}: máximo ${max}`
                );

            }


            return (
                `${grupo.nombre}: opcional`
            );

        }
    );


elemento.textContent =
    textos.join(" · ");
```

}

/* ============================================================
MOSTRAR OPCIONES COMPUESTO
============================================================ */

function mostrarOpcionesCompuesto() {

```
const contenedor =
    document.getElementById(
        "opcionesCompuesto"
    );


if (!contenedor) {

    return;

}


contenedor.innerHTML = "";


gruposCompuesto.forEach(
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
            "grupo-opciones";


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


actualizarTotalOpciones();
```

}

/* ============================================================
CREAR FILA OPCIÓN
============================================================ */

function crearFilaOpcion(
grupo,
opcion
) {

```
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


const cantidadElemento =
    document.createElement(
        "span"
    );


cantidadElemento.className =
    "opcion-cantidad";


const mas =
    document.createElement(
        "button"
    );


mas.type =
    "button";


mas.textContent =
    "+";


const cantidadActual =
    obtenerCantidadOpcion(
        grupo.id,
        opcion.componente_id
    );


cantidadElemento.textContent =
    cantidadActual;


menos.addEventListener(
    "click",
    () => {

        const actual =
            obtenerCantidadOpcion(
                grupo.id,
                opcion.componente_id
            );


        if (
            actual <= 0
        ) {

            return;

        }


        establecerCantidadOpcion(
            grupo.id,
            opcion.componente_id,
            actual - 1
        );


        cantidadElemento.textContent =
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
                grupo.maximo_selecciones ||
                0
            );


        /*
         * Primero respetamos el máximo del grupo.
         */

        if (
            maxGrupo &&
            totalGrupo >=
            maxGrupo
        ) {

            mostrarMensaje(
                `${grupo.nombre}: máximo ${maxGrupo} selecciones.`
            );

            return;

        }


        /*
         * Después respetamos el máximo
         * particular de la opción.
         */

        const maxOpcion =
            Number(
                opcion.maximo_cantidad ||
                0
            );


        if (
            maxOpcion &&
            actual >= maxOpcion
        ) {

            mostrarMensaje(
                `Máximo permitido para ${opcion.nombre}: ${maxOpcion}`
            );

            return;

        }


        establecerCantidadOpcion(
            grupo.id,
            opcion.componente_id,
            actual + 1
        );


        cantidadElemento.textContent =
            actual + 1;


        actualizarTotalOpciones();

    }
);


controles.appendChild(
    menos
);

controles.appendChild(
    cantidadElemento
);

controles.appendChild(
    mas
);


fila.appendChild(
    nombre
);

fila.appendChild(
    controles
);


return fila;
```

}

/* ============================================================
CANTIDAD OPCIÓN
============================================================ */

function obtenerCantidadOpcion(
grupoId,
componenteId
) {

```
if (
    !seleccionesCompuesto[
        grupoId
    ]
) {

    return 0;

}


return Number(
    seleccionesCompuesto[
        grupoId
    ][
        componenteId
    ] || 0
);
```

}

/* ============================================================
ESTABLECER CANTIDAD
============================================================ */

function establecerCantidadOpcion(
grupoId,
componenteId,
cantidad
) {

```
if (
    !seleccionesCompuesto[
        grupoId
    ]
) {

    seleccionesCompuesto[
        grupoId
    ] = {};

}


seleccionesCompuesto[
    grupoId
][
    componenteId
] =
    Math.max(
        0,
        Number(
            cantidad
        )
    );
```

}

/* ============================================================
TOTAL DE UN GRUPO
============================================================ */

function obtenerTotalGrupo(
grupoId
) {

```
const grupo =
    seleccionesCompuesto[
        grupoId
    ] || {};


return Object.values(
    grupo
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
```

}

/* ============================================================
TOTAL DE OPCIONES
============================================================ */

function obtenerTotalOpciones() {

```
return gruposCompuesto.reduce(
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
```

}

/* ============================================================
ACTUALIZAR TOTAL OPCIONES
============================================================ */

function actualizarTotalOpciones() {

```
const elemento =
    document.getElementById(
        "totalOpciones"
    );


if (elemento) {

    elemento.textContent =
        obtenerTotalOpciones();

}
```

}

/* ============================================================
VALIDAR GRUPOS
============================================================ */

function validarGruposCompuesto() {

```
for (
    const grupo
    of gruposCompuesto
) {

    const total =
        obtenerTotalGrupo(
            grupo.id
        );


    const minimo =
        Number(
            grupo.minimo_selecciones ||
            0
        );


    const maximo =
        Number(
            grupo.maximo_selecciones ||
            0
        );


    if (
        minimo &&
        total < minimo
    ) {

        mostrarMensaje(
            `${grupo.nombre}: debés seleccionar al menos ${minimo}.`
        );

        return false;

    }


    if (
        maximo &&
        total > maximo
    ) {

        mostrarMensaje(
            `${grupo.nombre}: no podés seleccionar más de ${maximo}.`
        );

        return false;

    }

}


return true;
```

}

/* ============================================================
OBTENER HIJOS PARA EL PEDIDO
============================================================ */

function construirHijosSeleccionados() {

```
const resultado = {};


gruposCompuesto.forEach(
    grupo => {

        const seleccion =
            seleccionesCompuesto[
                grupo.id
            ] || {};


        Object.entries(
            seleccion
        ).forEach(
            (
                [
                    componenteId,
                    cantidad
                ]
            ) => {

                if (
                    Number(
                        cantidad
                    ) > 0
                ) {

                    resultado[
                        componenteId
                    ] =
                        Number(
                            cantidad
                        );

                }

            }
        );

    }
);


return resultado;
```

}

/* ============================================================
CONSTRUIR NOMBRE DEL COMPUESTO
============================================================ */

function construirNombreCompuesto() {

```
const partes = [];


gruposCompuesto.forEach(
    grupo => {

        const seleccion =
            seleccionesCompuesto[
                grupo.id
            ] || {};


        Object.entries(
            seleccion
        ).forEach(
            (
                [
                    componenteId,
                    cantidad
                ]
            ) => {

                const cantidadNumero =
                    Number(
                        cantidad
                    );


                if (
                    cantidadNumero <= 0
                ) {

                    return;

                }


                const opcion =
                    grupo.opciones.find(
                        item =>
                            String(
                                item.componente_id
                            ) ===
                            String(
                                componenteId
                            )
                    );


                if (!opcion) {

                    return;

                }


                partes.push(
                    `${cantidadNumero} ${opcion.nombre}`
                );

            }
        );

    }
);


if (!partes.length) {

    return productoCompuestoActual.nombre;

}


return (
    productoCompuestoActual.nombre +
    " (" +
    partes.join(", ") +
    ")"
);
```

}

/* ============================================================
CALCULAR PRECIO DEL COMPUESTO
============================================================ */

function calcularPrecioCompuesto() {

```
const precioBase =
    Number(
        productoCompuestoActual.precio ||
        0
    );


let precio =
    precioBase;


/*
 * Por ahora:
 *
 * INCLUIDO:
 *     usa el precio base.
 *
 * MAXIMO:
 *     toma el precio más caro seleccionado
 *     dentro del grupo.
 *
 * Esto permite "mitad y mitad".
 */

gruposCompuesto.forEach(
    grupo => {

        if (
            String(
                grupo.modo_precio ||
                "INCLUIDO"
            ).toUpperCase() !==
            "MAXIMO"
        ) {

            return;

        }


        const seleccion =
            seleccionesCompuesto[
                grupo.id
            ] || {};


        let maximo =
            precio;


        Object.entries(
            seleccion
        ).forEach(
            (
                [
                    componenteId,
                    cantidad
                ]
            ) => {

                if (
                    Number(
                        cantidad
                    ) <= 0
                ) {

                    return;

                }


                const opcion =
                    grupo.opciones.find(
                        item =>
                            String(
                                item.componente_id
                            ) ===
                            String(
                                componenteId
                            )
                    );


                if (!opcion) {

                    return;

                }


                const precioOpcion =
                    Number(
                        opcion.precio ||
                        0
                    );


                if (
                    precioOpcion >
                    maximo
                ) {

                    maximo =
                        precioOpcion;

                }

            }
        );


        precio =
            maximo;

    }
);


return precio;
```

}

/* ============================================================
CONFIRMAR COMPUESTO
============================================================ */

function confirmarCompuesto() {

```
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


if (
    total === 0
) {

    mostrarMensaje(
        "Seleccioná al menos una opción."
    );

    return;

}


const nombreFinal =
    construirNombreCompuesto();


const precioFinal =
    calcularPrecioCompuesto();


const hijos =
    construirHijosSeleccionados();


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
        precioFinal,

    cantidad:
        1,

    subtotal:
        precioFinal,

    compuesto:
        true,

    hijos:
        hijos

});


cerrarCompuesto();

actualizarCarritoUI();
```

}

/* ============================================================
CERRAR COMPUESTO
============================================================ */

function cerrarCompuesto() {

```
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


gruposCompuesto =
    [];


seleccionesCompuesto =
    {};
```

}

/* ============================================================
CARRITO
============================================================ */

function actualizarCarritoUI() {

```
const cantidad =
    carrito.reduce(
        (
            total,
            item
        ) =>
            total +
            Number(
                item.cantidad
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
```

}

/* ============================================================
SUBTOTAL
============================================================ */

function calcularSubtotal() {

```
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
```

}

/* ============================================================
RENDERIZAR CARRITO
============================================================ */

function renderizarCarrito() {

```
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
```

}

/* ============================================================
ABRIR CARRITO
============================================================ */

function abrirCarrito() {

```
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
```

}

/* ============================================================
CERRAR CARRITO
============================================================ */

function cerrarCarrito() {

```
const modal =
    document.getElementById(
        "modalCarrito"
    );


if (modal) {

    modal.classList.add(
        "oculto"
    );

}
```

}

/* ============================================================
DATOS CLIENTE
============================================================ */

function abrirDatosCliente() {

```
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
```

}

/* ============================================================
CERRAR CLIENTE
============================================================ */

function cerrarCliente() {

```
const modal =
    document.getElementById(
        "modalCliente"
    );


if (modal) {

    modal.classList.add(
        "oculto"
    );

}
```

}

/* ============================================================
ENVIAR PEDIDO
============================================================ */

async function enviarPedido() {

```
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
    "PEDIDO A ENVIAR A LIGHTPOS:"
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

        datos =
            {};

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
```

}

/* ============================================================
LINK SEGUIMIENTO
============================================================ */

function crearLinkSeguimiento(
url,
numeroPedidoElemento
) {

```
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
```

}

/* ============================================================
OBTENER VALOR INPUT
============================================================ */

function obtenerValor(
id
) {

```
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
```

}

/* ============================================================
LIMPIAR FORMULARIO
============================================================ */

function limpiarFormulario() {

```
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
```

}

/* ============================================================
MENSAJE
============================================================ */

function mostrarMensaje(
texto
) {

```
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
```

}

/* ============================================================
VISOR DE IMÁGENES
============================================================ */

function abrirVisor(
src,
alt
) {

```
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
```

}

/* ============================================================
CERRAR VISOR
============================================================ */

function cerrarVisor() {

```
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
```

}

/* ============================================================
FORMATO PRECIO
============================================================ */

function formatearPrecio(
valor
) {

```
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
```

}
