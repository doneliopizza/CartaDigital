let productos = [];

let carrito = {};


// ============================================================
// CONFIGURACIÓN
// ============================================================

const VERSION_CACHE = Date.now();

const URL_GITHUB =
    "https://raw.githubusercontent.com/doneliopizza/CartaDigital/main";

const URL_PRODUCTOS =
    "https://cartadigitalapi.onrender.com/productos";

const URL_FOTOS =
    URL_GITHUB + "/fotos/";

const URL_LOGO =
    URL_FOTOS + "logo.png";

const IMAGEN_PLACEHOLDER =
    URL_FOTOS + "logo.png";

const TELEFONO_WHATSAPP =
    "5491170667389";

const ALIAS_TRANSFERENCIA =
    "donelio.pizza";


// ============================================================
// CARGAR PRODUCTOS
// ============================================================

async function cargarProductos() {

    try {

        const respuesta =
            await fetch(
                URL_PRODUCTOS +
                "?v=" +
                VERSION_CACHE,
                {
                    cache: "no-store"
                }
            );


        if (!respuesta.ok) {

            throw new Error(
                "Error al consultar la API"
            );

        }


        productos =
            await respuesta.json();


        console.log(
            "✅ Productos cargados desde API:",
            productos
        );


        mostrarCarta();


        const cargando =
            document.getElementById(
                "cargando"
            );


        if (cargando) {

            cargando.style.display =
                "none";

        }


    } catch (error) {

        console.error(
            "❌ Error cargando productos:",
            error
        );


        const cargando =
            document.getElementById(
                "cargando"
            );


        if (cargando) {

            cargando.innerText =
                "No se pudo cargar la carta.";

        }

    }

}


// ============================================================
// CARGAR LOGO
// ============================================================

function cargarLogo() {

    const encabezado =
        document.querySelector(
            ".encabezado"
        );


    if (!encabezado) {

        return;

    }


    const logo =
        document.createElement(
            "img"
        );


    logo.id =
        "logo-don-elio";


    logo.className =
        "logo-don-elio";


    logo.alt =
        "Don Elio Pizzas & Pastas";


    logo.src =
        URL_LOGO +
        "?v=" +
        VERSION_CACHE;


    logo.onerror = function () {

        this.style.display =
            "none";

    };


    encabezado.appendChild(
        logo
    );

}


// ============================================================
// OBTENER IMAGEN DEL PRODUCTO
// ============================================================

