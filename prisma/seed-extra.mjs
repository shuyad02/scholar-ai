import { PrismaClient } from "@prisma/client";

function chunkDocumentText(text, chunkSize = 400, chunkOverlap = 80) {
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  if (cleaned.length <= chunkSize) return [cleaned];
  const sentences = cleaned.split(/(?<=[.?!])\s+/);
  const chunks = [];
  let currentChunk = "";
  for (const sentence of sentences) {
    if ((currentChunk + " " + sentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      const overlapStart = Math.max(0, currentChunk.length - chunkOverlap);
      currentChunk = currentChunk.substring(overlapStart) + " " + sentence;
    } else {
      currentChunk = currentChunk ? currentChunk + " " + sentence : sentence;
    }
  }
  if (currentChunk.trim().length > 0) chunks.push(currentChunk.trim());
  return chunks;
}

function generateDeterministicPseudoVector(text, dimensions = 768) {
  const vector = new Array(dimensions).fill(0);
  const lower = text.toLowerCase();
  for (let i = 0; i < lower.length; i++) {
    const charCode = lower.charCodeAt(i);
    const index = (charCode * 31 + i * 17) % dimensions;
    vector[index] += 1;
  }
  let norm = 0;
  for (let i = 0; i < dimensions; i++) norm += vector[i] * vector[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < dimensions; i++) vector[i] = vector[i] / norm;
  return vector;
}

const prisma = new PrismaClient();

const scholarshipsData = [
  {
    title: "Gates Cambridge Scholarship",
    provider: "Gates Cambridge Trust (University of Cambridge)",
    description: "The Gates Cambridge Scholarship covers the full cost of studying at Cambridge including tuition fees, maintenance allowance, travel, visa costs, and family allowance. Established through a $210m donation from the Bill and Melinda Gates Foundation to build a global network of future leaders committed to improving the lives of others.",
    awardAmount: 60000,
    currency: "GBP",
    fundingType: "FULLY_FUNDED",
    deadline: new Date("2026-12-05T23:59:59Z"),
    educationLevels: ["MASTERS", "PHD"],
    eligibleCourses: ["All full-time postgraduate courses at University of Cambridge"],
    locationRestrictions: ["United Kingdom"],
    citizenshipRequirements: ["Open to all non-UK citizens"],
    minGpa: 3.8,
    minIelts: 7.5,
    minToefl: 110,
    officialUrl: "https://www.gatescambridge.org/apply/",
    isVerified: true,
    isActive: true,
    criteria: [
      {
        criterionType: "ACADEMIC_GPA",
        operator: "GTE",
        targetValue: "3.8",
        isMandatory: true,
        weight: 35,
        description: "Outstanding intellectual ability with minimum GPA of 3.8/4.0 (or UK First Class Honours equivalent)."
      },
      {
        criterionType: "LANGUAGE_TEST",
        operator: "GTE",
        targetValue: "7.5",
        isMandatory: true,
        weight: 25,
        description: "Minimum IELTS Academic overall score of 7.5 with 7.0 in each band."
      },
      {
        criterionType: "DEGREE_LEVEL",
        operator: "IN",
        targetValue: "MASTERS,PHD",
        isMandatory: true,
        weight: 20,
        description: "Must be applying to a full-time residential Masters or PhD at Cambridge."
      },
      {
        criterionType: "GENERAL",
        operator: "EQUALS",
        targetValue: "TRUE",
        isMandatory: false,
        weight: 20,
        description: "Demonstrated capacity for leadership and commitment to improving the lives of others."
      }
    ],
    document: {
      title: "Gates Cambridge Official Selection Criteria Handbook 2026",
      content: `The Gates Cambridge mission is to build a global network of future leaders committed to improving the lives of others. Selection is based on four core criteria:
1. Outstanding intellectual ability: Candidates must demonstrate academic excellence, typically ranking in the top 5-10% of their graduating class with a GPA of 3.8/4.0 or UK First Class Honours.
2. Reasons for choice of course: A well-articulated research proposal or academic rationale for undertaking postgraduate study at the University of Cambridge.
3. A commitment to improving the lives of others: Evidence of active engagement in solving societal, technological, health, or environmental challenges.
4. Leadership capacity: Demonstrated ability to inspire, organize, and execute initiatives with tangible impact.
Award Coverage: The scholarship provides full University Composition Fee, maintenance allowance (£20,000 per annum for 12 months), return economy airfare, visa and healthcare surcharge (IHS), and discretionary funding for academic development.`
    }
  },
  {
    title: "Rhodes Scholarship at Oxford",
    provider: "Rhodes Trust (University of Oxford)",
    description: "The Rhodes Scholarship is the oldest and perhaps most prestigious international scholarship program, enabling outstanding young people from around the world to study at the University of Oxford. Covers all university and college fees, a personal stipend, health insurance, and flights.",
    awardAmount: 65000,
    currency: "GBP",
    fundingType: "FULLY_FUNDED",
    deadline: new Date("2026-10-15T23:59:59Z"),
    educationLevels: ["MASTERS", "PHD"],
    eligibleCourses: ["Any full-time postgraduate degree at University of Oxford"],
    locationRestrictions: ["United Kingdom"],
    citizenshipRequirements: ["Open to eligible constituency citizens worldwide including India, US, Canada, Australia, Global"],
    minGpa: 3.7,
    minIelts: 7.5,
    minToefl: 110,
    officialUrl: "https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/",
    isVerified: true,
    isActive: true,
    criteria: [
      {
        criterionType: "ACADEMIC_GPA",
        operator: "GTE",
        targetValue: "3.7",
        isMandatory: true,
        weight: 30,
        description: "First Class Honours or GPA of at least 3.7/4.0 or equivalent."
      },
      {
        criterionType: "DEGREE_LEVEL",
        operator: "IN",
        targetValue: "MASTERS,PHD",
        isMandatory: true,
        weight: 25,
        description: "Must be applying for admission to a postgraduate degree at Oxford."
      },
      {
        criterionType: "LANGUAGE_TEST",
        operator: "GTE",
        targetValue: "7.5",
        isMandatory: true,
        weight: 25,
        description: "Meet the Oxford University higher-level English language requirement (IELTS 7.5+ or TOEFL 110+)."
      },
      {
        criterionType: "GENERAL",
        operator: "EQUALS",
        targetValue: "TRUE",
        isMandatory: false,
        weight: 20,
        description: "Energy to use one's talents to the full, moral character, and instincts to lead and care for others."
      }
    ],
    document: {
      title: "Rhodes Trust Selection & Eligibility Regulations",
      content: `The Rhodes Scholarship selects scholars based on Cecil Rhodes' criteria:
- Literary and scholastic attainments (First class degree / GPA 3.7+).
- Energy to use one's talents to the full, as exemplified by fondness for and success in sports or other vigorous activities.
- Truth, courage, devotion to duty, sympathy for and protection of the weak, kindliness, unselfishness and fellowship.
- Moral force of character and instincts to lead, and to take an interest in one's fellow beings.
Funding details: All Oxford University and college fees are paid in full. Scholars receive an annual stipend of £19,092 paid in quarterly installments, one economy flight to Oxford and one return flight to home country at the end of the scholarship, and Student Visa plus International Health Surcharge (IHS).`
    }
  },
  {
    title: "Commonwealth Master's Scholarships",
    provider: "Foreign, Commonwealth & Development Office (UK Government)",
    description: "Commonwealth Master's Scholarships are aimed at candidates from developing Commonwealth countries who could not otherwise afford to study in the UK. Fully funded program supporting 1-year taught Master's degrees across 6 key developmental themes.",
    awardAmount: 42000,
    currency: "GBP",
    fundingType: "FULLY_FUNDED",
    deadline: new Date("2026-11-20T23:59:59Z"),
    educationLevels: ["MASTERS"],
    eligibleCourses: ["Science & Tech, Health Systems, Global Prosperity, Peace & Governance, Resilience"],
    locationRestrictions: ["United Kingdom"],
    citizenshipRequirements: ["Eligible Commonwealth developing country citizen (e.g. India, Bangladesh, Kenya, Nigeria, Ghana)"],
    minGpa: 3.3,
    minIelts: 6.5,
    minToefl: 90,
    officialUrl: "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/",
    isVerified: true,
    isActive: true,
    criteria: [
      {
        criterionType: "CITIZENSHIP",
        operator: "IN",
        targetValue: "Commonwealth Developing Countries",
        isMandatory: true,
        weight: 35,
        description: "Citizen or permanent resident of an eligible Commonwealth country."
      },
      {
        criterionType: "ACADEMIC_GPA",
        operator: "GTE",
        targetValue: "3.3",
        isMandatory: true,
        weight: 30,
        description: "Minimum upper second class (2:1) undergraduate degree or GPA 3.3/4.0."
      },
      {
        criterionType: "DEGREE_LEVEL",
        operator: "EQUALS",
        targetValue: "MASTERS",
        isMandatory: true,
        weight: 20,
        description: "Applying for a 1-year full-time taught Master's course in the UK."
      },
      {
        criterionType: "FINANCIAL_NEED",
        operator: "EQUALS",
        targetValue: "TRUE",
        isMandatory: true,
        weight: 15,
        description: "Unable to afford to study in the UK without this scholarship."
      }
    ],
    document: {
      title: "Commonwealth Scholarship Commission Prospectus 2026",
      content: `The Commonwealth Scholarships Commission awards fully funded Master's scholarships to talented individuals from developing Commonwealth countries.
Eligible Themes:
1. Science and technology for development
2. Strengthening health systems and capacity
3. Promoting global prosperity
4. Strengthening global peace, security and governance
5. Strengthening resilience and response to crises
6. Access, inclusion and opportunity
Entitlements:
- Approved return airfare from home country to UK.
- Approved full tuition fees.
- Stipend (living allowance) of £1,347 per month, or £1,652 per month for universities in the London metropolitan area.
- Warm clothing allowance where applicable.
- Study travel grant toward the cost of study-related travel within the UK.`
    }
  },
  {
    title: "Eiffel Excellence Scholarship Program",
    provider: "Campus France & French Ministry for Europe and Foreign Affairs",
    description: "The Eiffel Excellence Scholarship Program was developed by the French Ministry for Europe and Foreign Affairs to enable French higher education institutions to attract top foreign students for Master's and PhD degree programs.",
    awardAmount: 22000,
    currency: "EUR",
    fundingType: "FULLY_FUNDED",
    deadline: new Date("2027-01-10T23:59:59Z"),
    educationLevels: ["MASTERS", "PHD"],
    eligibleCourses: ["Biology & Health, Ecological Transition, Math & Digital Sciences, Engineering, Law, Economics"],
    locationRestrictions: ["France"],
    citizenshipRequirements: ["Open to all non-French foreign nationals"],
    minGpa: 3.5,
    minIelts: 6.5,
    minToefl: 92,
    officialUrl: "https://www.campusfrance.org/en/the-eiffel-scholarship-program",
    isVerified: true,
    isActive: true,
    criteria: [
      {
        criterionType: "DEGREE_LEVEL",
        operator: "IN",
        targetValue: "MASTERS,PHD",
        isMandatory: true,
        weight: 35,
        description: "Must be enrolled in a Master's degree (under 25 yrs) or PhD program (under 30 yrs)."
      },
      {
        criterionType: "ACADEMIC_GPA",
        operator: "GTE",
        targetValue: "3.5",
        isMandatory: true,
        weight: 35,
        description: "Excellent academic record (top 10% of cohort or minimum GPA 3.5/4.0)."
      },
      {
        criterionType: "CITIZENSHIP",
        operator: "EQUALS",
        targetValue: "Non-French",
        isMandatory: true,
        weight: 30,
        description: "Candidates must be foreign nationals with non-French citizenship."
      }
    ],
    document: {
      title: "Campus France Eiffel Programme Regulations",
      content: `The Eiffel Excellence Scholarship is awarded across two levels:
Master's level: Monthly allowance of €1,181 plus international transportation, national transportation, social security coverage, and cultural activities. Tuition fees are generally waived by public French universities.
PhD level: Monthly allowance of €1,700 for up to 18 months, with international transportation, train travel, and housing assistance support.
Key Subject Areas:
- Science and Technology: Biology and health, ecological transition, mathematics and digital, engineering sciences.
- Humanities and Social Sciences: French history, language and civilization, law and political sciences, economics and management.`
    }
  },
  {
    title: "Australia Awards Scholarships",
    provider: "Department of Foreign Affairs and Trade (Australian Government)",
    description: "Australia Awards Scholarships are long-term awards administered by DFAT. They provide opportunities for people from developing countries, particularly those in the Indo-Pacific region, to undertake full-time undergraduate or postgraduate study at participating Australian universities.",
    awardAmount: 65000,
    currency: "AUD",
    fundingType: "FULLY_FUNDED",
    deadline: new Date("2026-04-30T23:59:59Z"),
    educationLevels: ["BACHELORS", "MASTERS", "PHD"],
    eligibleCourses: ["Priority development sectors agreed between Australia and partner country"],
    locationRestrictions: ["Australia"],
    citizenshipRequirements: ["Indo-Pacific and partner developing country citizens"],
    minGpa: 3.2,
    minIelts: 6.5,
    minToefl: 84,
    officialUrl: "https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships",
    isVerified: true,
    isActive: true,
    criteria: [
      {
        criterionType: "CITIZENSHIP",
        operator: "IN",
        targetValue: "Eligible Indo-Pacific Partner Countries",
        isMandatory: true,
        weight: 40,
        description: "Must be a citizen of an eligible participating partner country."
      },
      {
        criterionType: "LANGUAGE_TEST",
        operator: "GTE",
        targetValue: "6.5",
        isMandatory: true,
        weight: 30,
        description: "Minimum overall IELTS score of 6.5 with at least 6.0 in each sub-test."
      },
      {
        criterionType: "GENERAL",
        operator: "EQUALS",
        targetValue: "TRUE",
        isMandatory: true,
        weight: 30,
        description: "Commitment to return to home country for a minimum of two years post-study."
      }
    ],
    document: {
      title: "Australia Awards Policy Handbook",
      content: `Australia Awards Scholarships cover:
- Full tuition fees for undergraduate, master's or PhD coursework or research.
- Return air travel: single return economy airfare via the most direct route.
- Establishment allowance: A one-off payment of AUD $5,000 toward accommodation and textbooks.
- Contribution to Living Expenses (CLE): Fortnightly contribution at rate determined by DFAT (approx. AUD $30,000 annually).
- Overseas Student Health Cover (OSHC) for the duration of the scholarship.
- Introductory Academic Program (IAP) mandatory 4-6 week pre-academic orientation.`
    }
  },
  {
    title: "Knight-Hennessy Scholars at Stanford",
    provider: "Knight-Hennessy Scholars (Stanford University)",
    description: "The Knight-Hennessy Scholars program cultivates and supports a multidisciplinary, multicultural community of graduate students from across Stanford University, and delivers high-impact leadership development experiences.",
    awardAmount: 90000,
    currency: "USD",
    fundingType: "FULLY_FUNDED",
    deadline: new Date("2026-10-08T23:59:59Z"),
    educationLevels: ["MASTERS", "PHD"],
    eligibleCourses: ["Any full-time graduate degree program at Stanford (JD, MA, MBA, MD, MS, PhD)"],
    locationRestrictions: ["United States"],
    citizenshipRequirements: ["Open to citizens of all countries"],
    minGpa: 3.7,
    minIelts: 7.5,
    minToefl: 105,
    officialUrl: "https://knight-hennessy.stanford.edu/",
    isVerified: true,
    isActive: true,
    criteria: [
      {
        criterionType: "DEGREE_LEVEL",
        operator: "IN",
        targetValue: "MASTERS,PHD",
        isMandatory: true,
        weight: 35,
        description: "Must apply separately and be admitted to a full-time Stanford graduate degree."
      },
      {
        criterionType: "ACADEMIC_GPA",
        operator: "GTE",
        targetValue: "3.7",
        isMandatory: true,
        weight: 30,
        description: "High academic achievement with sharp mind, curious and independent thinker (GPA 3.7+)."
      },
      {
        criterionType: "GENERAL",
        operator: "EQUALS",
        targetValue: "TRUE",
        isMandatory: false,
        weight: 35,
        description: "Demonstrated purposeful leadership, civic mindset, and collaborative character."
      }
    ],
    document: {
      title: "Knight-Hennessy Scholars Profile & Financial Support Guidelines",
      content: `Knight-Hennessy Scholars receive financial support for up to three years of graduate education at Stanford University.
Financial coverage includes:
- A fellowship applied directly to cover full tuition and associated university fees.
- A living and academic stipend (such as for room and board, books, academic supplies, instructional materials, local transportation, and reasonable personal expenses).
- An economy class return ticket for one annual trip to and from Stanford.
Scholars also participate in the King Global Leadership Program (KGLP), a comprehensive leadership development curriculum.`
    }
  },
  {
    title: "Swiss Government Excellence Scholarships",
    provider: "Federal Commission for Scholarships for Foreign Students (FCS, Switzerland)",
    description: "Each year the Swiss Confederation awards Government Excellence Scholarships to promote international exchange and research cooperation between Switzerland and over 180 other countries. Aimed at young researchers who have completed a master's degree or PhD.",
    awardAmount: 25000,
    currency: "CHF",
    fundingType: "FULLY_FUNDED",
    deadline: new Date("2026-11-15T23:59:59Z"),
    educationLevels: ["PHD", "POSTDOC"],
    eligibleCourses: ["All academic fields at Swiss Cantonal Universities, ETH Zurich, or EPFL"],
    locationRestrictions: ["Switzerland"],
    citizenshipRequirements: ["Citizens of over 180 partner countries"],
    minGpa: 3.6,
    minIelts: 7.0,
    minToefl: 100,
    officialUrl: "https://www.sbfi.admin.ch/sbfi/en/home/education/scholarships-and-grants/swiss-government-excellence-scholarships.html",
    isVerified: true,
    isActive: true,
    criteria: [
      {
        criterionType: "DEGREE_LEVEL",
        operator: "IN",
        targetValue: "PHD,POSTDOC",
        isMandatory: true,
        weight: 40,
        description: "Applicant must hold a Master's degree (for PhD awards) or PhD (for Postdoc awards)."
      },
      {
        criterionType: "GENERAL",
        operator: "EQUALS",
        targetValue: "TRUE",
        isMandatory: true,
        weight: 35,
        description: "Must have an official letter of acceptance from a host professor at an eligible Swiss university."
      },
      {
        criterionType: "GENERAL",
        operator: "EQUALS",
        targetValue: "TRUE",
        isMandatory: true,
        weight: 25,
        description: "High-quality, original research proposal with clear methodology and timeline."
      }
    ],
    document: {
      title: "Swiss Confederation Federal Commission for Scholarships Guidelines",
      content: `The Swiss Government Excellence Scholarships offer:
- Monthly scholarship stipend of CHF 1,920 for PhD candidates and CHF 3,500 for Postdoctoral researchers.
- Mandatory Swiss health insurance paid directly by the FCS.
- One-time housing allowance of CHF 300 paid at the start of the scholarship.
- Public transportation pass for half-fare Swiss federal rail network.
- Academic support from the host institution (ETH Zurich, EPFL, University of Geneva, University of Zurich, etc.).`
    }
  }
];

async function seed() {
  console.log("🚀 Starting database enrichment with real global scholarships...");

  for (const s of scholarshipsData) {
    const existing = await prisma.scholarship.findFirst({
      where: { title: s.title },
    });

    if (existing) {
      console.log(`⏩ Already exists: ${s.title}`);
      continue;
    }

    const created = await prisma.scholarship.create({
      data: {
        title: s.title,
        provider: s.provider,
        description: s.description,
        awardAmount: s.awardAmount,
        currency: s.currency,
        fundingType: s.fundingType,
        deadline: s.deadline,
        educationLevels: s.educationLevels,
        eligibleCourses: s.eligibleCourses,
        locationRestrictions: s.locationRestrictions,
        citizenshipRequirements: s.citizenshipRequirements,
        minGpa: s.minGpa,
        minIelts: s.minIelts,
        minToefl: s.minToefl,
        officialUrl: s.officialUrl,
        isVerified: s.isVerified,
        isActive: s.isActive,
        criteria: {
          create: s.criteria.map((c) => ({
            criterionType: c.criterionType,
            operator: c.operator,
            targetValue: c.targetValue,
            isMandatory: c.isMandatory,
            weight: c.weight,
            description: c.description,
          })),
        },
      },
    });

    console.log(`✅ Created scholarship: ${created.title}`);

    // Ingest RAG document & chunks
    if (s.document) {
      const doc = await prisma.scholarshipDocument.create({
        data: {
          scholarshipId: created.id,
          title: s.document.title,
          contentText: s.document.content,
          version: 1,
        },
      });

      const chunks = chunkDocumentText(s.document.content);
      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];
        const embedding = generateDeterministicPseudoVector(chunkText, 768);

        await prisma.documentChunk.create({
          data: {
            documentId: doc.id,
            chunkIndex: i,
            chunkContent: chunkText,
            tokenCount: Math.ceil(chunkText.length / 4),
            embedding,
            metadata: {
              scholarshipId: created.id,
              documentTitle: s.document.title,
            },
          },
        });
      }
      console.log(`   📄 Ingested document: ${s.document.title} (${chunks.length} chunks)`);
    }
  }

  const count = await prisma.scholarship.count();
  console.log(`\n🎉 Total scholarships now in database: ${count}`);
}

seed()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
