export type Experience = {
  id: string;
  category: "workshop" | "show";
  title: string;
  craftsman: string;
  image: string;
  price: number;
  duration: string;
  location: string;
  description: string;
  highlights: string[];
  craftsmanDetails: {
    name: string;
    experience: string;
    specialty: string;
  };
  schedule: { date: string; times: string[] }[];
};

export const workshops: Experience[] = [
  {
    id: "wood",
    category: "workshop",
    title: "Wood Craft Workshop",
    craftsman: "Master Wood Craftsman",
    image: "/story2.png",
    price: 4500,
    duration: "2 Hours",
    location: "Kandy Craft Studio",
    description: "Learn traditional Sri Lankan wood carving techniques.",
    highlights: [
      "Hands-on carving practice",
      "Kandyan motif history",
      "Finish a polished wooden keepsake",
    ],
    craftsmanDetails: {
      name: "Master Perera",
      experience: "25 years of traditional wood carving",
      specialty: "Temple panels & home decor",
    },
    schedule: [
      { date: "2026-06-05", times: ["09:00 AM", "11:00 AM", "02:00 PM"] },
      { date: "2026-06-07", times: ["09:00 AM", "01:00 PM"] },
      { date: "2026-06-10", times: ["11:00 AM", "02:00 PM"] },
    ],
  },
  {
    id: "brass",
    category: "workshop",
    title: "Brass Craft Workshop",
    craftsman: "Master Brass Craftsman",
    image: "/hero1.png",
    price: 5000,
    duration: "2 Hours",
    location: "Kandy Craft Studio",
    description: "Learn traditional brass crafting techniques.",
    highlights: [
      "Design your own brass artifact",
      "Learn polishing and finishing",
      "Discover Kandyan brass heritage",
    ],
    craftsmanDetails: {
      name: "Master Silva",
      experience: "20 years crafting ceremonial brassware",
      specialty: "Decorative bowls & ritual pieces",
    },
    schedule: [
      { date: "2026-06-06", times: ["10:00 AM", "01:00 PM"] },
      { date: "2026-06-09", times: ["09:00 AM", "12:00 PM"] },
      { date: "2026-06-12", times: ["11:00 AM", "03:00 PM"] },
    ],
  },
  {
    id: "mask",
    category: "workshop",
    title: "Mask Carving Workshop",
    craftsman: "Mask Artisan",
    image: "/hero1.png",
    price: 6000,
    duration: "3 Hours",
    location: "Kandy Craft Studio",
    description: "Traditional Sri Lankan mask carving experience.",
    highlights: [
      "Create a Kandyan mask",
      "Learn carving and painting",
      "Discover cultural symbolism",
    ],
    craftsmanDetails: {
      name: "Master Kumara",
      experience: "18 years making ceremonial masks",
      specialty: "Traditional mask carving",
    },
    schedule: [
      { date: "2026-06-08", times: ["09:00 AM", "02:00 PM"] },
      { date: "2026-06-11", times: ["10:00 AM", "01:00 PM"] },
      { date: "2026-06-14", times: ["11:00 AM", "03:00 PM"] },
    ],
  },
];

export const shows: Experience[] = [
  {
    id: "kandy-performance",
    category: "show",
    title: "Kandy Cultural Performance",
    craftsman: "Royal Dance Troupe",
    image: "/hall1.png",
    price: 2500,
    duration: "1.5 Hours",
    location: "Royal Pavilion",
    description: "Enjoy a colorful Kandyan show with traditional dance, drumming and cultural storytelling.",
    highlights: [
      "Live Kandyan dance",
      "Ceremonial drumming",
      "Cultural storytelling",
    ],
    craftsmanDetails: {
      name: "Royal Kandyan Troupe",
      experience: "Performers with decades of festival expertise",
      specialty: "Traditional Kandyan show performances",
    },
    schedule: [
      { date: "2026-06-05", times: ["06:00 PM", "08:00 PM"] },
      { date: "2026-06-07", times: ["06:00 PM"] },
      { date: "2026-06-09", times: ["07:00 PM"] },
    ],
  },
  {
    id: "heritage-procession",
    category: "show",
    title: "Heritage Procession Show",
    craftsman: "Kandyan Cultural Ensemble",
    image: "/hero1.png",
    price: 2200,
    duration: "1 Hour",
    location: "Temple Grounds",
    description: "Watch a vibrant procession of dancers, drummers and traditional performers.",
    highlights: [
      "Traditional procession",
      "Authentic costumes",
      "Live music",
    ],
    craftsmanDetails: {
      name: "Kandyan Ensemble",
      experience: "Masters of ceremonial procession arts",
      specialty: "Cultural pageantry and live music",
    },
    schedule: [
      { date: "2026-06-06", times: ["05:30 PM"] },
      { date: "2026-06-08", times: ["06:30 PM"] },
      { date: "2026-06-12", times: ["07:00 PM"] },
    ],
  },
];
