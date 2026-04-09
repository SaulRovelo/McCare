"""
backend/services/generador_fiscal.py — Generador de Documentos Fiscales (CFDI)

Genera comprobantes fiscales en formato PDF y XML a partir de los datos
almacenados en la tabla documentos_fiscales de Supabase.

PDF: plantilla formal estilo CFDI con fpdf2
XML: estructura simplificada compatible con SAT (fines de prototipo)
"""
import uuid
import io
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from database.models import DocumentoFiscalSQL, UsuarioSQL, PerfilDonanteSQL


# ── Datos institucionales de McCare (donataria autorizada) ──────────────────

DONATARIA = {
    "nombre":    "Casas Ronald McDonald IAP",
    "rfc":       "CRM-920101-XXX",
    "regimen":   "Personas Morales con Fines no Lucrativos",
    "autorizacion": "46-2026 - SAT Donataria Autorizada",
    "domicilio": "Av. Cuauhtemoc 98, Col. Doctores, CDMX, C.P. 06720",
    "telefono":  "+52 55 5228 9900",
    "email":     "donativos@mccare.org.mx",
    "web":       "www.casasronaldmcdonald.org.mx",
}


def _obtener_datos_documento(db: Session, doc_id: str, usuario_id: str) -> Optional[dict]:
    """
    Obtiene todos los datos necesarios para generar el comprobante:
    - Documento fiscal especifico
    - Perfil del corporativo (empresa, RFC)
    - Usuario (nombre)
    """
    doc = db.query(DocumentoFiscalSQL).filter_by(id=doc_id, usuario_id=usuario_id).first()
    if not doc:
        return None

    usuario = db.query(UsuarioSQL).filter_by(id=usuario_id).first()
    perfil = db.query(PerfilDonanteSQL).filter_by(usuario_id=usuario_id).first()

    return {
        "doc_id":        str(doc.id),
        "mes_texto":     doc.mes_texto,
        "anio":          doc.anio,
        "monto":         doc.monto_amparado or 0.0,
        "folio":         f"MCR-{doc.anio}-{str(doc.id)[:8].upper()}",
        "fecha_emision": datetime.now().strftime("%d/%m/%Y"),
        # Datos del corporativo (donatario)
        "empresa_nombre": (perfil.empresa_nombre if perfil and perfil.empresa_nombre else usuario.nombre) if usuario else "Empresa Donante",
        "empresa_rfc":    (perfil.empresa_rfc if perfil and perfil.empresa_rfc else "RFC-000000-XXX") if perfil else "RFC-000000-XXX",
        "empresa_domicilio": "Av. Corporativa 1, Col. Empresarial, CDMX",
        "empresa_contacto": usuario.email if usuario else "contacto@empresa.com",
    }


def _safe(text: str) -> str:
    """Normaliza texto para ser compatible con latin-1 (fpdf2 Helvetica).
    Reemplaza caracteres fuera de rango con equivalentes ASCII seguros.
    """
    return (
        str(text)
        .replace("\u2014", "-")   # em dash
        .replace("\u2013", "-")   # en dash
        .replace("\u2019", "'")   # curly apostrophe
        .replace("\u201c", '"')   # left quote
        .replace("\u201d", '"')   # right quote
        .replace("\u00e1", "a")   # a con acento
        .replace("\u00e9", "e")   # e con acento
        .replace("\u00ed", "i")   # i con acento
        .replace("\u00f3", "o")   # o con acento
        .replace("\u00fa", "u")   # u con acento
        .replace("\u00f1", "n")   # enye
        .replace("\u00fc", "u")   # u dieresis
        .encode("latin-1", errors="replace")
        .decode("latin-1")
    )


# ── Generador PDF ────────────────────────────────────────────────────────────

