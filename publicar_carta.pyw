import json
import subprocess
import sys
from pathlib import Path
from decimal import Decimal


# ============================================================
# RUTAS
# ============================================================

POS_DIR = Path(
    r"C:\Users\Don Elio\Downloads\POS"
)

CARTA_DIR = Path(
    r"C:\Users\Don Elio\Downloads\CartaDigital"
)

JSON_FILE = CARTA_DIR / "productos.json"


# ============================================================
# IMPORTAR BASE DE DATOS
# ============================================================

sys.path.insert(
    0,
    str(POS_DIR)
)

sys.path.insert(
    0,
    str(POS_DIR / "bd")
)

from bd.base_datos import BaseDatos


# ============================================================
# CONVERTIR VALORES
# ============================================================

def convertir_valor(valor):

    if isinstance(valor, Decimal):

        return float(valor)

    return valor


# ============================================================
# EJECUTAR GIT
# ============================================================

def ejecutar_git(comando):

    print(
        ">",
        " ".join(comando)
    )

    resultado = subprocess.run(
        comando,
        cwd=CARTA_DIR,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace"
    )

    if resultado.stdout:

        print(
            resultado.stdout
        )

    if resultado.stderr:

        print(
            resultado.stderr
        )

    if resultado.returncode != 0:

        print(
            "ERROR ejecutando Git."
        )

        sys.exit(
            resultado.returncode
        )


# ============================================================
# ACTUALIZAR PRODUCTOS.JSON
# ============================================================

def actualizar_productos():

    print()
    print(
        "======================================"
    )
    print(
        " ACTUALIZANDO PRODUCTOS.JSON"
    )
    print(
        "======================================"
    )


    bd = BaseDatos()


    sql = """
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
          AND p.rubro_id IN (1, 2, 3)
          AND p.id <> 50
        ORDER BY
            r.id,
            p.orden,
            p.nombre
    """


    filas = bd.consultar(
        sql
    )


    productos = []


    for fila in filas:

        producto = {

            "id": fila[0],

            "nombre": fila[1],

            "precio":
                convertir_valor(
                    fila[2]
                ),

            "rubro_id": fila[3],

            "rubro": fila[4],

            "orden": fila[5],

            "url":
                f"{fila[0]}.jpg"

        }


        productos.append(
            producto
        )


    print(
        f"Productos encontrados: {len(productos)}"
    )


    # ========================================================
    # GUARDAR PRODUCTOS.JSON
    # ========================================================

    JSON_FILE.write_text(
        json.dumps(
            productos,
            ensure_ascii=False,
            indent=4
        ),
        encoding="utf-8"
    )


    print(
        "productos.json actualizado."
    )


# ============================================================
# PUBLICAR SOLAMENTE PRODUCTOS.JSON
# ============================================================
def publicar_productos():

    print()
    print(
        "======================================"
    )
    print(
        " PUBLICANDO SOLAMENTE PRODUCTOS.JSON"
    )
    print(
        "======================================"
    )


    # ========================================================
    # AGREGAR SOLAMENTE PRODUCTOS.JSON
    # ========================================================

    ejecutar_git(
        [
            "git",
            "add",
            "--",
            "productos.json"
        ]
    )


    # ========================================================
    # VERIFICAR SI CAMBIÓ
    # ========================================================

    resultado = subprocess.run(
        [
            "git",
            "diff",
            "--cached",
            "--quiet",
            "--",
            "productos.json"
        ],
        cwd=CARTA_DIR
    )


    if resultado.returncode == 0:

        print()
        print(
            "productos.json no tiene cambios."
        )

        print(
            "No hay nada nuevo para publicar."
        )

        return


    # ========================================================
    # COMMIT SOLAMENTE DE PRODUCTOS.JSON
    # ========================================================

    ejecutar_git(
        [
            "git",
            "commit",
            "-m",
            "Actualizar productos.json"
        ]
    )


    # ========================================================
    # GUARDAR CAMBIOS LOCALES PENDIENTES
    # ========================================================

    print()
    print(
        "Guardando temporalmente cambios locales..."
    )


    resultado = subprocess.run(
        [
            "git",
            "stash",
            "push",
            "-u",
            "-m",
            "TEMP_PUBLICAR_PRODUCTOS"
        ],
        cwd=CARTA_DIR,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace"
    )


    if resultado.stdout:
        print(
            resultado.stdout
        )


    if resultado.stderr:
        print(
            resultado.stderr
        )


    if resultado.returncode != 0:

        print(
            "ERROR guardando cambios locales."
        )

        sys.exit(
            resultado.returncode
        )


    # ========================================================
    # ACTUALIZAR DESDE GITHUB
    # ========================================================

    print()
    print(
        "Actualizando información desde GitHub..."
    )


    resultado = subprocess.run(
        [
            "git",
            "pull",
            "--rebase",
            "origin",
            "main"
        ],
        cwd=CARTA_DIR,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace"
    )


    if resultado.stdout:
        print(
            resultado.stdout
        )


    if resultado.stderr:
        print(
            resultado.stderr
        )


    if resultado.returncode != 0:

        print()
        print(
            "ERROR actualizando desde GitHub."
        )

        print(
            "Los cambios locales permanecen guardados en Git Stash."
        )

        sys.exit(
            resultado.returncode
        )


    # ========================================================
    # PUSH
    # ========================================================

    print()
    print(
        "Subiendo productos.json a GitHub..."
    )


    ejecutar_git(
        [
            "git",
            "push",
            "origin",
            "main"
        ]
    )


    # ========================================================
    # RECUPERAR CAMBIOS LOCALES
    # ========================================================

    print()
    print(
        "Recuperando cambios locales..."
    )


    resultado = subprocess.run(
        [
            "git",
            "stash",
            "pop"
        ],
        cwd=CARTA_DIR,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace"
    )


    if resultado.stdout:
        print(
            resultado.stdout
        )


    if resultado.stderr:
        print(
            resultado.stderr
        )


    if resultado.returncode != 0:

        print()
        print(
            "⚠️ El pedido fue publicado, pero hubo un problema"
        )

        print(
            "al recuperar los cambios locales."
        )

        print(
            "Los cambios siguen guardados en Git Stash."
        )

        sys.exit(
            resultado.returncode
        )


    # ========================================================
    # OK
    # ========================================================

    print()
    print(
        "======================================"
    )
    print(
        " productos.json PUBLICADO EN GITHUB"
    )
    print(
        "======================================"
    )
# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    try:

        actualizar_productos()

        publicar_productos()

        print()
        print(
            "Proceso terminado."
        )

    except Exception as e:

        print()
        print(
            "ERROR:"
        )

        print(e)

        sys.exit(1)
