/*
 * Portfolio content. Source of truth: file/Al_jabir_CV.pdf, CLAUDE.md, and the
 * supplied certificates/photographs. Do not add anything that is not backed by those.
 */

// Every image used on the site. Keys are referenced by the sections below.
// Photos: assets/img/photos/<id>-{640,1600}.webp
// Certificates: assets/img/certificates/<id>-{640,1800}.webp
const MEDIA = {
  // Project photographs
  "photo:project-biometric": {
    w: 960, h: 1280,
    alt: "Biometric attendance device with an LCD reading 'ESP Attendance' and a fingerprint sensor, in front of a monitor showing the web dashboard",
    caption: "Smart Biometric Attendance System: the fingerprint device and its web dashboard",
  },
  "photo:project-lfr": {
    w: 900, h: 1600,
    alt: "Close-ups of the line-following robot's circuit board and display, with firmware open on a laptop",
    caption: "PID-based line following robot: hardware and firmware",
  },
  "photo:project-robosoccer": {
    w: 960, h: 1280,
    alt: "Four-wheeled robo soccer robot with a metal front plate on a workbench",
    caption: "Robo soccer robot on the workbench",
  },
  "photo:project-iot-watch": {
    w: 958, h: 1280,
    alt: "Phone showing live temperature (34.2 °C) and humidity (42.3 %) readings next to the sensor hardware and code on a laptop",
    caption: "Environmental monitoring prototype streaming temperature and humidity to a phone",
  },

  // Competitions
  "photo:uiu-cse-fest-lfr-run": {
    w: 1600, h: 1066,
    alt: "Al Jabir crouching to place his line-following robot on the track at UIU CSE Fest 2025 while an organizer watches",
    caption: "Placing the line-following robot on the track at UIU CSE Fest 2025",
  },
  "photo:uiu-cse-fest-lfr": {
    w: 1600, h: 1200,
    alt: "Al Jabir in a UIU CSE Fest shirt holding up his line-following robot outside the venue",
    caption: "With the line-following robot at UIU CSE Fest",
  },
  "photo:cybernauts-2026": {
    w: 1200, h: 1600,
    alt: "Al Jabir holding his robo soccer robot in front of the NSUCEC Cybernauts 2026 backdrop",
    caption: "With the robo soccer robot at NSUCEC Cybernauts 2026",
  },

  // Leadership & events
  "photo:bear-summit": {
    w: 1280, h: 960,
    alt: "Al Jabir pointing at the campus ambassador photo wall at BEAR Summit 2026",
    caption: "BEAR Summit 2026, National Semiconductor Symposium",
  },
  "photo:eee-club-tournament": {
    w: 1600, h: 1067,
    alt: "Students and faculty at a tournament prize-giving table with trophies and medals",
    caption: "Tournament prize-giving with the EEE Club",
  },
  "photo:ybf-summer-camp-2024": {
    w: 1600, h: 1066,
    alt: "Large group of participants holding the Summer Camp banner of Youth for Better Future Society",
    caption: "Summer Camp 2024 by Youth for Better Future Society",
  },
  "photo:human-rights-day": {
    w: 1200, h: 1600,
    alt: "Al Jabir holding an HRSS placard about protecting children's rights during a Human Rights Day rally",
    caption: "Human Rights Day observance with HRSS",
  },

  // Seminars & industrial visits
  "photo:dtca-session": {
    w: 1600, h: 1200,
    alt: "Conference room with participants seated around tables during the DTCA session",
    caption: "DTCA session on modernizing Greater Dhaka's transportation system",
  },
  "photo:mirpur-grid-visit": {
    w: 1600, h: 1200,
    alt: "Group of students and engineers in hard hats in front of transformers at the Mirpur grid substation",
    caption: "Industrial visit to the Mirpur 132/33 kV grid substation",
  },
  "photo:energypac-visit": {
    w: 1600, h: 1200,
    alt: "Al Jabir standing in front of a large Energypac transformer tank at the factory",
    caption: "Industrial visit to Energypac's transformer manufacturing facility",
  },

  // Certificates
  "cert:ieee-secretary": {
    w: 1144, h: 807, file: "Certificate_image/Secretary_IEEE_SB.png",
    alt: "IEEE volunteering certificate naming Al Jabir as Secretary, Manarat International University, Jul 2025 to Apr 2026",
    caption: "Certificate of IEEE Volunteering: Secretary, Jul 2025 – Apr 2026",
  },
  "cert:bear-summit-ca": {
    w: 1800, h: 1266, file: "Certificate_image/Bear_summit_CA.jpg",
    alt: "Certificate of Appreciation from the National Semiconductor Symposium and BEAR Summit 2026 for serving as a BEAR Patron (Campus Ambassador)",
    caption: "Certificate of Appreciation: BEAR Patron (Campus Ambassador), BEAR Summit 2026",
  },
  "cert:phitron-ca": {
    w: 1080, h: 1080, file: "Certificate_image/pitron_CA.jpg",
    alt: "Phitron campus ambassador card for Al Jabir, BSc in EEE, Manarat International University",
    caption: "Phitron Campus Ambassador card",
  },
  "cert:judge-ismail-al-jazari": {
    w: 1800, h: 1261, file: "Certificate_image/Judge_ismail_al_jazari_robotics_fest.jpg",
    alt: "Honored Judge certificate of appreciation from the Ismail Al-Jazari Robotics Fest 2025",
    caption: "Certificate of Appreciation: Judge, Ismail Al-Jazari Robotics Fest 2025",
  },
  "cert:rookie-code-clash": {
    w: 1800, h: 1276, file: "Certificate_image/Rokie_programming_contest.jpg",
    alt: "Certificate of Achievement for 18th place in The Rookie Code Clash programming contest, September 25, 2024",
    caption: "Certificate of Achievement: 18th place, The Rookie Code Clash",
  },
  "cert:aspire-leadership": {
    w: 993, h: 765, file: "Certificate_image/Online_leadership_course.png",
    alt: "Aspire Institute certificate for completing the Online Leadership Course, a component of the Aspire Leaders Program, June 2023",
    caption: "Aspire Institute: Online Leadership Course, June 2023",
  },
  "cert:hp-life-effective-presentations": {
    w: 1200, h: 847, file: "Certificate_image/Effective_presentatio_HP.png",
    alt: "HP LIFE certificate of completion for the Effective Presentations online course, presented 3/30/2023",
    caption: "HP LIFE: Effective Presentations, certificate of completion",
  },
  "cert:plc-workshop": {
    w: 1800, h: 1263, file: "Certificate_image/PLC_workshop.jpg",
    alt: "AdvanTEK BD certificate of participation in the workshop Empowering Industrial Automation with PLC Technology, 7 December 2024",
    caption: "AdvanTEK BD: Empowering Industrial Automation with PLC Technology",
  },
  "cert:antenna-cst-workshop": {
    w: 1800, h: 1324, file: "Certificate_image/Workshop_antena_design.jpg",
    alt: "Manarat International University certificate for the workshop Antenna Design Using CST Microwave Studio, 3 December 2022",
    caption: "Workshop: Antenna Design Using CST Microwave Studio",
  },
  "cert:cyber-security-seminar": {
    w: 1800, h: 1371, file: "Certificate_image/seminer_on_digital_and_cybersecurity.jpg",
    alt: "Certificate of participation in the Seminar on Digital & Cyber Security, International Fire, Safety & Security Expo 2022",
    caption: "Seminar on Digital & Cyber Security, International Fire, Safety & Security Expo 2022",
  },
  "cert:engineering-summit-ybf": {
    w: 1800, h: 1365, file: "Certificate_image/engineering_summit_YBF.JPG",
    alt: "Certificate of participation for attending the Engineering Summit 2023 organized by Youth for Better Future Society",
    caption: "Engineering Summit 2023, Youth for Better Future Society",
  },
  "cert:mirpur-grid-visit": {
    w: 1800, h: 1274, file: "Certificate_image/Industrial_visit_mirpur_grid.jpg",
    alt: "Power Grid Company of Bangladesh certificate for participating in the industrial tour at Mirpur 132/33 kV Grid Substation, 22 October 2023",
    caption: "Industrial tour certificate: Mirpur 132/33 kV Grid Substation",
  },
  "cert:nsu-tech-fest": {
    w: 1800, h: 1273, file: "Certificate_image/NSU_tech_fest.jpg",
    alt: "NSU Tech Fest 2025 certificate for participation in the Robo Soccer tournament",
    caption: "NSU Tech Fest 2025: Robo Soccer participation",
  },
  "cert:bracu-traction": {
    w: 1800, h: 1255, file: "Certificate_image/BRACU_traction.jpg",
    alt: "Certificate of participation in the RoboStrikers segment of Traction, organized by the Robotics Club of BRAC University",
    caption: "Traction, BRAC University: RoboStrikers participation",
  },
};

