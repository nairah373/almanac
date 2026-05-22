/**
 * Demo data for Almanac.
 *   npm run db:seed
 *
 * Seeded resources are catalogue-only: they have DB rows but no uploaded PDF,
 * so previews and downloads will not work for them. Upload a real resource
 * through the app to exercise the full flow. Re-running this script is safe —
 * it replaces the demo profiles (and cascades to their resources/reviews).
 */
import { PrismaClient, type ResourceType, type UserRole } from "@prisma/client";

const prisma = new PrismaClient();

type SeedProfile = {
  id: string;
  email: string;
  fullName: string;
  username: string;
  role: UserRole;
  university: string;
  branch: string;
  collegeVerified: boolean;
  bio: string;
};

const creators: SeedProfile[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    email: "ananya@demo.almanac",
    fullName: "Ananya Sharma",
    username: "ananya",
    role: "CREATOR",
    university: "Visvesvaraya Technological University (VTU)",
    branch: "Computer Science & Engineering",
    collegeVerified: true,
    bio: "Final-year CSE student. I share clean, exam-focused notes for core CS subjects.",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    email: "rohan@demo.almanac",
    fullName: "Rohan Mehta",
    username: "rohanm",
    role: "CREATOR",
    university: "Dr. A.P.J. Abdul Kalam Technical University (AKTU)",
    branch: "Electronics & Communication",
    collegeVerified: true,
    bio: "ECE topper. Handwritten notes and previous year question solutions.",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    email: "kavya@demo.almanac",
    fullName: "Kavya Reddy",
    username: "kavyareddy",
    role: "CREATOR",
    university: "All India Institute of Medical Sciences (AIIMS)",
    branch: "MBBS (Medicine)",
    collegeVerified: true,
    bio: "MBBS, 3rd year. Concise anatomy and physiology notes that actually stick.",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    email: "codeclub@demo.almanac",
    fullName: "CodeClub NITK",
    username: "codeclub_nitk",
    role: "COACHING",
    university: "National Institute of Technology (NIT)",
    branch: "Computer Science & Engineering",
    collegeVerified: true,
    bio: "Student-run coaching collective. Curated formula sheets and crash material.",
  },
];

const students: SeedProfile[] = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    email: "vikram@demo.almanac",
    fullName: "Vikram Singh",
    username: "vikrams",
    role: "STUDENT",
    university: "Visvesvaraya Technological University (VTU)",
    branch: "Information Technology",
    collegeVerified: false,
    bio: "",
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    email: "priya@demo.almanac",
    fullName: "Priya Nair",
    username: "priyan",
    role: "STUDENT",
    university: "Dr. A.P.J. Abdul Kalam Technical University (AKTU)",
    branch: "Electronics & Communication",
    collegeVerified: false,
    bio: "",
  },
];

type SeedResource = {
  title: string;
  description: string;
  resourceType: ResourceType;
  university: string;
  branch: string;
  semester: number;
  subject: string;
  moduleName?: string;
  examType?: string;
  priceInPaise: number;
  downloadCount: number;
  pageCount: number;
  creatorId: string;
};

