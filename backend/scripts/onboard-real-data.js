/**
 * Real Data Onboarding Script — Platform Activation
 * Populates realistic academic documents, events, and forum posts.
 * Run: node scripts/onboard-real-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const Content = require('../models/Content');
const Event = require('../models/Event');
const Post = require('../models/Post');
const User = require('../models/User');
const aiService = require('../utils/aiService');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ─── Real-World Academic Documents ──────────────────────────────────────────

const REAL_DOCS = [
  {
    title: "CS-301: Advanced Algorithms & Data Structures",
    type: "Syllabus",
    category: "Academic",
    subject: "Computer Science",
    description: "Course syllabus covering Big-O analysis, graph algorithms (Dijkstra, A*), dynamic programming, and red-black trees.",
    content: `Course: CS-301 Advanced Algorithms
Instructor: Dr. Sarah Mitchell
Semester: Spring 2026

Prerequisites: 
- Proficiency in C++ or Java
- Completion of CS-101 (Intro to CS) and CS-201 (Basic Data Structures)

Learning Objectives:
1. Master complexity analysis (Time & Space) using Big-O, Big-Theta, and Big-Omega.
2. Implement and optimize advanced Data Structures: AVL Trees, B-Trees, and Graphs.
3. Apply Dynamic Programming to solve complex optimization problems like Knapsack and LCS.
4. Understand Graph Theory: DFS, BFS, Dijkstra's Shortest Path, and Kruskal's MST.

Grade Breakdown:
- Assignments: 40%
- Midterm: 25%
- Final Project: 35%
`
  },
  {
    title: "Applied Physics Lab Manual: Electromagnetic Wave Propagation",
    type: "Resource",
    category: "Technical",
    subject: "Physics",
    description: "Standard lab procedures for measuring wave interference and signal attenuation in various mediums.",
    content: `Applied Physics II - Lab Manual
Experiment #4: Electromagnetic Wave Interference

Objective:
To determine the wavelength of a microwave source using Michelson Interferometry and calculate the refractive index of glass at microwave frequencies.

Materials:
- Microwave transmitter (10GHz)
- Receiver with digital multimeter
- Fixed and movable metal mirrors
- Glass slab (10cm thickness)

Procedure:
1. Align the transmitter and receiver on the main optical bench.
2. Set up the beam splitter at a 45-degree angle.
3. Measure the initial intensity peaks.
4. Slowly move the reflecting mirror and record the position of every 5th maximum.
5. Insert the glass slab and calculate the phase shift.

Safety Note:
Do not look directly into the microwave transmitter aperture during operation.
`
  },
  {
    title: "Calculus III: Vector Analysis Lecture Notes",
    type: "Notes",
    category: "Academic",
    subject: "Mathematics",
    description: "Deep dive into Gradient, Divergence, and Curl with applications to Maxwell's Equations.",
    content: `Calculus III - Weekly Notes - Unit 5: Vector Calculus

Key Concepts:

1. The Gradient (∇f):
   Represents the direction and rate of fastest increase of a scalar field.
   Formula: ∇f = (∂f/∂x)i + (∂f/∂y)j + (∂f/∂z)k

2. Divergence (∇ · F):
   A measure of a vector field's "source" or "sink" at a given point.
   Application: Gauss's Law in Electromagnetism.

3. Curl (∇ × F):
   Represents the rotation or "circulation" of a vector field.
   Conservative fields have Curl = 0.

Important Theorems:
- Green's Theorem: Relates a line integral around a closed curve to a double integral over a plane region.
- Stokes' Theorem: A 3D generalization of Green's theorem.
`
  }
];

const REAL_EVENTS = [
  {
    title: "Smart Campus Hackathon 2026",
    description: "Join 300+ students for a 36-hour sprint to build AI-driven solutions for campus sustainability and automation. Prizes worth $5,000!",
    category: "Technical", date: new Date(Date.now() + 14 * 86400000), time: "09:00 AM",
    location: "Main Engineering Block", image: "🤖", maxAttendees: 300
  },
  {
    title: "Alumni Career Panel: Breaking into FAANG",
    description: "Learn from senior engineers at Google, Amazon, and Meta. Tips on technical interviews, system design, and resume building.",
    category: "Placement", date: new Date(Date.now() + 5 * 86400000), time: "05:30 PM",
    location: "Student Center Auditorium", image: "💼", maxAttendees: 200
  },
  {
    title: "Annual Cultural Jam & Talent Quest",
    description: "An evening of music, dance, and stand-up comedy. Showcase your talent and enjoy local food stalls.",
    category: "Cultural", date: new Date(Date.now() + 21 * 86400000), time: "06:00 PM",
    location: "Open Air Theatre", image: "🎭", maxAttendees: 1000
  }
];

const REAL_POSTS = [
  {
    title: "Any tips for the CS-301 Midterm?",
    content: "Hey seniors! I'm struggling with Dynamic Programming concepts for the upcoming Algorithms midterm. Any specific problems or resources you recommend?",
    category: "Academic", tags: ["CS", "Algorithms", "StudyHelp"]
  },
  {
    title: "Found a lost ID card in the Cafe",
    content: "Found a student ID card belonging to 'Marcus Aurelius' near the coffee counter. I've handed it over to the Security Desk in the Admin Block.",
    category: "General", tags: ["LostAndFound", "Campus"]
  },
  {
    title: "Project Partners for AI Workshop",
    content: "Looking for 2 more members for the 'Smart Campus' Hackathon team. Need someone familiar with React and another with Python/FastAPI. PM me!",
    category: "Tech", tags: ["Hackathon", "Collaboration"]
  }
];

async function onboard() {
  try {
    console.log('🚀 Activating Platform with Real Data...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ Error: No admin user found. Create one first.');
      process.exit(1);
    }
    const adminId = admin._id;
    console.log(`👤 Using Admin: ${admin.name} (${admin.email})`);

    // 1. Onboard Content
    console.log('📄 Processing Academic Documents (AI indexing enabled)...');
    for (const doc of REAL_DOCS) {
      const filename = `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, doc.content);

      console.log(`   🧠 Analyzing: ${doc.title}...`);
      const summary = await aiService.generateSummary(doc.content);
      const embedding = await aiService.getEmbedding(doc.content);

      const content = new Content({
        ...doc,
        filename,
        originalName: `${doc.title}.txt`,
        mimetype: 'text/plain',
        size: Buffer.byteLength(doc.content),
        uploadedBy: adminId,
        uploaderName: admin.name,
        extractedText: doc.content,
        summary,
        embedding,
        isApproved: true
      });
      await content.save();
    }

    // 2. Onboard Events
    console.log('📅 Seeding Campus Events...');
    const eventDocs = REAL_EVENTS.map(ev => ({
      ...ev,
      organizer: adminId,
      organizerName: admin.name,
      isApproved: true,
      status: 'upcoming'
    }));
    await Event.insertMany(eventDocs);

    // 3. Onboard Posts
    console.log('💬 Seeding Community Posts...');
    for (const postData of REAL_POSTS) {
       const post = new Post({
         ...postData,
         userId: adminId,
         isApproved: true
       });
       await post.save();
    }

    console.log('\n🎉 ALL MODULES ACTIVATED! Platform populated with real-world data.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Onboarding failed:', err);
    process.exit(1);
  }
}

onboard();
