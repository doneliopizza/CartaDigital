// ============================================================
// DON ELIO - CARTA DIGITAL V2
// ============================================================
//
// V2 independiente de V1.
//
// OBJETIVO:
//
// Cliente
//    ↓
// Carta
//    ↓
// Carrito
//    ↓
// Datos cliente
//    ↓
// API
//    ↓
// Mercado Pago
//    ↓
// Pedido en Clever Cloud
//    ↓
// POS local
//
// En esta primera versión todavía NO enviamos el pedido.
// Dejamos preparada la estructura para hacerlo.
// ============================================================


// ============================================================
// CONFIGURACIÓN
// ============================================================

const API_BASE =
    "https://cartadigitalapi.onrender.com";

const URL_PRODUCTOS =
    API_BASE + "/productos";


const URL_GITHUB =
    "https://raw.githubusercontent.com/doneliopizza/CartaDigital/main";


const URL_FOTOS =
    URL_GITHUB + "/fotos/";


const URL_LOGO =
    URL_FOTOS + "logo.png";


const IMAGEN_PLACEHOLDER =
    URL_LOGO;


const ALIAS_TRANSFERENCIA =
    "donelio.pizza";


// ============================================================
// VARIABLES
// ============================================================

let productos = [];


// Carrito V2.
//
// Productos simples:
//
// carrito = [
//     {
//         producto_id: 10,
//         cantidad: 2
//     }
// ]
//
// Más adelante los compuestos podrán utilizar:
//
// {
//     producto_id: 50,
//     cantidad: 1,
//     hijos: [
//         {
//             producto_id: 10
//         },
//         {
//             producto_id: 15
//         }
//     ]
// }

let carrito = [];


// ============================================================
// INICIO
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "🚀 Don Elio Carta V2 iniciada"
        );


        cargarLogo();

        cargarProductos();

    }
);


// ============================================================
// CARGAR PRODUCTOS
// ============================================================

