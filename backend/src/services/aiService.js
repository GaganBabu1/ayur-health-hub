// Dataset-driven AI service for consultation analysis
// Loads diseases and symptoms from MongoDB and calculates weighted matches

const Disease = require('../models/Disease');
const Symptom = require('../models/Symptom');

/**
 * Calculate weighted disease score based on symptom matches
 * @param {Array} inputSymptoms - Array of symptom names from user
 * @param {Object} mentalState - Mental state object with stress level, mood, etc.
 * @returns {Promise<Object>} - Diseases with confidence scores
 */
const calculateDiseaseScores = async (inputSymptoms = [], mentalState = {}) => {
  try {
    // Fetch all diseases from database
    const diseases = await Disease.find({});
    
    if (!diseases.length) {
      console.warn('⚠️  No diseases found in database, using fallback rules');
      return fallbackAnalysis(inputSymptoms, mentalState);
    }

    // Normalize input symptoms to lowercase
    const normalizedSymptoms = inputSymptoms.map(s => s.toLowerCase());
    const combinedSymptomText = normalizedSymptoms.join(' ');
    
    console.log('🔍 AI Service - Input symptoms:', normalizedSymptoms);

    // Score each disease based on symptom matches
    const diseaseScores = diseases.map(disease => {
      let score = disease.baseConfidence || 0.5;
      let matchedSymptoms = 0;
      let totalWeight = 0;

      // Check each symptom in the disease
      if (disease.symptoms && Array.isArray(disease.symptoms)) {
        disease.symptoms.forEach(diseaseSymptom => {
          const diseaseSymptomLower = diseaseSymptom.name.toLowerCase();
          
          // Check for direct match
          if (normalizedSymptoms.includes(diseaseSymptomLower) || 
              combinedSymptomText.includes(diseaseSymptomLower)) {
            matchedSymptoms++;
            // Apply weight from dataset (default 1 if not specified)
            const weight = diseaseSymptom.weight || 1;
            totalWeight += weight;
            score += (weight * 0.2); // Each weighted symptom adds 20% per weight unit
          }
        });
      }

      // Debug log for Common Cold
      if (disease.name === 'Common Cold') {
        console.log('🔍 Common Cold - Matched symptoms:', matchedSymptoms, '- Total weight:', totalWeight, '- Score:', score);
      }

      return {
        disease,
        score: Math.min(score, 0.99), // Cap at 99% confidence
        matchedSymptomCount: matchedSymptoms,
      };
    });

    // Debug log for Common Cold
    diseaseScores.forEach(d => {
      if (d.disease.name === 'Common Cold') {
        console.log('🔍 Common Cold - Final capped score:', d.score);
      }
    });

    // Filter out diseases with no symptom matches (unless confidence is high)
    let relevantDiseases = diseaseScores
      .filter(d => d.matchedSymptomCount > 0 || d.score >= 0.6)
      .sort((a, b) => {
        // Sort by matched symptom count first, then by score
        if (b.matchedSymptomCount !== a.matchedSymptomCount) {
          return b.matchedSymptomCount - a.matchedSymptomCount;
        }
        return b.score - a.score;
      })
      .slice(0, 3); // Top 3 diseases

    // If no matches found, use top diseases by base confidence
    if (relevantDiseases.length === 0) {
      relevantDiseases = diseaseScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);
    }

    return {
      predictedDiseases: relevantDiseases.map(d => ({
        name: d.disease.name,
        confidence: Math.round(d.score * 100), // Return as percentage (0-100)
        ayurvedicName: d.disease.ayurvedicName,
        dosha: d.disease.dosha,
        matchedSymptoms: d.matchedSymptomCount, // Include match count for debugging
      })),
      scores: diseaseScores,
    };
  } catch (error) {
    console.error('Error calculating disease scores:', error);
    return { predictedDiseases: [], scores: [] };
  }
};

/**
 * Determine triage level based on symptoms and mental state
 */
const determinateTriageLevel = (symptoms, disease) => {
  const combinedText = symptoms.join(' ').toLowerCase();
  
  // Check for urgent conditions
  if (
    combinedText.includes('chest pain') ||
    combinedText.includes('shortness of breath') ||
    combinedText.includes('severe') ||
    combinedText.includes('unbearable') ||
    combinedText.includes('emergency')
  ) {
    return 'urgent';
  }

  // Check disease-specific triage level from database
  if (disease && disease.triageLevel) {
    return disease.triageLevel;
  }

  return 'normal';
};

/**
 * Main consultation analysis function
 * Uses datasets for disease prediction with fallback to rules
 */
