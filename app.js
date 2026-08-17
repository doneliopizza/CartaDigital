let productos = [];

let carrito = {};


// ============================================================
// CONFIGURACIÓN
// ============================================================

const URL_GITHUB =
    "https://raw.githubusercontent.com/doneliopizza/CartaDigital/main";

const URL_PRODUCTOS =
    URL_GITHUB + "/productos.json";

const URL_FOTOS =
    URL_GITHUB + "/fotos/";

const URL_LOGO =
    URL_FOTOS + "logo.png";

const IMAGEN_PLACEHOLDER =
    "https://raw.githubusercontent.com/doneliopizza/CartaDigital/refs/heads/main/fotos/logo.png";

const TELEFONO_WHATSAPP =
    "5491170667389";

const ALIAS_TRANSFERENCIA =
    "donelio.pizza";


// ============================================================
// CARGAR PRODUCTOS
// ============================================================

async function cargarProductos() {

    try {

        const respuesta = await fetch(
            URL_PRODUCTOS + "?v=" + Date.now(),
            {
                cache: "no-store"
            }
        );


        if (!respuesta.ok) {

            throw new Error(
                "Error al consultar productos.json"
            );

        }


        productos = await respuesta.json();


        mostrarCarta();


        document.getElementById(
            "cargando"
        ).style.display = "none";


    } catch (error) {

        console.error(error);


        document.getElementById(
            "cargando"
        ).innerText =
            "No se pudo cargar la carta.";

    }

}


// ============================================================
// CARGAR LOGO
// ============================================================

function cargarLogo() {

    const encabezado =
        document.querySelector(".encabezado");


    if (!encabezado) {

        return;

    }


    // Evitar duplicar el logo

    if (
        document.getElementById(
            "logo-don-elio"
        )
    ) {

        return;

    }


    const logo =
        document.createElement("img");


    logo.id =
        "logo-don-elio";


    // Cache busting

    logo.src =
        URL_LOGO +
        "?v=" +
        Date.now();


    logo.alt =
        "Don Elio Pizzas & Pastas";


    logo.className =
        "logo-don-elio";


    // Si no existe la imagen,
    // ocultar el logo

    logo.onerror = function () {

        this.style.display =
            "none";

    };


    // Insertar antes del H1

    const titulo =
        encabezado.querySelector("h1");


    if (titulo) {

        encabezado.insertBefore(
            logo,
            titulo
        );

    } else {

        encabezado.prepend(
            logo
        );

    }

}


// ============================================================
// OBTENER IMAGEN DEL PRODUCTO
// ============================================================

function obtenerImagen(producto) {

    /*
        El JSON debe contener:

        "url": "producto.jpg"

        Entonces se buscará:

        https://raw.githubusercontent.com/
        doneliopizza/CartaDigital/main/fotos/producto.jpg

        Si "url" está vacío o no existe,
        se utiliza el placeholder.
    */


    if (
        producto.url &&
        typeof producto.url === "string" &&
        producto.url.trim() !== ""
    ) {

        return (
            URL_FOTOS +
            encodeURIComponent(
                producto.url.trim()
            )
        );

    }


    return IMAGEN_PLACEHOLDER;

}


// ============================================================
// MOSTRAR CARTA
// ============================================================

function mostrarCarta() {

    const carta =
        document.getElementById(
            "carta"
        );


    carta.innerHTML = "";


    const categorias = {};


    // ========================================================
    // AGRUPAR PRODUCTOS POR RUBRO
    // ========================================================

    productos.forEach(
        producto => {

            if (
                !categorias[
                    producto.rubro
                ]
            ) {

                categorias[
                    producto.rubro
                ] = [];

            }


            categorias[
                producto.rubro
            ].push(
                producto
            );

        }
    );


    // ========================================================
    // CREAR CATEGORÍAS
    // ========================================================

    Object.keys(
        categorias
    ).forEach(
        rubro => {

            const seccion =
                document.createElement(
                    "section"
                );


            seccion.className =
                "categoria";


            // =================================================
            // TÍTULO
            // =================================================

            const titulo =
                document.createElement(
                    "h2"
                );


            titulo.innerText =
                rubro;


            seccion.appendChild(
                titulo
            );


            // =================================================
            // PRODUCTOS
            // =================================================

            categorias[
                rubro
            ].forEach(
                producto => {

                    const div =
                        document.createElement(
                            "div"
                        );


                    div.className =
                        "producto";


                    const imagen =
                        obtenerImagen(
                            producto
                        );


                    div.innerHTML = `

                        <div class="producto-imagen">


                            <img
                                src="${imagen}"
                                alt="${producto.nombre}"
                                loading="lazy"
                                onclick="ampliarImagen('${imagen}')"
                                onerror="
                                    this.onerror=null;
                                    this.src='${IMAGEN_PLACEHOLDER}'
                                "
                            >
                        </div>


                        <div class="producto-info">

                            <div class="producto-nombre">

                                ${producto.nombre}

                            </div>


                            <div class="producto-precio">

                                $${formatearPrecio(
                                    producto.precio
                                )}

                            </div>

                        </div>


                        <button
                            class="btn-agregar"
                            onclick="agregarProducto(${producto.id})"
                        >

                            +

                        </button>

                    `;


                    seccion.appendChild(
                        div
                    );

                }
            );


            carta.appendChild(
                seccion
            );

        }
    );

}

