import { calculateHealthScore, getHealthScoreStatus } from '../src/utils/healthScoreCalculator';

console.log('🏥 Health Score Calculator Tests\n');

// Test Case 1: Perfect Health
console.log('📊 Test 1: Perfect Health Profile');
const perfectHealth = {
  age: 30,
  gender: 'male',
  height: 175,
  weight: 70, // BMI = 22.9 (ideal)
  sleepQuality: 5, // Excellent sleep
  lifestyle: 'active', // Active lifestyle
  diseaseHistory: '',
  chronicConditions: [],
};
const score1 = calculateHealthScore(perfectHealth);
console.log(`  Score: ${score1.percentage}`);
console.log(`  Breakdown:`, score1.breakdown);
console.log(`  Status: ${getHealthScoreStatus(score1.score).status}\n`);

// Test Case 2: Good Health with Minor Issues
console.log('📊 Test 2: Good Health (Moderate Activity, Minor Conditions)');
const goodHealth = {
  age: 35,
  gender: 'female',
  height: 165,
  weight: 68, // BMI = 25 (slightly overweight)
  sleepQuality: 4, // Good sleep
  lifestyle: 'moderate',
  diseaseHistory: 'Occasional headaches, mild allergy',
  chronicConditions: ['allergy'],
};
const score2 = calculateHealthScore(goodHealth);
console.log(`  Score: ${score2.percentage}`);
console.log(`  Breakdown:`, score2.breakdown);
console.log(`  Status: ${getHealthScoreStatus(score2.score).status}\n`);

// Test Case 3: Fair Health with Multiple Issues
console.log('📊 Test 3: Fair Health (Sedentary, Overweight)');
const fairHealth = {
  age: 45,
  gender: 'male',
  height: 180,
  weight: 95, // BMI = 29.3 (overweight)
  sleepQuality: 2, // Poor sleep
  lifestyle: 'sedentary',
  diseaseHistory: 'High blood pressure, occasional back pain',
  chronicConditions: ['hypertension'],
};
const score3 = calculateHealthScore(fairHealth);
console.log(`  Score: ${score3.percentage}`);
console.log(`  Breakdown:`, score3.breakdown);
console.log(`  Status: ${getHealthScoreStatus(score3.score).status}\n`);

// Test Case 4: Poor Health with Serious Conditions
console.log('📊 Test 4: Poor Health (Serious Conditions)');
const poorHealth = {
  age: 55,
  gender: 'female',
  height: 160,
  weight: 90, // BMI = 35.2 (obese)
  sleepQuality: 1, // Very poor sleep
  lifestyle: 'sedentary',
  diseaseHistory: 'Type 2 Diabetes, Hypertension, Heart disease',
  chronicConditions: ['diabetes', 'hypertension', 'heart_disease'],
};
const score4 = calculateHealthScore(poorHealth);
console.log(`  Score: ${score4.percentage}`);
console.log(`  Breakdown:`, score4.breakdown);
console.log(`  Status: ${getHealthScoreStatus(score4.score).status}\n`);

// Test Case 5: Minimal Data (Should Handle Gracefully)
console.log('📊 Test 5: Minimal Data (New User)');
const minimalData = {
  age: 28,
};
const score5 = calculateHealthScore(minimalData);
console.log(`  Score: ${score5.percentage}`);
console.log(`  Breakdown:`, score5.breakdown);
console.log(`  Status: ${getHealthScoreStatus(score5.score).status}\n`);

// Test Case 6: Our Test User from Signup
console.log('📊 Test 6: Actual Test User (From Signup Test)');
const testUser = {
  age: 30,
  gender: 'male',
  height: 175,
  weight: 75,
  sleepQuality: 4,
  lifestyle: 'active',
  diseaseHistory: 'No chronic conditions, occasional headaches',
};
const score6 = calculateHealthScore(testUser);
console.log(`  Score: ${score6.percentage}`);
console.log(`  Breakdown:`, score6.breakdown);
console.log(`  Status: ${getHealthScoreStatus(score6.score).status}\n`);

console.log('═══════════════════════════════════════════');
console.log('✅ All Health Score Tests Complete!');
console.log('═══════════════════════════════════════════');
