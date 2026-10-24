const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateDeterministicPseudoVector(text, dimensions = 768) {
  const vector = new Array(dimensions).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
    const bucket = Math.abs(hash) % dimensions;
    vector[bucket] += 1.0;
  }
  let sumSquares = 0;
  for (let i = 0; i < dimensions; i++) {
    sumSquares += vector[i] * vector[i];
  }
  const norm = Math.sqrt(sumSquares) || 1.0;
  return vector.map(v => Number((v / norm).toFixed(6)));
}

async function main() {
  console.log("Seeding comprehensive ScholarAI database...");

  // Clean old records
  await prisma.documentChunk.deleteMany({});
  await prisma.scholarshipDocument.deleteMany({});
  await prisma.eligibilityCriterion.deleteMany({});
  await prisma.scholarshipMatch.deleteMany({});
  await prisma.savedScholarship.deleteMany({});
  await prisma.scholarshipApplication.deleteMany({});
  await prisma.scholarship.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Demo User & Profile
  const demoUser = await prisma.user.create({
    data: {
      name: "Lokesh Yadav",
      email: "lokesh@scholarai.org",
      role: "STUDENT",
      profile: {
        create: {
          educationLevel: "MASTERS",
          fieldOfStudy: "Computer Science",
          gpa: 3.75,
          gpaScale: 4.0,
          graduationYear: 2024,
          countryOfOrigin: "India",
          currentCountry: "India",
          familyIncomeUsd: 15000,
          ieltsScore: 7.5,
          workExperienceYears: 2.5,
          publicationsCount: 1,
          skills: ["Machine Learning", "Python", "Data Science"],
          isVerified: true
        }
      }
    }
  });
  console.log(`Created demo user: ${demoUser.name} (${demoUser.email})`);

  // 2. Scholarships
  // A. Fulbright
  const fulbright = await prisma.scholarship.create({
    data: {
      title: "Fulbright Foreign Student Program",
      provider: "U.S. Department of State",
      description: "The Fulbright Foreign Student Program enables graduate students, young professionals, and artists from abroad to study and conduct research in the United States. It covers tuition, airfare, living stipend, and health insurance.",
      awardAmount: 45000,
      currency: "USD",
      fundingType: "FULLY_FUNDED",
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      educationLevels: ["MASTERS", "PHD"],
      eligibleCourses: ["Computer Science", "Public Policy", "Economics", "Engineering"],
      locationRestrictions: ["United States"],
      citizenshipRequirements: ["India", "Global Non-US"],
      minGpa: 3.3,
      minIelts: 7.0,
      minToefl: 95,
      officialUrl: "https://foreign.fulbrightonline.org/",
      isVerified: true,
      isActive: true,
      criteria: {
        create: [
          {
            criterionType: "DEGREE_LEVEL",
            operator: "IN",
            targetValue: JSON.stringify(["MASTERS", "PHD"]),
            isMandatory: true,
            weight: 1.5,
            description: "Must be applying for Master's or PhD degree program."
          },
          {
            criterionType: "ACADEMIC_GPA",
            operator: "GTE",
            targetValue: "3.3",
            isMandatory: true,
            weight: 1.2,
            description: "Minimum cumulative undergraduate GPA of 3.3 / 4.0 or equivalent."
          },
          {
            criterionType: "LANGUAGE_TEST",
            operator: "GTE",
            targetValue: "7.0",
            isMandatory: true,
            weight: 1.0,
            description: "Minimum IELTS score of 7.0 or TOEFL iBT of 95."
          },
          {
            criterionType: "CITIZENSHIP",
            operator: "CONTAINS",
            targetValue: "NON_US",
            isMandatory: true,
            weight: 2.0,
            description: "Must not hold U.S. citizenship or permanent residency."
          }
        ]
      }
    }
  });

  const fulbrightDoc = await prisma.scholarshipDocument.create({
    data: {
      scholarshipId: fulbright.id,
      title: "Fulbright Official Eligibility & Requirements Guide",
      sourceUrl: "https://foreign.fulbrightonline.org/about/eligibility",
      contentText: "Program Overview: Operates in more than 160 countries. Roughly 4,000 foreign students receive Fulbright scholarships annually. Academic Credentials: Must hold a bachelor degree before the grant begins. Language Proficiency: IELTS score 7.0+ or TOEFL 95+. Commitment: Must return to home country for at least two years upon completion under J-1 visa. Funding: Full tuition, monthly living allowance, round-trip airfare, health benefits.",
      version: 1
    }
  });

  await prisma.documentChunk.create({
    data: {
      documentId: fulbrightDoc.id,
      chunkIndex: 0,
      chunkContent: fulbrightDoc.contentText,
      tokenCount: Math.ceil(fulbrightDoc.contentText.length / 4),
      embedding: generateDeterministicPseudoVector(fulbrightDoc.contentText, 768),
      metadata: {
        scholarshipId: fulbright.id,
        documentTitle: fulbrightDoc.title,
        sourceUrl: fulbrightDoc.sourceUrl
      }
    }
  });

  // B. DAAD
  const daad = await prisma.scholarship.create({
    data: {
      title: "DAAD Helmut-Schmidt-Programme",
      provider: "German Academic Exchange Service (DAAD)",
      description: "Designed to qualify future leaders from developing countries in politics, law, economics, and public administration for a fully funded Master's degree in Germany.",
      awardAmount: 32000,
      currency: "EUR",
      fundingType: "FULLY_FUNDED",
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      educationLevels: ["MASTERS"],
      eligibleCourses: ["Public Policy", "Governance", "Development Studies", "Economics"],
      locationRestrictions: ["Germany"],
      citizenshipRequirements: ["Developing Countries"],
      minGpa: 3.0,
      minIelts: 6.5,
      minToefl: 88,
      officialUrl: "https://www.daad.de/en/",
      isVerified: true,
      isActive: true,
      criteria: {
        create: [
          {
            criterionType: "DEGREE_LEVEL",
            operator: "EQUALS",
            targetValue: "MASTERS",
            isMandatory: true,
            weight: 1.5,
            description: "Candidate must be applying for a participating Master's program."
          },
          {
            criterionType: "ACADEMIC_GPA",
            operator: "GTE",
            targetValue: "3.0",
            isMandatory: false,
            weight: 1.0,
            description: "Bachelor's degree with above-average academic performance."
          },
          {
            criterionType: "LANGUAGE_TEST",
            operator: "GTE",
            targetValue: "6.5",
            isMandatory: true,
            weight: 1.0,
            description: "Proficiency in English with minimum IELTS 6.5."
          }
        ]
      }
    }
  });

  const daadDoc = await prisma.scholarshipDocument.create({
    data: {
      scholarshipId: daad.id,
      title: "DAAD Helmut Schmidt Guidelines",
      sourceUrl: "https://www.daad.de/helmut-schmidt",
      contentText: "Target Group: Graduates from developing countries. Value: 934 Euros monthly stipend, German health insurance, travel allowance, rent subsidies. Criteria: Academic merit, relevant work experience, statement of purpose.",
      version: 1
    }
  });

  await prisma.documentChunk.create({
    data: {
      documentId: daadDoc.id,
      chunkIndex: 0,
      chunkContent: daadDoc.contentText,
      tokenCount: Math.ceil(daadDoc.contentText.length / 4),
      embedding: generateDeterministicPseudoVector(daadDoc.contentText, 768),
      metadata: {
        scholarshipId: daad.id,
        documentTitle: daadDoc.title,
        sourceUrl: daadDoc.sourceUrl
      }
    }
  });

  // C. Chevening
  const chevening = await prisma.scholarship.create({
    data: {
      title: "Chevening UK Government Scholarships",
      provider: "Foreign, Commonwealth and Development Office (UK)",
      description: "UK government's global scholarship programme offering full financial support for any eligible master's degree at any UK university.",
      awardAmount: 40000,
      currency: "GBP",
      fundingType: "FULLY_FUNDED",
      deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      educationLevels: ["MASTERS"],
      eligibleCourses: ["All Disciplines", "Computer Science", "Finance", "Law"],
      locationRestrictions: ["United Kingdom"],
      citizenshipRequirements: ["India", "Global Non-UK"],
      minGpa: 3.2,
      officialUrl: "https://www.chevening.org/",
      isVerified: true,
      isActive: true,
      criteria: {
        create: [
          {
            criterionType: "DEGREE_LEVEL",
            operator: "EQUALS",
            targetValue: "MASTERS",
            isMandatory: true,
            weight: 1.5,
            description: "Must be enrolled in a 1-year taught Master's program in the UK."
          },
          {
            criterionType: "GENERAL",
            operator: "GTE",
            targetValue: "2",
            isMandatory: true,
            weight: 1.5,
            description: "Minimum two years of verifiable work experience (2,800 hours)."
          }
        ]
      }
    }
  });

  const cheveningDoc = await prisma.scholarshipDocument.create({
    data: {
      scholarshipId: chevening.id,
      title: "Chevening Scholarship Policy and Work Experience Rules",
      sourceUrl: "https://www.chevening.org/scholarships/guidance/work-experience/",
      contentText: "Applicants must have at least two years (2,800 hours) of work experience. Full-time, part-time, or internships qualify. Award covers full tuition fees, monthly stipend, travel costs to UK, arrival/departure allowances, visa costs.",
      version: 1
    }
  });

  await prisma.documentChunk.create({
    data: {
      documentId: cheveningDoc.id,
      chunkIndex: 0,
      chunkContent: cheveningDoc.contentText,
      tokenCount: Math.ceil(cheveningDoc.contentText.length / 4),
      embedding: generateDeterministicPseudoVector(cheveningDoc.contentText, 768),
      metadata: {
        scholarshipId: chevening.id,
        documentTitle: cheveningDoc.title,
        sourceUrl: cheveningDoc.sourceUrl
      }
    }
  });

  // 3. User Seed Connections: Matches, Saved Scholarships & Applications
  await prisma.savedScholarship.create({
    data: {
      userId: demoUser.id,
      scholarshipId: fulbright.id,
    }
  });

  await prisma.scholarshipApplication.create({
    data: {
      userId: demoUser.id,
      scholarshipId: chevening.id,
      status: "PREPARING_DOCUMENTS",
      personalNotes: "Drafted essays, preparing work experience certificates."
    }
  });

  await prisma.scholarshipMatch.createMany({
    data: [
      {
        userId: demoUser.id,
        scholarshipId: fulbright.id,
        eligibilityScore: 92.5,
        status: "HIGH_MATCH",
        matchedCriteria: [
          { criterion: "DEGREE_LEVEL", passed: true, studentValue: "MASTERS" },
          { criterion: "ACADEMIC_GPA", passed: true, studentValue: 3.75, minRequired: 3.3 },
          { criterion: "LANGUAGE_TEST", passed: true, studentValue: 7.5, minRequired: 7.0 }
        ],
        unmetCriteria: [],
        missingInfo: [],
        explanation: "Strong candidate exceeding minimum GPA (3.75 vs 3.3) and IELTS score (7.5 vs 7.0).",
        nextSteps: ["Complete Statement of Purpose", "Request academic references"]
      },
      {
        userId: demoUser.id,
        scholarshipId: chevening.id,
        eligibilityScore: 88.0,
        status: "HIGH_MATCH",
        matchedCriteria: [
          { criterion: "DEGREE_LEVEL", passed: true, studentValue: "MASTERS" },
          { criterion: "GENERAL", passed: true, studentValue: "2.5 years work experience", minRequired: "2.0 years" }
        ],
        unmetCriteria: [],
        missingInfo: [],
        explanation: "Candidate satisfies minimum 2 years work experience requirement with 2.5 years documented.",
        nextSteps: ["Prepare 3 UK course choices", "Draft leadership essay"]
      }
    ]
  });

  console.log("Database seeded successfully with Users, Profiles, Scholarships, Criteria, Chunks, and Matches!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
