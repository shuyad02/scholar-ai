import { config } from 'dotenv'
config() // Load .env file before PrismaClient initializes

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing scholarships
  await prisma.scholarship.deleteMany()

  const scholarships = [
    {
      name: 'Global Korea Scholarship (GKS)',
      country: 'South Korea',
      university: 'Various Korean Universities',
      degreeLevel: ['MASTER', 'PHD', 'BACHELOR'] as any[],
      fundingType: 'FULLY_FUNDED' as any,
      deadline: new Date('2025-09-30'),
      eligibilityCriteria:
        'Must be non-Korean citizen. GPA 2.64/4.0 or above. Age under 25 (undergrad) or 40 (grad). Must not be Korean citizen or hold Korean residency.',
      requiredDocuments: ['PASSPORT', 'TRANSCRIPT', 'RECOMMENDATION_LETTER', 'SOP', 'LANGUAGE_CERTIFICATE'],
      officialWebsite: 'https://www.studyinkorea.go.kr/',
      benefits:
        'Full tuition, monthly stipend (900,000 KRW for master/PhD), airfare, Korean language training, medical insurance',
      description:
        'The Korean Government Scholarship Program (GKS) is a prestigious scholarship for international students who wish to pursue higher education in Korea.',
      tags: ['Korea', 'Government', 'STEM', 'Arts', 'Humanities'],
      languageRequirement: 'TOPIK or IELTS/TOEFL',
      minCgpa: 2.64,
      minIelts: 5.5,
    },
    {
      name: 'MEXT Scholarship (Japan)',
      country: 'Japan',
      university: 'Various Japanese Universities',
      degreeLevel: ['MASTER', 'PHD', 'BACHELOR'] as any[],
      fundingType: 'FULLY_FUNDED' as any,
      deadline: new Date('2025-05-31'),
      eligibilityCriteria:
        'Must be a national of a country that has diplomatic relations with Japan. Age under 35. Good academic record.',
      requiredDocuments: ['PASSPORT', 'TRANSCRIPT', 'RECOMMENDATION_LETTER', 'SOP', 'RESUME'],
      officialWebsite: 'https://www.mext.go.jp/en/',
      benefits:
        'Full tuition waiver, monthly stipend (143,000–145,000 JPY), travel allowance, Japanese language courses',
      description:
        'The MEXT Scholarship is offered by the Japanese Ministry of Education, Culture, Sports, Science and Technology for international students.',
      tags: ['Japan', 'Government', 'STEM', 'Research', 'Engineering'],
      languageRequirement: 'JLPT or English proficiency',
      minCgpa: 3.0,
      minIelts: null,
    },
    {
      name: 'Erasmus Mundus Joint Masters',
      country: 'European Union',
      university: 'Multiple EU Universities',
      degreeLevel: ['MASTER'] as any[],
      fundingType: 'FULLY_FUNDED' as any,
      deadline: new Date('2025-01-15'),
      eligibilityCriteria:
        'Must hold a bachelor degree. Open to all nationalities. Strong academic background required.',
      requiredDocuments: ['PASSPORT', 'TRANSCRIPT', 'RECOMMENDATION_LETTER', 'SOP', 'RESUME', 'LANGUAGE_CERTIFICATE'],
      officialWebsite: 'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus_en',
      benefits:
        'Tuition fees covered, monthly stipend (1,400 EUR), travel and installation allowances, health insurance',
      description:
        "The Erasmus Mundus Joint Masters programme provides excellent scholarships for top international students to pursue joint master's degrees across European universities.",
      tags: ['Europe', 'EU', 'Masters', 'Joint Degree', 'Research', 'Technology'],
      languageRequirement: 'IELTS 6.5+ or TOEFL 90+',
      minCgpa: 3.0,
      minIelts: 6.5,
      minToefl: 90,
    },
    {
      name: 'DAAD Scholarship (Germany)',
      country: 'Germany',
      university: 'Various German Universities',
      degreeLevel: ['MASTER', 'PHD'] as any[],
      fundingType: 'FULLY_FUNDED' as any,
      deadline: new Date('2024-10-15'),
      eligibilityCriteria:
        "Bachelor's degree with above-average grades. At least 2 years of professional experience (for some programs). German or English language skills.",
      requiredDocuments: ['PASSPORT', 'TRANSCRIPT', 'RECOMMENDATION_LETTER', 'SOP', 'RESUME', 'LANGUAGE_CERTIFICATE'],
      officialWebsite: 'https://www.daad.de/en/',
      benefits:
        'Monthly stipend (934 EUR for graduates, 1,300 EUR for PhD), travel subsidy, health insurance allowance, study and research allowances',
      description:
        'The DAAD (German Academic Exchange Service) scholarship supports outstanding international students and researchers to study and conduct research in Germany.',
      tags: ['Germany', 'Europe', 'Research', 'STEM', 'Engineering', 'Sciences'],
      languageRequirement: 'German or English proficiency',
      minCgpa: 3.0,
      minIelts: 6.0,
    },
    {
      name: 'Fulbright Foreign Student Program',
      country: 'United States',
      university: 'Various US Universities',
      degreeLevel: ['MASTER', 'PHD'] as any[],
      fundingType: 'FULLY_FUNDED' as any,
      deadline: new Date('2024-10-15'),
      eligibilityCriteria:
        "Citizens of participating countries. Bachelor's degree or equivalent. Strong leadership potential and English proficiency.",
      requiredDocuments: ['PASSPORT', 'TRANSCRIPT', 'RECOMMENDATION_LETTER', 'SOP', 'RESUME', 'LANGUAGE_CERTIFICATE'],
      officialWebsite: 'https://foreign.fulbrightonline.org/',
      benefits:
        'Tuition, textbook, and living allowances, round-trip airfare, accident and sickness insurance, enrichment activities',
      description:
        'The Fulbright Program is the flagship international exchange scholarship program of the U.S. government, providing merit-based grants for graduate students, scholars, and professionals.',
      tags: ['USA', 'Government', 'Leadership', 'Research', 'Arts', 'Sciences'],
      languageRequirement: 'TOEFL 79+ or IELTS 6.5+',
      minCgpa: 3.0,
      minIelts: 6.5,
      minToefl: 79,
    },
    {
      name: 'Chevening Scholarship (UK)',
      country: 'United Kingdom',
      university: 'Any UK University',
      degreeLevel: ['MASTER'] as any[],
      fundingType: 'FULLY_FUNDED' as any,
      deadline: new Date('2024-11-05'),
      eligibilityCriteria:
        "Citizen of a Chevening-eligible country. At least 2 years of work experience. Bachelor's degree. Strong leadership potential.",
      requiredDocuments: ['PASSPORT', 'TRANSCRIPT', 'RECOMMENDATION_LETTER', 'SOP', 'RESUME', 'LANGUAGE_CERTIFICATE'],
      officialWebsite: 'https://www.chevening.org/',
      benefits:
        "Tuition fees, monthly stipend (around £1,000/month), flights, arrival and departure allowances, visa fee reimbursement, Chevening Alumni Network access",
      description:
        "Chevening is the UK government's international awards programme funded by the Foreign, Commonwealth and Development Office (FCDO). It aims to develop global leaders.",
      tags: ['UK', 'Government', 'Leadership', 'Masters', 'Management', 'Policy'],
      languageRequirement: 'IELTS 6.5+ (no band below 5.5)',
      minCgpa: 2.8,
      minIelts: 6.5,
    },
  ]

  for (const scholarship of scholarships) {
    await prisma.scholarship.create({
      data: scholarship,
    })
    console.log(`✅ Created scholarship: ${scholarship.name}`)
  }

  console.log(`\n🎉 Seeded ${scholarships.length} scholarships successfully!`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
