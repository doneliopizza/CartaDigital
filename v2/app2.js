// ============================================================
// DON ELIO - APP V2
// ============================================================
//
// ESTA VERSION ES TOTALMENTE INDEPENDIENTE DE app.js
//
// Usa la misma API:
//
// https://api.doneliopizzeria.com.ar
//
// Endpoints:
//
// GET  /productos
// GET  /productos/{id}
// POST /productos
// PUT  /productos/{id}
//
// ============================================================


// ============================================================
// CONFIGURACIÓN
// ============================================================

const API_BASE =
    "https://cartadigitalapi.onrender.com";

const URL_PRODUCTOS =
    `${API_BASE}/productos`;


// ============================================================
// VARIABLES
// ============================================================

let productos = [];

let productosFiltrados = [];

let rubroActivo = "";


// ============================================================
// INICIO
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    configurarEventos();

    cargarProductos();

});


// ============================================================
// EVENTOS
// ============================================================

function configurarEventos() {

    const buscar =
        document.getElementById("buscar");

    if (buscar) {

        buscar.addEventListener("input", () => {

            aplicarFiltros();

        });

    }


    const url =
        document.getElementById("url");

    if (url) {

        url.addEventListener("input", () => {

            actualizarPreview();

        });

    }


    const form =
        document.getElementById("form-producto");

    if (form) {

        form.addEventListener(
            "submit",
            guardarProducto
        );

    }


    const modal =
        document.getElementById("modal-producto");

    if (modal) {

        modal.addEventListener(
            "click",
            (event) => {

                if (event.target === modal) {

                    cerrarModal();

                }

            }
        );

    }

}


// ============================================================
// CARGAR PRODUCTOS
// ============================================================

async function cargarProductos() {

    const estado =
        document.getElementById("estado-api");


    if (estado) {

        estado.textContent =
            "● Conectando con API...";

        estado.className =
            "api-status cargando";

    }


    try {

        console.log(
            "Consultando API:",
            URL_PRODUCTOS
        );


        const respuesta =
            await fetch(
                URL_PRODUCTOS,
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
            "HTTP:",
            respuesta.status
        );


        const texto =
            await respuesta.text();


        console.log(
            "Respuesta:",
            texto
        );


        if (!respuesta.ok) {

            throw new Error(
                `HTTP ${respuesta.status} - ${texto}`
            );

        }


        let datos;


        try {

            datos =
                JSON.parse(texto);

        }

        catch (e) {

            throw new Error(
                "La API respondió algo que no es JSON: " +
                texto
            );

        }


        console.log(
            "Productos recibidos:",
            datos
        );


        if (!Array.isArray(datos)) {

            throw new Error(
                "La API no devolvió una lista de productos"
            );

        }


        // ====================================================
        // GUARDAR PRODUCTOS
        // ====================================================

        productos = datos;


        // ====================================================
        // CONSTRUIR RUBROS
        // ====================================================

        construirFiltrosRubros();


        // ====================================================
        // APLICAR FILTROS
        // ====================================================

        aplicarFiltros();


        // ====================================================
        // ACTUALIZAR RESUMEN
        // ====================================================

        actualizarResumen();


        // ====================================================
        // ESTADO API
        // ====================================================

        if (estado) {

            estado.textContent =
                `● API OK · ${productos.length} productos`;

            estado.className =
                "api-status ok";

        }

    }


    catch (error) {

        console.error(
            "ERROR API:",
            error
        );


        if (estado) {

            estado.textContent =
                "● Error API: " +
                error.message;

            estado.className =
                "api-status error";

        }


        mostrarErrorProductos(
            error.message
        );

    }

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
        `estado-api ${tipo}`;


    elemento.textContent =
        texto;

}


// ============================================================
// FILTROS DE RUBRO
// ============================================================

