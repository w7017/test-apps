const fs = require('fs').promises;
const path = require('path');

// Simulate PDF report generation
async function generatePDFReport(deliverableId, audits) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const filename = `rapport-audit-${deliverableId}-${Date.now()}.pdf`;
  const filePath = path.join('uploads', 'reports', filename);
  
  // Ensure directory exists
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  
  // Simulate PDF content creation
  const pdfContent = generatePDFContent(audits);
  await fs.writeFile(filePath, pdfContent);
  
  return filePath;
}

// Simulate Excel report generation
async function generateExcelReport(deliverableId, audits) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const filename = `equipements-audit-${deliverableId}-${Date.now()}.xlsx`;
  const filePath = path.join('uploads', 'reports', filename);
  
  // Ensure directory exists
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  
  // Simulate Excel content creation
  const excelContent = generateExcelContent(audits);
  await fs.writeFile(filePath, excelContent);
  
  return filePath;
}

function generatePDFContent(audits) {
  // This would normally use a PDF library like pdf-lib or puppeteer
  // For simulation, we'll create a simple text representation
  
  let content = `RAPPORT D'AUDIT TECHNIQUE
========================

Date de génération: ${new Date().toLocaleDateString('fr-FR')}
Nombre d'équipements audités: ${audits.length}

SYNTHÈSE
--------
`;

  const statusCounts = audits.reduce((acc, audit) => {
    acc[audit.overall_status] = (acc[audit.overall_status] || 0) + 1;
    return acc;
  }, {});

  content += `Conformes: ${statusCounts.ok || 0}\n`;
  content += `À surveiller: ${statusCounts.warning || 0}\n`;
  content += `Critiques: ${statusCounts.critical || 0}\n\n`;

  content += `DÉTAIL DES AUDITS
-----------------\n`;

  audits.forEach((audit, index) => {
    content += `${index + 1}. ${audit.equipment_reference} (${audit.equipment_type})\n`;
    content += `   Localisation: ${audit.equipment_location}\n`;
    content += `   Statut: ${audit.overall_status}\n`;
    content += `   Date audit: ${new Date(audit.audit_date).toLocaleDateString('fr-FR')}\n`;
    if (audit.notes) {
      content += `   Notes: ${audit.notes}\n`;
    }
    content += '\n';
  });

  return content;
}

function generateExcelContent(audits) {
  // This would normally use a library like exceljs
  // For simulation, we'll create a CSV-like content
  
  let content = 'Référence,Type,Localisation,Domaine,Statut,Date Audit,Notes\n';
  
  audits.forEach(audit => {
    content += `"${audit.equipment_reference}","${audit.equipment_type}","${audit.equipment_location}","${audit.domain_name || ''}","${audit.overall_status}","${new Date(audit.audit_date).toLocaleDateString('fr-FR')}","${audit.notes || ''}"\n`;
  });
  
  return content;
}

module.exports = {
  generatePDFReport,
  generateExcelReport
};