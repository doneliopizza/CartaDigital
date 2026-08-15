let productos = [];

let carrito = {};


// ============================
// CONFIGURACIÓN
// ============================

const IMAGEN_PLACEHOLDER =
    "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=500&q=80";


// ============================
// CARGAR PRODUCTOS
// ============================

async function cargarProductos() {

    try {

#        const respuesta = await fetch(
 #           "https://raw.githubusercontent.com/doneliopizza/CartaDigital/main/productos.json"
 #       );
        const respuesta = await fetch(
    "https://raw.githubusercontent.com/doneliopizza/CartaDigital/main/productos.json?v=" + Date.now(),
    {
        cache: "no-store"
    }
);

        if (!respuesta.ok) {

            throw new Error(
                "Error al consultar la API"
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


// ============================
// OBTENER IMAGEN DEL PRODUCTO
// ============================

function obtenerImagen(producto) {

    /*
        Por ahora todos utilizan
        una imagen de ejemplo.

        Más adelante podemos hacer:

        producto.imagen

        y traer la foto desde MySQL.
    */

    return IMAGEN_PLACEHOLDER;

}


// ============================
// MOSTRAR CARTA
// ============================

function mostrarCarta() {

    const carta =
        document.getElementById("carta");

    carta.innerHTML = "";


    const categorias = {};


    // Agrupar productos por rubro

    productos.forEach(producto => {

        if (!categorias[producto.rubro]) {

            categorias[producto.rubro] = [];

        }

        categorias[producto.rubro].push(
            producto
        );

    });


    // Crear cada categoría

    Object.keys(categorias).forEach(
        rubro => {

            const seccion =
                document.createElement(
                    "section"
                );

            seccion.className =
                "categoria";


            // Título categoría

            const titulo =
                document.createElement(
                    "h2"
                );

            titulo.innerText =
                rubro;


            seccion.appendChild(
                titulo
            );


            // Productos

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
                            onclick="agregarProducto(
                                ${producto.id}
                            )">

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


// ============================
// AGREGAR PRODUCTO
// ============================

function agregarProducto(id) {

    if (!carrito[id]) {

        carrito[id] = 0;

    }

    carrito[id]++;


    actualizarCarrito();

}


// ============================
// RESTAR PRODUCTO
// ============================

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


// ============================
// ACTUALIZAR CARRITO
// ============================

function actualizarCarrito() {

    let cantidad = 0;

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


            const cantidadProducto =
                carrito[id];


            cantidad +=
                cantidadProducto;


            total +=
                producto.precio *
                cantidadProducto;

        }
    );


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


// ============================
// MOSTRAR LISTA DEL CARRITO
// ============================

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
                        onclick="quitarProducto(
                            ${id}
                        )">

                        −

                    </button>


                    <strong>

                        ${cantidad}

                    </strong>


                    <button
                        onclick="agregarProducto(
                            ${id}
                        )">

                        +

                    </button>

                </div>

            `;


            lista.appendChild(
                div
            );

        }
    );


    // Calcular total

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


    document.getElementById(
        "total-modal"
    ).innerText =

        `$${formatearPrecio(total)}`;

}


// ============================
// MOSTRAR CARRITO
// ============================

function mostrarCarrito() {

    document.getElementById(
        "modal-carrito"
    ).style.display =
        "block";


    mostrarListaCarrito();

}


// ============================
// CERRAR CARRITO
// ============================

function cerrarCarrito() {

    document.getElementById(
        "modal-carrito"
    ).style.display =
        "none";

}


// ============================
// FORMATEAR PRECIO
// ============================

function formatearPrecio(numero) {

    return new Intl.NumberFormat(
        "es-AR"
    ).format(numero);

}


// ============================
// ENVIAR PEDIDO A WHATSAPP
// ============================

function enviarWhatsApp() {

    if (
        Object.keys(carrito).length === 0
    ) {

        alert(
            "El carrito está vacío."
        );

        return;

    }


    let mensaje =
        "Hola! Quiero realizar el siguiente pedido:\n\n";


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


            const cantidad =
                carrito[id];


            const subtotal =
                producto.precio *
                cantidad;


            total +=
                subtotal;


            mensaje +=

                `${cantidad} x ` +
                `${producto.nombre} - ` +
                `$${formatearPrecio(
                    subtotal
                )}\n`;

        }
    );


    mensaje +=

        `\nTotal: ` +
        `$${formatearPrecio(total)}`;


    // ==================================
    // TU NUMERO DE WHATSAPP
    // ==================================

    const telefono =
        "5491170667389";


    // ==================================
    // CREAR URL
    // ==================================

    const url =
        "https://wa.me/" +
        telefono +
        "?text=" +
        encodeURIComponent(
            mensaje
        );


    window.open(
        url,
        "_blank"
    );

}


// ============================
// INICIAR CARTA
// ============================

cargarProductos();