const PROJECTS = [
  {
    id: "biometric",
    title: "Smart Biometric Attendance System",
    category: "Embedded · IoT · Web",
    summary:
      "A complete biometric attendance solution built for a company, combining an ESP32 fingerprint device with a web dashboard and local data storage.",
    tech: ["ESP32", "Fingerprint device", "Web dashboard", "Local data storage"],
    features: [
      "Employee check-in and check-out by fingerprint",
      "Holiday management",
      "Overtime calculation",
      "Attendance summaries",
      "Customizable settings",
      "Long-term storage of up to 12 months of attendance data",
    ],
    media: ["photo:project-biometric"],
    featured: true,
  },
  {
    id: "firefighting",
    title: "Firefighting Robot",
    category: "Robotics · Embedded",
    summary:
      "An autonomous firefighting robot that uses IR sensors to detect fire and location conditions and initiate the appropriate action.",
    tech: ["IR sensors", "Embedded control", "Autonomous movement"],
    features: [
      "Sensor-based fire and location detection",
      "Automated movement toward the detected condition",
      "Real-time response without manual control",
    ],
    media: [],
    icon: "flame",
    // To add a video: "assets/video/firefighting-robot.mp4"
    video: null,
  },
  {
    id: "lfr",
    title: "PID-Based Line Following Robot",
    category: "Robotics · Control",
    summary:
      "A PID-controlled line-following robot with an integrated display for real-time monitoring and on-device tuning.",
    tech: ["PID control", "Integrated display", "On-device calibration"],
    features: [
      "Configurable PID parameters edited directly on the robot",
      "Calibration for improved tracking accuracy",
      "Real-time monitoring on the built-in display",
      "Tuned for stable line tracking",
    ],
    media: ["photo:project-lfr", "photo:uiu-cse-fest-lfr-run", "photo:uiu-cse-fest-lfr"],
  },
  {
    id: "robosoccer",
    title: "Robo Soccer Robot",
    category: "Robotics",
    summary:
      "A remotely controlled soccer robot with adjustable speed, built for responsive, competitive gameplay.",
    tech: ["Remote control", "Motor control", "Speed control"],
    features: [
      "Adjustable speed",
      "Optimized motor control for fast movement",
      "Accurate direction changes",
      "Competed in NSU Tech Fest, BRAC University Traction and Cybernauts 2026",
    ],
    media: ["photo:project-robosoccer", "photo:cybernauts-2026"],
  },
  {
    id: "iot-watch",
    title: "IoT-Enabled Environmental Monitoring Watch",
    category: "IoT · Wearable",
    summary:
      "A wearable IoT device that uses environmental sensors and Wi-Fi connectivity to monitor surrounding conditions in real time.",
    tech: ["Environmental sensors", "Wi-Fi", "Embedded hardware"],
    features: [
      "Environmental sensor data collection",
      "Wireless communication over Wi-Fi",
      "Real-time monitoring from a phone",
    ],
    media: ["photo:project-iot-watch"],
  },
  {
    id: "drone",
    title: "Custom-Built Drone",
    category: "Hardware · UAV",
    summary:
      "A custom drone designed, assembled and tested at university.",
    tech: ["Hardware integration", "Flight control", "Testing"],
    features: [
      "Design and assembly of the airframe and electronics",
      "Hardware integration",
      "Flight control work",
      "Testing and performance optimization",
    ],
    media: [],
    icon: "drone",
    // To add a video: "assets/video/custom-drone.mp4"
    video: null,
  },
];

