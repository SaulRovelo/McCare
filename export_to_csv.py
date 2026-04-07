import sqlite3
import csv
import os

db_path = 'mccare.db'  # Cambiar a mccare_respaldo_organico.db si quieres exportar el respaldo.

def exportar_tabla(cursor, tabla, archivo):
    cursor.execute(f"SELECT * FROM {tabla}")
    rows = cursor.fetchall()
    
    if not rows:
        print(f"⚠️ La tabla '{tabla}' está vacía. No se exportó nada en {archivo}.")
        return

    columnas = [description[0] for description in cursor.description]
    
    with open(archivo, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(columnas)
        writer.writerows(rows)
    
    print(f"✅ {len(rows)} filas exportadas a {archivo}")

if __name__ == "__main__":
    if not os.path.exists(db_path):
        print(f"❌ Error: No se encontró la base de datos local en {db_path}")
        exit(1)

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("Iniciando exportación de datos...")
    exportar_tabla(cursor, 'insumos', 'insumos.csv')
    exportar_tabla(cursor, 'movimientos_inventario', 'movimientos_inventario.csv')
    print("Proceso finalizado. Ahora puedes importar estos CSV a Supabase.")
    
    conn.close()