function construirFiltrosRubros() {

    const contenedor =
        document.getElementById(
            "filtros-rubros"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML = "";


    // ========================================================
    // BOTÓN TODOS
    // ========================================================

    const botonTodos =
        document.createElement(
            "button"
        );


    botonTodos.className =
        "filtro";


    botonTodos.textContent =
        "TODOS";


    botonTodos.dataset.rubro =
        "";


    if (rubroActivo === "") {

        botonTodos.classList.add(
            "activo"
        );

    }


    botonTodos.onclick = () => {

        filtrarRubro("");

    };


    contenedor.appendChild(
        botonTodos
    );


    // ========================================================
    // OBTENER RUBROS
    // ========================================================

    const rubros =
        new Map();


    productos.forEach(
        producto => {

            if (
                producto.rubro_id &&
                producto.rubro
            ) {

                rubros.set(
                    producto.rubro_id,
                    producto.rubro
                );

            }

        }
    );


    // ========================================================
    // CREAR BOTONES
    // ========================================================

    [...rubros.entries()]
        .sort(
            (a, b) =>
                a[1].localeCompare(
                    b[1],
                    "es"
                )
        )
        .forEach(
            ([id, nombre]) => {

                const boton =
                    document.createElement(
                        "button"
                    );


                boton.className =
                    "filtro";


                boton.textContent =
                    nombre;


                boton.dataset.rubro =
                    id;


                if (
                    String(id) ===
                    rubroActivo
                ) {

                    boton.classList.add(
                        "activo"
                    );

                }


                boton.onclick = () => {

                    filtrarRubro(id);

                };


                contenedor.appendChild(
                    boton
                );

            }
        );

}


// ============================================================
// FILTRAR RUBRO
// ============================================================

function filtrarRubro(
    rubro
) {

    rubroActivo =
        String(rubro);


    document
        .querySelectorAll(
            ".filtro"
        )
        .forEach(
            boton => {

                boton.classList.remove(
                    "activo"
                );


                if (
                    String(
                        boton.dataset.rubro
                    ) === rubroActivo
                ) {

                    boton.classList.add(
                        "activo"
                    );

                }

            }
        );


    aplicarFiltros();

}


// ============================================================
// APLICAR FILTROS
// ============================================================

function aplicarFiltros() {

    const buscar =
        document.getElementById(
            "buscar"
        );


    const texto =
        buscar
            ? buscar.value
                .trim()
                .toLowerCase()
            : "";


    productosFiltrados =
        productos.filter(
            producto => {


                // --------------------------------------------
                // FILTRO RUBRO
                // --------------------------------------------

                if (
                    rubroActivo &&
                    String(
                        producto.rubro_id
                    ) !== rubroActivo
                ) {

                    return false;

                }


                // --------------------------------------------
                // FILTRO TEXTO
                // --------------------------------------------

                if (texto) {

                    const nombre =
                        String(
                            producto.nombre || ""
                        )
                        .toLowerCase();


                    if (
                        !nombre.includes(
                            texto
                        )
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );


    renderProductos();

}


// ============================================================
// RESUMEN
// ============================================================

function actualizarResumen() {

    const activos =
        productos.filter(
            producto =>
                Number(
                    producto.estado
                ) === 1
        ).length;


    const inactivos =
        productos.length -
        activos;


    const cantidadProductos =
        document.getElementById(
            "cantidad-productos"
        );


    if (cantidadProductos) {

        cantidadProductos.textContent =
            productos.length;

    }


    const cantidadActivos =
        document.getElementById(
            "cantidad-activos"
        );


    if (cantidadActivos) {

        cantidadActivos.textContent =
            activos;

    }


    const cantidadInactivos =
        document.getElementById(
            "cantidad-inactivos"
        );


    if (cantidadInactivos) {

        cantidadInactivos.textContent =
            inactivos;

    }

}


// ============================================================
// RENDER PRODUCTOS
// ============================================================

function renderProductos() {

    const contenedor =
        document.getElementById(
            "productos"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML = "";


    if (
        productosFiltrados.length === 0
    ) {

        contenedor.innerHTML = `

            <div class="cargando-productos">

                No se encontraron productos.

            </div>

        `;

        return;

    }


    productosFiltrados.forEach(
        producto => {

            contenedor.appendChild(
                crearTarjetaProducto(
                    producto
                )
            );

        }
    );

}


// ============================================================
// CREAR TARJETA
// ============================================================

function crearTarjetaProducto(
    producto
) {

    const tarjeta =
        document.createElement(
            "article"
        );


    tarjeta.className =
        "producto-card";


    // ========================================================
    // IMAGEN
    // ========================================================

    const contenedorImagen =
        document.createElement(
            "div"
        );


    contenedorImagen.className =
        "producto-imagen";


    if (producto.url) {

        const imagen =
            document.createElement(
                "img"
            );


        imagen.src =
            obtenerURLImagen(
                producto.url
            );


        imagen.alt =
            producto.nombre || "";


        imagen.loading =
            "lazy";


        imagen.onerror =
            function () {

                this.parentElement.innerHTML =
                    `<span class="sin-imagen">🍕</span>`;

            };


        imagen.onclick = () => {

            abrirImagenGrande(
                imagen.src,
                producto.nombre
            );

        };


        contenedorImagen.appendChild(
            imagen
        );

    }

    else {

        contenedorImagen.innerHTML =
            `<span class="sin-imagen">🍕</span>`;

    }


    tarjeta.appendChild(
        contenedorImagen
    );


    // ========================================================
    // INFORMACIÓN
    // ========================================================

    const info =
        document.createElement(
            "div"
        );


    info.className =
        "producto-info";


    // ========================================================
    // NOMBRE
    // ========================================================

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


    // ========================================================
    // RUBRO
    // ========================================================

    const rubro =
        document.createElement(
            "div"
        );


    rubro.className =
        "producto-rubro";


    rubro.textContent =
        producto.rubro
            ? producto.rubro
            : `Rubro #${producto.rubro_id}`;


    info.appendChild(
        rubro
    );


    // ========================================================
    // PRECIO
    // ========================================================

    const precio =
        document.createElement(
            "div"
        );


    precio.className =
        "producto-precio";


    precio.textContent =
        formatoPrecio(
            producto.precio
        );


    info.appendChild(
        precio
    );


    // ========================================================
    // ID
    // ========================================================

    const id =
        document.createElement(
            "div"
        );


    id.className =
        "producto-id";


    id.textContent =
        `ID: ${producto.id}`;


    info.appendChild(
        id
    );


    // ========================================================
    // BADGES
    // ========================================================

    const badges =
        document.createElement(
            "div"
        );


    badges.className =
        "badges";


    // ========================================================
    // ESTADO
    // ========================================================

    const estado =
        document.createElement(
            "span"
        );


    estado.className =
        `badge ${
            Number(producto.estado) === 1
                ? "activo"
                : "inactivo"
        }`;


    estado.textContent =
        Number(producto.estado) === 1
            ? "Activo"
            : "Inactivo";


    badges.appendChild(
        estado
    );


    // ========================================================
    // COMPUESTO
    // ========================================================

    if (
        Number(
            producto.es_compuesto
        ) === 1
    ) {

        const compuesto =
            document.createElement(
                "span"
            );


        compuesto.className =
            "badge comp";


        compuesto.textContent =
            "Compuesto";


        badges.appendChild(
            compuesto
        );

    }


    // ========================================================
    // TIPO PRODUCTO
    // ========================================================

    if (
        producto.tipo_producto
    ) {

        const tipo =
            document.createElement(
                "span"
            );


        tipo.className =
            "badge";


        tipo.textContent =
            producto.tipo_producto;


        badges.appendChild(
            tipo
        );

    }


    info.appendChild(
        badges
    );


    tarjeta.appendChild(
        info
    );


    // ========================================================
    // ACCIONES
    // ========================================================

    const acciones =
        document.createElement(
            "div"
        );


    acciones.className =
        "producto-acciones";


    const editar =
        document.createElement(
            "button"
        );


    editar.className =
        "editar";


    editar.textContent =
        "✏️ Editar";


    editar.onclick = () => {

        abrirEditarProducto(
            producto
        );

    };


    acciones.appendChild(
        editar
    );


    tarjeta.appendChild(
        acciones
    );


    return tarjeta;

}


// ============================================================
// URL IMAGEN
// ============================================================
//
// Si JSON devuelve:
//
// 125.jpg
//
// se busca:
//
// https://raw.githubusercontent.com/doneliopizza/
// CartaDigital/main/fotos/125.jpg
//
// ============================================================

function obtenerURLImagen(
    url
) {

    if (!url) {

        return "";

    }


    url =
        String(url).trim();


    if (
        url.startsWith(
            "http://"
        ) ||
        url.startsWith(
            "https://"
        )
    ) {

        return url;

    }


    const base =
        "https://raw.githubusercontent.com/doneliopizza/CartaDigital/main/fotos/";


    return (
        base +
        url +
        "?v=" +
        Date.now()
    );

}


// ============================================================
// FORMATEAR PRECIO
// ============================================================

function formatoPrecio(
    valor
) {

    const numero =
        Number(valor) || 0;


    return numero.toLocaleString(
        "es-AR",
        {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 0
        }
    );

}


// ============================================================
// NUEVO PRODUCTO
// ============================================================

function abrirNuevoProducto() {

    limpiarFormulario();


    const titulo =
        document.getElementById(
            "modal-titulo"
        );


    if (titulo) {

        titulo.textContent =
            "Nuevo producto";

    }


    const subtitulo =
        document.getElementById(
            "modal-subtitulo"
        );


    if (subtitulo) {

        subtitulo.textContent =
            "Crear producto";

    }


    const modal =
        document.getElementById(
            "modal-producto"
        );


    if (modal) {

        modal.classList.remove(
            "oculto"
        );

    }

}


// ============================================================
// EDITAR PRODUCTO
// ============================================================

function abrirEditarProducto(
    producto
) {

    document
        .getElementById(
            "producto-id"
        )
        .value =
        producto.id;


    document
        .getElementById(
            "nombre"
        )
        .value =
        producto.nombre || "";


    document
        .getElementById(
            "precio"
        )
        .value =
        producto.precio || 0;


    document
        .getElementById(
            "url"
        )
        .value =
        producto.url || "";


    document
        .getElementById(
            "tipo-producto"
        )
        .value =
        producto.tipo_producto ||
        "simple";


    document
        .getElementById(
            "rubro-id"
        )
        .value =
        producto.rubro_id || "";


    document
        .getElementById(
            "orden"
        )
        .value =
        producto.orden || 0;


    document
        .getElementById(
            "estado"
        )
        .value =
        producto.estado ?? 1;


    document
        .getElementById(
            "es-compuesto"
        )
        .value =
        producto.es_compuesto ?? 0;


    document
        .getElementById(
            "cant-min"
        )
        .value =
        producto.cant_min ?? 0;


    document
        .getElementById(
            "cant-max"
        )
        .value =
        producto.cant_max ?? 0;


    document
        .getElementById(
            "modal-titulo"
        )
        .textContent =
        `Editar producto #${producto.id}`;


    document
        .getElementById(
            "modal-subtitulo"
        )
        .textContent =
        producto.nombre || "";


    actualizarPreview();


    document
        .getElementById(
            "modal-producto"
        )
        .classList.remove(
            "oculto"
        );

}


// ============================================================
// LIMPIAR FORMULARIO
// ============================================================

function limpiarFormulario() {

    const form =
        document.getElementById(
            "form-producto"
        );


    if (form) {

        form.reset();

    }


    document
        .getElementById(
            "producto-id"
        )
        .value = "";


    document
        .getElementById(
            "tipo-producto"
        )
        .value =
        "simple";


    document
        .getElementById(
            "estado"
        )
        .value =
        "1";


    document
        .getElementById(
            "es-compuesto"
        )
        .value =
        "0";


    document
        .getElementById(
            "cant-min"
        )
        .value =
        "0";


    document
        .getElementById(
            "cant-max"
        )
        .value =
        "0";


    document
        .getElementById(
            "orden"
        )
        .value =
        "0";


    const preview =
        document.getElementById(
            "preview-imagen"
        );


    if (preview) {

        preview.innerHTML =
            "<span>Sin imagen</span>";

    }

}


// ============================================================
// CERRAR MODAL
// ============================================================

function cerrarModal() {

    const modal =
        document.getElementById(
            "modal-producto"
        );


    if (modal) {

        modal.classList.add(
            "oculto"
        );

    }

}


// ============================================================
// GUARDAR PRODUCTO
// ============================================================

async function guardarProducto(
    event
) {

    event.preventDefault();


    const id =
        document
            .getElementById(
                "producto-id"
            )
            .value;


    const datos = {

        nombre:
            document
                .getElementById(
                    "nombre"
                )
                .value
                .trim(),


        precio:
            Number(
                document
                    .getElementById(
                        "precio"
                    )
                    .value
            ),


        url:
            document
                .getElementById(
                    "url"
                )
                .value
                .trim() || null,


        tipo_producto:
            document
                .getElementById(
                    "tipo-producto"
                )
                .value,


        rubro_id:
            Number(
                document
                    .getElementById(
                        "rubro-id"
                    )
                    .value
            ),


        orden:
            Number(
                document
                    .getElementById(
                        "orden"
                    )
                    .value
            ),


        estado:
            Number(
                document
                    .getElementById(
                        "estado"
                    )
                    .value
            ),


        es_compuesto:
            Number(
                document
                    .getElementById(
                        "es-compuesto"
                    )
                    .value
            ),


        cant_min:
            Number(
                document
                    .getElementById(
                        "cant-min"
                    )
                    .value
            ),


        cant_max:
            Number(
                document
                    .getElementById(
                        "cant-max"
                    )
                    .value
            )

    };


    // ========================================================
    // VALIDACIONES
    // ========================================================

    if (!datos.nombre) {

        mostrarNotificacion(
            "El nombre es obligatorio.",
            "error"
        );

        return;

    }


    if (
        !datos.precio ||
        datos.precio < 0
    ) {

        mostrarNotificacion(
            "El precio no es válido.",
            "error"
        );

        return;

    }


    if (!datos.rubro_id) {

        mostrarNotificacion(
            "El rubro es obligatorio.",
            "error"
        );

        return;

    }


    try {

        let respuesta;


        // ====================================================
        // EDITAR
        // ====================================================

        if (id) {

            respuesta =
                await fetch(
                    `${URL_PRODUCTOS}/${id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                datos
                            )
                    }
                );

        }


        // ====================================================
        // CREAR
        // ====================================================

        else {

            respuesta =
                await fetch(
                    URL_PRODUCTOS,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                datos
                            )
                    }
                );

        }


        // ====================================================
        // RESPUESTA ERROR
        // ====================================================

        if (!respuesta.ok) {

            const texto =
                await respuesta.text();


            throw new Error(
                `HTTP ${respuesta.status}: ${texto}`
            );

        }


        // ====================================================
        // RESPUESTA JSON
        // ====================================================

        const resultado =
            await respuesta.json();


        console.log(
            "Respuesta API:",
            resultado
        );


        // ====================================================
        // CERRAR MODAL
        // ====================================================

        cerrarModal();


        // ====================================================
        // NOTIFICACIÓN
        // ====================================================

        mostrarNotificacion(
            id
                ? "Producto actualizado correctamente."
                : "Producto creado correctamente.",
            "ok"
        );


        // ====================================================
        // RECARGAR PRODUCTOS
        // ====================================================

        await cargarProductos();

    }


    catch (error) {

        console.error(
            "Error guardando producto:",
            error
        );


        mostrarNotificacion(
            "No se pudo guardar el producto.",
            "error"
        );

    }

}


// ============================================================
// PREVIEW IMAGEN
// ============================================================

function actualizarPreview() {

    const campoURL =
        document.getElementById(
            "url"
        );


    const preview =
        document.getElementById(
            "preview-imagen"
        );


    if (!campoURL || !preview) {

        return;

    }


    const url =
        campoURL.value
            .trim();


    if (!url) {

        preview.innerHTML =
            "<span>Sin imagen</span>";

        return;

    }


    const imagen =
        obtenerURLImagen(
            url
        );


    preview.innerHTML = `

        <img
            src="${imagen}"
            alt="Vista previa"
            onerror="this.parentElement.innerHTML='<span>Imagen no encontrada</span>'"
        >

    `;

}


// ============================================================
// IMAGEN GRANDE
// ============================================================

function abrirImagenGrande(
    src,
    nombre
) {

    const modal =
        document.createElement(
            "div"
        );


    modal.className =
        "modal";


    modal.innerHTML = `

        <div
            style="
                max-width:900px;
                max-height:90vh;
                position:relative;
            "
        >

            <button
                onclick="this.parentElement.parentElement.remove()"
                style="
                    position:absolute;
                    right:-15px;
                    top:-15px;
                    width:40px;
                    height:40px;
                    border-radius:50%;
                    background:white;
                    font-size:25px;
                    z-index:2;
                "
            >
                ×
            </button>


            <img
                src="${src}"
                alt="${nombre || ""}"
                style="
                    max-width:100%;
                    max-height:85vh;
                    object-fit:contain;
                    border-radius:10px;
                    display:block;
                "
            >

        </div>

    `;


    modal.onclick =
        (event) => {

            if (
                event.target === modal
            ) {

                modal.remove();

            }

        };


    document.body.appendChild(
        modal
    );

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
        `notificacion ${tipo}`;


    setTimeout(
        () => {

            elemento.classList.add(
                "oculto"
            );

        },
        3000
    );

}


// ============================================================
// ERROR PRODUCTOS
// ============================================================

function mostrarErrorProductos(
    mensaje
) {

    const contenedor =
        document.getElementById(
            "productos"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML = `

        <div
            class="cargando-productos"
        >

            ❌ ${mensaje}

            <br><br>

            <button
                class="btn-nuevo"
                onclick="cargarProductos()"
            >
                Intentar nuevamente
            </button>

        </div>

    `;

}
