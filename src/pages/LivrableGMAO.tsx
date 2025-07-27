import React, { useState } from 'react';

const tabs = [
  { label: 'Import Equipements', key: 'import_equipements' },
  { label: 'Import Planning', key: 'import_planning' },
  { label: 'Planning Client', key: 'planning_client' },
];

const LivrableGMAO = () => {
  const [activeTab, setActiveTab] = useState('import_equipements');

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Livrable GMAO</h2>
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
        {activeTab === 'import_equipements' && (
          <div>Import massif des équipements (à répliquer depuis Data Management).</div>
        )}
        {activeTab === 'import_planning' && (
          <div>Importer le planning préventif (CSV/Excel).</div>
        )}
        {activeTab === 'planning_client' && (
          <div>Éditeur WYSIWYG du planning préventif pour le client actif.</div>
        )}
      </div>
    </div>
  );
};

export default LivrableGMAO; 