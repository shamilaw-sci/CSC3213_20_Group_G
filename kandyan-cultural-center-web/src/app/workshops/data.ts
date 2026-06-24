export type Experience = {
  id: string;
  category: "workshop";
  title: string;
  craftsman: string;
  image: string;
  gallery: string[];
  price: number;
  duration: string;
  location: string;
  description: string;
  highlights: string[];
};

export const workshops: Experience[] = [
  {
    id: "wood",
    category: "workshop",
    title: "Wood Craft Workshop",
    craftsman: "Master Wood Craftsman",
    image: "/story2.png",
    gallery: ["/story2.png", "/hero1.png", "/hero3.png"],
    price: 4500,
    duration: "2 Hours",
    location: "Kandy Craft Studio",
    description: "Experience hands-on Sri Lankan wood craft in a focused, expert-led session.",
    highlights: [
      "Hands-on carving practice",
      "Finish a custom wooden keepsake",
      "Learn Kandyan woodcraft traditions",
    ],
    
  },
];