// ============================================================
// AMPLIAR IMAGEN DEL PRODUCTO
// ============================================================

function ampliarImagen(imagen) {

    let visor =
        document.getElementById(
            "visor-imagen"
        );


    // Si todavía no existe, lo creamos

    if (!visor) {

        visor =
            document.createElement(
                "div"
            );


        visor.id =
            "visor-imagen";


        visor.innerHTML = `

            <div
                class="visor-fondo"
                onclick="cerrarImagen()"
            ></div>


            <div class="visor-contenido">


                <button
                    type="button"
                    class="cerrar-imagen"
                    onclick="cerrarImagen()"
                    aria-label="Cerrar imagen"
                >
                    ✕
                </button>


                <img
                    id="imagen-ampliada"
                    src=""
                    alt="Imagen ampliada"
                >


            </div>

        `;


        document.body.appendChild(
            visor
        );

    }


    const imagenAmpliada =
        document.getElementById(
            "imagen-ampliada"
        );


    imagenAmpliada.src =
        imagen;


    visor.classList.add(
        "activo"
    );


    // Evitar que el fondo se pueda mover

    document.body.style.overflow =
        "hidden";

}



// ============================================================
// CERRAR IMAGEN AMPLIADA
// ============================================================

function cerrarImagen() {

    const visor =
        document.getElementById(
            "visor-imagen"
        );


    if (!visor) {

        return;

    }


    visor.classList.remove(
        "activo"
    );


    // Volver a permitir scroll

    document.body.style.overflow =
        "";

}
// ============================================================
// AGREGAR PRODUCTO
// ============================================================

function agregarProducto(id) {

    if (!carrito[id]) {

        carrito[id] = 0;

    }


    carrito[id]++;


    actualizarCarrito();

}


// ============================================================
// RESTAR PRODUCTO
// ============================================================

function quitarProducto(id) {

    if (!carrito[id]) {

        return;

    }


    carrito[id]--;


    if (carrito[id] <= 0) {

        delete carrito[id];

    }


    actualizarCarrito();

}


// ============================================================
// OBTENER TOTAL
// ============================================================

function obtenerTotalCarrito() {

    let total = 0;


    Object.keys(
        carrito
    ).forEach(
        id => {

            const producto =
                productos.find(
                    p => p.id == id
                );


            if (!producto) {

                return;

            }


            total +=
                Number(
                    producto.precio
                ) *
                carrito[id];

        }
    );


    return total;

}


// ============================================================
// OBTENER CANTIDAD
// ============================================================

function obtenerCantidadCarrito() {

    let cantidad = 0;


    Object.keys(
        carrito
    ).forEach(
        id => {

            cantidad +=
                carrito[id];

        }
    );


    return cantidad;

}


// ============================================================
// ACTUALIZAR CARRITO
// ============================================================

function actualizarCarrito() {

    const cantidad =
        obtenerCantidadCarrito();


    const total =
        obtenerTotalCarrito();


    document.getElementById(
        "cantidad-carrito"
    ).innerText =

        cantidad === 1

            ? "1 producto"

            : `${cantidad} productos`;


    document.getElementById(
        "total-carrito"
    ).innerText =

        `$${formatearPrecio(total)}`;


    mostrarListaCarrito();

}


