// OCR Simulator - simulates AI-powered nameplate recognition
const simulateOCR = async (imagePath) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock OCR results based on common equipment types
  const mockResults = [
    {
      brand: 'DAIKIN',
      model: 'VRV-IV-S',
      serial_number: 'DK2024-001-ABC',
      domain: 'CVC',
      type: 'Climatisation VRV',
      confidence: 95
    },
    {
      brand: 'SCHNEIDER',
      model: 'ATS48C17Q',
      serial_number: 'SCH2024-789-XYZ',
      domain: 'Électricité',
      type: 'Démarreur progressif',
      confidence: 88
    },
    {
      brand: 'GRUNDFOS',
      model: 'CR 15-3',
      serial_number: 'GR2024-456-DEF',
      domain: 'Plomberie',
      type: 'Pompe centrifuge',
      confidence: 92
    },
    {
      brand: 'FRANCE AIR',
      model: 'JDEAL 450',
      serial_number: 'FA2024-123-GHI',
      domain: 'CVC',
      type: 'Centrale de traitement d\'air',
      confidence: 97
    }
  ];

  // Return random mock result
  const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
  
  return {
    success: true,
    extracted_data: randomResult,
    processing_time: '1.5s',
    suggestions: {
      reference: `${randomResult.brand.substring(0, 3)}-${Date.now().toString().slice(-6)}`,
      location: 'À définir - Local technique',
      maintenance_frequency: randomResult.domain === 'CVC' ? 90 : 180
    }
  };
};

module.exports = { simulateOCR };