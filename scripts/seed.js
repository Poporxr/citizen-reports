const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  doc,
  setDoc,
  Timestamp,
} = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

// Load .env variables
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...vals] = trimmed.split("=");
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join("=").trim();
      }
    }
  });
}

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const now = Date.now();
const minute = 60 * 1000;
const hour = 60 * minute;
const day = 24 * hour;

// At least 3 incidents for each of the 6 categories (Accident, Fighting, Rioting, Fire, Theft, Other)
const seedIncidents = [
  // ── ACCIDENT (3) ──
  {
    id: "inc-acc-01",
    category: "Accident",
    title: "Two-vehicle collision near Modern Market junction",
    description:
      "A saloon car and a commercial minibus collided near the Modern Market roundabout. FRSC personnel and neighborhood volunteers are currently directing congested traffic. Commuters are advised to slow down.",
    locationName: "Modern Market, Makurdi",
    latitude: 7.7345,
    longitude: 8.5388,
    userName: "Emmanuel Aondohemba",
    userId: "seed-user-1",
    imageUrl:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
    offsetMs: 8 * minute,
  },
  {
    id: "inc-acc-02",
    category: "Accident",
    title: "Overturned cargo truck spilling grains along Old Bridge",
    description:
      "A heavy trailer carrying corn sacks lost balance on the curve near the toll bridge. One lane is completely obstructed while emergency towing crews work to hoist the container.",
    locationName: "Old Bridge, Makurdi",
    latitude: 7.7381,
    longitude: 8.5312,
    userName: "Kator Chia",
    userId: "seed-user-7",
    imageUrl:
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
    offsetMs: 6 * hour,
  },
  {
    id: "inc-acc-03",
    category: "Accident",
    title: "Tricycle hit-and-run incident at Wurukum roundabout",
    description:
      "A commercial Keke NAPEP was clipped by an unidentified SUV that drove off toward New Bridge. Passengers sustained minor bruises and were treated at a nearby clinic.",
    locationName: "Wurukum Roundabout, Makurdi",
    latitude: 7.7425,
    longitude: 8.5498,
    userName: "Iorwuese Tyav",
    userId: "seed-user-10",
    imageUrl:
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
    offsetMs: 18 * hour,
  },

  // ── FIGHTING (3) ──
  {
    id: "inc-fgt-01",
    category: "Fighting",
    title: "Clash between youth groups separated at North Bank park",
    description:
      "An intense argument over transport loading turns escalated into a physical brawl among commercial bus conductors. Community elders and local union leaders stepped in to defuse the situation.",
    locationName: "North Bank, Makurdi",
    latitude: 7.7562,
    longitude: 8.5418,
    userName: "Peter Agena",
    userId: "seed-user-4",
    imageUrl:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80",
    offsetMs: 1.5 * hour,
  },
  {
    id: "inc-fgt-02",
    category: "Fighting",
    title: "Dispute over commercial parking spaces settled peacefully",
    description:
      "Traders and taxi drivers exchanged heated arguments over parking slots in front of the shopping complex. Security guards restored order and demarcated parking boundaries.",
    locationName: "Otukpo Road, Makurdi",
    latitude: 7.7102,
    longitude: 8.5115,
    userName: "Solomon Kwaghtser",
    userId: "seed-user-12",
    imageUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
    offsetMs: 32 * hour,
  },
  {
    id: "inc-fgt-03",
    category: "Fighting",
    title: "Altercation between commuters and conductors at Wurukum flyover",
    description:
      "A disagreement over fare change turned into a scuffle near the flyover bus halt. Bystanders and traffic wardens intervened before any property damage occurred.",
    locationName: "Wurukum Flyover, Makurdi",
    latitude: 7.7441,
    longitude: 8.5482,
    userName: "Moses Igbana",
    userId: "seed-user-13",
    imageUrl:
      "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&q=80",
    offsetMs: 44 * hour,
  },

  // ── RIOTING (3) ──
  {
    id: "inc-riot-01",
    category: "Rioting",
    title: "Tension and road blockage near university main gate",
    description:
      "Students gathered outside the university main gate protesting power outages in residential hostels. Tires were lit earlier, but university management and student leaders are currently engaged in dialogue.",
    locationName: "BSU Gate, Makurdi",
    latitude: 7.7198,
    longitude: 8.5234,
    userName: "Daniel Iorpuu",
    userId: "seed-user-5",
    imageUrl:
      "https://images.unsplash.com/photo-1569098644584-210bcd375b59?w=800&q=80",
    offsetMs: 2.2 * hour,
  },
  {
    id: "inc-riot-02",
    category: "Rioting",
    title: "Fuel price protest outside filling station along New Bridge",
    description:
      "Commercial tricycle operators staged a demonstration outside a fuel station that allegedly refused to dispense fuel at official rates. Police units are on ground maintaining order.",
    locationName: "New Bridge Road, Makurdi",
    latitude: 7.7468,
    longitude: 8.5392,
    userName: "Terkimbi Udu",
    userId: "seed-user-14",
    imageUrl:
      "https://images.unsplash.com/photo-1572945753563-8049567811f4?w=800&q=80",
    offsetMs: 20 * hour,
  },
  {
    id: "inc-riot-03",
    category: "Rioting",
    title: "Market traders demonstration over stall levies peacefully dispersed",
    description:
      "Stall holders at Wadata Market held a brief walkout to protest unexpected municipal levy increments. Market union leaders have agreed to meet with local government officials.",
    locationName: "Wadata Market, Makurdi",
    latitude: 7.7291,
    longitude: 8.5085,
    userName: "Hembadoon Dondo",
    userId: "seed-user-15",
    imageUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
    offsetMs: 38 * hour,
  },

  // ── FIRE (3) ──
  {
    id: "inc-fire-01",
    category: "Fire",
    title: "Market stall fire controlled at Wurukum Market",
    description:
      "A fire broke out in a provision shop at Wurukum Market due to an electrical spark. Traders used dry powder extinguishers to contain it before the State Fire Service arrived. No casualties recorded.",
    locationName: "Wurukum Market, Makurdi",
    latitude: 7.7412,
    longitude: 8.5523,
    userName: "Grace Terhemba",
    userId: "seed-user-2",
    imageUrl:
      "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800&q=80",
    offsetMs: 25 * minute,
  },
  {
    id: "inc-fire-02",
    category: "Fire",
    title: "Bush fire encroaching farmland along Gboko road",
    description:
      "A fast-moving bush fire ignited by dry harmattan winds is threatening crop storehouses along Gboko road. Volunteers have dug firebreaks while alerting local authorities.",
    locationName: "Gboko Road, Benue",
    latitude: 7.5123,
    longitude: 8.8451,
    userName: "Terna Bem",
    userId: "seed-user-8",
    imageUrl:
      "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&q=80",
    offsetMs: 9 * hour,
  },
  {
    id: "inc-fire-03",
    category: "Fire",
    title: "Generator exhaust fire extinguished behind commercial plaza",
    description:
      "A heavy diesel generator exhaust pipe caught fire due to oil accumulation behind a shopping complex in High Level. Fire wardens suppressed the flames before it reached the main structure.",
    locationName: "High Level, Makurdi",
    latitude: 7.7265,
    longitude: 8.5178,
    userName: "Oche Joseph",
    userId: "seed-user-16",
    imageUrl:
      "https://images.unsplash.com/photo-1498084393753-b411b2d26b34?w=800&q=80",
    offsetMs: 28 * hour,
  },

  // ── THEFT (3) ──
  {
    id: "inc-thf-01",
    category: "Theft",
    title: "Handbag and phone snatching reported at High Level bus stop",
    description:
      "Two unidentified young men on an unmarked motorcycle snatched a commuter's handbag and iPhone at High Level bus stop. Police patrol has been informed and are surveying the corridor.",
    locationName: "High Level, Makurdi",
    latitude: 7.7289,
    longitude: 8.5165,
    userName: "Blessing Ode",
    userId: "seed-user-3",
    imageUrl:
      "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80",
    offsetMs: 45 * minute,
  },
  {
    id: "inc-thf-02",
    category: "Theft",
    title: "Attempted burglary at electronics shop thwarted by vigilante",
    description:
      "Local neighborhood watch officers caught two suspects trying to force open an electronics showroom shutter at 3 AM. The suspects were handed over to police command.",
    locationName: "Railway Station Area, Makurdi",
    latitude: 7.7245,
    longitude: 8.5309,
    userName: "Dooshima Akor",
    userId: "seed-user-9",
    imageUrl:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
    offsetMs: 14 * hour,
  },
  {
    id: "inc-thf-03",
    category: "Theft",
    title: "Motorcycle stolen from church premises during evening fellowship",
    description:
      "A red Bajaj Boxer motorcycle was removed from the parking lot in Judges Quarters. Anyone with leads is asked to contact the local division police station.",
    locationName: "Judges Quarters, Makurdi",
    latitude: 7.7088,
    longitude: 8.5221,
    userName: "Paul Agbo",
    userId: "seed-user-17",
    imageUrl:
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80",
    offsetMs: 30 * hour,
  },

  // ── OTHER (3) ──
  {
    id: "inc-oth-01",
    category: "Other",
    title: "Fallen high-tension pole blocking residential access road",
    description:
      "Heavy night rain and wind brought down a utility pole across the main residential avenue in Kanshio. Wires are live on the pavement. Residents are barricading the street until JED repairs it.",
    locationName: "Kanshio, Makurdi",
    latitude: 7.6987,
    longitude: 8.5142,
    userName: "Mercy Adzenga",
    userId: "seed-user-6",
    imageUrl:
      "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&q=80",
    offsetMs: 4 * hour,
  },
  {
    id: "inc-oth-02",
    category: "Other",
    title: "Flooding submerges drainage canal after flash rain",
    description:
      "A major drainage canal overflowed near Idye community causing waist-deep water on access walkways. Motorists are directed to use the higher bypass route.",
    locationName: "Idye, Makurdi",
    latitude: 7.7154,
    longitude: 8.5298,
    userName: "Aver Shima",
    userId: "seed-user-11",
    imageUrl:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&q=80",
    offsetMs: 26 * hour,
  },
  {
    id: "inc-oth-03",
    category: "Other",
    title: "Main water pipe rupture flooding walkway near low-cost housing",
    description:
      "A high-volume public water main burst along the sidewalk, causing substantial water wastage and muddying access to residential blocks. Water board engineers have been notified.",
    locationName: "Low Level, Makurdi",
    latitude: 7.7315,
    longitude: 8.5245,
    userName: "Terfa Gbande",
    userId: "seed-user-18",
    imageUrl:
      "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=800&q=80",
    offsetMs: 50 * hour,
  },
];

