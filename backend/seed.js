const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');
const Symptom = require('./src/models/Symptom');
const Disease = require('./src/models/Disease');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Symptom.deleteMany({});
    await Disease.deleteMany({});
    console.log('Cleared existing data');

    // Seed Users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'admin@123',
        role: 'admin'
      },
      {
        name: 'Dr. Sharma',
        email: 'sharma@ayurhealth.com',
        password: 'password123',
        role: 'doctor',
        specialization: 'Ayurvedic Physician',
        experience: 15,
        rating: 4.8
      },
      {
        name: 'Dr. Patel',
        email: 'patel@ayurhealth.com',
        password: 'password123',
        role: 'doctor',
        specialization: 'Holistic Health',
        experience: 12,
        rating: 4.7
      },
      {
        name: 'Dr. Kumar',
        email: 'kumar@ayurhealth.com',
        password: 'password123',
        role: 'doctor',
        specialization: 'Digestive Health',
        experience: 10,
        rating: 4.9
      },
      {
        name: 'Dr. Singh',
        email: 'singh@ayurhealth.com',
        password: 'password123',
        role: 'doctor',
        specialization: 'Mental Wellness',
        experience: 8,
        rating: 4.6
      },
      {
        name: 'Dr. Gupta',
        email: 'gupta@ayurhealth.com',
        password: 'password123',
        role: 'doctor',
        specialization: 'General Practice',
        experience: 20,
        rating: 4.5
      },
      {
        name: 'John Patient',
        email: 'patient@example.com',
        password: 'password123',
        role: 'patient'
      },
      {
        name: 'Sarah Johnson',
        email: 'patient2@example.com',
        password: 'password123',
        role: 'patient'
      }
    ]);
    console.log('Users seeded:', users.length);

    // Seed Symptoms
    const symptoms = await Symptom.create([
      { name: 'Headache', category: 'Neurological' },
      { name: 'Fever', category: 'General' },
      { name: 'Cough', category: 'Respiratory' },
      { name: 'Cold', category: 'Respiratory' },
      { name: 'Sore Throat', category: 'Respiratory' },
      { name: 'Body Ache', category: 'Musculoskeletal' },
      { name: 'Fatigue', category: 'General' },
      { name: 'Dizziness', category: 'Neurological' },
      { name: 'Nausea', category: 'Digestive' },
      { name: 'Vomiting', category: 'Digestive' },
      { name: 'Diarrhea', category: 'Digestive' },
      { name: 'Constipation', category: 'Digestive' },
      { name: 'Abdominal Pain', category: 'Digestive' },
      { name: 'Indigestion', category: 'Digestive' },
      { name: 'Acne', category: 'Skin' },
      { name: 'Eczema', category: 'Skin' },
      { name: 'Psoriasis', category: 'Skin' },
      { name: 'Hair Loss', category: 'Skin' },
      { name: 'Joint Pain', category: 'Musculoskeletal' },
      { name: 'Back Pain', category: 'Musculoskeletal' },
      { name: 'Arthritis', category: 'Musculoskeletal' },
      { name: 'Muscle Weakness', category: 'Musculoskeletal' },
      { name: 'Insomnia', category: 'Neurological' },
      { name: 'Anxiety', category: 'Mental' },
      { name: 'Depression', category: 'Mental' },
      { name: 'Stress', category: 'Mental' },
      { name: 'High Blood Pressure', category: 'Cardiovascular' },
      { name: 'Low Blood Pressure', category: 'Cardiovascular' },
      { name: 'Palpitations', category: 'Cardiovascular' },
      { name: 'Shortness of Breath', category: 'Respiratory' },
      { name: 'Chest Pain', category: 'Cardiovascular' },
      { name: 'Irregular Heartbeat', category: 'Cardiovascular' },
      { name: 'Diabetes Symptoms', category: 'Metabolic' },
      { name: 'Thyroid Issues', category: 'Endocrine' },
      { name: 'Weight Gain', category: 'Metabolic' },
      { name: 'Weight Loss', category: 'Metabolic' },
      { name: 'Poor Appetite', category: 'Digestive' },
      { name: 'Excessive Hunger', category: 'Digestive' },
      { name: 'Excessive Thirst', category: 'General' },
      { name: 'Frequent Urination', category: 'Urinary' },
      { name: 'Painful Urination', category: 'Urinary' },
      { name: 'Kidney Stones', category: 'Urinary' },
      { name: 'Eye Strain', category: 'Eyes' },
      { name: 'Blurred Vision', category: 'Eyes' },
      { name: 'Itchy Eyes', category: 'Eyes' },
      { name: 'Dry Eyes', category: 'Eyes' },
      { name: 'Ear Pain', category: 'ENT' },
      { name: 'Hearing Loss', category: 'ENT' },
      { name: 'Tinnitus', category: 'ENT' },
      { name: 'Nasal Congestion', category: 'ENT' },
      { name: 'Sinusitis', category: 'ENT' },
      { name: 'Allergies', category: 'General' },
      { name: 'Swelling', category: 'General' },
      { name: 'Inflammation', category: 'General' },
      { name: 'Numbness', category: 'Neurological' },
      { name: 'Tingling', category: 'Neurological' }
    ]);
    console.log('Symptoms seeded:', symptoms.length);

    // Seed Diseases
    const diseases = await Disease.create([
      {
        name: 'Common Cold',
        description: 'A viral respiratory infection',
        symptoms: [
          { name: 'Fever', weight: 0.8 },
          { name: 'Cough', weight: 0.9 },
          { name: 'Sore Throat', weight: 0.7 }
        ],
        ayurvedicTreatment: 'Rest, warm fluids, Tulsi tea, ginger',
        severity: 'Mild'
      },
      {
        name: 'Flu',
        description: 'Influenza - respiratory viral infection',
        symptoms: [
          { name: 'Fever', weight: 0.9 },
          { name: 'Cough', weight: 0.8 },
          { name: 'Body Ache', weight: 0.8 },
          { name: 'Fatigue', weight: 0.7 }
        ],
        ayurvedicTreatment: 'Bed rest, herbal decoctions, immune boosters',
        severity: 'Moderate'
      },
      {
        name: 'Migraine',
        description: 'Severe headache with neurological symptoms',
        symptoms: [
          { name: 'Headache', weight: 0.95 },
          { name: 'Dizziness', weight: 0.6 }
        ],
        ayurvedicTreatment: 'Abhyanga, meditation, cooling herbs',
        severity: 'Moderate'
      },
      {
        name: 'Indigestion',
        description: 'Digestive discomfort and bloating',
        symptoms: [
          { name: 'Nausea', weight: 0.7 },
          { name: 'Abdominal Pain', weight: 0.8 },
          { name: 'Indigestion', weight: 0.9 }
        ],
        ayurvedicTreatment: 'Digestive herbs, proper diet, warm water',
        severity: 'Mild'
      },
      {
        name: 'Acne Vulgaris',
        description: 'Skin condition characterized by pimples',
        symptoms: [
          { name: 'Acne', weight: 0.95 }
        ],
        ayurvedicTreatment: 'Herbal face packs, neem, turmeric',
        severity: 'Mild'
      },
      {
        name: 'Arthritis',
        description: 'Joint inflammation and pain',
        symptoms: [
          { name: 'Joint Pain', weight: 0.9 },
          { name: 'Back Pain', weight: 0.7 },
          { name: 'Arthritis', weight: 0.85 }
        ],
        ayurvedicTreatment: 'Oil massage, herbal supplements, yoga',
        severity: 'Moderate'
      },
      {
        name: 'Insomnia',
        description: 'Sleep disorder and inability to sleep',
        symptoms: [
          { name: 'Insomnia', weight: 0.95 },
          { name: 'Fatigue', weight: 0.7 }
        ],
        ayurvedicTreatment: 'Ashwagandha, warm milk, relaxation techniques',
        severity: 'Moderate'
      },
      {
        name: 'Anxiety Disorder',
        description: 'Excessive worry and nervous tension',
        symptoms: [
          { name: 'Anxiety', weight: 0.9 },
          { name: 'Stress', weight: 0.8 }
        ],
        ayurvedicTreatment: 'Meditation, Brahmi, breathing exercises',
        severity: 'Moderate'
      },
      {
        name: 'Hypertension',
        description: 'High blood pressure',
        symptoms: [
          { name: 'Headache', weight: 0.6 },
          { name: 'High Blood Pressure', weight: 0.95 }
        ],
        ayurvedicTreatment: 'Stress reduction, heart-healthy herbs, exercise',
        severity: 'Moderate'
      },
      {
        name: 'Type 2 Diabetes',
        description: 'Blood sugar regulation disorder',
        symptoms: [
          { name: 'Diabetes Symptoms', weight: 0.85 },
          { name: 'Excessive Thirst', weight: 0.7 },
          { name: 'Frequent Urination', weight: 0.8 }
        ],
        ayurvedicTreatment: 'Dietary changes, herbal remedies, exercise',
        severity: 'Moderate'
      },
      {
        name: 'Eczema',
        description: 'Chronic skin inflammation',
        symptoms: [
          { name: 'Eczema', weight: 0.9 }
        ],
        ayurvedicTreatment: 'Cooling herbs, oil therapy, dietary management',
        severity: 'Mild'
      },
      {
        name: 'Bronchitis',
        description: 'Inflammation of bronchial tubes',
        symptoms: [
          { name: 'Cough', weight: 0.9 },
          { name: 'Cold', weight: 0.6 },
          { name: 'Shortness of Breath', weight: 0.7 }
        ],
        ayurvedicTreatment: 'Expectorant herbs, steam inhalation, rest',
        severity: 'Moderate'
      },
      {
        name: 'Gastritis',
        description: 'Stomach lining inflammation',
        symptoms: [
          { name: 'Nausea', weight: 0.7 },
          { name: 'Abdominal Pain', weight: 0.85 }
        ],
        ayurvedicTreatment: 'Soothing herbs, bland diet, stress management',
        severity: 'Moderate'
      },
      {
        name: 'Allergic Rhinitis',
        description: 'Allergic inflammation of nasal passages',
        symptoms: [
          { name: 'Cold', weight: 0.8 },
          { name: 'Nasal Congestion', weight: 0.9 },
          { name: 'Sinusitis', weight: 0.7 }
        ],
        ayurvedicTreatment: 'Neti pot, herbal nasal drops, immune support',
        severity: 'Mild'
      },
      {
        name: 'Thyroid Disorder',
        description: 'Thyroid gland dysfunction',
        symptoms: [
          { name: 'Thyroid Issues', weight: 0.85 },
          { name: 'Weight Gain', weight: 0.7 },
          { name: 'Fatigue', weight: 0.8 }
        ],
        ayurvedicTreatment: 'Sesame oil massage, thyroid-supporting herbs',
        severity: 'Moderate'
      }
    ]);
    console.log('Diseases seeded:', diseases.length);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