const WORK = [
  {
    role: "Technical Support & IT Assistant",
    org: "Smart Solution",
    period: "2020 – 2021",
    points: [
      "Computer hardware and software setup, troubleshooting and technical support.",
      "CCTV installation and configuration for government and private organizations.",
      "System setup and maintenance across multiple client sites.",
    ],
  },
];

const LEADERSHIP = [
  {
    role: "Founding General Secretary",
    org: "IEEE Manarat International University Student Branch",
    period: "2025 – 2026",
    points: [
      "Co-founded and helped establish the IEEE Student Branch.",
      "Organized research seminars and technical workshops to promote research and engineering activities.",
    ],
    evidence: ["cert:ieee-secretary"],
  },
  {
    role: "IT & PR Secretary",
    org: "Youth for Sustainable Future Society (YSF)",
    period: "2025 – 2026",
    points: [
      "Developed and maintained websites for organizational activities.",
      "Organized IT training programs and supported digital communication and promotion.",
    ],
  },
  {
    role: "Campus Ambassador",
    org: "Phitron",
    period: "2025",
    points: [
      "Promoted programming and competitive programming among university students.",
      "Encouraged students to take part in programming learning and skill development.",
    ],
    evidence: ["cert:phitron-ca"],
  },
  {
    role: "Campus Ambassador",
    org: "BEAR Summit · National Semiconductor Symposium",
    period: "2026",
    points: [
      "Supported event organization and coordination.",
      "Helped engage students and faculty in a national-level event.",
    ],
    evidence: ["cert:bear-summit-ca", "photo:bear-summit"],
  },
  {
    role: "Executive Member",
    org: "EEE Club",
    period: "2024 – 2025",
    points: [
      "Helped organize seminars, industrial visits, football and cricket tournaments, and student activities.",
    ],
    evidence: ["photo:eee-club-tournament"],
  },
  {
    role: "Campus Secretary",
    org: "Youth for Better Future (YBF)",
    period: "2024 – 2025",
    points: [
      "Organized training sessions, training camps, sports tournaments and blood donation programs.",
    ],
    evidence: ["photo:ybf-summer-camp-2024"],
  },
];