async function cargarProductos() {

    cambiarEstadoAPI(
        "cargando",
        "● Conectando con API..."
    );


    mostrarCargando();


    try {

        const respuesta =
            await fetch(
                URL_PRODUCTOS +
                "?v=" +
                Date.now(),
                {
                    method: "GET",
                    cache: "no-store",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        console.log(
            "HTTP productos:",
            respuesta.status
        );


        if (!respuesta.ok) {

            const texto =
                await respuesta.text();

            throw new Error(
                "HTTP " +
                respuesta.status +
                " - " +
                texto
            );

        }


        const datos =
            await respuesta.json();


        if (!Array.isArray(datos)) {

            throw new Error(
                "La API no devolvió una lista de productos."
            );

        }


        productos =
            datos.filter(
                producto =>
                    Number(
                        producto.estado
                    ) === 1
            );


        console.log(
            "✅ Productos cargados:",
            productos
        );


        cambiarEstadoAPI(
            "ok",
            "● API OK · " +
            productos.length +
            " productos"
        );


        mostrarCarta();


        ocultarCargando();


        actualizarCarrito();

    }

    catch (error) {

        console.error(
            "❌ ERROR API:",
            error
        );


        cambiarEstadoAPI(
            "error",
            "● Error conectando con API"
        );


        mostrarErrorProductos(
            error.message
        );

    }

}


// ============================================================
// LOGO
// ============================================================

function cargarLogo() {

    const contenedor =
        document.getElementById(
            "logo-contenedor"
        );


    if (!contenedor) {

        return;

    }


    const logo =
        document.createElement("img");


    logo.className =
        "logo-don-elio";


    logo.alt =
        "Don Elio Pizzas & Pastas";


    logo.src =
        URL_LOGO +
        "?v=" +
        Date.now();


    logo.onerror =
        function() {

            console.error(
                "❌ No se pudo cargar el logo."
            );

            this.style.display =
                "none";

        };


    contenedor.appendChild(
        logo
    );

}


// ============================================================
// ESTADO API
// ============================================================

function cambiarEstadoAPI(
    tipo,
    texto
) {

    const elemento =
        document.getElementById(
            "estado-api"
        );


    if (!elemento) {

        return;

    }


    elemento.className =
        "estado-api " +
        tipo;


    elemento.textContent =
        texto;

}


// ============================================================
// CARGANDO
// ============================================================

function mostrarCargando() {

    const elemento =
        document.getElementById(
            "cargando"
        );


    if (elemento) {

        elemento.style.display =
            "block";

        elemento.textContent =
            "Cargando carta...";

    }

}


function ocultarCargando() {

    const elemento =
        document.getElementById(
            "cargando"
        );


    if (elemento) {

        elemento.style.display =
            "none";

    }

}


// ============================================================
// ERROR
// ============================================================

function mostrarErrorProductos(
    mensaje
) {

    const carta =
        document.getElementById(
            "carta"
        );


    if (!carta) {

        return;

    }


    carta.innerHTML = `

        <div class="error-productos">

            <div class="error-icono">
                ⚠️
            </div>

            <h2>
                No se pudo cargar la carta
            </h2>

            <p>
                ${escaparHTML(mensaje)}
            </p>

            <button
                type="button"
                onclick="cargarProductos()"
            >
                Intentar nuevamente
            </button>

        </div>

    `;


    ocultarCargando();

}


// ============================================================
// IMAGEN
// ============================================================

function obtenerImagen(
    producto
) {

    if (
        producto.url &&
        typeof producto.url === "string" &&
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
        IMAGEN_PLACEHOLDER +
        "?v=" +
        Date.now()
    );

}


// ============================================================
// MOSTRAR CARTA
// ============================================================

function mostrarCarta() {

    const carta =
        document.getElementById(
            "carta"
        );


    if (!carta) {

        return;

    }


    carta.innerHTML = "";


    if (productos.length === 0) {

        carta.innerHTML = `

            <div class="sin-productos">

                No hay productos disponibles.

            </div>

        `;

        return;

    }


    const categorias = {};


    productos.forEach(
        producto => {

            const rubro =
                producto.rubro ||
                "Otros";


            if (!categorias[rubro]) {

                categorias[rubro] = [];

            }


            categorias[rubro].push(
                producto
            );

        }
    );


    Object.keys(categorias)
        .forEach(
            rubro => {

                crearCategoria(
                    carta,
                    rubro,
                    categorias[rubro]
                );

            }
        );

}


// ============================================================
// CREAR CATEGORÍA
// ============================================================

function crearCategoria(
    contenedor,
    rubro,
    lista
) {

    const seccion =
        document.createElement(
            "section"
        );


    seccion.className =
        "categoria";


    const titulo =
        document.createElement(
            "h2"
        );


    titulo.textContent =
        rubro;


    seccion.appendChild(
        titulo
    );


    lista.forEach(
        producto => {

            seccion.appendChild(
                crearProducto(
                    producto
                )
            );

        }
    );


    contenedor.appendChild(
        seccion
    );

}


// ============================================================
// CREAR PRODUCTO
// ============================================================

function crearProducto(
    producto
) {

    const div =
        document.createElement(
            "article"
        );


    div.className =
        "producto";


    // --------------------------------------------------------
    // IMAGEN
    // --------------------------------------------------------

    const contenedorImagen =
        document.createElement(
            "div"
        );


    contenedorImagen.className =
        "producto-imagen";


    const imagen =
        document.createElement(
            "img"
        );


    imagen.src =
        obtenerImagen(
            producto
        );


    imagen.alt =
        producto.nombre || "";


    imagen.loading =
        "lazy";


    imagen.onclick =
        function() {

            verImagenGrande(
                imagen
            );

        };


    imagen.onerror =
        function() {

            this.onerror =
                null;

            this.src =
                IMAGEN_PLACEHOLDER +
                "?v=" +
                Date.now();

        };


    contenedorImagen.appendChild(
        imagen
    );


    // --------------------------------------------------------
    // INFORMACIÓN
    // --------------------------------------------------------

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
        producto.nombre || "";


    info.appendChild(
        nombre
    );


    const precio =
        document.createElement(
            "div"
        );


    precio.className =
        "producto-precio";


    precio.textContent =
        "$" +
        formatearPrecio(
            Number(
                producto.precio
            ) || 0
        );


    info.appendChild(
        precio
    );


    // --------------------------------------------------------
    // BADGES
    // --------------------------------------------------------

    if (
        Number(
            producto.es_compuesto
        ) === 1
    ) {

        const badge =
            document.createElement(
                "span"
            );


        badge.className =
            "badge-compuesto";


        badge.textContent =
            "Elegir opciones";


        info.appendChild(
            badge
        );

    }


    // --------------------------------------------------------
    // BOTÓN
    // --------------------------------------------------------

    const boton =
        document.createElement(
            "button"
        );


    boton.type =
        "button";


    boton.className =
        "btn-agregar";


    boton.textContent =
        "+";


    boton.title =
        "Agregar al pedido";


    boton.onclick =
        function() {

            agregarProducto(
                producto.id
            );

        };


    div.appendChild(
        contenedorImagen
    );


    div.appendChild(
        info
    );


    div.appendChild(
        boton
    );


    return div;

}


// ============================================================
// VISOR IMAGEN GRANDE
// ============================================================

function verImagenGrande(
    imagen
) {

    cerrarImagenGrande();


    const visor =
        document.createElement(
            "div"
        );


    visor.id =
        "visor-imagen";


    visor.innerHTML = `

        <div class="visor-imagen-fondo">

            <img
                src="${imagen.src}"
                alt="${escaparHTML(
                    imagen.alt || ""
                )}"
            >


            <button
                type="button"
                class="visor-imagen-cerrar"
                aria-label="Cerrar"
            >
                ×
            </button>

        </div>

    `;


    document.body.appendChild(
        visor
    );


    const fondo =
        visor.querySelector(
            ".visor-imagen-fondo"
        );


    const boton =
        visor.querySelector(
            ".visor-imagen-cerrar"
        );


    fondo.addEventListener(
        "click",
        function(evento) {

            if (
                evento.target === fondo
            ) {

                cerrarImagenGrande();

            }

        }
    );


    boton.addEventListener(
        "click",
        cerrarImagenGrande
    );


    document.addEventListener(
        "keydown",
        cerrarImagenConEscape
    );


    document.body.style.overflow =
        "hidden";

}


// ============================================================
// CERRAR IMAGEN
// ============================================================

function cerrarImagenGrande() {

    const visor =
        document.getElementById(
            "visor-imagen"
        );


    if (visor) {

        visor.remove();

    }


    document.body.style.overflow =
        "";


    document.removeEventListener(
        "keydown",
        cerrarImagenConEscape
    );

}


// ============================================================
// ESC
// ============================================================

function cerrarImagenConEscape(
    evento
) {

    if (
        evento.key === "Escape"
    ) {

        cerrarImagenGrande();

    }

}


// ============================================================
// AGREGAR PRODUCTO
// ============================================================

function agregarProducto(
    id
) {

    const producto =
        buscarProducto(id);


    if (!producto) {

        console.error(
            "Producto no encontrado:",
            id
        );

        return;

    }


    /*
     * FUTURO:
     *
     * Si es compuesto:
     *
     * abrir selector de hijos.
     *
     * Por ahora se agrega como producto normal.
     */

    const item =
        carrito.find(
            item =>
                String(
                    item.producto_id
                ) === String(id)
        );


    if (item) {

        item.cantidad++;

    }

    else {

        carrito.push({

            producto_id:
                producto.id,

            cantidad:
                1,

            // Preparado para compuestos.
            hijos: []

        });

    }


    actualizarCarrito();


    mostrarNotificacion(
        producto.nombre +
        " agregado al pedido.",
        "ok"
    );

}


// ============================================================
// QUITAR PRODUCTO
// ============================================================

function quitarProducto(
    id
) {

    const item =
        carrito.find(
            item =>
                String(
                    item.producto_id
                ) === String(id)
        );


    if (!item) {

        return;

    }


    item.cantidad--;


    if (
        item.cantidad <= 0
    ) {

        carrito =
            carrito.filter(
                item =>
                    String(
                        item.producto_id
                    ) !== String(id)
            );

    }


    actualizarCarrito();

}


// ============================================================
// BUSCAR PRODUCTO
// ============================================================

function buscarProducto(
    id
) {

    return productos.find(
        producto =>
            String(
                producto.id
            ) === String(id)
    );

}


// ============================================================
// OBTENER CANTIDAD
// ============================================================

function obtenerCantidadCarrito() {

    return carrito.reduce(
        (
            total,
            item
        ) => {

            return (
                total +
                Number(
                    item.cantidad
                )
            );

        },
        0
    );

}


// ============================================================
// OBTENER TOTAL
// ============================================================

function obtenerTotalCarrito() {

    return carrito.reduce(
        (
            total,
            item
        ) => {

            const producto =
                buscarProducto(
                    item.producto_id
                );


            if (!producto) {

                return total;

            }


            const precio =
                Number(
                    producto.precio
                ) || 0;


            return (
                total +
                (
                    precio *
                    item.cantidad
                )
            );

        },
        0
    );

}


// ============================================================
// ACTUALIZAR CARRITO
// ============================================================

function actualizarCarrito() {

    const cantidad =
        obtenerCantidadCarrito();


    const total =
        obtenerTotalCarrito();


    const cantidadElemento =
        document.getElementById(
            "cantidad-carrito"
        );


    const totalElemento =
        document.getElementById(
            "total-carrito"
        );


    if (cantidadElemento) {

        cantidadElemento.textContent =
            cantidad === 1
                ? "1 producto"
                : cantidad +
                  " productos";

    }


    if (totalElemento) {

        totalElemento.textContent =
            "$" +
            formatearPrecio(
                total
            );

    }


    mostrarListaCarrito();

}


// ============================================================
// MOSTRAR LISTA CARRITO
// ============================================================

function mostrarListaCarrito() {

    const lista =
        document.getElementById(
            "lista-carrito"
        );


    if (!lista) {

        return;

    }


    lista.innerHTML = "";


    if (carrito.length === 0) {

        lista.innerHTML = `

            <div class="carrito-vacio">

                🛒

                <strong>
                    Tu pedido está vacío
                </strong>

                <span>
                    Agregá productos de la carta.
                </span>

            </div>

        `;

        actualizarTotalModal();

        return;

    }


    carrito.forEach(
        item => {

            const producto =
                buscarProducto(
                    item.producto_id
                );


            if (!producto) {

                return;

            }


            const cantidad =
                item.cantidad;


            const subtotal =
                (
                    Number(
                        producto.precio
                    ) || 0
                ) *
                cantidad;


            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "item-carrito";


            div.innerHTML = `

                <div class="item-carrito-info">

                    <strong>
                        ${escaparHTML(
                            producto.nombre
                        )}
                    </strong>


                    <span>
                        $${formatearPrecio(
                            subtotal
                        )}
                    </span>


                    ${
                        Number(
                            producto.es_compuesto
                        ) === 1
                            ? `
                                <small>
                                    Producto compuesto
                                </small>
                              `
                            : ""
                    }

                </div>


                <div class="controles">

                    <button
                        type="button"
                        onclick="quitarProducto(${producto.id})"
                    >
                        −
                    </button>


                    <strong>
                        ${cantidad}
                    </strong>


                    <button
                        type="button"
                        onclick="agregarProducto(${producto.id})"
                    >
                        +
                    </button>

                </div>

            `;


            lista.appendChild(
                div
            );

        }
    );


    actualizarTotalModal();

}


// ============================================================
// TOTAL MODAL
// ============================================================

function actualizarTotalModal() {

    const total =
        document.getElementById(
            "total-modal"
        );


    if (total) {

        total.textContent =
            "$" +
            formatearPrecio(
                obtenerTotalCarrito()
            );

    }

}


// ============================================================
// MOSTRAR CARRITO
// ============================================================

function mostrarCarrito() {

    if (
        carrito.length === 0
    ) {

        mostrarNotificacion(
            "Agregá al menos un producto al pedido.",
            "error"
        );

        return;

    }


    const modal =
        document.getElementById(
            "modal-carrito"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "oculto"
    );


    document.body.style.overflow =
        "hidden";


    mostrarListaCarrito();

}


// ============================================================
// CERRAR CARRITO
// ============================================================

function cerrarCarrito() {

    const modal =
        document.getElementById(
            "modal-carrito"
        );


    if (modal) {

        modal.classList.add(
            "oculto"
        );

    }


    document.body.style.overflow =
        "";

}


// ============================================================
// MEDIO DE PAGO
// ============================================================

function cambiarMedioPago() {

    const medio =
        document.querySelector(
            'input[name="medio-pago"]:checked'
        );


    const detalle =
        document.getElementById(
            "detalle-pago"
        );


    if (!detalle) {

        return;

    }


    detalle.innerHTML = "";


    if (!medio) {

        return;

    }


    // --------------------------------------------------------
    // EFECTIVO
    // --------------------------------------------------------

    if (
        medio.value === "efectivo"
    ) {

        detalle.innerHTML = `

            <div class="detalle-efectivo">

                <strong>
                    💵 Pago en efectivo
                </strong>


                <label
                    for="monto-efectivo"
                >
                    ¿Con cuánto vas a pagar?
                </label>


                <input
                    type="number"
                    id="monto-efectivo"
                    placeholder="Ej: 20000"
                    min="0"
                    inputmode="numeric"
                    oninput="calcularVuelto()"
                >


                <div
                    id="resultado-vuelto"
                    class="resultado-vuelto"
                ></div>

            </div>

        `;

        return;

    }


    // --------------------------------------------------------
    // TRANSFERENCIA
    // --------------------------------------------------------

    if (
        medio.value === "transferencia"
    ) {

        detalle.innerHTML = `

            <div class="detalle-transferencia">

                <strong>
                    🏦 Transferencia bancaria
                </strong>


                <p>
                    Alias:
                </p>


                <div class="alias-transferencia">

                    <span>
                        ${ALIAS_TRANSFERENCIA}
                    </span>


                    <button
                        type="button"
                        onclick="copiarAlias()"
                    >
                        Copiar
                    </button>

                </div>


                <p>
                    En V2 el comprobante será asociado
                    al pedido desde el sistema.
                </p>

            </div>

        `;

        return;

    }


    // --------------------------------------------------------
    // MERCADO PAGO
    // --------------------------------------------------------

    if (
        medio.value === "mercadopago"
    ) {

        detalle.innerHTML = `

            <div class="detalle-mercadopago">

                <strong>
                    💙 Mercado Pago
                </strong>


                <p>
                    Al continuar con el pedido,
                    se generará el pago.
                </p>


                <p>
                    Serás dirigido a Mercado Pago
                    para completar la operación.
                </p>

            </div>

        `;

    }

}


// ============================================================
// VUELTO
// ============================================================

function calcularVuelto() {

    const input =
        document.getElementById(
            "monto-efectivo"
        );


    const resultado =
        document.getElementById(
            "resultado-vuelto"
        );


    if (
        !input ||
        !resultado
    ) {

        return;

    }


    const monto =
        Number(
            input.value
        );


    const total =
        obtenerTotalCarrito();


    if (!monto) {

        resultado.innerHTML =
            "";

        return;

    }


    const vuelto =
        monto -
        total;


    if (
        vuelto < 0
    ) {

        resultado.innerHTML = `

            <div class="vuelto-error">

                Faltan

                <strong>
                    $${formatearPrecio(
                        Math.abs(
                            vuelto
                        )
                    )}
                </strong>

            </div>

        `;

        return;

    }


    resultado.innerHTML = `

        <div class="vuelto-ok">

            Vuelto:

            <strong>
                $${formatearPrecio(
                    vuelto
                )}
            </strong>

        </div>

    `;

}


// ============================================================
// COPIAR ALIAS
// ============================================================

async function copiarAlias() {

    try {

        await navigator.clipboard.writeText(
            ALIAS_TRANSFERENCIA
        );


        mostrarNotificacion(
            "Alias copiado.",
            "ok"
        );

    }

    catch (error) {

        alert(
            "No se pudo copiar automáticamente.\n\n" +
            "Alias: " +
            ALIAS_TRANSFERENCIA
        );

    }

}


// ============================================================
// OBTENER DATOS CLIENTE
// ============================================================

function obtenerDatosCliente() {

    const nombre =
        document.getElementById(
            "cliente-nombre"
        )?.value.trim() || "";


    const telefono =
        document.getElementById(
            "cliente-telefono"
        )?.value.trim() || "";


    const calle =
        document.getElementById(
            "cliente-calle"
        )?.value.trim() || "";


    const altura =
        document.getElementById(
            "cliente-altura"
        )?.value.trim() || "";


    const localidad =
        document.getElementById(
            "cliente-localidad"
        )?.value.trim() || "";


    const medio =
        document.querySelector(
            'input[name="medio-pago"]:checked'
        );


    return {

        nombre,

        telefono,

        calle,

        altura,

        localidad,

        medioPago:
            medio
                ? medio.value
                : null

    };

}


// ============================================================
// VALIDAR PEDIDO
// ============================================================

function validarPedido() {

    if (
        carrito.length === 0
    ) {

        mostrarNotificacion(
            "El carrito está vacío.",
            "error"
        );

        return false;

    }


    const datos =
        obtenerDatosCliente();


    if (!datos.nombre) {

        mostrarNotificacion(
            "Ingresá tu nombre.",
            "error"
        );

        enfocar(
            "cliente-nombre"
        );

        return false;

    }


    if (!datos.telefono) {

        mostrarNotificacion(
            "Ingresá un teléfono de contacto.",
            "error"
        );

        enfocar(
            "cliente-telefono"
        );

        return false;

    }


    if (!datos.calle) {

        mostrarNotificacion(
            "Ingresá la calle.",
            "error"
        );

        enfocar(
            "cliente-calle"
        );

        return false;

    }


    if (!datos.altura) {

        mostrarNotificacion(
            "Ingresá la altura.",
            "error"
        );

        enfocar(
            "cliente-altura"
        );

        return false;

    }


    if (!datos.localidad) {

        mostrarNotificacion(
            "Ingresá la localidad.",
            "error"
        );

        enfocar(
            "cliente-localidad"
        );

        return false;

    }


    if (!datos.medioPago) {

        mostrarNotificacion(
            "Seleccioná un medio de pago.",
            "error"
        );

        return false;

    }


    // --------------------------------------------------------
    // EFECTIVO
    // --------------------------------------------------------

    if (
        datos.medioPago === "efectivo"
    ) {

        const monto =
            Number(
                document.getElementById(
                    "monto-efectivo"
                )?.value
            );


        const total =
            obtenerTotalCarrito();


        if (!monto) {

            mostrarNotificacion(
                "Indicá con cuánto vas a pagar.",
                "error"
            );

            return false;

        }


        if (
            monto < total
        ) {

            mostrarNotificacion(
                "El monto ingresado es menor al total.",
                "error"
            );

            return false;

        }

    }


    return true;

}


// ============================================================
// PREPARAR PEDIDO
// ============================================================
//
// IMPORTANTE:
//
// Esta función NO manda todavía el pedido.
//
// Es el punto donde posteriormente haremos:
//
// 1. POST /pedidos
// 2. API calcula precios
// 3. API crea pedido
// 4. Mercado Pago
// 5. Redirección
//
// ============================================================

function prepararPedido() {

    if (
        !validarPedido()
    ) {

        return;

    }


    const datos =
        obtenerDatosCliente();


    const pedido =
        construirPedido();


    console.log(
        "================================"
    );


    console.log(
        "📦 PEDIDO V2"
    );


    console.log(
        "================================"
    );


    console.log(
        pedido
    );


    mostrarMensajePedido(

        "success",

        "Pedido preparado correctamente. " +
        "La conexión con Mercado Pago se agregará en la próxima etapa."

    );

}


// ============================================================
// CONSTRUIR PEDIDO
// ============================================================

function construirPedido() {

    const datos =
        obtenerDatosCliente();


    const items =
        carrito.map(
            item => {

                const producto =
                    buscarProducto(
                        item.producto_id
                    );


                return {

                    producto_id:
                        item.producto_id,

                    cantidad:
                        item.cantidad,

                    /*
                     * IMPORTANTE:
                     *
                     * No usamos el precio
                     * del navegador como
                     * precio definitivo.
                     *
                     * La API deberá
                     * consultar el precio
                     * real en Clever Cloud.
                     */

                    precio_cliente:
                        producto
                            ? Number(
                                producto.precio
                            )
                            : 0,

                    hijos:
                        item.hijos || []

                };

            }
        );


    return {

        version: 2,

        cliente: {

            nombre:
                datos.nombre,

            telefono:
                datos.telefono,

            direccion: {

                calle:
                    datos.calle,

                altura:
                    datos.altura,

                localidad:
                    datos.localidad

            }

        },


        medio_pago:
            datos.medioPago,


        efectivo:

            datos.medioPago === "efectivo"

                ? {

                    paga_con:
                        Number(
                            document.getElementById(
                                "monto-efectivo"
                            )?.value
                        ),

                    vuelto:
                        Number(
                            document.getElementById(
                                "monto-efectivo"
                            )?.value
                        ) -
                        obtenerTotalCarrito()

                }

                : null,


        items,


        /*
         * Este total sirve solamente
         * para mostrar al usuario.
         *
         * El total definitivo deberá
         * calcularlo la API.
         */

        total_cliente:
            obtenerTotalCarrito(),

        fecha_cliente:
            new Date().toISOString()

    };

}


// ============================================================
// MENSAJE PEDIDO
// ============================================================

function mostrarMensajePedido(
    tipo,
    texto
) {

    const elemento =
        document.getElementById(
            "mensaje-pedido"
        );


    if (!elemento) {

        return;

    }


    elemento.className =
        "mensaje-pedido " +
        tipo;


    elemento.textContent =
        texto;

}


// ============================================================
// ENFOCAR CAMPO
// ============================================================

function enfocar(
    id
) {

    const elemento =
        document.getElementById(
            id
        );


    if (elemento) {

        elemento.focus();

        elemento.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

}


// ============================================================
// NOTIFICACIÓN
// ============================================================

function mostrarNotificacion(
    mensaje,
    tipo = "ok"
) {

    const elemento =
        document.getElementById(
            "notificacion"
        );


    if (!elemento) {

        return;

    }


    elemento.textContent =
        mensaje;


    elemento.className =
        "notificacion " +
        tipo;


    clearTimeout(
        mostrarNotificacion.timer
    );


    mostrarNotificacion.timer =
        setTimeout(
            function() {

                elemento.classList.add(
                    "oculto"
                );

            },
            3000
        );

}


// ============================================================
// FORMATEAR PRECIO
// ============================================================

function formatearPrecio(
    numero
) {

    return new Intl.NumberFormat(
        "es-AR"
    ).format(
        Number(
            numero
        ) || 0
    );

}


// ============================================================
// ESCAPAR HTML
// ============================================================

function escaparHTML(
    texto
) {

    return String(
        texto ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}
