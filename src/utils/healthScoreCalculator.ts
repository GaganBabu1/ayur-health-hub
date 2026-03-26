/**
 * Health Score Calculator
 * 
 * Calculates a comprehensive health score (0-100) based on user profile data
 * Factors considered:
 * - Sleep Quality (15%)
 * - Lifestyle Activity (20%)
 * - Weight BMI Status (20%)
 * - Age Adjustment (10%)
 * - Medical History (20%)
 * - Overall Wellness (15%)
 */

export interface HealthScoreInput {
  age?: number;
  gender?: string;
  height?: number; // in cm
  weight?: number; // in kg
  sleepQuality?: number; // 1-5
  lifestyle?: string; // 'sedentary', 'moderate', 'active'
  diseaseHistory?: string;
  chronicConditions?: string[];
}

/**
 * Calculate BMI and return a score (0-100)
 * Optimal BMI is 18.5-24.9
 */
function getBMIScore(height?: number, weight?: number): number {
  if (!height || !weight) return 60; // Default score if missing data

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  if (bmi < 18.5) return 70; // Underweight
  if (bmi <= 24.9) return 100; // Healthy weight
  if (bmi <= 29.9) return 75; // Overweight
  if (bmi <= 34.9) return 50; // Obese Class 1
  return 30; // Obese Class 2+
}

/**
 * Calculate sleep quality score (0-100)
 * Based on 1-5 scale
 */
function getSleepScore(sleepQuality?: number): number {
  if (!sleepQuality) return 50;
  return sleepQuality * 20; // 1=20, 2=40, 3=60, 4=80, 5=100
}

/**
 * Calculate lifestyle score (0-100)
 */
function getLifestyleScore(lifestyle?: string): number {
  switch (lifestyle?.toLowerCase()) {
    case 'active':
      return 100;
    case 'moderate':
      return 75;
    case 'sedentary':
      return 40;
    default:
      return 60;
  }
}

/**
 * Calculate age adjustment score
 * Considers optimal age ranges
 */
function getAgeAdjustmentScore(age?: number): number {
  if (!age) return 70;

  if (age >= 18 && age <= 35) return 100; // Optimal age
  if (age >= 35 && age <= 50) return 85;
  if (age >= 50 && age <= 65) return 75;
  if (age >= 65) return 65;
  return 50; // Below 18
}

/**
 * Calculate medical history score (0-100)
 * Based on disease history description
 */
function getMedicalHistoryScore(diseaseHistory?: string, chronicConditions?: string[]): number {
  let score = 100;

  if (!diseaseHistory && (!chronicConditions || chronicConditions.length === 0)) {
    return 100; // Perfect - no health issues
  }

  // Check for serious conditions in description
  const seriousConditions = [
    'diabetes',
    'hypertension',
    'heart',
    'cancer',
    'stroke',
    'kidney',
    'liver',
  ];

  const text = (diseaseHistory || '').toLowerCase();
  const hasSerious = seriousConditions.some((condition) => text.includes(condition));

  if (hasSerious) score -= 40;

  // Check for minor conditions
  const minorConditions = ['headache', 'allergy', 'asthma', 'arthritis', 'thyroid'];
  const hasMinor = minorConditions.some((condition) => text.includes(condition));

  if (hasMinor) score -= 15;

  // Count chronic conditions
  const conditionCount = chronicConditions?.length || 0;
  score -= conditionCount * 10;

  return Math.max(20, score); // Minimum score of 20
}

/**
 * Calculate overall wellness score
 * This is a base score that gets adjusted by other factors
 */
function getWellnessBaseScore(): number {
  return 65; // Base wellness score
}

/**
 * Main function: Calculate comprehensive health score
 */
export function calculateHealthScore(data: HealthScoreInput): {
  score: number;
  percentage: string;
  breakdown: {
    bmi: number;
    sleep: number;
    lifestyle: number;
    age: number;
    medical: number;
    wellness: number;
  };
} {
  const bmiScore = getBMIScore(data.height, data.weight);
  const sleepScore = getSleepScore(data.sleepQuality);
  const lifestyleScore = getLifestyleScore(data.lifestyle);
  const ageScore = getAgeAdjustmentScore(data.age);
  const medicalScore = getMedicalHistoryScore(data.diseaseHistory, data.chronicConditions);
  const wellnessScore = getWellnessBaseScore();

  // Weighted average
  const totalScore =
    (bmiScore * 0.2 +
      sleepScore * 0.15 +
      lifestyleScore * 0.2 +
      ageScore * 0.1 +
      medicalScore * 0.2 +
      wellnessScore * 0.15) /
    1;

  const roundedScore = Math.round(totalScore);

  return {
    score: roundedScore,
    percentage: `${roundedScore}%`,
    breakdown: {
      bmi: bmiScore,
      sleep: sleepScore,
      lifestyle: lifestyleScore,
      age: ageScore,
      medical: medicalScore,
      wellness: wellnessScore,
    },
  };
}

/**
 * Get health score status and recommendations
 */
export function getHealthScoreStatus(score: number): {
  status: string;
  color: string;
  recommendation: string;
} {
  if (score >= 90) {
    return {
      status: 'Excellent',
      color: 'text-green-600',
      recommendation: 'Maintain your current healthy lifestyle',
    };
  }
  if (score >= 75) {
    return {
      status: 'Good',
      color: 'text-blue-600',
      recommendation: 'Keep up the good work with minor improvements',
    };
  }
  if (score >= 60) {
    return {
      status: 'Fair',
      color: 'text-yellow-600',
      recommendation: 'Consider lifestyle modifications for better health',
    };
  }
  if (score >= 45) {
    return {
      status: 'Poor',
      color: 'text-orange-600',
      recommendation: 'Consult with healthcare practitioners for personalized advice',
    };
  }
  return {
    status: 'Critical',
    color: 'text-red-600',
    recommendation: 'Seek immediate medical consultation',
  };
}