async function seed() {
  console.log("--------------------------------------------------");
  console.log("Seeding Firestore incidents collection...");
  console.log("Project ID:", firebaseConfig.projectId);
  console.log(`Adding ${seedIncidents.length} rich incident reports (3 per category)...`);
  console.log("--------------------------------------------------");

  let successCount = 0;
  for (const item of seedIncidents) {
    const { offsetMs, ...docData } = item;
    const docDate = new Date(now - offsetMs);
    const docRef = doc(collection(db, "incidents"), item.id);

    try {
      await setDoc(docRef, {
        ...docData,
        createdAt: Timestamp.fromDate(docDate),
      });
      successCount++;
      console.log(`✓ [${docData.category.padEnd(8)}] ${docData.title}`);
    } catch (err) {
      console.error(`✗ Error adding ${item.id}:`, err.message);
      if (
        err.message.includes("permission") ||
        err.message.includes("PERMISSION_DENIED")
      ) {
        console.log(
          "\n⚠️  FIRESTORE SECURITY RULES BLOCKED WRITING." +
            "\nPlease publish the rules from firestore.rules in Firebase Console, then run 'npm run seed' again."
        );
        process.exit(1);
      }
    }
  }

  console.log("--------------------------------------------------");
  console.log(
    `Seeding complete! Successfully seeded ${successCount} of ${seedIncidents.length} incidents.`
  );
  console.log("All 6 categories now have at least 3 rich community reports.");
  console.log("--------------------------------------------------");
  process.exit(0);
}

seed();