// ============================================================
// MOSTRAR LISTA DEL CARRITO
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


    Object.keys(
        carrito
    ).forEach(
        id => {

            const producto =
                productos.find(
                    p => p.id == id
                );


            if (!producto) {

                return;

            }


            const cantidad =
                carrito[id];


            const subtotal =
                Number(
                    producto.precio
                ) *
                cantidad;


            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "item-carrito";


            div.innerHTML = `

                <div>

                    <strong>
                        ${producto.nombre}
                    </strong>

                    <br>

                    $${formatearPrecio(
                        subtotal
                    )}

                </div>


                <div class="controles">

                    <button
                        onclick="quitarProducto(${id})"
                    >

                        −

                    </button>


                    <strong>
                        ${cantidad}
                    </strong>


                    <button
                        onclick="agregarProducto(${id})"
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


    const total =
        obtenerTotalCarrito();


    const totalModal =
        document.getElementById(
            "total-modal"
        );


    if (totalModal) {

        totalModal.innerText =
            `$${formatearPrecio(total)}`;

    }


    crearFormularioPedido();

}


// ============================================================
// CREAR FORMULARIO
// ============================================================

function crearFormularioPedido() {

    let formulario =
        document.getElementById(
            "formulario-pedido"
        );


    if (!formulario) {

        formulario =
            document.createElement(
                "div"
            );


        formulario.id =
            "formulario-pedido";


        const botonWhatsApp =
            document.querySelector(
                ".btn-whatsapp"
            );


        if (botonWhatsApp) {

            botonWhatsApp.before(
                formulario
            );

        }

    }


    formulario.innerHTML = `

        <div class="datos-pedido">

            <h3>
                👤 Datos del cliente
            </h3>


            <label>
                Nombre
            </label>

            <input
                type="text"
                id="cliente-nombre"
                placeholder="Tu nombre"
                autocomplete="name"
            >


            <label>
                Teléfono de contacto
            </label>

            <input
                type="tel"
                id="cliente-telefono"
                placeholder="Ej: 11 7066 7389"
                autocomplete="tel"
            >


            <h3>
                📍 Dirección de entrega
            </h3>


            <label>
                Calle
            </label>

            <input
                type="text"
                id="cliente-calle"
                placeholder="Ej: Av. San Martín"
                autocomplete="street-address"
            >


            <label>
                Altura
            </label>

            <input
                type="number"
                id="cliente-altura"
                placeholder="Ej: 1234"
                inputmode="numeric"
            >


            <label>
                Localidad
            </label>

            <input
                type="text"
                id="cliente-localidad"
                placeholder="Ej: Villa Ballester"
                autocomplete="address-level2"
            >


            <h3>
                💳 Medio de pago
            </h3>


            <div class="medios-pago">

                <label class="medio-opcion">

                    <input
                        type="radio"
                        name="medio-pago"
                        value="efectivo"
                        onchange="cambiarMedioPago()"
                    >

                    💵 Efectivo

                </label>


                <label class="medio-opcion">

                    <input
                        type="radio"
                        name="medio-pago"
                        value="transferencia"
                        onchange="cambiarMedioPago()"
                    >

                    🏦 Transferencia

                </label>


                <label class="medio-opcion">

                    <input
                        type="radio"
                        name="medio-pago"
                        value="mercadopago"
                        onchange="cambiarMedioPago()"
                    >

                    Mercado Pago

                </label>

            </div>


            <div id="detalle-pago"></div>

        </div>

    `;

}


// ============================================================
// CAMBIAR MEDIO DE PAGO
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


    if (!medio) {

        detalle.innerHTML = "";

        return;

    }


    // ========================================================
    // EFECTIVO
    // ========================================================

    if (
        medio.value === "efectivo"
    ) {

        detalle.innerHTML = `

            <div class="detalle-efectivo">

                <label>
                    💵 ¿Con cuánto vas a pagar?
                </label>

                <input
                    type="number"
                    id="monto-efectivo"
                    placeholder="Ej: 20000"
                    min="0"
                    inputmode="numeric"
                    oninput="calcularVuelto()"
                >

                <div id="resultado-vuelto"></div>

            </div>

        `;

        return;

    }


    // ========================================================
    // TRANSFERENCIA
    // ========================================================

    if (
        medio.value === "transferencia"
    ) {

        detalle.innerHTML = `

            <div class="detalle-transferencia">

                <strong>
                    🏦 Transferencia bancaria
                </strong>

                <p>
                    Realizá la transferencia al siguiente alias:
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
                    Después enviá el comprobante
                    junto con el pedido por WhatsApp.
                </p>

            </div>

        `;

        return;

    }


    // ========================================================
    // MERCADO PAGO
    // ========================================================

    if (
        medio.value === "mercadopago"
    ) {

        detalle.innerHTML = `

            <div class="detalle-mercadopago">

                <strong>
                    Mercado Pago
                </strong>

                <p>
                    Seleccioná esta opción y enviá
                    el pedido por WhatsApp.
                </p>

                <p>
                    Te indicaremos cómo realizar
                    el pago.
                </p>

            </div>

        `;

    }

}


// ============================================================
// CALCULAR VUELTO
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

        resultado.innerHTML = "";

        return;

    }


    const vuelto =
        monto - total;


    if (vuelto < 0) {

        resultado.innerHTML = `

            <div style="
                color:#c0392b;
                margin-top:8px;
            ">

                Faltan

                <strong>
                    $${formatearPrecio(
                        Math.abs(vuelto)
                    )}
                </strong>

            </div>

        `;

        return;

    }


    resultado.innerHTML = `

        <div style="
            color:#27ae60;
            margin-top:8px;
        ">

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


        const boton =
            document.querySelector(
                ".alias-transferencia button"
            );


        if (boton) {

            const textoOriginal =
                boton.innerText;


            boton.innerText =
                "¡Copiado!";


            setTimeout(
                () => {

                    boton.innerText =
                        textoOriginal;

                },
                2000
            );

        }


    } catch (error) {

        alert(
            "No se pudo copiar automáticamente.\n\n" +
            "Alias: " +
            ALIAS_TRANSFERENCIA
        );

    }

}


