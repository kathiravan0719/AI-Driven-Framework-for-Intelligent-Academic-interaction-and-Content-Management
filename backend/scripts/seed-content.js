/**
 * Seed Script — Content Management Module
 * Populates sample study materials + events into MongoDB
 * Run: node scripts/seed-content.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const Content = require('../models/Content');
const Event = require('../models/Event');
const User = require('../models/User');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Create a dummy placeholder text file in /uploads and return filename */
function createPlaceholderFile(name, content) {
  const filename = `seed-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`;
  fs.writeFileSync(path.join(uploadsDir, filename), content);
  return filename;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const SAMPLE_CONTENT = [
  // Academic — Notes
  { title: 'Introduction to Data Structures', type: 'Notes', category: 'Academic', subject: 'Computer Science', description: 'Comprehensive notes covering arrays, linked lists, stacks, queues, and trees.', tags: ['DSA', 'Arrays', 'Trees'], uploaderName: 'Dr. Rajesh Kumar' },
  { title: 'Calculus — Differential Equations', type: 'Notes', category: 'Academic', subject: 'Mathematics', description: 'Detailed notes on first and second order differential equations with solved examples.', tags: ['Calculus', 'Maths'], uploaderName: 'Prof. Meera Nair' },
  { title: 'Organic Chemistry Fundamentals', type: 'Notes', category: 'Academic', subject: 'Chemistry', description: 'Notes on functional groups, reactions, and mechanisms in organic chemistry.', tags: ['Chemistry', 'Organic'], uploaderName: 'Dr. Vikram Iyer' },
  { title: 'Digital Electronics — Logic Gates', type: 'Notes', category: 'Technical', subject: 'Electronics', description: 'Study notes on combinational and sequential logic circuits.', tags: ['Electronics', 'Logic'], uploaderName: 'Prof. Anitha Rajan' },
  { title: 'English Literature — Victorian Era', type: 'Notes', category: 'Academic', subject: 'English', description: 'Notes covering major Victorian poets and novels with critical analysis.', tags: ['English', 'Literature'], uploaderName: 'Dr. Priya Sharma' },

  // Academic — Assignments
  { title: 'Assignment 1 — Algorithm Analysis', type: 'Assignment', category: 'Academic', subject: 'Computer Science', description: 'Solve 10 problems on time and space complexity. Submit by end of month.', tags: ['DSA', 'Assignment'], uploaderName: 'Dr. Rajesh Kumar' },
  { title: 'Physics Lab Report — Pendulum', type: 'Assignment', category: 'Academic', subject: 'Physics', description: 'Lab report template and guidelines for the pendulum experiment.', tags: ['Lab', 'Physics'], uploaderName: 'Prof. Suresh Babu' },
  { title: 'Mathematics Exercise Set 3', type: 'Assignment', category: 'Academic', subject: 'Mathematics', description: 'Practice problems on integration and differentiation for Unit 3.', tags: ['Calculus', 'Practice'], uploaderName: 'Prof. Meera Nair' },

  // Administrative — Circulars
  { title: 'Exam Schedule — April 2026', type: 'Circular', category: 'Administrative', subject: 'Mathematics', description: 'Internal assessment examination schedule for all departments in April 2026.', tags: ['Exam', 'Schedule'], uploaderName: 'Academic Office' },
  { title: 'Holiday List 2026', type: 'Circular', category: 'Administrative', subject: 'Computer Science', description: 'Official holiday calendar for the academic year 2025–2026.', tags: ['Holiday', 'Calendar'], uploaderName: 'Principal Office' },
  { title: 'Anti-Ragging Policy', type: 'Circular', category: 'Administrative', subject: 'English', description: 'Updated college anti-ragging policy and reporting guidelines.', tags: ['Policy', 'Safety'], uploaderName: 'Administration' },

  // Library — Resources
  { title: 'Free E-Books — Computer Science', type: 'Resource', category: 'Library', subject: 'Computer Science', description: 'Curated list of free online textbooks and PDF resources for CS students.', tags: ['Books', 'Free', 'CS'], uploaderName: 'Library Staff' },
  { title: 'Research Paper Writing Guide', type: 'Resource', category: 'Library', subject: 'English', description: 'Step-by-step guide to writing and formatting academic research papers.', tags: ['Research', 'Writing'], uploaderName: 'Library Staff' },
  { title: 'Physics Reference Tables', type: 'Resource', category: 'Library', subject: 'Physics', description: 'Quick reference tables for physics constants, formulas, and unit conversions.', tags: ['Physics', 'Reference'], uploaderName: 'Library Staff' },

  // Technical — Syllabus
  { title: 'B.Tech CS Syllabus 2024–25', type: 'Syllabus', category: 'Academic', subject: 'Computer Science', description: 'Complete B.Tech Computer Science curriculum for all 8 semesters.', tags: ['Syllabus', 'BTech'], uploaderName: 'Academic Office' },
  { title: 'Data Structures Lab Manual', type: 'Syllabus', category: 'Technical', subject: 'Computer Science', description: 'Lab manual with experiments, expected output, and viva questions.', tags: ['Lab', 'Manual', 'CS'], uploaderName: 'Dr. Rajesh Kumar' },

  // General
  { title: 'Campus Map & Building Guide', type: 'Resource', category: 'General', subject: 'Other', description: 'Detailed campus map with building numbers, labs, library, and admin office locations.', tags: ['Campus', 'Map'], uploaderName: 'Student Affairs' },
  { title: 'Student Handbook 2025–26', type: 'Resource', category: 'General', subject: 'Other', description: 'Complete student handbook covering rules, code of conduct, and facilities.', tags: ['Handbook', 'Rules'], uploaderName: 'Administration' },
];

const SAMPLE_EVENTS = [
  // Academic events
  {
    title: 'Seminar on Machine Learning in Healthcare',
    description: 'An expert seminar exploring the applications of ML and AI in modern healthcare diagnostics, treatment planning, and patient management.',
    category: 'Academic', date: new Date(Date.now() + 3 * 86400000), time: '10:00 AM',
    location: 'Seminar Hall A', image: '🤖', maxAttendees: 200, organizerName: 'CS Department',
  },
  {
    title: 'Guest Lecture — Blockchain Technology',
    description: 'Industry expert from a leading fintech firm will walk through real-world blockchain applications beyond cryptocurrency.',
    category: 'Academic', date: new Date(Date.now() + 7 * 86400000), time: '2:00 PM',
    location: 'Lecture Hall 1', image: '⛓️', maxAttendees: 150, organizerName: 'IT Department',
  },
  {
    title: 'Workshop — Research Methodology',
    description: 'Learn how to write compelling research papers, cite sources, and use academic databases. Open to all students.',
    category: 'Workshop', date: new Date(Date.now() + 5 * 86400000), time: '9:00 AM',
    location: 'Library Conference Room', image: '📚', maxAttendees: 50, organizerName: 'Library',
  },

  // Technical events
  {
    title: 'Hackathon 2026 — Code for Change',
    description: '24-hour hackathon challenging students to build tech solutions for real social problems. Teams of 3–4. Exciting prizes await!',
    category: 'Technical', date: new Date(Date.now() + 10 * 86400000), time: '8:00 AM',
    location: 'Main Lab Block', image: '🚀', maxAttendees: 300, organizerName: 'Tech Club',
  },
  {
    title: 'IoT & Embedded Systems Expo',
    description: 'Student project exhibition featuring IoT prototypes, embedded systems, and robotics. Open for public viewing.',
    category: 'Technical', date: new Date(Date.now() + 14 * 86400000), time: '10:00 AM',
    location: 'Electronics Lab', image: '🔬', maxAttendees: 250, organizerName: 'Electronics Dept',
  },

  // Cultural events
  {
    title: 'Annual Cultural Festival — Tarang 2026',
    description: 'Three days of music, dance, drama, and art. Performances by students from all departments. Food stalls and exhibitions.',
    category: 'Cultural', date: new Date(Date.now() + 20 * 86400000), time: '5:00 PM',
    location: 'Open Air Theatre', image: '🎭', maxAttendees: 1000, organizerName: 'Cultural Committee',
  },
  {
    title: 'Photography Club Exhibition',
    description: 'Annual exhibition showcasing the best photographs clicked by students across the campus and surrounding areas.',
    category: 'Cultural', date: new Date(Date.now() + 6 * 86400000), time: '11:00 AM',
    location: 'Art Gallery, Block C', image: '🎨', maxAttendees: 100, organizerName: 'Photography Club',
  },

  // Sports
  {
    title: 'Inter-College Cricket Tournament',
    description: 'Annual cricket tournament among 8 participating colleges. Knockout format. Finals on the last day.',
    category: 'Sports', date: new Date(Date.now() + 8 * 86400000), time: '7:00 AM',
    location: 'College Cricket Ground', image: '🏆', maxAttendees: 500, organizerName: 'Sports Committee',
  },
  {
    title: 'Badminton Singles Championship',
    description: 'Open registration for the annual badminton singles championship. All skill levels welcome.',
    category: 'Sports', date: new Date(Date.now() + 4 * 86400000), time: '4:00 PM',
    location: 'Indoor Sports Hall', image: '🏸', maxAttendees: 80, organizerName: 'Sports Club',
  },

  // Placement
  {
    title: 'Campus Placement Drive — TCS & Infosys',
    description: 'Pre-placement orientation and aptitude test preparation session. Resume review and mock interviews will be conducted.',
    category: 'Placement', date: new Date(Date.now() + 2 * 86400000), time: '9:00 AM',
    location: 'Placement Cell, Admin Block', image: '💼', maxAttendees: 200, organizerName: 'Placement Cell',
  },
  {
    title: 'LinkedIn Profile & Resume Masterclass',
    description: 'HR experts guide final-year students on building a compelling LinkedIn profile and crafting an ATS-friendly resume.',
    category: 'Placement', date: new Date(Date.now() + 1 * 86400000), time: '3:00 PM',
    location: 'Seminar Hall B', image: '🎯', maxAttendees: 100, organizerName: 'Placement Cell',
  },

  // Workshop
  {
    title: 'Python for Data Science — Beginner Workshop',
    description: 'Hands-on 3-hour workshop. Participants will learn Python basics, pandas, matplotlib, and build a mini data project.',
    category: 'Workshop', date: new Date(Date.now() + 9 * 86400000), time: '10:00 AM',
    location: 'Computer Lab 2', image: '🐍', maxAttendees: 40, organizerName: 'AI Club',
  },

  // General
  {
    title: 'Freshers Welcome Orientation',
    description: 'Welcome event for first-year students. Meet faculty, seniors, and explore clubs. Free lunch provided!',
    category: 'General', date: new Date(Date.now() + 15 * 86400000), time: '9:30 AM',
    location: 'Main Auditorium', image: '🎊', maxAttendees: 600, organizerName: 'Student Council',
  },

  // Past events (already happened)
  {
    title: 'Alumni Meet 2025',
    description: 'Annual gathering of alumni from all batches. Networking, talks, and memories.',
    category: 'General', date: new Date(Date.now() - 15 * 86400000), time: '11:00 AM',
    location: 'Convention Hall', image: '🎓', maxAttendees: 300, organizerName: 'Alumni Association',
    status: 'past',
  },
  {
    title: 'National Level Science Exhibition',
    description: 'Students showcased innovative science projects. Our college won 2nd place overall.',
    category: 'Academic', date: new Date(Date.now() - 30 * 86400000), time: '10:00 AM',
    location: 'Science Block', image: '🏅', maxAttendees: 200, organizerName: 'Science Dept',
    status: 'past',
  },
];

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find any existing user to use as uploader/organizer
    const anyUser = await User.findOne();
    const uploaderId = anyUser?._id || new mongoose.Types.ObjectId();

    // ── Seed Content ────────────────────────────────────────────────────────
    const existingContent = await Content.countDocuments();
    if (existingContent > 0) {
      console.log(`⚠️  Content already seeded (${existingContent} docs). Skipping content seed.`);
    } else {
      console.log('📄 Seeding study materials...');
      const contentDocs = SAMPLE_CONTENT.map((item, i) => {
        // Create a real placeholder file so downloads don't 404
        const bodyText = `${item.title}\n${'─'.repeat(60)}\n\n${item.description}\n\nSubject: ${item.subject}\nType: ${item.type}\nCategory: ${item.category}\nUploaded by: ${item.uploaderName}\n\n[This is a sample/demo file seeded for demonstration purposes.]`;
        const filename = createPlaceholderFile(item.title.replace(/[^a-z0-9]/gi, '_'), bodyText);
        return {
          title: item.title,
          type: item.type,
          category: item.category,
          subject: item.subject,
          description: item.description,
          tags: item.tags || [],
          filename,
          originalName: `${item.title.replace(/[^a-z0-9 ]/gi, '').substring(0, 40)}.pdf`,
          mimetype: 'application/pdf',
          size: Math.floor(Math.random() * 4000000) + 100000, // 100KB–4MB
          uploadedBy: uploaderId,
          uploaderName: item.uploaderName,
          downloadCount: Math.floor(Math.random() * 80),
          isApproved: true,
        };
      });
      await Content.insertMany(contentDocs);
      console.log(`✅ Seeded ${contentDocs.length} study materials`);
    }

    // ── Seed Events ──────────────────────────────────────────────────────────
    const existingEvents = await Event.countDocuments();
    if (existingEvents > 0) {
      console.log(`⚠️  Events already seeded (${existingEvents} docs). Skipping event seed.`);
    } else {
      console.log('📅 Seeding events...');
      const eventDocs = SAMPLE_EVENTS.map(ev => ({
        ...ev,
        organizer: uploaderId,
        attendees: [],
        isApproved: true,
        status: ev.status || (ev.date < new Date() ? 'past' : 'upcoming'),
      }));
      await Event.insertMany(eventDocs);
      console.log(`✅ Seeded ${eventDocs.length} events`);
    }

    console.log('\n🎉 Seed complete! Restart your frontend to see the data.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
