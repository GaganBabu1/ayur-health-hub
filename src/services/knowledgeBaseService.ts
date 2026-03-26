import { apiGet } from './apiClient';

/**
 * Knowledge Base Service - Real API Integration
 * Combines diseases and treatments from backend admin endpoints
 * to provide herb and remedy information for the knowledge base.
 */

// ============ KNOWLEDGE BASE INTERFACES ============

export interface Herb {
  id: string;
  name: string;
  sanskritName: string;
  description: string;
  benefits: string[];
  uses: string[];
  doshaEffect: string;
  imageUrl?: string;
}

export interface AyurvedicRemedy {
  id: string;
  name: string;
  condition: string;
  ingredients: string[];
  preparation: string;
  dosage: string;
  benefits: string;
}

// ============ BACKEND INTERFACES ============

export interface BackendSymptom {
  _id: string;
  name: string;
  category?: string;
}

export interface BackendDisease {
  _id: string;
  name: string;
  description?: string;
  symptoms: BackendSymptom[];
  severityLevel?: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface BackendTreatment {
  _id: string;
  disease: {
    _id: string;
    name: string;
    description: string;
  };
  herbs: string[];
  dietRecommendations: string[];
  lifestyleRecommendations: string[];
  notes?: string;
  createdAt: string;
}

// ============ KNOWLEDGE BASE SERVICE ============

/**
 * Get all herbs (mapped from diseases)
 * Fetches diseases from /admin/diseases and maps them to Herb format
 */
export async function getHerbs(): Promise<Herb[]> {
  try {
    const diseases = await apiGet<BackendDisease[]>('/admin/diseases');

    return diseases.map(disease => ({
      id: disease._id,
      name: disease.name,
      sanskritName: disease.name, // Backend doesn't have sanskrit names, use regular name
      description: disease.description || 'A condition in Ayurvedic medicine',
      benefits: [
        `Addresses ${disease.name}`,
        `Severity level: ${disease.severityLevel || 'standard'}`,
        'Balances doshas',
      ],
      uses: disease.symptoms
        ? disease.symptoms.map(s => (typeof s === 'string' ? s : s.name))
        : [disease.name],
      doshaEffect: `Related to ${disease.name} treatment`,
    }));
  } catch (error) {
    console.error('Error fetching herbs from diseases:', error);
    return [];
  }
}

/**
 * Get herb by ID (mapped from disease)
 */
export async function getHerbById(id: string): Promise<Herb | null> {
  try {
    const herbs = await getHerbs();
    return herbs.find(h => h.id === id) || null;
  } catch (error) {
    console.error('Error fetching herb by ID:', error);
    return null;
  }
}

/**
 * Search herbs by query (client-side filter)
 */
export async function searchHerbs(query: string): Promise<Herb[]> {
  const herbs = await getHerbs();
  const lowerQuery = query.toLowerCase();
  return herbs.filter(
    h =>
      h.name.toLowerCase().includes(lowerQuery) ||
      h.sanskritName.toLowerCase().includes(lowerQuery) ||
      h.benefits.some(b => b.toLowerCase().includes(lowerQuery)) ||
      h.uses.some(u => u.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get all remedies (mapped from treatments)
 * Fetches treatments from /admin/treatments and maps them to AyurvedicRemedy format
 */
export async function getRemedies(): Promise<AyurvedicRemedy[]> {
  try {
    const treatments = await apiGet<BackendTreatment[]>('/admin/treatments');

    return treatments.map(treatment => ({
      id: treatment._id,
      name: treatment.notes ? treatment.notes.split('\n')[0] : `${treatment.disease.name} Treatment`,
      condition: treatment.disease.name,
      ingredients: treatment.herbs && treatment.herbs.length > 0 
        ? treatment.herbs 
        : ['Herbal blend'],
      preparation: treatment.dietRecommendations && treatment.dietRecommendations.length > 0
        ? `Follow dietary recommendations: ${treatment.dietRecommendations.join(', ')}`
        : 'Follow Ayurvedic preparation methods',
      dosage: treatment.lifestyleRecommendations && treatment.lifestyleRecommendations.length > 0
        ? `${treatment.lifestyleRecommendations.join(', ')}`
        : 'As recommended by practitioner',
      benefits: treatment.notes || `Helps manage ${treatment.disease.name} through Ayurvedic treatment`,
    }));
  } catch (error) {
    console.error('Error fetching remedies from treatments:', error);
    return [];
  }
}

/**
 * Get remedy by ID (mapped from treatment)
 */
export async function getRemedyById(id: string): Promise<AyurvedicRemedy | null> {
  try {
    const remedies = await getRemedies();
    return remedies.find(r => r.id === id) || null;
  } catch (error) {
    console.error('Error fetching remedy by ID:', error);
    return null;
  }
}

/**
 * Search remedies by query (client-side filter)
 */
export async function searchRemedies(query: string): Promise<AyurvedicRemedy[]> {
  const remedies = await getRemedies();
  const lowerQuery = query.toLowerCase();
  return remedies.filter(
    r =>
      r.name.toLowerCase().includes(lowerQuery) ||
      r.condition.toLowerCase().includes(lowerQuery) ||
      r.ingredients.some(i => i.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Search all knowledge base items (herbs and remedies)
 */
export async function searchAll(query: string) {
  const [herbs, remedies] = await Promise.all([
    searchHerbs(query),
    searchRemedies(query),
  ]);
  return { herbs, remedies };
}

// ============ LEGACY EXPORTS (For backward compatibility) ============

export const knowledgeBaseService = {
  getHerbs,
  getHerbById,
  searchHerbs,
  getRemedies,
  getRemedyById,
  searchRemedies,
  searchAll,
};