function obtenerImagen(producto) {

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
            VERSION_CACHE
        );

    }


    return (
        IMAGEN_PLACEHOLDER +
        "?v=" +
        VERSION_CACHE
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


            const titulo =
                document.createElement(
                    "h2"
                );


            titulo.innerText =
                rubro;


            seccion.appendChild(
                titulo
            );


            categorias[rubro].forEach(
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


                    const nombre =
                        producto.nombre || "";


                    const precio =
                        Number(
                            producto.precio
                        ) || 0;


                    const id =
                        producto.id;


                    div.innerHTML = `

                        <div class="producto-imagen">

                            <img
                                src="${imagen}"
                                alt="${nombre}"
                                loading="lazy"
                                onclick="verImagenGrande(this)"
                                onerror="
                                    this.onerror=null;
                                    this.src='${IMAGEN_PLACEHOLDER}?v=${VERSION_CACHE}'
                                "
                            >

                        </div>


                        <div class="producto-info">

                            <div class="producto-nombre">

                                ${nombre}

                            </div>


                            <div class="producto-precio">

                                $${formatearPrecio(precio)}

                            </div>

                        </div>


                        <button
                            type="button"
                            class="btn-agregar"
                            onclick="agregarProducto(${id})"
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
// VISOR DE IMAGEN GRANDE
// ============================================================

function verImagenGrande(imagen) {

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
                alt="${imagen.alt || "Imagen"}"
            >


            <button
                class="visor-imagen-cerrar"
                type="button"
                aria-label="Cerrar imagen"
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


    if (fondo) {

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

    }


    const botonCerrar =
        visor.querySelector(
            ".visor-imagen-cerrar"
        );


    if (botonCerrar) {

        botonCerrar.addEventListener(
            "click",
            cerrarImagenGrande
        );

    }


    document.addEventListener(
        "keydown",
        cerrarImagenConEscape
    );


    document.body.style.overflow =
        "hidden";

}


// ============================================================
// CERRAR IMAGEN GRANDE
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
// CERRAR CON ESCAPE
// ============================================================

function cerrarImagenConEscape(evento) {

    if (
        evento.key === "Escape"
    ) {

        cerrarImagenGrande();

    }

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


    if (
        carrito[id] <= 0
    ) {

        delete carrito[id];

    }


    actualizarCarrito();

}


// ============================================================
// TOTAL CARRITO
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
// CANTIDAD CARRITO
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


    const elementoCantidad =
        document.getElementById(
            "cantidad-carrito"
        );


    const elementoTotal =
        document.getElementById(
            "total-carrito"
        );


    if (elementoCantidad) {

        elementoCantidad.innerText =
            cantidad === 1
                ? "1 producto"
                : `${cantidad} productos`;

    }


    if (elementoTotal) {

        elementoTotal.innerText =
            `$${formatearPrecio(total)}`;

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

                    $${formatearPrecio(subtotal)}

                </div>


                <div class="controles">

                    <button
                        type="button"
                        onclick="quitarProducto(${id})"
                    >
                        −
                    </button>


                    <strong>
                        ${cantidad}
                    </strong>


                    <button
                        type="button"
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

            <div class="mensaje-faltante">

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

        <div class="mensaje-vuelto">

            Vuelto:

            <strong>
                $${formatearPrecio(vuelto)}
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


    const modal =
        document.getElementById(
            "modal-carrito"
        );


    if (modal) {

        modal.style.display =
            "block";

    }


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

        modal.style.display =
            "none";

    }

}


// ============================================================
// FORMATEAR PRECIO
// ============================================================

function formatearPrecio(numero) {

    return new Intl.NumberFormat(
        "es-AR"
    ).format(
        Number(numero) || 0
    );

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

        alert("Ingresá tu nombre.");

        return false;

    }


    if (!datos.telefono) {

        alert(
            "Ingresá un teléfono de contacto."
        );

        return false;

    }


    if (!datos.calle) {

        alert("Ingresá la calle.");

        return false;

    }


    if (!datos.altura) {

        alert("Ingresá la altura.");

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

function generarMensajeWhatsApp() {

    const datos =
        obtenerDatosCliente();


    const total =
        obtenerTotalCarrito();


    let mensaje =
        "🍕 *NUEVO PEDIDO - DON ELIO*";


    mensaje += "\n\n";


    mensaje +=
        "👤 *CLIENTE*\n";


    mensaje +=
        "Nombre: " +
        datos.nombre +
        "\n";


    mensaje +=
        "Teléfono: " +
        datos.telefono +
        "\n\n";


    mensaje +=
        "📍 *DIRECCIÓN DE ENTREGA*\n";


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


    mensaje +=
        "🛒 *PEDIDO*\n";


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


            mensaje +=
                `${cantidad} x ` +
                `${producto.nombre} - ` +
                `$${formatearPrecio(subtotal)}\n`;

        }
    );


    mensaje += "\n";


    mensaje +=
        "💰 *TOTAL: $" +
        formatearPrecio(total) +
        "*";


    mensaje += "\n\n";


    mensaje +=
        "💳 *MEDIO DE PAGO*\n";


    if (
        datos.medioPago === "efectivo"
    ) {

        const monto =
            Number(
                document.getElementById(
                    "monto-efectivo"
                ).value
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


    mensaje += "\n\n";


    mensaje +=
        "📲 Pedido realizado desde la carta digital.";


    return mensaje;

}


// ============================================================
// ENVIAR WHATSAPP
// ============================================================

function enviarWhatsApp() {

    if (
        Object.keys(carrito).length === 0
    ) {

        alert(
            "El carrito está vacío."
        );

        return;

    }


    if (!validarPedido()) {

        return;

    }


    const mensaje =
        generarMensajeWhatsApp();


    const url =
        "https://wa.me/" +
        TELEFONO_WHATSAPP +
        "?text=" +
        encodeURIComponent(
            mensaje
        );


    window.open(
        url,
        "_blank"
    );

}


// ============================================================
// INICIAR CARTA
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        cargarLogo();

        cargarProductos();

    }
);
