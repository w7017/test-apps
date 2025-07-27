import React, { useState } from 'react';

const tabs = [
  { label: 'Présentation Client', key: 'presentation' },
  { label: 'Rapport de synthèse', key: 'rapport' },
  { label: 'Liste des équipements', key: 'equipements' },
  { label: 'Observations complémentaires', key: 'observations' },
];

const AuditLivrable = () => {
  const [activeTab, setActiveTab] = useState('presentation');

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Livrable État des lieux</h2>
      <div className="flex space-x-4 border-b mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`pb-2 px-4 font-semibold border-b-2 transition-colors ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {activeTab === 'presentation' && (
          <div>Génération automatique d'un PPTX structuré par Site/Bâtiment/Niveau/Local. (À implémenter)</div>
        )}
        {activeTab === 'rapport' && (
          <div>Intégration du rapport de synthèse (déjà implémenté ailleurs, à intégrer ici).</div>
        )}
        {activeTab === 'equipements' && (
          <div>Tableau des équipements audités, défauts et actions de remédiation. (À implémenter)</div>
        )}
        {activeTab === 'observations' && (
          <div>Zone libre pour remarques ou photos annexes (champ texte + upload). (À implémenter)</div>
        )}
      </div>
    </div>
  );
};

export default AuditLivrable; 