const ACHIEVEMENTS = [
  {
    kind: "Judging",
    title: "Robotics Fest Judge",
    org: "Ismail Al-Jazari Robotics Fest 2025",
    metric: "300+",
    metricLabel: "participants evaluated",
    text: "Evaluated participants across multiple robotics competition categories.",
    evidence: ["cert:judge-ismail-al-jazari"],
  },
  {
    kind: "Judging",
    title: "Science Fest Judge",
    org: "Al-Khawarizmi Science Fest",
    metric: "150+",
    metricLabel: "project groups · 600+ students",
    text: "Evaluated science project groups.",
  },
  {
    kind: "Programming",
    title: "Rookie Code Clash",
    org: "Youth for Better Future Society",
    metric: "5th",
    metricLabel: "place in the final",
    text: "Placed 18th in the preliminary round and 5th in the final.",
    evidence: ["cert:rookie-code-clash"],
  },
  {
    kind: "Programming",
    title: "Competitive Programming",
    org: "Codeforces · LeetCode · HackerRank",
    metric: "700+",
    metricLabel: "problems solved",
    text: "Problems solved across competitive programming platforms.",
  },
  {
    kind: "Leadership training",
    title: "Online Leadership Training",
    org: "Aspire Institute",
    text: "Completed the Online Leadership Course of the Aspire Leaders Program, featuring sessions by Harvard Business School faculty.",
    evidence: ["cert:aspire-leadership"],
  },
];

