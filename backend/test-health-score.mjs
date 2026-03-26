// Health Score Calculator - Standalone Test

function getBMIScore(height, weight) {
  if (!height || !weight) return 60;
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  if (bmi < 18.5) return 70;
  if (bmi <= 24.9) return 100;
  if (bmi <= 29.9) return 75;
  if (bmi <= 34.9) return 50;
  return 30;
}

function getSleepScore(sleepQuality) {
  if (!sleepQuality) return 50;
  return sleepQuality * 20;
}

function getLifestyleScore(lifestyle) {
  switch ((lifestyle || '').toLowerCase()) {
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

function getAgeAdjustmentScore(age) {
  if (!age) return 70;
  if (age >= 18 && age <= 35) return 100;
  if (age >= 35 && age <= 50) return 85;
  if (age >= 50 && age <= 65) return 75;
  if (age >= 65) return 65;
  return 50;
}

function getMedicalHistoryScore(diseaseHistory, chronicConditions) {
  let score = 100;
  if (!diseaseHistory && (!chronicConditions || chronicConditions.length === 0)) {
    return 100;
  }

  const seriousConditions = ['diabetes', 'hypertension', 'heart', 'cancer', 'stroke', 'kidney', 'liver'];
  const text = (diseaseHistory || '').toLowerCase();
  const hasSerious = seriousConditions.some((condition) => text.includes(condition));
  if (hasSerious) score -= 40;

  const minorConditions = ['headache', 'allergy', 'asthma', 'arthritis', 'thyroid'];
  const hasMinor = minorConditions.some((condition) => text.includes(condition));
  if (hasMinor) score -= 15;

  const conditionCount = (chronicConditions || []).length;
  score -= conditionCount * 10;

  return Math.max(20, score);
}

function calculateHealthScore(data) {
  const bmiScore = getBMIScore(data.height, data.weight);
  const sleepScore = getSleepScore(data.sleepQuality);
  const lifestyleScore = getLifestyleScore(data.lifestyle);
  const ageScore = getAgeAdjustmentScore(data.age);
  const medicalScore = getMedicalHistoryScore(data.diseaseHistory, data.chronicConditions);
  const wellnessScore = 65;

  const totalScore =
    bmiScore * 0.2 +
    sleepScore * 0.15 +
    lifestyleScore * 0.2 +
    ageScore * 0.1 +
    medicalScore * 0.2 +
    wellnessScore * 0.15;

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

function getHealthScoreStatus(score) {
  if (score >= 90) {
    return {
      status: 'Excellent',
      recommendation: 'Maintain your current healthy lifestyle',
    };
  }
  if (score >= 75) {
    return {
      status: 'Good',
      recommendation: 'Keep up the good work with minor improvements',
    };
  }
  if (score >= 60) {
    return {
      status: 'Fair',
      recommendation: 'Consider lifestyle modifications for better health',
    };
  }
  if (score >= 45) {
    return {
      status: 'Poor',
      recommendation: 'Consult with healthcare practitioners for personalized advice',
    };
  }
  return {
    status: 'Critical',
    recommendation: 'Seek immediate medical consultation',
  };
}

// Tests
console.log('🏥 Health Score Calculator Tests\n');

console.log('📊 Test 1: Perfect Health Profile');
const score1 = calculateHealthScore({
  age: 30,
  gender: 'male',
  height: 175,
  weight: 70,
  sleepQuality: 5,
  lifestyle: 'active',
  diseaseHistory: '',
  chronicConditions: [],
});
console.log(`  Score: ${score1.percentage}`);
console.log(`  Breakdown: BMI=${score1.breakdown.bmi}, Sleep=${score1.breakdown.sleep}, Lifestyle=${score1.breakdown.lifestyle}, Age=${score1.breakdown.age}, Medical=${score1.breakdown.medical}, Wellness=${score1.breakdown.wellness}`);
console.log(`  Status: ${getHealthScoreStatus(score1.score).status}`);
console.log(`  Recommendation: ${getHealthScoreStatus(score1.score).recommendation}\n`);

console.log('📊 Test 2: Good Health (Moderate Activity, Minor Conditions)');
const score2 = calculateHealthScore({
  age: 35,
  gender: 'female',
  height: 165,
  weight: 68,
  sleepQuality: 4,
  lifestyle: 'moderate',
  diseaseHistory: 'Occasional headaches, mild allergy',
  chronicConditions: ['allergy'],
});
console.log(`  Score: ${score2.percentage}`);
console.log(`  Breakdown: BMI=${score2.breakdown.bmi}, Sleep=${score2.breakdown.sleep}, Lifestyle=${score2.breakdown.lifestyle}, Age=${score2.breakdown.age}, Medical=${score2.breakdown.medical}, Wellness=${score2.breakdown.wellness}`);
console.log(`  Status: ${getHealthScoreStatus(score2.score).status}`);
console.log(`  Recommendation: ${getHealthScoreStatus(score2.score).recommendation}\n`);

console.log('📊 Test 3: Fair Health (Sedentary, Overweight)');
const score3 = calculateHealthScore({
  age: 45,
  gender: 'male',
  height: 180,
  weight: 95,
  sleepQuality: 2,
  lifestyle: 'sedentary',
  diseaseHistory: 'High blood pressure, occasional back pain',
  chronicConditions: ['hypertension'],
});
console.log(`  Score: ${score3.percentage}`);
console.log(`  Breakdown: BMI=${score3.breakdown.bmi}, Sleep=${score3.breakdown.sleep}, Lifestyle=${score3.breakdown.lifestyle}, Age=${score3.breakdown.age}, Medical=${score3.breakdown.medical}, Wellness=${score3.breakdown.wellness}`);
console.log(`  Status: ${getHealthScoreStatus(score3.score).status}`);
console.log(`  Recommendation: ${getHealthScoreStatus(score3.score).recommendation}\n`);

console.log('📊 Test 4: Poor Health (Serious Conditions)');
const score4 = calculateHealthScore({
  age: 55,
  gender: 'female',
  height: 160,
  weight: 90,
  sleepQuality: 1,
  lifestyle: 'sedentary',
  diseaseHistory: 'Type 2 Diabetes, Hypertension, Heart disease',
  chronicConditions: ['diabetes', 'hypertension', 'heart_disease'],
});
console.log(`  Score: ${score4.percentage}`);
console.log(`  Breakdown: BMI=${score4.breakdown.bmi}, Sleep=${score4.breakdown.sleep}, Lifestyle=${score4.breakdown.lifestyle}, Age=${score4.breakdown.age}, Medical=${score4.breakdown.medical}, Wellness=${score4.breakdown.wellness}`);
console.log(`  Status: ${getHealthScoreStatus(score4.score).status}`);
console.log(`  Recommendation: ${getHealthScoreStatus(score4.score).recommendation}\n`);

console.log('📊 Test 5: Our Test User (From Signup Test)');
const score5 = calculateHealthScore({
  age: 30,
  gender: 'male',
  height: 175,
  weight: 75,
  sleepQuality: 4,
  lifestyle: 'active',
  diseaseHistory: 'No chronic conditions, occasional headaches',
});
console.log(`  Score: ${score5.percentage}`);
console.log(`  Breakdown: BMI=${score5.breakdown.bmi}, Sleep=${score5.breakdown.sleep}, Lifestyle=${score5.breakdown.lifestyle}, Age=${score5.breakdown.age}, Medical=${score5.breakdown.medical}, Wellness=${score5.breakdown.wellness}`);
console.log(`  Status: ${getHealthScoreStatus(score5.score).status}`);
console.log(`  Recommendation: ${getHealthScoreStatus(score5.score).recommendation}\n`);

console.log('═══════════════════════════════════════════');
console.log('✅ All Health Score Tests Complete!');
console.log('═══════════════════════════════════════════');