const resources: SeedResource[] = [
  {
    title: "Operating Systems — Complete Unit 1 to 3 Notes",
    description:
      "Process management, scheduling algorithms, synchronisation and deadlocks — explained with diagrams and solved numericals. Built from two semesters of lecture notes and exam patterns.",
    resourceType: "TYPED",
    university: "Visvesvaraya Technological University (VTU)",
    branch: "Computer Science & Engineering",
    semester: 5,
    subject: "Operating Systems",
    moduleName: "Unit 1–3",
    examType: "End-Semester",
    priceInPaise: 4900,
    downloadCount: 214,
    pageCount: 48,
    creatorId: creators[0].id,
  },
  {
    title: "Data Structures — Handwritten Master Notes",
    description:
      "Trees, graphs, hashing and complexity analysis in clear handwriting. Every concept paired with a worked example and the typical exam question.",
    resourceType: "HANDWRITTEN",
    university: "Visvesvaraya Technological University (VTU)",
    branch: "Computer Science & Engineering",
    semester: 3,
    subject: "Data Structures",
    examType: "University Exam",
    priceInPaise: 5900,
    downloadCount: 388,
    pageCount: 62,
    creatorId: creators[0].id,
  },
  {
    title: "DBMS Quick Revision — Last Day Before Exam",
    description:
      "Normalisation, transactions, indexing and SQL — compressed into a focused revision set you can finish the night before the exam.",
    resourceType: "TYPED",
    university: "Visvesvaraya Technological University (VTU)",
    branch: "Computer Science & Engineering",
    semester: 4,
    subject: "Database Management Systems",
    examType: "End-Semester",
    priceInPaise: 0,
    downloadCount: 502,
    pageCount: 20,
    creatorId: creators[0].id,
  },
  {
    title: "Signals & Systems — Previous Year Questions (Solved)",
    description:
      "Five years of university question papers with fully worked solutions. Patterns and repeated questions are highlighted.",
    resourceType: "PYQ",
    university: "Dr. A.P.J. Abdul Kalam Technical University (AKTU)",
    branch: "Electronics & Communication",
    semester: 4,
    subject: "Signals & Systems",
    examType: "University Exam",
    priceInPaise: 3900,
    downloadCount: 176,
    pageCount: 34,
    creatorId: creators[1].id,
  },
  {
    title: "Digital Electronics — Handwritten Notes",
    description:
      "Logic gates, combinational and sequential circuits, with truth tables and timing diagrams drawn out neatly.",
    resourceType: "HANDWRITTEN",
    university: "Dr. A.P.J. Abdul Kalam Technical University (AKTU)",
    branch: "Electronics & Communication",
    semester: 3,
    subject: "Digital Electronics",
    examType: "Mid-Semester",
    priceInPaise: 4500,
    downloadCount: 142,
    pageCount: 40,
    creatorId: creators[1].id,
  },
  {
    title: "Microprocessors 8085/8086 — Formula & Instruction Sheet",
    description:
      "Every instruction set, addressing mode and key formula on a compact reference sheet. Perfect for the practical exam.",
    resourceType: "FORMULA_SHEET",
    university: "Dr. A.P.J. Abdul Kalam Technical University (AKTU)",
    branch: "Electronics & Communication",
    semester: 5,
    subject: "Microprocessors",
    examType: "Practical / Lab",
    priceInPaise: 0,
    downloadCount: 297,
    pageCount: 6,
    creatorId: creators[1].id,
  },
  {
    title: "Human Anatomy — Upper Limb Complete Notes",
    description:
      "Bones, muscles, nerves and clinical correlations of the upper limb. Structured exactly the way it is asked in professional exams.",
    resourceType: "TYPED",
    university: "All India Institute of Medical Sciences (AIIMS)",
    branch: "MBBS (Medicine)",
    semester: 1,
    subject: "Human Anatomy",
    examType: "University Exam",
    priceInPaise: 7900,
    downloadCount: 421,
    pageCount: 56,
    creatorId: creators[2].id,
  },
  {
    title: "Physiology — Cardiovascular System Flashcards",
    description:
      "120 spaced-repetition flashcards covering cardiac cycle, ECG and regulation. Built for rapid recall before vivas.",
    resourceType: "FLASHCARDS",
    university: "All India Institute of Medical Sciences (AIIMS)",
    branch: "MBBS (Medicine)",
    semester: 2,
    subject: "Physiology",
    examType: "Internal Assessment",
    priceInPaise: 5900,
    downloadCount: 233,
    pageCount: 30,
    creatorId: creators[2].id,
  },
  {
    title: "Biochemistry — Metabolic Pathways Summary",
    description:
      "Every major metabolic pathway on clean, colour-free diagrams with regulatory points and clinical notes.",
    resourceType: "PPT_SUMMARY",
    university: "All India Institute of Medical Sciences (AIIMS)",
    branch: "MBBS (Medicine)",
    semester: 2,
    subject: "Biochemistry",
    examType: "End-Semester",
    priceInPaise: 0,
    downloadCount: 318,
    pageCount: 24,
    creatorId: creators[2].id,
  },
  {
    title: "Engineering Mathematics — Formula Sheet (All Units)",
    description:
      "Calculus, linear algebra, differential equations and transforms — every formula you need, on a single curated sheet.",
    resourceType: "FORMULA_SHEET",
    university: "National Institute of Technology (NIT)",
    branch: "Computer Science & Engineering",
    semester: 2,
    subject: "Engineering Mathematics",
    examType: "End-Semester",
    priceInPaise: 2900,
    downloadCount: 640,
    pageCount: 8,
    creatorId: creators[3].id,
  },
  {
    title: "Computer Networks — Crash Revision Notes",
    description:
      "OSI and TCP/IP, routing, congestion control and security — a fast, complete revision pass curated by our seniors.",
    resourceType: "TYPED",
    university: "National Institute of Technology (NIT)",
    branch: "Computer Science & Engineering",
    semester: 6,
    subject: "Computer Networks",
    examType: "End-Semester",
    priceInPaise: 6900,
    downloadCount: 188,
    pageCount: 44,
    creatorId: creators[3].id,
  },
  {
    title: "DSA Lab Record — Full Semester (Programs + Output)",
    description:
      "Every data-structures lab program with clean code, sample input and expected output. Formatted to copy straight into a record.",
    resourceType: "LAB_RECORD",
    university: "National Institute of Technology (NIT)",
    branch: "Computer Science & Engineering",
    semester: 3,
    subject: "Data Structures",
    examType: "Practical / Lab",
    priceInPaise: 3900,
    downloadCount: 256,
    pageCount: 52,
    creatorId: creators[3].id,
  },
];

