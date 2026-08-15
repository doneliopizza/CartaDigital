let productos = [];

let carrito = {};


// ============================================================
// CONFIGURACIÓN
// ============================================================

const IMAGEN_PLACEHOLDER =
    "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=500&q=80";

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
            "https://raw.githubusercontent.com/doneliopizza/CartaDigital/main/productos.json?v=" + Date.now(),
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
// OBTENER IMAGEN DEL PRODUCTO
// ============================================================

function obtenerImagen(producto) {

    return IMAGEN_PLACEHOLDER;

}


// ============================================================
// MOSTRAR CARTA
// ============================================================

function mostrarCarta() {

    const carta =
        document.getElementById("carta");

    carta.innerHTML = "";

    const categorias = {};


    // ========================================================
    // AGRUPAR PRODUCTOS POR RUBRO
    // ========================================================

    productos.forEach(producto => {

        if (!categorias[producto.rubro]) {

            categorias[producto.rubro] = [];

        }

        categorias[producto.rubro].push(
            producto
        );

    });


    // ========================================================
    // CREAR CATEGORÍAS
    // ========================================================

    Object.keys(categorias).forEach(
        rubro => {

            const seccion =
                document.createElement(
                    "section"
                );

            seccion.className =
                "categoria";


            // Título

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


                    div.innerHTML = `

                        <div class="producto-imagen">

                            <img
                                src="${imagen}"
                                alt="${producto.nombre}"
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
                            onclick="agregarProducto(${producto.id})">

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
// CALCULAR TOTAL
// ============================================================

function obtenerTotalCarrito() {

    let total = 0;

    Object.keys(carrito).forEach(
        id => {

            const producto =
                productos.find(
                    p => p.id == id
                );

            if (!producto) {

                return;

            }

            total +=
                producto.precio *
                carrito[id];

        }
    );

    return total;

}


// ============================================================
// CANTIDAD TOTAL
// ============================================================

function obtenerCantidadCarrito() {

    let cantidad = 0;

    Object.keys(carrito).forEach(
        id => {

            cantidad += carrito[id];

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


    // Cantidad

    document.getElementById(
        "cantidad-carrito"
    ).innerText =

        cantidad === 1

            ? "1 producto"

            : `${cantidad} productos`;


    // Total

    document.getElementById(
        "total-carrito"
    ).innerText =

        `$${formatearPrecio(total)}`;


    // Modal

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


    lista.innerHTML = "";


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
                producto.precio *
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
                        onclick="quitarProducto(${id})">

                        −

                    </button>


                    <strong>
                        ${cantidad}
                    </strong>


                    <button
                        onclick="agregarProducto(${id})">

                        +

                    </button>

                </div>

            `;


            lista.appendChild(
                div
            );

        }
    );


    // ========================================================
    // TOTAL
    // ========================================================

    const total =
        obtenerTotalCarrito();


    document.getElementById(
        "total-modal"
    ).innerText =

        `$${formatearPrecio(total)}`;


    // ========================================================
    // FORMULARIO DEL CLIENTE
    // ========================================================

    crearFormularioPedido();

}


// ============================================================
// CREAR FORMULARIO DEL PEDIDO
// ============================================================