const analyzeConsultation = async (input) => {
  const { symptomNames = [], mentalState = {}, userProfile = {} } = input;

  try {
    // Get disease scores from database
    const diseaseResult = await calculateDiseaseScores(symptomNames, mentalState);
    
    if (!diseaseResult.predictedDiseases.length) {
      return fallbackAnalysis(symptomNames, mentalState);
    }

    const topDisease = diseaseResult.predictedDiseases[0];
    const triageLevel = determinateTriageLevel(
      symptomNames, 
      diseaseResult.scores[0]?.disease
    );

    // Fetch full disease details for treatment plan
    const fullDiseaseData = await Disease.findOne({ name: topDisease.name });
    
    const recommendedPlan = {
      herbs: fullDiseaseData?.treatments?.herbs?.map(h => h.name) || [],
      diet: fullDiseaseData?.treatments?.diet || [],
      lifestyle: fullDiseaseData?.treatments?.lifestyle || [],
      avoidance: fullDiseaseData?.treatments?.avoidance || [],
      preventionTips: fullDiseaseData?.preventionTips || [],
    };

    return {
      predictedDiseases: diseaseResult.predictedDiseases.slice(0, 2),
      triageLevel,
      recommendedPlan,
      dataSource: 'dataset', // Indicate this came from database
    };
  } catch (error) {
    console.error('Error in consultation analysis:', error);
    // Fallback to hardcoded rules if database fails
    return fallbackAnalysis(symptomNames, mentalState);
  }
};

/**
 * Fallback rule-based analysis if database fails
 */
const fallbackAnalysis = (symptomNames = [], mentalState = {}) => {
  const lowerSymptoms = symptomNames.map(s => s.toLowerCase());
  const combinedSymptomText = lowerSymptoms.join(' ');

  let predictedDiseases = [];
  let triageLevel = 'normal';
  let recommendedPlan = {};

  // Rule 1: Upper Respiratory Infection
  if (
    combinedSymptomText.includes('fever') ||
    combinedSymptomText.includes('cough') ||
    combinedSymptomText.includes('cold') ||
    combinedSymptomText.includes('sore throat')
  ) {
    predictedDiseases.push({
      name: 'Upper Respiratory Infection',
      confidence: 0.8,
    });
    recommendedPlan = {
      herbs: ['Tulsi', 'Ginger', 'Honey', 'Turmeric'],
      diet: ['Warm herbal teas', 'Light soups', 'Avoid cold foods'],
      lifestyle: ['Rest', 'Steam inhalation', 'Stay hydrated'],
    };
  }

  // Rule 2: Acidity / Gastritis
  if (
    combinedSymptomText.includes('acidity') ||
    combinedSymptomText.includes('bloating') ||
    combinedSymptomText.includes('gas') ||
    combinedSymptomText.includes('indigestion')
  ) {
    predictedDiseases.push({
      name: 'Acidity / Gastritis',
      confidence: 0.8,
    });
    recommendedPlan = {
      herbs: ['Jeera', 'Fennel', 'Coriander', 'Licorice'],
      diet: [
        'Warm water',
        'Light meals',
        'Avoid spicy/oily foods',
        'No caffeine',
      ],
      lifestyle: ['Eat slowly', 'Evening walks', 'Avoid heavy meals at night'],
    };
  }

  // Rule 3: Migraine / Headache
  if (
    combinedSymptomText.includes('headache') ||
    combinedSymptomText.includes('migraine')
  ) {
    predictedDiseases.push({
      name: 'Migraine / Headache',
      confidence: 0.75,
    });
    if (!recommendedPlan.herbs) {
      recommendedPlan = {
        herbs: ['Brahmi', 'Ashwagandha', 'Sandalwood'],
        diet: ['Avoid triggers', 'Herbal teas', 'Proper hydration'],
        lifestyle: ['Stress management', 'Regular sleep', 'Neck exercises'],
      };
    }
  }

  // Rule 4: Stress-related Disorder
  if (
    mentalState?.stressLevel >= 4 ||
    (mentalState?.sleepQuality && mentalState.sleepQuality <= 2) ||
    combinedSymptomText.includes('stress') ||
    combinedSymptomText.includes('anxiety') ||
    combinedSymptomText.includes('insomnia')
  ) {
    predictedDiseases.push({
      name: 'Stress-related Disorder',
      confidence: 0.7,
    });
    recommendedPlan = {
      herbs: ['Ashwagandha', 'Brahmi', 'Jatamansi'],
      diet: ['Warm milk with sesame', 'Balanced meals', 'Avoid stimulants'],
      lifestyle: ['Meditation', 'Yoga', 'Breathing exercises', 'Regular sleep'],
    };
  }

  // Check for urgent conditions
  if (
    combinedSymptomText.includes('chest pain') ||
    combinedSymptomText.includes('shortness of breath') ||
    combinedSymptomText.includes('high fever') ||
    combinedSymptomText.includes('severe')
  ) {
    triageLevel = 'urgent';
  } else if (predictedDiseases.length > 0 && predictedDiseases[0].confidence >= 0.7) {
    triageLevel = 'doctor';
  } else {
    triageLevel = 'normal';
  }

  // Fallback if no diseases predicted
  if (predictedDiseases.length === 0) {
    predictedDiseases.push({
      name: 'General Malaise / Further Evaluation Needed',
      confidence: 0.4,
    });
    recommendedPlan = {
      herbs: ['Tulsi', 'Ginger'],
      diet: ['Balanced nutrition', 'Warm foods', 'Hydration'],
      lifestyle: ['Rest', 'Gentle exercise', 'Medical consultation recommended'],
    };
    triageLevel = 'normal';
  }

  return {
    predictedDiseases: predictedDiseases.slice(0, 2),
    triageLevel,
    recommendedPlan,
    dataSource: 'fallback', // Indicate this used fallback rules
  };
};

module.exports = { analyzeConsultation };
