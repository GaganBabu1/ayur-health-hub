# Ayurveda Health Hub - Dataset Documentation

## Overview
This directory contains comprehensive medical datasets for the Ayurvedic consultation system. These datasets are designed to be used by the AI service for disease prediction and treatment recommendations.

## Dataset Files

### 1. **diseases.json**
Complete list of diseases/conditions with Ayurvedic information.

**Structure:**
```json
{
  "_id": "disease_001",
  "name": "Common Cold",
  "scientificName": "Viral Upper Respiratory Infection",
  "ayurvedicName": "Pratisyaya",
  "dosha": ["Vata", "Kapha"],
  "symptoms": [
    { "name": "cough", "weight": 0.9 },
    { "name": "fever", "weight": 0.6 }
  ],
  "severity": "mild",
  "triageLevel": "normal|doctor|urgent",
  "baseConfidence": 0.8,
  "durationDays": 7,
  "treatments": {
    "herbs": [
      { "name": "Tulsi", "dosage": "1-2 cups tea daily" }
    ],
    "diet": ["Warm herbal teas", "Light soups"],
    "lifestyle": ["Rest", "Steam inhalation"],
    "avoidance": ["Cold foods", "Fried foods"]
  },
  "whenToSeekDoctor": ["Fever persists beyond 5 days"],
  "seasonality": ["Winter", "Monsoon"],
  "contagious": true,
  "preventionTips": ["Maintain good hygiene"],
  "complications": ["Bronchitis", "Sinusitis"],
  "createdAt": "2025-01-01"
}
```

**Key Fields:**
- `_id`: Unique disease identifier
- `dosha`: Ayurvedic constitutional imbalance (Vata, Pitta, Kapha)
- `symptoms`: Associated symptoms with weight (importance/frequency)
- `triageLevel`: Urgency classification
- `baseConfidence`: Starting confidence score for this disease
- `treatments`: Comprehensive Ayurvedic treatment plan
- `seasonality`: When disease is most common

**Total Records:** 15 diseases (Common Cold, Acidity, Migraine, Stress, Insomnia, Indigestion, Constipation, Diarrhea, Cough, Asthma, Fever, Joint Pain, Skin Allergies, Fatigue, High BP)

---

### 2. **symptoms.json**
Comprehensive symptom database with categorization and relationships.

**Structure:**
```json
{
  "_id": "symptom_001",
  "name": "fever",
  "category": "General|Respiratory|Digestive|Neurological|Psychological|Sleep|Musculoskeletal|Skin|Cardiovascular|Sensory",
  "relatedDiseases": ["disease_001", "disease_008"],
  "severity": "mild|moderate|severe",
  "duration": "3-7 days",
  "description": "Body temperature above 98.6°F",
  "commonCauses": ["Viral infections", "Bacterial infections"],
  "whenToSeekHelp": "If fever persists beyond 5 days"
}
```

**Key Fields:**
- `category`: Symptom classification
- `relatedDiseases`: Array of disease IDs that present this symptom
- `commonCauses`: Most frequent causes of this symptom
- `whenToSeekHelp`: Clinical guidance for urgency

**Total Records:** 58 symptoms across 10 categories
- General: 7 (fever, fatigue, weakness, body ache, chills, low energy, lethargy)
- Respiratory: 10 (cough, sore throat, runny nose, nasal congestion, wheezing, shortness of breath, difficulty breathing, productive cough, chest discomfort, chest tightness)
- Digestive: 12 (acidity, heartburn, bloating, gas, indigestion, stomach pain, nausea, diarrhea, loose stools, constipation, hard stools, loss of appetite, heaviness)
- Neurological: 6 (headache, migraine, throbbing pain, light sensitivity, dizziness, vision problems)
- Psychological: 5 (stress, anxiety, restlessness, irritability, lack of motivation)
- Sleep: 4 (insomnia, difficulty falling asleep, frequent waking, early morning awakening)
- Musculoskeletal: 6 (joint pain, stiffness, swelling, limited movement, creaking sound, muscle tension)
- Skin: 4 (itching, rash, redness, hives)
- Cardiovascular: 2 (palpitations, high blood pressure)
- Sensory: 1 (vision problems)

---

### 3. **symptom-disease-mapping.json**
Weighted mapping between symptoms and diseases for AI calculations.

**Structure:**
```json
{
  "_id": "mapping_001",
  "diseaseId": "disease_001",
  "diseaseName": "Common Cold",
  "symptomMappings": [
    { "symptomId": "symptom_002", "symptomName": "cough", "weight": 0.9 },
    { "symptomId": "symptom_001", "symptomName": "fever", "weight": 0.6 }
  ],
  "baseConfidence": 0.8,
  "algorithm": "weighted_average"
}
```

**Key Fields:**
- `symptomMappings`: Array of symptom weights for this disease
- `baseConfidence`: Default confidence if disease is matched
- `algorithm`: Calculation method (currently: weighted_average)

**Weight Calculation:**
```
Disease Confidence = (Σ(symptom_weight × disease_weight) / Σ(disease_weights)) × baseConfidence
```

---

## Dataset Statistics

| Metric | Value |
|--------|-------|
| **Total Diseases** | 15 |
| **Total Symptoms** | 58 |
| **Total Mappings** | 15 |
| **Symptom Categories** | 10 |
| **Average Symptoms per Disease** | ~6 |
| **Ayurvedic Doshas Covered** | 3 (Vata, Pitta, Kapha) |
| **Triage Levels** | 3 (Normal, Doctor, Urgent) |

---

## Implementation Notes

### Current State
- ✅ **Created:** Comprehensive datasets designed
- ✅ **Validated:** All cross-references verified
- ⏳ **Integration:** Ready for implementation

### For Implementation Phase
The datasets are structured to be:

1. **Loaded into MongoDB** - Create collections for:
   - `diseases` collection
   - `symptoms` collection
   - `symptom_disease_mappings` collection

2. **Used by AI Service** - Replace hardcoded rules with:
   - Database lookups instead of if-statements
   - Weighted calculations from mappings
   - Dynamic confidence scoring

3. **API Endpoints** - Create endpoints for:
   - `GET /datasets/diseases` - List all diseases
   - `GET /datasets/symptoms` - List all symptoms
   - `GET /datasets/disease/:id` - Get disease details
   - `GET /datasets/symptom/:id` - Get symptom details

4. **Admin Features** - Allow:
   - Add new diseases
   - Update treatment recommendations
   - Adjust symptom weights
   - Manage seasonal data

---

## Data Quality

- ✅ **Complete:** All 15 diseases have full treatment information
- ✅ **Accurate:** Symptoms and treatments match Ayurvedic principles
- ✅ **Consistent:** Standardized format across all records
- ✅ **Referenced:** All cross-references validated
- ✅ **Documented:** Each field has clear descriptions

---

## Future Enhancements

1. **Add more diseases** - Expand from 15 to 50+ conditions
2. **Machine Learning** - Train models on real patient data
3. **Seasonal variations** - Different treatments for seasons
4. **Age-based recommendations** - Customize by age group
5. **Contraindications** - Add medication interactions
6. **Success rates** - Track treatment outcomes
7. **Multi-language** - Add translations for global use
8. **Patient preferences** - Remember successful treatments per patient

---

## File Formats

All files are in standard JSON format (UTF-8 encoding) for easy:
- Import into MongoDB
- Processing by Node.js
- Integration with frontend
- Version control with Git

---

## Created Date
December 7, 2025

## Status
**📦 READY FOR IMPLEMENTATION** - All datasets created and documented. No implementation changes made to code.