def generar_pdf(db: Session, doc_id: str, usuario_id: str) -> Optional[bytes]:
    """
    Genera un PDF formal estilo CFDI con fpdf2.
    Retorna los bytes del PDF o None si no se encuentra el documento.
    """
    from fpdf import FPDF, XPos, YPos

    datos = _obtener_datos_documento(db, doc_id, usuario_id)
    if not datos:
        return None

    class FiscalPDF(FPDF):
        def header(self):
            # Barra roja superior
            self.set_fill_color(218, 41, 28)   # #DA291C
            self.rect(0, 0, 210, 18, style="F")
            # Nombre de la organización
            self.set_text_color(255, 255, 255)
            self.set_font("Helvetica", "B", 13)
            self.set_xy(10, 4)
            self.cell(130, 10, "Casas Ronald McDonald IAP", align="L")
            # Nombre del documento
            self.set_font("Helvetica", "", 9)
            self.set_xy(140, 4)
            self.cell(60, 5, "COMPROBANTE FISCAL DIGITAL", align="R")
            self.set_xy(140, 9)
            self.cell(60, 5, "Donativo Deducible de Impuestos", align="R")
            self.set_text_color(30, 30, 30)

        def footer(self):
            self.set_y(-15)
            self.set_fill_color(218, 41, 28)
            self.rect(0, 282, 210, 15, style="F")
            self.set_text_color(255, 255, 255)
            self.set_font("Helvetica", "", 7)
            self.set_xy(10, 284)
            self.cell(90, 5, f"Donataria Autorizada No. {DONATARIA['autorizacion']}", align="L")
            self.set_xy(100, 284)
            self.cell(100, 5, f"{DONATARIA['web']}  |  {DONATARIA['email']}", align="R")
            self.set_xy(10, 289)
            self.cell(190, 5, "Este documento es valido como comprobante fiscal de donativo ante el SAT.",
                      align="C")
            self.set_text_color(30, 30, 30)

    pdf = FiscalPDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    monto = datos["monto"]
    monto_iva = monto * 0.16
    monto_total = monto + monto_iva

    # ── Seccion: Folio y fecha ──────────────────────────────────────────────
    pdf.set_y(25)
    pdf.set_fill_color(248, 249, 250)
    pdf.rect(10, 24, 190, 18, style="F")
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_xy(15, 27)
    pdf.set_text_color(218, 41, 28)
    pdf.cell(50, 6, f"FOLIO: {datos['folio']}")
    pdf.set_text_color(80, 80, 80)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_xy(15, 34)
    pdf.cell(50, 5, f"Fecha de emision: {datos['fecha_emision']}")
    pdf.set_xy(120, 27)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(75, 5, f"Periodo: {datos['mes_texto']} {datos['anio']}", align="R")
    pdf.set_font("Helvetica", "", 9)
    pdf.set_xy(120, 34)
    pdf.cell(75, 5, "Tipo: Donativo en efectivo", align="R")

    # ── Seccion: Emisor ─────────────────────────────────────────────────────
    pdf.set_y(48)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(218, 41, 28)
    pdf.cell(190, 6, "DATOS DEL EMISOR (DONATARIA AUTORIZADA)", ln=True)
    pdf.set_draw_color(218, 41, 28)
    pdf.set_line_width(0.5)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(2)

    pdf.set_text_color(30, 30, 30)
    pdf.set_font("Helvetica", "B", 9)
    campos_emisor = [
        ("Razon Social:",       DONATARIA["nombre"]),
        ("RFC:",                DONATARIA["rfc"]),
        ("Regimen Fiscal:",     DONATARIA["regimen"]),
        ("Domicilio Fiscal:",   DONATARIA["domicilio"]),
        ("Autorizacion SAT:",   DONATARIA["autorizacion"]),
    ]
    for label, valor in campos_emisor:
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_x(12)
        pdf.cell(55, 5, label)
        pdf.set_font("Helvetica", "", 9)
        pdf.cell(130, 5, _safe(valor), ln=True)
    pdf.ln(3)

    # ── Seccion: Receptor (Corporativo) ─────────────────────────────────────
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(218, 41, 28)
    pdf.cell(190, 6, "DATOS DEL RECEPTOR (DONANTE CORPORATIVO)", ln=True)
    pdf.set_draw_color(218, 41, 28)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(2)

    pdf.set_text_color(30, 30, 30)
    campos_receptor = [
        ("Razon Social:",       datos["empresa_nombre"]),
        ("RFC:",                datos["empresa_rfc"]),
        ("Domicilio Fiscal:",   datos["empresa_domicilio"]),
        ("Correo de Contacto:", datos["empresa_contacto"]),
    ]
    for label, valor in campos_receptor:
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_x(12)
        pdf.cell(55, 5, label)
        pdf.set_font("Helvetica", "", 9)
        pdf.cell(130, 5, _safe(valor), ln=True)
    pdf.ln(3)

    # ── Tabla: Concepto ─────────────────────────────────────────────────────
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(218, 41, 28)
    pdf.cell(190, 6, "CONCEPTO DEL DONATIVO", ln=True)
    pdf.set_draw_color(218, 41, 28)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(2)

    # Encabezados de tabla
    pdf.set_fill_color(218, 41, 28)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(10, 7, "#", border=0, fill=True, align="C")
    pdf.cell(100, 7, "Descripcion", border=0, fill=True)
    pdf.cell(30, 7, "Clave SAT", border=0, fill=True, align="C")
    pdf.cell(50, 7, "Importe (MXN)", border=0, fill=True, align="R")
    pdf.ln()

    # Fila del concepto
    pdf.set_fill_color(252, 252, 252)
    pdf.set_text_color(30, 30, 30)
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(10, 7, "1", border=0, fill=True, align="C")
    pdf.cell(100, 7, _safe(f"Donativo deducible - {datos['mes_texto']} {datos['anio']}"), border=0, fill=True)
    pdf.cell(30, 7, "84111500", border=0, fill=True, align="C")
    pdf.cell(50, 7, f"$ {monto:,.2f}", border=0, fill=True, align="R")
    pdf.ln(10)

    # ── Resumen de montos ────────────────────────────────────────────────────
    pdf.set_x(120)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(50, 5, "Subtotal:", align="L")
    pdf.cell(40, 5, f"$ {monto:,.2f}", align="R", ln=True)

    pdf.set_x(120)
    pdf.cell(50, 5, "IVA (16%):", align="L")
    pdf.cell(40, 5, f"$ {monto_iva:,.2f}", align="R", ln=True)

    pdf.set_draw_color(200, 200, 200)
    pdf.line(120, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(1)

    pdf.set_x(120)
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(50, 7, "TOTAL:", align="L")
    pdf.set_text_color(218, 41, 28)
    pdf.cell(40, 7, f"$ {monto_total:,.2f} MXN", align="R", ln=True)
    pdf.ln(6)

    # ── Leyenda legal ────────────────────────────────────────────────────────
    pdf.set_x(10)
    pdf.set_fill_color(255, 248, 246)
    pdf.set_draw_color(218, 41, 28)
    y_ley = pdf.get_y()
    pdf.rect(10, y_ley, 190, 22, style="FD")
    pdf.set_font("Helvetica", "B", 8)
    pdf.set_text_color(218, 41, 28)
    pdf.set_xy(14, y_ley + 3)
    pdf.cell(180, 5, "LEYENDA DE DEDUCIBILIDAD FISCAL", ln=True)
    pdf.set_x(14)
    pdf.set_font("Helvetica", "", 7.5)
    pdf.set_text_color(60, 60, 60)
    pdf.multi_cell(
        182, 4,
        "El donativo amparado por este comprobante es deducible del Impuesto Sobre la Renta (ISR) "
        "conforme a los articulos 27, fraccion I y 151, fraccion III de la Ley del ISR. "
        "La institucion donataria tiene autorizacion vigente emitida por el SAT para recibir donativos deducibles."
    )
    pdf.ln(6)

    # ── UUID del sellado (simulado) ──────────────────────────────────────────
    uuid_cfdi = str(uuid.uuid4()).upper()
    pdf.set_font("Helvetica", "", 7)
    pdf.set_text_color(140, 140, 140)
    pdf.set_x(10)
    pdf.cell(190, 4, f"UUID CFDI: {uuid_cfdi}", align="C", ln=True)
    pdf.cell(190, 4, f"Sello Digital SAT: {uuid_cfdi[:32]}...  |  NoCertificadoSAT: 00001000000800002434", align="C", ln=True)

    return bytes(pdf.output())


# ── Generador XML ────────────────────────────────────────────────────────────

def generar_xml(db: Session, doc_id: str, usuario_id: str) -> Optional[str]:
    """
    Genera un XML estilo CFDI 4.0 (simplificado para prototipo).
    Retorna el string XML o None si no se encuentra el documento.
    """
    datos = _obtener_datos_documento(db, doc_id, usuario_id)
    if not datos:
        return None

    monto = datos["monto"]
    uuid_cfdi = str(uuid.uuid4()).upper()
    fecha_hora = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante
  xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 cfdv40.xsd"
  Version="4.0"
  Serie="MCR"
  Folio="{datos['folio']}"
  Fecha="{fecha_hora}"
  Sello="SELLO_DIGITAL_SIMULADO_{uuid_cfdi[:16]}"
  FormaPago="01"
  NoCertificado="00001000000800002434"
  Certificado="CERTIFICADO_SIMULADO"
  SubTotal="{monto:.2f}"
  Impuestos="{monto * 0.16:.2f}"
  Total="{monto * 1.16:.2f}"
  Moneda="MXN"
  TipoDeComprobante="E"
  Exportacion="01"
  LugarExpedicion="06720">

  <cfdi:Emisor
    Rfc="{DONATARIA['rfc']}"
    Nombre="{DONATARIA['nombre']}"
    RegimenFiscal="608"/>

  <cfdi:Receptor
    Rfc="{datos['empresa_rfc']}"
    Nombre="{datos['empresa_nombre']}"
    DomicilioFiscalReceptor="06720"
    RegimenFiscalReceptor="601"
    UsoCFDI="D04"/>

  <cfdi:Conceptos>
    <cfdi:Concepto
      ClaveProdServ="84111500"
      Cantidad="1"
      ClaveUnidad="E48"
      Unidad="Unidad de servicio"
      Descripcion="Donativo deducible de impuestos — {datos['mes_texto']} {datos['anio']}"
      ValorUnitario="{monto:.2f}"
      Importe="{monto:.2f}"
      ObjetoImp="02">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado
            Base="{monto:.2f}"
            Impuesto="002"
            TipoFactor="Tasa"
            TasaOCuota="0.16"
            Importe="{monto * 0.16:.2f}"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>

  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital
      xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital"
      Version="1.1"
      UUID="{uuid_cfdi}"
      FechaTimbrado="{fecha_hora}"
      RfcProvCertif="SAX010101000"
      SelloCFD="SELLO_CFD_SIMULADO"
      NoCertificadoSAT="00001000000800002434"
      SelloSAT="SELLO_SAT_SIMULADO"/>
  </cfdi:Complemento>

</cfdi:Comprobante>"""

    return xml
