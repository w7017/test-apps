const express = require('express');
const pool = require('../database/connection');
const { authenticateToken } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');

const router = express.Router();

// AI Assistant Chat
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, context } = req.body;

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple AI response logic based on keywords
    let response = generateAIResponse(message.toLowerCase(), context);

    // Log activity
    await logActivity(req.user.id, 'AI_CHAT', 'ai_assistant', null, {
      user_message: message,
      ai_response: response.substring(0, 100) + '...'
    }, req.ip, req.get('User-Agent'));

    res.json({
      response,
      suggestions: generateSuggestions(message.toLowerCase()),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Equipment Suggestions
router.post('/equipment/suggest', authenticateToken, async (req, res) => {
  try {
    const { partial_data, domain } = req.body;

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 800));

    const suggestions = await generateEquipmentSuggestions(partial_data, domain);

    // Log activity
    await logActivity(req.user.id, 'AI_EQUIPMENT_SUGGEST', 'ai_assistant', null, {
      partial_data,
      domain,
      suggestions_count: suggestions.length
    }, req.ip, req.get('User-Agent'));

    res.json({
      suggestions,
      confidence: Math.floor(Math.random() * 30) + 70 // 70-100%
    });
  } catch (error) {
    console.error('Error in AI equipment suggestions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Audit Checklist Generation
router.post('/audit/checklist', authenticateToken, async (req, res) => {
  try {
    const { equipment_type, domain } = req.body;

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 600));

    const checklist = generateAuditChecklist(equipment_type, domain);

    // Log activity
    await logActivity(req.user.id, 'AI_AUDIT_CHECKLIST', 'ai_assistant', null, {
      equipment_type,
      domain,
      checklist_items: checklist.length
    }, req.ip, req.get('User-Agent'));

    res.json({
      checklist,
      equipment_type,
      domain,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating audit checklist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Data Mapping for CSV Import
router.post('/data/mapping', authenticateToken, async (req, res) => {
  try {
    const { columns, sample_data } = req.body;

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1200));

    const mapping = generateColumnMapping(columns, sample_data);

    // Log activity
    await logActivity(req.user.id, 'AI_DATA_MAPPING', 'ai_assistant', null, {
      columns_count: columns.length,
      mapping_confidence: mapping.overall_confidence
    }, req.ip, req.get('User-Agent'));

    res.json({
      mapping: mapping.suggestions,
      confidence: mapping.overall_confidence,
      warnings: mapping.warnings
    });
  } catch (error) {
    console.error('Error in AI data mapping:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Maintenance Recommendations
router.post('/maintenance/recommend', authenticateToken, async (req, res) => {
  try {
    const { equipment_id, audit_history } = req.body;

    // Get equipment details
    const equipmentResult = await pool.query(`
      SELECT e.*, td.name as domain_name
      FROM equipment e
      LEFT JOIN technical_domains td ON e.domain_id = td.id
      WHERE e.id = $1
    `, [equipment_id]);

    if (equipmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const equipment = equipmentResult.rows[0];

    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500));

    const recommendations = generateMaintenanceRecommendations(equipment, audit_history);

    // Log activity
    await logActivity(req.user.id, 'AI_MAINTENANCE_RECOMMEND', 'ai_assistant', equipment_id, {
      equipment_reference: equipment.reference,
      recommendations_count: recommendations.length
    }, req.ip, req.get('User-Agent'));

    res.json({
      equipment_reference: equipment.reference,
      recommendations,
      priority_score: Math.floor(Math.random() * 40) + 60, // 60-100
      next_maintenance_suggested: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error generating maintenance recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper Functions

function generateAIResponse(message, context) {
  if (message.includes('vmc') || message.includes('ventilation')) {
    return "Pour auditer une VMC, voici les points clés à vérifier :\n\n1. **État des filtres** - Vérifiez l'encrassement et remplacez si nécessaire\n2. **Fonctionnement des moteurs** - Écoutez les bruits anormaux, vibrations\n3. **Débits d'air** - Mesurez les débits d'extraction et d'insufflation\n4. **Étanchéité des conduits** - Inspectez visuellement les raccordements\n5. **Système de régulation** - Testez les sondes et automatismes\n\nVoulez-vous que je vous guide pour un type spécifique de VMC ?";
  }
  
  if (message.includes('équipement') || message.includes('ajouter') || message.includes('créer')) {
    return "Pour ajouter un nouvel équipement rapidement :\n\n1. **Utilisez l'OCR** - Prenez une photo de la plaque signalétique\n2. **Vérifiez les données** - L'IA pré-remplit automatiquement les champs\n3. **Complétez la localisation** - Précisez le bâtiment et l'étage\n4. **Choisissez le domaine** - CVC, Électricité, Plomberie...\n\nL'OCR reconnaît automatiquement la marque, le modèle et le numéro de série. Cela vous fait gagner 80% du temps de saisie !";
  }
  
  if (message.includes('rapport') || message.includes('livrable') || message.includes('pdf')) {
    return "Pour générer un rapport d'audit :\n\n1. **Allez dans 'Livrables'** - Section dédiée aux rapports\n2. **Cliquez 'Générer nouveau rapport'** - Sélectionnez la période\n3. **Choisissez le périmètre** - Client, site ou bâtiment spécifique\n4. **Formats disponibles** :\n   - PDF synthétique (rapport complet)\n   - Excel équipements (liste détaillée)\n   - Excel anomalies (actions correctives)\n\nLe rapport est généré automatiquement avec toutes les données d'audit de la période sélectionnée.";
  }
  
  if (message.includes('import') || message.includes('csv') || message.includes('excel')) {
    return "Pour importer vos équipements :\n\n1. **Préparez votre fichier** - Format CSV ou Excel accepté\n2. **Glissez-déposez** - Dans la section 'Data Management'\n3. **Mapping automatique** - L'IA suggère les correspondances de colonnes\n4. **Validez en 1 clic** - Vérifiez et confirmez l'import\n\nL'IA reconnaît automatiquement les colonnes comme 'référence', 'type', 'localisation', etc. Taux de réussite : 95% !";
  }
  
  if (message.includes('aide') || message.includes('help') || message.includes('comment')) {
    return "Je peux vous aider avec :\n\n🔧 **Audits d'équipements** - Procédures, checklists, bonnes pratiques\n📊 **Génération de rapports** - PDF, Excel, personnalisation\n📥 **Import de données** - CSV, mapping automatique\n⚙️ **Configuration** - Paramètres, utilisateurs, domaines\n🏢 **Gestion des sites** - Clients, bâtiments, organisation\n\nPosez-moi une question spécifique ou dites-moi ce que vous cherchez à faire !";
  }
  
  return "Je peux vous aider avec la GMAO ! Posez-moi des questions sur :\n- L'audit d'équipements\n- La génération de rapports\n- L'import de données\n- La configuration du système\n\nQue souhaitez-vous savoir ?";
}

function generateSuggestions(message) {
  const suggestions = [
    "Comment auditer une CTA ?",
    "Générer un rapport mensuel",
    "Importer des équipements",
    "Configurer les domaines techniques"
  ];
  
  if (message.includes('vmc')) {
    return [
      "Checklist audit VMC",
      "Fréquence maintenance VMC",
      "Défauts courants VMC"
    ];
  }
  
  return suggestions.slice(0, 3);
}

async function generateEquipmentSuggestions(partialData, domain) {
  // Simulate database lookup for similar equipment
  const suggestions = [];
  
  if (domain === 'CVC') {
    suggestions.push(
      { field: 'type', value: 'Centrale de traitement d\'air', confidence: 92 },
      { field: 'maintenance_frequency', value: 90, confidence: 88 },
      { field: 'location', value: 'Local technique', confidence: 75 }
    );
  } else if (domain === 'Électricité') {
    suggestions.push(
      { field: 'type', value: 'Tableau électrique', confidence: 85 },
      { field: 'maintenance_frequency', value: 365, confidence: 90 },
      { field: 'location', value: 'Local TGBT', confidence: 80 }
    );
  }
  
  return suggestions;
}

function generateAuditChecklist(equipmentType, domain) {
  const baseChecklist = [
    { item: 'État général', description: 'Inspection visuelle globale' },
    { item: 'Sécurité', description: 'Vérification des dispositifs de sécurité' },
    { item: 'Fonctionnement', description: 'Test de fonctionnement normal' }
  ];
  
  if (domain === 'CVC') {
    if (equipmentType.toLowerCase().includes('vmc') || equipmentType.toLowerCase().includes('ventilation')) {
      return [
        ...baseChecklist,
        { item: 'Filtres', description: 'État et encrassement des filtres' },
        { item: 'Moteurs', description: 'Fonctionnement, bruit, vibrations' },
        { item: 'Débits', description: 'Mesure des débits d\'air' },
        { item: 'Conduits', description: 'Étanchéité et état des conduits' }
      ];
    } else if (equipmentType.toLowerCase().includes('cta') || equipmentType.toLowerCase().includes('centrale')) {
      return [
        ...baseChecklist,
        { item: 'Batteries', description: 'État des batteries chaude/froide' },
        { item: 'Ventilateurs', description: 'Fonctionnement et équilibrage' },
        { item: 'Filtration', description: 'État et perte de charge des filtres' },
        { item: 'Régulation', description: 'Fonctionnement des automatismes' }
      ];
    }
  } else if (domain === 'Électricité') {
    return [
      ...baseChecklist,
      { item: 'Connexions', description: 'Serrage et état des connexions' },
      { item: 'Isolement', description: 'Mesure de résistance d\'isolement' },
      { item: 'Protection', description: 'Test des dispositifs de protection' },
      { item: 'Signalisation', description: 'Fonctionnement des voyants et alarmes' }
    ];
  }
  
  return baseChecklist;
}

function generateColumnMapping(columns, sampleData) {
  const mappings = {
    'ref': { target: 'reference', confidence: 95 },
    'reference': { target: 'reference', confidence: 98 },
    'ref_equipment': { target: 'reference', confidence: 92 },
    'type': { target: 'type', confidence: 90 },
    'type_equip': { target: 'type', confidence: 88 },
    'marque': { target: 'brand', confidence: 85 },
    'brand': { target: 'brand', confidence: 95 },
    'modele': { target: 'model', confidence: 85 },
    'model': { target: 'model', confidence: 95 },
    'serie': { target: 'serial_number', confidence: 88 },
    'serial': { target: 'serial_number', confidence: 92 },
    'serial_number': { target: 'serial_number', confidence: 98 },
    'localisation': { target: 'location', confidence: 90 },
    'location': { target: 'location', confidence: 95 },
    'emplacement': { target: 'location', confidence: 85 },
    'domaine': { target: 'domain', confidence: 88 },
    'domain': { target: 'domain', confidence: 95 }
  };
  
  const suggestions = [];
  const warnings = [];
  let totalConfidence = 0;
  
  columns.forEach(column => {
    const normalizedColumn = column.toLowerCase().replace(/[^a-z0-9]/g, '');
    let bestMatch = null;
    let bestConfidence = 0;
    
    // Find best matching target field
    Object.keys(mappings).forEach(key => {
      if (normalizedColumn.includes(key) || key.includes(normalizedColumn)) {
        if (mappings[key].confidence > bestConfidence) {
          bestMatch = mappings[key];
          bestConfidence = mappings[key].confidence;
        }
      }
    });
    
    if (bestMatch) {
      suggestions.push({
        source: column,
        target: bestMatch.target,
        confidence: bestConfidence
      });
      totalConfidence += bestConfidence;
    } else {
      suggestions.push({
        source: column,
        target: 'unmapped',
        confidence: 0
      });
      warnings.push(`Colonne '${column}' non reconnue`);
    }
  });
  
  return {
    suggestions,
    overall_confidence: Math.round(totalConfidence / columns.length),
    warnings
  };
}

function generateMaintenanceRecommendations(equipment, auditHistory) {
  const recommendations = [];
  
  // Base recommendations based on equipment type and domain
  if (equipment.domain_name === 'CVC') {
    recommendations.push({
      type: 'preventive',
      priority: 'high',
      action: 'Remplacement des filtres',
      description: 'Remplacer les filtres selon la fréquence recommandée',
      estimated_cost: '150-300€',
      frequency: 'Trimestrielle'
    });
    
    recommendations.push({
      type: 'inspection',
      priority: 'medium',
      action: 'Contrôle des débits',
      description: 'Vérifier et ajuster les débits d\'air',
      estimated_cost: '200-400€',
      frequency: 'Semestrielle'
    });
  }
  
  // Add recommendations based on equipment age
  const installationDate = new Date(equipment.installation_date);
  const ageInYears = (Date.now() - installationDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  if (ageInYears > 10) {
    recommendations.push({
      type: 'replacement',
      priority: 'medium',
      action: 'Évaluation de remplacement',
      description: 'Équipement ancien, évaluer l\'opportunité de remplacement',
      estimated_cost: '5000-15000€',
      frequency: 'Ponctuelle'
    });
  }
  
  return recommendations;
}

module.exports = router;