const reviewSeeds: {
  resourceIndex: number;
  authorId: string;
  rating: number;
  comment: string;
}[] = [
  {
    resourceIndex: 0,
    authorId: students[0].id,
    rating: 5,
    comment: "Cleared my OS end-sem with this. The solved numericals are gold.",
  },
  {
    resourceIndex: 0,
    authorId: students[1].id,
    rating: 4,
    comment: "Very thorough. Would have liked a few more diagrams in Unit 3.",
  },
  {
    resourceIndex: 1,
    authorId: students[0].id,
    rating: 5,
    comment: "Best DSA notes I've found. Handwriting is genuinely readable.",
  },
  {
    resourceIndex: 2,
    authorId: students[1].id,
    rating: 5,
    comment: "Perfect last-day revision. Concise and exactly to the point.",
  },
  {
    resourceIndex: 3,
    authorId: students[1].id,
    rating: 5,
    comment: "Repeated questions were spot on. Saved so much time.",
  },
  {
    resourceIndex: 6,
    authorId: students[0].id,
    rating: 5,
    comment: "Anatomy finally made sense. Clinical correlations are excellent.",
  },
  {
    resourceIndex: 9,
    authorId: students[0].id,
    rating: 4,
    comment: "Compact and useful. Carried it into every maths exam.",
  },
  {
    resourceIndex: 9,
    authorId: students[1].id,
    rating: 5,
    comment: "One sheet, every formula. Exactly what a formula sheet should be.",
  },
];

async function main() {
  const allIds = [...creators, ...students].map((p) => p.id);
  // Replace any previous demo data (cascades to resources/reviews/follows).
  await prisma.profile.deleteMany({ where: { id: { in: allIds } } });

  for (const p of [...creators, ...students]) {
    await prisma.profile.create({
      data: {
        id: p.id,
        email: p.email,
        fullName: p.fullName,
        username: p.username,
        role: p.role,
        university: p.university,
        branch: p.branch,
        collegeVerified: p.collegeVerified,
        bio: p.bio || null,
      },
    });
  }

  const createdResources = [];
  for (let i = 0; i < resources.length; i++) {
    const r = resources[i];
    const created = await prisma.resource.create({
      data: {
        title: r.title,
        description: r.description,
        resourceType: r.resourceType,
        university: r.university,
        branch: r.branch,
        semester: r.semester,
        subject: r.subject,
        moduleName: r.moduleName ?? null,
        examType: r.examType ?? null,
        isFree: r.priceInPaise === 0,
        priceInPaise: r.priceInPaise,
        originalKey: `seed/${r.creatorId}/${i}.pdf`,
        previewKey: null,
        pageCount: r.pageCount,
        downloadCount: r.downloadCount,
        status: "PUBLISHED",
        creatorId: r.creatorId,
      },
    });
    createdResources.push(created);
  }

  for (const rv of reviewSeeds) {
    await prisma.review.create({
      data: {
        resourceId: createdResources[rv.resourceIndex].id,
        authorId: rv.authorId,
        rating: rv.rating,
        comment: rv.comment,
      },
    });
  }

  // A few follow relationships so creator stats look alive.
  const follows = [
    { followerId: students[0].id, creatorId: creators[0].id },
    { followerId: students[1].id, creatorId: creators[0].id },
    { followerId: students[0].id, creatorId: creators[2].id },
    { followerId: students[1].id, creatorId: creators[1].id },
    { followerId: creators[1].id, creatorId: creators[0].id },
  ];
  for (const f of follows) {
    await prisma.follow.create({ data: f });
  }

  console.log(
    `Seeded ${creators.length + students.length} profiles, ` +
      `${createdResources.length} resources, ${reviewSeeds.length} reviews.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