// ============================================================
// MOSTRAR CARRITO
// ============================================================

function mostrarCarrito() {

    if (
        Object.keys(carrito).length === 0
    ) {

        alert(
            "Agregá al menos un producto al pedido."
        );

        return;

    }


    document.getElementById(
        "modal-carrito"
    ).style.display =
        "block";


    mostrarListaCarrito();

}


// ============================================================
// CERRAR CARRITO
// ============================================================

function cerrarCarrito() {

    document.getElementById(
        "modal-carrito"
    ).style.display =
        "none";

}


// ============================================================
// FORMATEAR PRECIO
// ============================================================

function formatearPrecio(numero) {

    return new Intl.NumberFormat(
        "es-AR"
    ).format(numero);

}


// ============================================================
// OBTENER DATOS CLIENTE
// ============================================================

function obtenerDatosCliente() {

    const nombre =
        document.getElementById(
            "cliente-nombre"
        )?.value.trim();


    const telefono =
        document.getElementById(
            "cliente-telefono"
        )?.value.trim();


    const calle =
        document.getElementById(
            "cliente-calle"
        )?.value.trim();


    const altura =
        document.getElementById(
            "cliente-altura"
        )?.value.trim();


    const localidad =
        document.getElementById(
            "cliente-localidad"
        )?.value.trim();


    const medioPago =
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
            medioPago
                ? medioPago.value
                : null

    };

}


// ============================================================
// VALIDAR PEDIDO
// ============================================================

function validarPedido() {

    const datos =
        obtenerDatosCliente();


    if (!datos.nombre) {

        alert(
            "Ingresá tu nombre."
        );

        return false;

    }


    if (!datos.telefono) {

        alert(
            "Ingresá un teléfono de contacto."
        );

        return false;

    }


    if (!datos.calle) {

        alert(
            "Ingresá la calle."
        );

        return false;

    }


    if (!datos.altura) {

        alert(
            "Ingresá la altura."
        );

        return false;

    }


    if (!datos.localidad) {

        alert(
            "Ingresá la localidad."
        );

        return false;

    }


    if (!datos.medioPago) {

        alert(
            "Seleccioná un medio de pago."
        );

        return false;

    }


    // ========================================================
    // VALIDAR EFECTIVO
    // ========================================================

    if (
        datos.medioPago === "efectivo"
    ) {

        const input =
            document.getElementById(
                "monto-efectivo"
            );


        const monto =
            Number(
                input?.value
            );


        const total =
            obtenerTotalCarrito();


        if (!monto) {

            alert(
                "Indicá con cuánto vas a pagar."
            );

            return false;

        }


        if (monto < total) {

            alert(
                "El monto ingresado es menor al total del pedido."
            );

            return false;

        }

    }


    return true;

}


// ============================================================
// GENERAR MENSAJE WHATSAPP
// ============================================================

// ============================================================
// GENERAR MENSAJE WHATSAPP
// ============================================================

