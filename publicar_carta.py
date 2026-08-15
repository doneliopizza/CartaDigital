import json
import subprocess
import sys
from pathlib import Path
from decimal import Decimal


# ============================================================
# RUTAS
# ============================================================

POS_DIR = Path(r"C:\Users\Don Elio\Downloads\POS")

CARTA_DIR = Path(
    r"C:\Users\Don Elio\Downloads\CartaDigital"
)

JSON_FILE = CARTA_DIR / "productos.json"


# ============================================================
# IMPORTAR BASE DE DATOS
# ============================================================

sys.path.insert(0, str(POS_DIR))
sys.path.insert(0, str(POS_DIR / "bd"))

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

    print(">", " ".join(comando))

    resultado = subprocess.run(
        comando,
        cwd=CARTA_DIR,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace"
    )

    if resultado.stdout:
        print(resultado.stdout)

    if resultado.stderr:
        print(resultado.stderr)

    return resultado.returncode == 0


# ============================================================
# GENERAR PRODUCTOS.JSON
# ============================================================

def exportar_productos():

    print("======================================")
    print(" ACTUALIZANDO CARTA DIGITAL")
    print("======================================")

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
AND P.ID <> 50
        ORDER BY
            r.id,
            p.orden,
            p.nombre
    """

    filas = bd.consultar(sql)

    productos = []

    for fila in filas:

        producto = {

            "id": fila[0],

            "nombre": fila[1],

            "precio": convertir_valor(
                fila[2]
            ),

            "rubro_id": fila[3],

            "rubro": fila[4],

            "orden": fila[5],

            # FOTO
            "url": f"{fila[0]}.jpg"

        }

        productos.append(producto)


    print(
        f"Productos encontrados: {len(productos)}"
    )


    # ========================================================
    # CREAR JSON
    # ========================================================

    nuevo_json = json.dumps(
        productos,
        ensure_ascii=False,
        indent=4
    )


    # ========================================================
    # GUARDAR JSON
    # ========================================================

    JSON_FILE.write_text(
        nuevo_json,
        encoding="utf-8"
    )


    print(
        "productos.json actualizado."
    )

    print(
        JSON_FILE
    )


# ============================================================
# PUBLICAR GITHUB
# ============================================================

def publicar_github():

    print("======================================")
    print(" PUBLICANDO EN GITHUB")
    print("======================================")


    # ========================================================
    # CANCELAR REBASE ANTERIOR
    # ========================================================

    subprocess.run(
        [
            "git",
            "rebase",
            "--abort"
        ],
        cwd=CARTA_DIR,
        capture_output=True,
        text=True
    )


    # ========================================================
    # GIT ADD
    # ========================================================

    print()

    if not ejecutar_git([
        "git",
        "add",
        "."
    ]):

        print(
            "ERROR en git add."
        )

        return False


    # ========================================================
    # GIT COMMIT
    # ========================================================

    print()

    resultado = subprocess.run(
        [
            "git",
            "commit",
            "-m",
            "Actualizar carta digital"
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


    # ========================================================
    # PUSH FORZADO
    # ========================================================

    print()

    print(
        "Subiendo CartaDigital a GitHub..."
    )


    if not ejecutar_git([
        "git",
        "push",
        "--force",
        "origin",
        "main"
    ]):

        print(
            "ERROR en git push."
        )

        return False


    # ========================================================
    # OK
    # ========================================================

    print()

    print("======================================")
    print(" CARTA PUBLICADA CORRECTAMENTE")
    print("======================================")


    return True


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    try:

        exportar_productos()

        publicar_github()

        print()

        print(
            "Proceso terminado."
        )


    except Exception as e:

        print()

        print(
            "ERROR actualizando carta:"
        )

        print(e)

        print()

        print(
            "El POS puede continuar normalmente."
        )