const ACTIVITIES = [
  {
    id: "seminars",
    label: "Seminars & Conferences",
    items: [
      {
        title: "Special One-Day Session on Modernizing Greater Dhaka's Transportation System",
        org: "DTCA",
        text: "Shared ideas and proposed solutions for modernizing and improving the capital's transportation system.",
        evidence: ["photo:dtca-session"],
      },
      {
        title: "Seminar on Digital & Cyber Security",
        org: "International Fire, Safety & Security Expo 2022",
        date: "26 Nov 2022",
        evidence: ["cert:cyber-security-seminar"],
      },
      {
        title: "3rd Engineering Summit",
        org: "Youth for Better Future (YBF)",
        date: "3 Mar 2023",
        evidence: ["cert:engineering-summit-ybf"],
      },
    ],
  },
  {
    id: "workshops",
    label: "Workshops & Training",
    items: [
      {
        title: "Industrial Automation with PLC Technology",
        org: "AdvanTEK BD",
        date: "7 Dec 2024",
        text: "Hands-on training in PLC-based industrial automation.",
        evidence: ["cert:plc-workshop"],
      },
      {
        title: "Antenna Design Using CST Microwave Studio",
        org: "Dept. of EEE, Manarat International University",
        date: "3 Dec 2022",
        text: "Hands-on antenna modeling and design using CST Microwave Studio.",
        evidence: ["cert:antenna-cst-workshop"],
      },
      {
        title: "Effective Presentations",
        org: "HP LIFE · HP Foundation",
        date: "30 Mar 2023",
        text: "Online course on tailoring information to an audience and delivering persuasive, well-designed presentations.",
        evidence: ["cert:hp-life-effective-presentations"],
      },
    ],
  },
  {
    id: "visits",
    label: "Industrial Visits",
    items: [
      {
        title: "Mirpur 132/33 kV Grid Substation",
        org: "Organized by MIU EEE Club",
        date: "22 Oct 2023",
        text: "Observed power transmission, grid infrastructure and substation operations.",
        evidence: ["photo:mirpur-grid-visit", "cert:mirpur-grid-visit"],
      },
      {
        title: "Energypac",
        org: "Transformer manufacturing facility",
        text: "Visited the transformer manufacturing facilities and observed the production process.",
        evidence: ["photo:energypac-visit"],
      },
    ],
  },
  {
    id: "competitions",
    label: "Competitions & Technical Engagements",
    items: [
      {
        title: "UIU CSE Fest",
        org: "Line Following Robot (LFR)",
        text: "Participated in the line-following robot competition.",
        evidence: ["photo:uiu-cse-fest-lfr-run", "photo:uiu-cse-fest-lfr"],
      },
      {
        title: "NSU Tech Fest 2025",
        org: "Robo Soccer",
        text: "Participated in the robo soccer competition.",
        evidence: ["cert:nsu-tech-fest"],
      },
      {
        title: "BRAC University Traction",
        org: "Robo Soccer (RoboStrikers)",
        text: "Participated in the robo soccer competition.",
        evidence: ["cert:bracu-traction"],
      },
      {
        title: "Cybernauts 2026",
        org: "Robo Soccer",
        text: "Participated in the robo soccer competition.",
        evidence: ["photo:cybernauts-2026"],
      },
    ],
  },
];

const GALLERY_CATEGORIES = ["Projects", "Competitions", "Leadership", "Seminars", "Industrial Visits", "Events"];