function generarMensajeWhatsApp() {

    const datos =
        obtenerDatosCliente();

    const total =
        obtenerTotalCarrito();


    // Emojis mediante Unicode
    // para evitar problemas de codificación
    const EMOJI_PIZZA = "\u{1F355}";
    const EMOJI_PERSONA = "\u{1F464}";
    const EMOJI_UBICACION = "\u{1F4CD}";
    const EMOJI_CARRITO = "\u{1F6D2}";
    const EMOJI_DINERO = "\u{1F4B0}";
    const EMOJI_TARJETA = "\u{1F4B3}";
    const EMOJI_TELEFONO = "\u{1F4F2}";


    let mensaje =
        EMOJI_PIZZA +
        " *NUEVO PEDIDO - DON ELIO*";


    mensaje +=
        "\n\n";


    // ========================================================
    // CLIENTE
    // ========================================================

    mensaje +=
        EMOJI_PERSONA +
        " *CLIENTE*\n";


    mensaje +=
        "Nombre: " +
        datos.nombre +
        "\n";


    mensaje +=
        "Teléfono: " +
        datos.telefono +
        "\n\n";


    // ========================================================
    // DIRECCIÓN
    // ========================================================

    mensaje +=
        EMOJI_UBICACION +
        " *DIRECCIÓN DE ENTREGA*\n";


    mensaje +=
        "Calle: " +
        datos.calle +
        "\n";


    mensaje +=
        "Altura: " +
        datos.altura +
        "\n";


    mensaje +=
        "Localidad: " +
        datos.localidad +
        "\n\n";


    // ========================================================
    // PEDIDO
    // ========================================================

    mensaje +=
        EMOJI_CARRITO +
        " *PEDIDO*\n";


    Object.keys(carrito).forEach(
        id => {

            const producto =
                productos.find(
                    p => p.id == id
                );


            if (!producto) {
                return;
            }


            const cantidad =
                carrito[id];


            const subtotal =
                Number(
                    producto.precio
                ) *
                cantidad;


            mensaje +=
                `${cantidad} x ` +
                `${producto.nombre} - ` +
                `$${formatearPrecio(subtotal)}\n`;

        }
    );


    mensaje +=
        "\n";


    // ========================================================
    // TOTAL
    // ========================================================

    mensaje +=
        EMOJI_DINERO +
        " *TOTAL: $" +
        formatearPrecio(total) +
        "*";


    mensaje +=
        "\n\n";


    // ========================================================
    // MEDIO DE PAGO
    // ========================================================

    mensaje +=
        EMOJI_TARJETA +
        " *MEDIO DE PAGO*\n";


    if (
        datos.medioPago === "efectivo"
    ) {

        const input =
            document.getElementById(
                "monto-efectivo"
            );


        const monto =
            Number(
                input?.value
            );


        const vuelto =
            monto - total;


        mensaje +=
            "Efectivo\n";


        mensaje +=
            "Paga con: $" +
            formatearPrecio(monto) +
            "\n";


        mensaje +=
            "Vuelto: $" +
            formatearPrecio(vuelto);

    }


    if (
        datos.medioPago === "transferencia"
    ) {

        mensaje +=
            "Transferencia\n";


        mensaje +=
            "Alias: " +
            ALIAS_TRANSFERENCIA;

    }


    if (
        datos.medioPago === "mercadopago"
    ) {

        mensaje +=
            "Mercado Pago\n";


        mensaje +=
            "Coordinar pago por WhatsApp.";

    }


    mensaje +=
        "\n\n";


    mensaje +=
        EMOJI_TELEFONO +
        " Pedido realizado desde la carta digital.";


    return mensaje;

}

// ============================================================
// ENVIAR PEDIDO A WHATSAPP
// ============================================================

function enviarWhatsApp() {

    // ========================================================
    // VALIDAR CARRITO
    // ========================================================

    if (
        Object.keys(carrito).length === 0
    ) {

        alert(
            "El carrito está vacío."
        );

        return;

    }


    // ========================================================
    // VALIDAR DATOS
    // ========================================================

    if (!validarPedido()) {

        return;

    }


    // ========================================================
    // GENERAR MENSAJE
    // ========================================================

    const mensaje =
        generarMensajeWhatsApp();


    // ========================================================
    // GENERAR URL DE WHATSAPP
    // ========================================================

    /*
        URLSearchParams se encarga de codificar
        correctamente UTF-8.

        Esto permite conservar:

        🍕
        👤
        📍
        🛒
        💰
        💳
        📲

        y también:

        á é í ó ú
        ñ
        ü
        saltos de línea
        etc.
    */

    const parametros =
        new URLSearchParams();


    parametros.set(
        "text",
        mensaje
    );


    const url =
        "https://wa.me/" +
        TELEFONO_WHATSAPP +
        "?" +
        parametros.toString();


    // ========================================================
    // ABRIR WHATSAPP
    // ========================================================

    window.open(
        url,
        "_blank"
    );

}

// ============================================================
// INICIAR CARTA
// ============================================================

cargarLogo();

cargarProductos();