function crearFormularioPedido() {

    let formulario =
        document.getElementById(
            "formulario-pedido"
        );


    // Si todavía no existe, lo creamos

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
                Datos del pedido
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
                Teléfono
            </label>

            <input
                type="tel"
                id="cliente-telefono"
                placeholder="Ej: 11 7066 7389"
                autocomplete="tel"
            >


            <h3>
                Dirección de entrega
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
                Forma de pago
            </h3>


            <div class="medios-pago">

                <label class="medio-opcion">

                    <input
                        type="radio"
                        name="medio-pago"
                        value="efectivo"
                        onchange="cambiarMedioPago()"
                    >

                    Efectivo

                </label>


                <label class="medio-opcion">

                    <input
                        type="radio"
                        name="medio-pago"
                        value="transferencia"
                        onchange="cambiarMedioPago()"
                    >

                    Transferencia

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


    // ========================================================
    // SI YA HABÍA DATOS, RECUPERARLOS
    // ========================================================

    configurarCalculoEfectivo();

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


    if (!medio) {

        detalle.innerHTML = "";

        return;

    }


    // ========================================================
    // EFECTIVO
    // ========================================================

    if (medio.value === "efectivo") {

        detalle.innerHTML = `

            <div class="detalle-efectivo">

                <label>
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

                <div id="resultado-vuelto"></div>

            </div>

        `;

        return;

    }


    // ========================================================
    // TRANSFERENCIA
    // ========================================================

    if (medio.value === "transferencia") {

        detalle.innerHTML = `

            <div class="detalle-transferencia">

                <strong>
                    Transferencia bancaria
                </strong>

                <p>
                    Alias:
                </p>

                <div class="alias-transferencia">

                    <span id="alias-transferencia">
                        ${ALIAS_TRANSFERENCIA}
                    </span>

                    <button
                        type="button"
                        onclick="copiarAlias()">

                        Copiar

                    </button>

                </div>

                <p>
                    Realizá la transferencia y luego
                    enviá el comprobante por WhatsApp.
                </p>

            </div>

        `;

        return;

    }


    // ========================================================
    // MERCADO PAGO
    // ========================================================

    if (medio.value === "mercadopago") {

        detalle.innerHTML = `

            <div class="detalle-mercadopago">

                <strong>
                    Mercado Pago
                </strong>

                <p>
                    Podés realizar el pago mediante
                    Mercado Pago.
                </p>

                <p>
                    Al enviar el pedido por WhatsApp
                    te indicaremos cómo realizar el pago.
                </p>

            </div>

        `;

    }

}


// ============================================================
// CONFIGURAR CÁLCULO DE EFECTIVO
// ============================================================

function configurarCalculoEfectivo() {

    const medio =
        document.querySelector(
            'input[name="medio-pago"]:checked'
        );


    if (
        medio &&
        medio.value === "efectivo"
    ) {

        cambiarMedioPago();

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


    if (!input || !resultado) {

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

            <div style="color:#c0392b; margin-top:8px;">

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

        <div style="margin-top:8px;">

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


            setTimeout(() => {

                boton.innerText =
                    textoOriginal;

            }, 2000);

        }


    } catch (error) {

        alert(
            "No se pudo copiar automáticamente. Alias: " +
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
// OBTENER DATOS DEL CLIENTE
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

        const monto =
            Number(
                document.getElementById(
                    "monto-efectivo"
                )?.value
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
// GENERAR PEDIDO PARA WHATSAPP
// ============================================================

function generarMensajeWhatsApp() {

    const datos =
        obtenerDatosCliente();


    const total =
        obtenerTotalCarrito();


    let mensaje =
        "🍕 *NUEVO PEDIDO - DON ELIO*";


    mensaje +=
        "\n\n";


    // ========================================================
    // DATOS DEL CLIENTE
    // ========================================================

    mensaje +=
        "👤 *CLIENTE*\n";

    mensaje +=
        "Nombre: " +
        datos.nombre +
        "\n";

    mensaje +=
        "Teléfono: " +
        datos.telefono +
        "\n";


    mensaje +=
        "\n";


    // ========================================================
    // DIRECCIÓN
    // ========================================================

    mensaje +=
        "📍 *DIRECCIÓN*\n";

    mensaje +=
        datos.calle +
        " " +
        datos.altura +
        "\n";

    mensaje +=
        datos.localidad +
        "\n";


    mensaje +=
        "\n";


    // ========================================================
    // PEDIDO
    // ========================================================

    mensaje +=
        "🛒 *PEDIDO*\n";


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
                producto.precio *
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
        "💰 *TOTAL: $" +
        formatearPrecio(total) +
        "*";


    mensaje +=
        "\n\n";


    // ========================================================
    // MEDIO DE PAGO
    // ========================================================

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


    mensaje +=
        "\n\n";


    mensaje +=
        "📲 Pedido realizado desde la carta digital.";


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
    // CREAR URL
    // ========================================================

    const url =
        "https://wa.me/" +
        TELEFONO_WHATSAPP +
        "?text=" +
        encodeURIComponent(
            mensaje
        );


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

cargarProductos();
