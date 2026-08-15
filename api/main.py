from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import text
from pathlib import Path

from database import SessionLocal


app = FastAPI(
    title="Carta Digital",
    version="1.0"
)


BASE_DIR = Path(__file__).resolve().parent.parent
WEB_DIR = BASE_DIR / "web"


app.mount(
    "/static",
    StaticFiles(directory=WEB_DIR),
    name="static"
)


@app.get("/carta")
def carta():
    return FileResponse(WEB_DIR / "index.html")

# ============================
# INICIO API
# ============================

@app.get("/")
def inicio():

    return {
        "mensaje": "API Carta Digital funcionando"
    }


# ============================
# PRODUCTOS
# ============================

@app.get("/productos")
def obtener_productos():

    db = SessionLocal()

    try:

        consulta = text("""
            SELECT
                p.id,
                p.nombre,
                p.precio,
                p.rubro_id,
                r.nombre AS rubro,
                p.orden
            FROM productos p
            INNER JOIN rubros r
                ON p.rubro_id = r.id
            WHERE p.estado = 1
              AND r.estado = 1
            ORDER BY
                r.id,
                p.orden,
                p.nombre
        """)

        resultado = db.execute(
            consulta
        )

        productos = []

        for fila in resultado:

            productos.append({

                "id": fila.id,

                "nombre": fila.nombre,

                "precio": float(fila.precio),

                "rubro_id": fila.rubro_id,

                "rubro": fila.rubro,

                "orden": fila.orden

            })

        return productos

    finally:

        db.close()