const GALLERY = [
  { media: "photo:uiu-cse-fest-lfr-run", category: "Competitions", feature: true },
  { media: "photo:project-biometric", category: "Projects" },
  { media: "photo:cybernauts-2026", category: "Competitions" },
  { media: "photo:bear-summit", category: "Leadership" },
  { media: "photo:project-lfr", category: "Projects" },
  { media: "photo:dtca-session", category: "Seminars" },
  { media: "photo:mirpur-grid-visit", category: "Industrial Visits", feature: true },
  { media: "photo:eee-club-tournament", category: "Leadership" },
  { media: "photo:project-iot-watch", category: "Projects" },
  { media: "photo:energypac-visit", category: "Industrial Visits" },
  { media: "photo:uiu-cse-fest-lfr", category: "Competitions" },
  { media: "photo:ybf-summer-camp-2024", category: "Events" },
  { media: "photo:project-robosoccer", category: "Projects" },
  { media: "photo:human-rights-day", category: "Events" },
];

const DOCUMENT_CATEGORIES = ["Leadership", "Achievements", "Competitions", "Workshops & Training", "Seminars", "Industrial Visits"];

const DOCUMENTS = [
  { media: "cert:ieee-secretary", title: "IEEE Volunteering: Secretary", org: "IEEE · Manarat International University", date: "Jul 2025 – Apr 2026", type: "Certificate", category: "Leadership" },
  { media: "cert:bear-summit-ca", title: "BEAR Patron (Campus Ambassador)", org: "National Semiconductor Symposium & BEAR Summit 2026", date: "2026", type: "Certificate of Appreciation", category: "Leadership" },
  { media: "cert:phitron-ca", title: "Campus Ambassador", org: "Phitron", date: "2025", type: "Ambassador card", category: "Leadership" },
  { media: "cert:judge-ismail-al-jazari", title: "Honored Judge", org: "Ismail Al-Jazari Robotics Fest 2025", date: "13 Nov 2025", type: "Certificate of Appreciation", category: "Achievements" },
  { media: "cert:rookie-code-clash", title: "18th Place, The Rookie Code Clash", org: "Youth for Better Future Society", date: "25 Sep 2024", type: "Certificate of Achievement", category: "Achievements" },
  { media: "cert:aspire-leadership", title: "Online Leadership Course", org: "Aspire Institute · Aspire Leaders Program", date: "Jun 2023", type: "Certificate", category: "Achievements" },
  { media: "cert:nsu-tech-fest", title: "Robo Soccer", org: "NSU Tech Fest 2025", date: "2025", type: "Certificate of Participation", category: "Competitions" },
  { media: "cert:bracu-traction", title: "RoboStrikers", org: "Traction · Robotics Club of BRAC University", type: "Certificate of Participation", category: "Competitions" },
  { media: "cert:plc-workshop", title: "Industrial Automation with PLC Technology", org: "AdvanTEK BD", date: "7 Dec 2024", type: "Certificate of Participation", category: "Workshops & Training" },
  { media: "cert:antenna-cst-workshop", title: "Antenna Design Using CST Microwave Studio", org: "Dept. of EEE, Manarat International University", date: "3 Dec 2022", type: "Certificate of Participation", category: "Workshops & Training" },
  { media: "cert:hp-life-effective-presentations", title: "Effective Presentations", org: "HP LIFE · HP Foundation", date: "30 Mar 2023", type: "Certificate of Completion", category: "Workshops & Training" },
  { media: "cert:cyber-security-seminar", title: "Seminar on Digital & Cyber Security", org: "International Fire, Safety & Security Expo 2022", date: "26 Nov 2022", type: "Certificate of Participation", category: "Seminars" },
  { media: "cert:engineering-summit-ybf", title: "Engineering Summit 2023", org: "Youth for Better Future Society", date: "3 Mar 2023", type: "Certificate of Participation", category: "Seminars" },
  { media: "cert:mirpur-grid-visit", title: "Industrial Tour: Mirpur 132/33 kV Grid Substation", org: "Power Grid Company of Bangladesh · MIU EEE Club", date: "22 Oct 2023", type: "Certificate of Participation", category: "Industrial Visits" },
];
