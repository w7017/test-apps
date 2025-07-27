import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useClient } from '../contexts/ClientContext';
import UserMenu from './UserMenu';
import {
  Home,
  Building,
  Users,
  Wrench,
  FileText,
  Database,
  Settings,
  Zap,
  FilePlus,
  ClipboardList,
  Calendar,
  Upload,
  ListChecks,
  Layers,
  File,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const sections = [
  {
    key: 'parc',
    label: 'Parc',
    icon: Layers,
    items: [
      { path: '/clients', icon: Users, label: 'Client' },
      { path: '/arborescence', icon: Layers, label: 'Arborescence technique' },
    ],
  },
  {
    key: 'audit',
    label: 'Audit',
    icon: Wrench,
    items: [
      { path: '/audits', icon: Wrench, label: 'Relevés/Audit Equipements' },
      { path: '/audit-livrable', icon: FileText, label: 'Livrable Etat des lieux' },
    ],
  },
  {
    key: 'ppa',
    label: 'PPA',
    icon: FilePlus,
    items: [
      { path: '/ppa', icon: FilePlus, label: 'Générer PPA' },
    ],
  },
  {
    key: 'gpa',
    label: 'GPA / OPL / OPR',
    icon: ClipboardList,
    items: [
      { path: '/gpa', icon: ClipboardList, label: 'Suivre GPA' },
      { path: '/opl-opr', icon: CheckCircle, label: 'Track OPL / OPR' },
    ],
  },
  {
    key: 'pepa',
    label: 'PEPA GMAO',
    icon: Calendar,
    items: [
      { path: '/preparation-equipement', icon: Wrench, label: 'Préparation équipement' },
      { path: '/planification-prev', icon: Calendar, label: 'Planification Prév' },
      { path: '/livrable-gmao', icon: File, label: 'Livrable GMAO' },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const { hasRole } = useAuth();
  const { selectedClient } = useClient();

  // Trouver la section ouverte par défaut selon la route active
  const getDefaultOpen = () => {
    const found = sections.find(section =>
      section.items.some(item => location.pathname.startsWith(item.path))
    );
    return found ? found.key : null;
  };
  const [openSection, setOpenSection] = useState(getDefaultOpen());

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-72 bg-slate-800 text-white shadow-lg flex flex-col h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <Zap className="w-8 h-8 text-blue-400" />
          <h1 className="text-xl font-bold">GMAO Pro</h1>
        </div>
        <p className="text-slate-400 text-sm mt-1">Maintenance Assistée par IA</p>
        {selectedClient && (
          <div className="mt-4 flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold w-fit">
            <span className="text-lg">{selectedClient.logo}</span>
            <span>{selectedClient.name}</span>
          </div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto px-2">
        {sections.map(section => (
          <div key={section.key} className="mb-2">
            <button
              className="flex items-center w-full px-2 py-2 text-left font-bold text-slate-200 hover:bg-slate-700 rounded transition-colors group"
              onClick={() => setOpenSection(openSection === section.key ? null : section.key)}
            >
              <section.icon className="w-5 h-5 mr-2 text-blue-400" />
              <span className="flex-1">{section.label}</span>
              {openSection === section.key ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {openSection === section.key && (
              <div className="ml-6 mt-1">
                {section.items.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center pl-4 py-2 rounded transition-colors text-sm ${isActive(item.path) ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
        <UserMenu />
      </div>
    </div>
  );
};

export default Sidebar;