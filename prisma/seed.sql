-- =============================================
-- ScholarAI - Scholarship Seed Data
-- Supabase SQL Editor mein yeh poora SQL paste karein
-- =============================================

-- Pehle purana data saaf karein (agar koi ho)
DELETE FROM "scholarships";

-- 6 Famous Scholarships insert karein
INSERT INTO "scholarships" (
  "id", "name", "country", "university", "degreeLevel", "fundingType",
  "deadline", "eligibilityCriteria", "requiredDocuments", "officialWebsite",
  "benefits", "description", "tags", "languageRequirement",
  "minCgpa", "minIelts", "minToefl", "createdAt", "updatedAt"
) VALUES

-- 1. GKS Korea
(
  gen_random_uuid()::text,
  'Global Korea Scholarship (GKS)',
  'South Korea',
  'Various Korean Universities',
  ARRAY['MASTER','PHD','BACHELOR']::"DegreeLevel"[],
  'FULLY_FUNDED'::"FundingType",
  '2025-09-30 00:00:00',
  'Must be non-Korean citizen. GPA 2.64/4.0 or above. Age under 25 (undergrad) or 40 (grad). Must not be Korean citizen or hold Korean residency.',
  ARRAY['PASSPORT','TRANSCRIPT','RECOMMENDATION_LETTER','SOP','LANGUAGE_CERTIFICATE'],
  'https://www.studyinkorea.go.kr/',
  'Full tuition, monthly stipend (900,000 KRW for master/PhD), airfare, Korean language training, medical insurance',
  'The Korean Government Scholarship Program (GKS) is a prestigious scholarship for international students who wish to pursue higher education in Korea.',
  ARRAY['Korea','Government','STEM','Arts','Humanities'],
  'TOPIK or IELTS/TOEFL',
  2.64, 5.5, NULL,
  NOW(), NOW()
),

-- 2. MEXT Japan
(
  gen_random_uuid()::text,
  'MEXT Scholarship (Japan)',
  'Japan',
  'Various Japanese Universities',
  ARRAY['MASTER','PHD','BACHELOR']::"DegreeLevel"[],
  'FULLY_FUNDED'::"FundingType",
  '2025-05-31 00:00:00',
  'Must be a national of a country that has diplomatic relations with Japan. Age under 35. Good academic record.',
  ARRAY['PASSPORT','TRANSCRIPT','RECOMMENDATION_LETTER','SOP','RESUME'],
  'https://www.mext.go.jp/en/',
  'Full tuition waiver, monthly stipend (143,000-145,000 JPY), travel allowance, Japanese language courses',
  'The MEXT Scholarship is offered by the Japanese Ministry of Education for international students.',
  ARRAY['Japan','Government','STEM','Research','Engineering'],
  'JLPT or English proficiency',
  3.0, NULL, NULL,
  NOW(), NOW()
),

-- 3. Erasmus Mundus
(
  gen_random_uuid()::text,
  'Erasmus Mundus Joint Masters',
  'European Union',
  'Multiple EU Universities',
  ARRAY['MASTER']::"DegreeLevel"[],
  'FULLY_FUNDED'::"FundingType",
  '2025-01-15 00:00:00',
  'Must hold a bachelor degree. Open to all nationalities. Strong academic background required.',
  ARRAY['PASSPORT','TRANSCRIPT','RECOMMENDATION_LETTER','SOP','RESUME','LANGUAGE_CERTIFICATE'],
  'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus_en',
  'Tuition fees covered, monthly stipend (1,400 EUR), travel and installation allowances, health insurance',
  'The Erasmus Mundus Joint Masters programme provides excellent scholarships for top international students to pursue joint master degrees across European universities.',
  ARRAY['Europe','EU','Masters','Joint Degree','Research','Technology'],
  'IELTS 6.5+ or TOEFL 90+',
  3.0, 6.5, 90,
  NOW(), NOW()
),

-- 4. DAAD Germany
(
  gen_random_uuid()::text,
  'DAAD Scholarship (Germany)',
  'Germany',
  'Various German Universities',
  ARRAY['MASTER','PHD']::"DegreeLevel"[],
  'FULLY_FUNDED'::"FundingType",
  '2025-10-15 00:00:00',
  'Bachelor degree with above-average grades. At least 2 years of professional experience for some programs. German or English language skills.',
  ARRAY['PASSPORT','TRANSCRIPT','RECOMMENDATION_LETTER','SOP','RESUME','LANGUAGE_CERTIFICATE'],
  'https://www.daad.de/en/',
  'Monthly stipend (934 EUR for graduates, 1,300 EUR for PhD), travel subsidy, health insurance allowance',
  'The DAAD (German Academic Exchange Service) scholarship supports outstanding international students and researchers to study in Germany.',
  ARRAY['Germany','Europe','Research','STEM','Engineering','Sciences'],
  'German or English proficiency',
  3.0, 6.0, NULL,
  NOW(), NOW()
),

-- 5. Fulbright USA
(
  gen_random_uuid()::text,
  'Fulbright Foreign Student Program',
  'United States',
  'Various US Universities',
  ARRAY['MASTER','PHD']::"DegreeLevel"[],
  'FULLY_FUNDED'::"FundingType",
  '2025-10-15 00:00:00',
  'Citizens of participating countries. Bachelor degree or equivalent. Strong leadership potential and English proficiency.',
  ARRAY['PASSPORT','TRANSCRIPT','RECOMMENDATION_LETTER','SOP','RESUME','LANGUAGE_CERTIFICATE'],
  'https://foreign.fulbrightonline.org/',
  'Tuition, textbook, and living allowances, round-trip airfare, accident and sickness insurance',
  'The Fulbright Program is the flagship international exchange scholarship of the U.S. government for graduate students, scholars, and professionals.',
  ARRAY['USA','Government','Leadership','Research','Arts','Sciences'],
  'TOEFL 79+ or IELTS 6.5+',
  3.0, 6.5, 79,
  NOW(), NOW()
),

-- 6. Chevening UK
(
  gen_random_uuid()::text,
  'Chevening Scholarship (UK)',
  'United Kingdom',
  'Any UK University',
  ARRAY['MASTER']::"DegreeLevel"[],
  'FULLY_FUNDED'::"FundingType",
  '2025-11-05 00:00:00',
  'Citizen of a Chevening-eligible country. At least 2 years of work experience. Bachelor degree. Strong leadership potential.',
  ARRAY['PASSPORT','TRANSCRIPT','RECOMMENDATION_LETTER','SOP','RESUME','LANGUAGE_CERTIFICATE'],
  'https://www.chevening.org/',
  'Tuition fees, monthly stipend (around 1,000 GBP/month), flights, arrival and departure allowances, visa fee reimbursement',
  'The UK government international awards programme funded by the FCDO. It aims to develop global leaders.',
  ARRAY['UK','Government','Leadership','Masters','Management','Policy'],
  'IELTS 6.5+ (no band below 5.5)',
  2.8, 6.5, NULL,
  NOW(), NOW()
);

-- Verify karein kitne records insert hue
SELECT COUNT(*) as "Total Scholarships Added" FROM "scholarships";
