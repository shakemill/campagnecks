import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

import type { ScreeningRecord } from "@/lib/types/domain";

export async function generatePatientReportPdf(record: ScreeningRecord): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageSize: [number, number] = [595, 842];
  const marginLeft = 40;
  const marginRight = 40;
  const marginTop = 40;
  const marginBottom = 40;
  const contentWidth = pageSize[0] - marginLeft - marginRight;

  let page = pdfDoc.addPage(pageSize);
  let y = pageSize[1] - marginTop;

  const COLORS = {
    text: rgb(0.15, 0.15, 0.15),
    muted: rgb(0.45, 0.45, 0.45),
    primary: rgb(0.8, 0.23, 0.53),
    softPrimaryBg: rgb(0.99, 0.96, 0.98),
    lightGrayBg: rgb(0.97, 0.98, 0.99),
    border: rgb(0.88, 0.89, 0.91),
    white: rgb(1, 1, 1),
  };

  function ensureSpace(height = 20): void {
    if (y - height < marginBottom) {
      page = pdfDoc.addPage(pageSize);
      y = pageSize[1] - marginTop;
    }
  }

  function wrapText(text: string, size = 10, maxWidth = contentWidth): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (fontRegular.widthOfTextAtSize(candidate, size) <= maxWidth) {
        current = candidate;
      } else {
        if (current) {
          lines.push(current);
        }
        current = word;
      }
    }

    if (current) {
      lines.push(current);
    }
    return lines.length ? lines : [""];
  }

  function drawLine(text: string, options?: { bold?: boolean; size?: number; color?: ReturnType<typeof rgb> }) {
    const size = options?.size ?? 10;
    const lineHeight = size + 4;
    const lines = wrapText(text, size);
    ensureSpace(lines.length * lineHeight + 4);
    for (const line of lines) {
      page.drawText(line, {
        x: marginLeft,
        y,
        size,
        font: options?.bold ? fontBold : fontRegular,
        color: options?.color ?? COLORS.text,
      });
      y -= lineHeight;
    }
  }

  function drawSectionTitle(title: string): void {
    ensureSpace(28);
    y -= 2;
    page.drawRectangle({
      x: marginLeft,
      y: y - 16,
      width: contentWidth,
      height: 20,
      color: COLORS.softPrimaryBg,
      borderColor: COLORS.border,
      borderWidth: 0.5,
    });
    page.drawText(title, {
      x: marginLeft + 8,
      y: y - 2,
      size: 11,
      font: fontBold,
      color: COLORS.primary,
    });
    y -= 24;
  }

  function drawKeyValueRow(label: string, value: string): void {
    const rowHeight = 18;
    const labelWidth = 170;
    const valueWidth = contentWidth - labelWidth;
    ensureSpace(rowHeight);

    page.drawRectangle({
      x: marginLeft,
      y: y - rowHeight + 2,
      width: labelWidth,
      height: rowHeight,
      color: COLORS.lightGrayBg,
      borderColor: COLORS.border,
      borderWidth: 0.5,
    });
    page.drawRectangle({
      x: marginLeft + labelWidth,
      y: y - rowHeight + 2,
      width: valueWidth,
      height: rowHeight,
      color: COLORS.white,
      borderColor: COLORS.border,
      borderWidth: 0.5,
    });
    page.drawText(label, {
      x: marginLeft + 6,
      y: y - 11,
      size: 9,
      font: fontBold,
      color: COLORS.muted,
    });
    page.drawText(value || "-", {
      x: marginLeft + labelWidth + 6,
      y: y - 11,
      size: 9,
      font: fontRegular,
      color: COLORS.text,
    });
    y -= rowHeight;
  }

  const personalHistoryMap: Record<string, string> = {
    HTA: "HTA",
    DIABETE: "Diabete",
    IRC: "IRC",
    AVC: "AVC",
    IDM: "Infarctus du myocarde",
  };
  const familyHistoryMap: Record<string, string> = {
    HTA: "HTA",
    DIABETE: "Diabete",
    AVC: "AVC",
    IDM: "IDM",
    MORT_SUBITE: "Mort subite",
  };
  const interpretationMap: Record<string, string> = {
    DEP_NORM: "Depistage normal",
    HTA: "HTA",
    DIABETE: "Diabete",
    PREDIABETE: "Prediabete",
    OBESITE: "Obesite",
    SURPOIDS: "Surpoids",
    OBESITE_ABDOMINALE: "Obesite abdominale",
  };
  const riskMap: Record<string, string> = {
    FAIBLE: "Risque faible (<5%)",
    MODERE: "Risque modere (5-10%)",
    ELEVE: "Risque eleve (10-20%)",
    TRES_ELEVE: "Risque tres eleve (20-30%)",
    TRES_TRES_ELEVE: "Risque tres tres eleve (>=30%)",
  };
  const adviceMap: Record<string, string> = {
    reduceSaltBouillon: "Arreter les cubes et bouillons d'assaisonnement",
    reduceSaltMeals: "Reduire au maximum la quantite de sel",
    avoidProcessedFood: "Eviter les aliments transformes",
    avoidSedentaryLifestyle: "Eviter la sedentarite",
    activity30mFiveDays: "30 min d'activite physique moderee (>=5 jours/semaine)",
    addVegetables: "Moitie de l'assiette en legumes",
    eatFruitsRegularly: "Consommer regulierement des fruits",
    replaceSugaryDrinks: "Remplacer sodas/boissons sucrees par l'eau",
    stopSmoking: "Stop tabac",
    reduceAlcohol: "Limiter l'alcool",
    monitorBloodPressureWeightSugar: "Surveiller tension, poids, glycemie",
    consultIfHighRisk: "Consulter rapidement si risque eleve/tres eleve",
  };

  page.drawRectangle({
    x: marginLeft,
    y: y - 54,
    width: contentWidth,
    height: 54,
    color: COLORS.white,
    borderColor: COLORS.primary,
    borderWidth: 1.2,
  });
  page.drawText("PLENITUDE CLINIQUE KOUAM SAMUEL", {
    x: marginLeft + 10,
    y: y - 18,
    size: 11,
    font: fontBold,
    color: COLORS.primary,
  });
  page.drawText("Rapport professionnel - Depistage cardiovasculaire", {
    x: marginLeft + 10,
    y: y - 34,
    size: 10,
    font: fontRegular,
    color: COLORS.text,
  });
  page.drawText(`Genere le ${new Date().toLocaleString("fr-FR")}`, {
    x: marginLeft + 10,
    y: y - 47,
    size: 8,
    font: fontRegular,
    color: COLORS.muted,
  });
  y -= 66;

  drawSectionTitle("IDENTIFICATION DU PATIENT");
  drawKeyValueRow("N d'enregistrement", record.registrationNumber);
  drawKeyValueRow("Date de fiche", record.patient.date);
  drawKeyValueRow("Nom et prenom", record.patient.fullName);
  drawKeyValueRow("Age / Sexe", `${record.patient.age} ans / ${record.patient.sex === "M" ? "Masculin" : "Feminin"}`);
  drawKeyValueRow("Lieu de residence", record.patient.residence);
  drawKeyValueRow("Profession", record.patient.profession);
  drawKeyValueRow("Telephone", `${record.patient.phone1}${record.patient.phone2 ? ` / ${record.patient.phone2}` : ""}`);
  y -= 8;

  drawSectionTitle("FACTEURS DE RISQUE ET ANTECEDENTS");
  drawLine(
    `Tabagisme: ${record.riskFactors.smoking}${record.riskFactors.packYears ? ` | ${record.riskFactors.packYears} PA` : ""}${
      record.riskFactors.yearsSinceQuit ? ` | Sevre depuis ${record.riskFactors.yearsSinceQuit} ans` : ""
    }`,
  );
  drawLine(`Consommation alcool: ${record.riskFactors.alcohol}`);
  drawLine(`Activite physique (30 min): ${record.riskFactors.physicalActivity}`);
  drawLine(
    `Antecedents personnels: ${
      record.riskFactors.personalHistory.length
        ? record.riskFactors.personalHistory.map((item) => personalHistoryMap[item]).join(", ")
        : "Aucun"
    }`,
  );
  drawLine(
    `Antecedents familiaux: ${
      record.riskFactors.familyHistory.length
        ? record.riskFactors.familyHistory.map((item) => familyHistoryMap[item]).join(", ")
        : "Aucun"
    }`,
  );
  drawLine(`Traitement en cours: ${record.riskFactors.ongoingTreatment || "Non precise"}`);
  y -= 6;

  drawSectionTitle("CONSTANTES ET BIOLOGIE");
  drawLine(
    `PA bras droit: ${record.vitalsBiology.bloodPressureRight.systolic}/${record.vitalsBiology.bloodPressureRight.diastolic} mmHg`,
  );
  drawLine(
    `PA bras gauche: ${record.vitalsBiology.bloodPressureLeft.systolic}/${record.vitalsBiology.bloodPressureLeft.diastolic} mmHg`,
  );
  drawLine(
    `Poids: ${record.vitalsBiology.weightKg} kg | Taille: ${record.vitalsBiology.heightCm} cm | IMC: ${record.vitalsBiology.bmi}`,
  );
  drawLine(`Tour de taille: ${record.vitalsBiology.waistCm} cm`);
  drawLine(`Glycemie a jeun: ${record.vitalsBiology.fastingGlucoseGl} g/L`);
  y -= 6;

  if (record.vitalsGuidance) {
    const vg = record.vitalsGuidance;
    drawSectionTitle("SYNTHESE AUTOMATIQUE (CONSTANTES)");
    drawLine(
      "Informations derivees des mesures ci-dessus et du sexe ; aide non substitutive du jugement clinique.",
      { size: 9, color: COLORS.muted },
    );
    if (vg.bloodPressureAvg) {
      drawLine(
        `PA moyenne (bras droit/gauche): ${vg.bloodPressureAvg.systolic}/${vg.bloodPressureAvg.diastolic} mmHg`,
      );
      drawLine(`Classification: ${vg.bloodPressureAvg.classification}`);
      drawLine(`Risque cardiovasculaire: ${vg.bloodPressureAvg.cardiovascularRisk}`);
      drawLine(`Action: ${vg.bloodPressureAvg.action}`);
    }
    if (vg.bmi) {
      drawLine(`IMC: ${vg.bmi.value} kg/m2 — ${vg.bmi.weightStatus} (${vg.bmi.intervalLabel})`);
      drawLine(`Risque metabolique: ${vg.bmi.metabolicRisk}`);
    }
    if (vg.waist) {
      drawLine(`Tour de taille: ${vg.waist.value} cm — ${vg.waist.thresholdLabel}`);
      drawLine(`Risque cardiometabolique (perimetre): ${vg.waist.cardiometabolicRisk}`);
    }
    if (vg.glucose) {
      drawLine(`Glycemie a jeun: ${vg.glucose.valueGPerL} g/L — ${vg.glucose.status}`);
      drawLine(`Risque clinique (glycemie): ${vg.glucose.clinicalRisk}`);
    }
    drawLine(`Synthese calculee le: ${vg.computedAt}`, { size: 9, color: COLORS.muted });
    y -= 6;
  }

  drawSectionTitle("INTERPRETATION GLOBALE");
  drawLine(
    `Interpretations cochees: ${
      record.interpretation.labels.length
        ? record.interpretation.labels.map((item) => interpretationMap[item] ?? item).join(", ")
        : "Aucune"
    }`,
  );
  drawLine(`Autre interpretation: ${record.interpretation.other || "Aucune"}`);
  y -= 6;

  const scoreOmsEligible =
    typeof record.patient.age === "number" &&
    Number.isFinite(record.patient.age) &&
    record.patient.age >= 40;

  if (scoreOmsEligible) {
    drawSectionTitle("EVALUATION DU RISQUE CARDIOVASCULAIRE");
    drawLine(`Evaluation activee: ${record.cardiovascularRisk.enabled ? "Oui" : "Non"}`);
    drawLine(
      `Niveau de risque: ${
        record.cardiovascularRisk.level ? riskMap[record.cardiovascularRisk.level] : "Non evalue"
      }`,
    );
    drawLine(`Note SCORE OMS: ${record.cardiovascularRisk.scoreNote || "Aucune"}`);
    y -= 6;
  }

  drawSectionTitle("ORIENTATION ET DECISION MEDICALE");
  drawLine(
    `Orientations cochees: ${
      record.orientationDecision.items.length ? record.orientationDecision.items.join(", ") : "Aucune"
    }`,
  );
  drawLine(`Autre orientation: ${record.orientationDecision.other || "Aucune"}`);
  drawLine(
    `Rendez-vous de controle: ${
      record.orientationDecision.followUpDate
        ? `${record.orientationDecision.followUpDate} ${record.orientationDecision.followUpTime ?? ""}`.trim()
        : "Non defini"
    }`,
  );
  y -= 6;

  drawSectionTitle("IDENTIFICATION DU PERSONNEL");
  drawLine(`Infirmier(ere): ${record.staffIdentity.nurseName || "Non renseigne"}`);
  drawLine(`Medecin: ${record.staffIdentity.doctorName || "Non renseigne"}`);
  y -= 6;

  drawSectionTitle("CONSEILS HYGIENO-DIETETIQUES");
  const checkedAdvice = Object.entries(record.hygienoDietAdvice)
    .filter(([, checked]) => checked)
    .map(([label]) => adviceMap[label] ?? label);
  drawLine(checkedAdvice.length ? checkedAdvice.join(", ") : "Aucun conseil coche");

  y -= 8;
  drawLine(`Fiche validee par medecin: ${record.validatedAt ? "Oui" : "Non"}`, { bold: true });
  drawLine(
    `Date validation: ${record.validatedAt ? new Date(record.validatedAt).toLocaleString("fr-FR") : "N/A"}`,
    { color: COLORS.muted },
  );

  const payload = record.qrPayload ?? `${record.id}:${record.registrationNumber}:${record.updatedAt}`;
  const qrDataUrl = await QRCode.toDataURL(payload);
  const qrImage = await pdfDoc.embedPng(qrDataUrl);
  ensureSpace(130);
  page.drawImage(qrImage, { x: pageSize[0] - 150, y: marginBottom, width: 110, height: 110 });
  page.drawText("QR verification", {
    x: pageSize[0] - 140,
    y: marginBottom - 12,
    size: 9,
    font: fontRegular,
    color: COLORS.muted,
  });

  return pdfDoc.save();
}
