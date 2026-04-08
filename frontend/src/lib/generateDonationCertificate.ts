import { jsPDF } from "jspdf";

type CertificateParams = {
    donorName: string;
    donationType: "monto" | "insumo";
    amount?: number;
    itemName?: string;
    createdAt?: Date;
};

function formatSpanishDate(date: Date) {
    return new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
}

function normalizeName(name?: string) {
    if (!name || !name.trim()) return "DONANTE MCCARE";
    return name.trim().toUpperCase();
}

export function getLoggedUserName() {
    if (typeof window === "undefined") return "DONANTE MCCARE";

    try {
        const rawUser = localStorage.getItem("userMcCare");
        if (rawUser) {
            const parsed = JSON.parse(rawUser);

            const possibleName =
                parsed?.nombre_completo ||
                parsed?.nombre ||
                parsed?.name ||
                [parsed?.nombre, parsed?.apellidos].filter(Boolean).join(" ");

            if (possibleName?.trim()) return possibleName;
        }
    } catch {}

    const fallbackName = localStorage.getItem("userName");
    if (fallbackName?.trim()) return fallbackName;

    return "DONANTE MCCARE";
}

export function generateDonationCertificate({
                                                donorName,
                                                donationType,
                                                amount,
                                                itemName,
                                                createdAt = new Date(),
                                            }: CertificateParams) {
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = 297;
    const pageHeight = 210;

    const red = "#C62828";
    const yellow = "#F4B63F";
    const dark = "#7A1E1E";

    doc.setFillColor(249, 245, 238);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.setFillColor(244, 182, 63);
    doc.rect(0, 0, pageWidth, 42, "F");

    doc.setFillColor(198, 40, 40);
    doc.rect(220, 0, 40, 185, "F");

    doc.setFillColor(220, 220, 220);
    doc.triangle(220, 185, 260, 185, 240, 195, "F");
    doc.setFillColor(198, 40, 40);
    doc.triangle(221, 183, 259, 183, 240, 192, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("McCare", 26, 20);

    doc.setFont("times", "italic");
    doc.setFontSize(16);
    doc.text("CERTIFICADO DE DONACIÓN", 26, 31);

    doc.setTextColor(dark);
    doc.setFont("times", "normal");
    doc.setFontSize(17);
    doc.text("ESTE CERTIFICADO SE CONCEDE A", 20, 68);

    doc.setDrawColor(220, 180, 60);
    doc.setLineWidth(0.8);
    doc.line(20, 79, 205, 79);

    doc.setTextColor(red);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(normalizeName(donorName), 20, 101);

    doc.setDrawColor(150, 60, 60);
    doc.setLineWidth(0.6);
    doc.line(20, 112, 205, 112);

    doc.setTextColor(dark);
    doc.setFont("times", "normal");
    doc.setFontSize(14);

    const contributionText =
        donationType === "monto"
            ? `POR SU GENEROSA CONTRIBUCIÓN DE $${(amount || 0).toLocaleString("es-MX")} MXN, ESTE CERTIFICADO SE OTORGA COMO RECONOCIMIENTO POR SU DONACIÓN EN APOYO A MCCARE.`
            : `POR SU GENEROSA CONTRIBUCIÓN EN INSUMOS${itemName ? ` (${itemName})` : ""}, ESTE CERTIFICADO SE OTORGA COMO RECONOCIMIENTO POR SU DONACIÓN EN APOYO A MCCARE.`;

    const splitText = doc.splitTextToSize(contributionText, 165);
    doc.text(splitText, 20, 126);

    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text(formatSpanishDate(createdAt).toUpperCase(), 20, 155);

    doc.setDrawColor(150, 60, 60);
    doc.line(20, 168, 115, 168);

    doc.setFont("times", "normal");
    doc.setFontSize(14);
    doc.text("GRACIAS POR TU APOYO A McCare", 20, 190);

    doc.setFillColor(244, 182, 63);
    doc.circle(240, 140, 16, "F");
    doc.setDrawColor(198, 40, 40);
    doc.setLineWidth(1);
    doc.circle(240, 140, 12, "S");

    doc.setTextColor(red);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("♥", 236.5, 144);

    const safeName = normalizeName(donorName).replace(/\s+/g, "_");
    const fileDate = createdAt.toISOString().slice(0, 10);

    doc.save(`certificado_donacion_${safeName}_${fileDate}.pdf`);
}