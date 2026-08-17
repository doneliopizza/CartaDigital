/* ============================================================
   VISOR DE IMAGEN GRANDE
   ============================================================ */

#visor-imagen {
    position: fixed;
    inset: 0;
    z-index: 99999;
}


.visor-imagen-fondo {
    position: fixed;
    inset: 0;

    background: rgba(0, 0, 0, 0.90);

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 20px;

    cursor: zoom-out;
}


.visor-imagen-fondo img {
    max-width: 95vw;
    max-height: 90vh;

    width: auto;
    height: auto;

    object-fit: contain;

    border-radius: 10px;

    box-shadow:
        0 10px 40px rgba(0, 0, 0, 0.5);

    cursor: default;
}


.visor-imagen-cerrar {
    position: fixed;

    top: 15px;
    right: 15px;

    width: 45px;
    height: 45px;

    border: none;
    border-radius: 50%;

    background: rgba(255, 255, 255, 0.9);

    color: #222;

    font-size: 32px;
    line-height: 40px;

    cursor: pointer;

    z-index: 100000;
}


.visor-imagen-cerrar:hover {
    background: white;
}
