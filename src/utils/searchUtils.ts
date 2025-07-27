import Fuse from 'fuse.js';

// Configuration pour la recherche fuzzy
export const createFuseInstance = <T>(data: T[], keys: string[]) => {
  return new Fuse(data, {
    keys,
    threshold: 0.3, // Tolérance pour les fautes de frappe
    ignoreLocation: true,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
  });
};

// Fonction de debounce pour optimiser les performances
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Normalisation du texte pour la recherche
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/\s+/g, ' ')
    .trim();
};

// Recherche par regex pour des patterns spécifiques
export const regexSearch = (text: string, pattern: string): boolean => {
  try {
    const regex = new RegExp(pattern, 'i');
    return regex.test(normalizeText(text));
  } catch {
    return normalizeText(text).includes(normalizeText(pattern));
  }
};

// Fonction de recherche intelligente combinée
export const intelligentSearch = <T>(
  data: T[],
  searchTerm: string,
  searchKeys: string[],
  customFilters?: (item: T, term: string) => boolean
): T[] => {
  if (!searchTerm || searchTerm.length < 2) return data;

  const normalizedTerm = normalizeText(searchTerm);
  
  // Recherche fuzzy avec Fuse.js
  const fuse = createFuseInstance(data, searchKeys);
  const fuseResults = fuse.search(searchTerm).map(result => result.item);
  
  // Recherche regex pour patterns spécifiques
  const regexResults = data.filter(item => {
    return searchKeys.some(key => {
      const value = getNestedValue(item, key);
      return value && regexSearch(String(value), searchTerm);
    });
  });
  
  // Recherche personnalisée si fournie
  const customResults = customFilters 
    ? data.filter(item => customFilters(item, normalizedTerm))
    : [];
  
  // Recherche par numéros (pour les équipements, codes, etc.)
  const numberResults = data.filter(item => {
    return searchKeys.some(key => {
      const value = getNestedValue(item, key);
      if (value && !isNaN(Number(searchTerm))) {
        return String(value).includes(searchTerm);
      }
      return false;
    });
  });
  
  // Combinaison et déduplication des résultats
  const allResults = [...fuseResults, ...regexResults, ...customResults, ...numberResults];
  return Array.from(new Set(allResults));
};

// Utilitaire pour accéder aux propriétés imbriquées
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Types pour les filtres avancés
export interface AdvancedFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
  value: any;
}

// Application des filtres avancés
export const applyAdvancedFilters = <T>(
  data: T[],
  filters: AdvancedFilter[]
): T[] => {
  return data.filter(item => {
    return filters.every(filter => {
      const fieldValue = getNestedValue(item, filter.field);
      
      switch (filter.operator) {
        case 'equals':
          return fieldValue === filter.value;
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
        case 'greater':
          return Number(fieldValue) > Number(filter.value);
        case 'less':
          return Number(fieldValue) < Number(filter.value);
        case 'between':
          return Number(fieldValue) >= filter.value[0] && Number(fieldValue) <= filter.value[1];
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(fieldValue);
        default:
          return true;
      }
    });
  });
};