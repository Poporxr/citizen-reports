export type Category =
  | "Accident"
  | "Fighting"
  | "Rioting"
  | "Fire"
  | "Theft"
  | "Other";

export const categories: Category[] = [
  "Accident",
  "Fighting",
  "Rioting",
  "Fire",
  "Theft",
  "Other",
];

export const filterCategories = ["All", ...categories] as const;

export type Incident = {
  id: string;
  category: Category;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  time: string;
  reporter: string;
  image: string;
  active: boolean;
};

export const incidents: Incident[] = [
  {
    id: "1",
    category: "Accident",
    title: "Vehicle collision near city junction",
    description:
      "Two vehicles were involved in an accident near the main junction. Traffic is slow in both directions and bystanders are helping to clear the road.",
    location: "Makurdi, Benue",
    latitude: 7.7322,
    longitude: 8.5391,
    time: "10 mins ago",
    reporter: "Emmanuel Aondohemba",
    image: "https://picsum.photos/seed/collision/800/500",
    active: true,
  },
  {
    id: "2",
    category: "Fire",
    title: "Small fire reported at local market",
    description:
      "A small fire started at one of the stalls in the market. Traders are moving goods away from the area while help is on the way.",
    location: "Wurukum, Makurdi",
    latitude: 7.7401,
    longitude: 8.5512,
    time: "35 mins ago",
    reporter: "Grace Terhemba",
    image: "https://picsum.photos/seed/marketfire/800/500",
    active: true,
  },
  {
    id: "3",
    category: "Rioting",
    title: "Disturbance reported near university gate",
    description:
      "A group gathered near the university gate and the situation became tense. Residents are advised to use alternative routes for now.",
    location: "Makurdi",
    latitude: 7.7192,
    longitude: 8.5223,
    time: "1 hr ago",
    reporter: "Daniel Iorpuu",
    image: "https://picsum.photos/seed/gatecrowd/800/500",
    active: true,
  },
  {
    id: "4",
    category: "Theft",
    title: "Phone snatching reported along main road",
    description:
      "A commuter had a phone snatched close to the bus stop along the main road. Two suspects left on a motorcycle.",
    location: "High Level, Makurdi",
    latitude: 7.7285,
    longitude: 8.5148,
    time: "2 hrs ago",
    reporter: "Blessing Ode",
    image: "https://picsum.photos/seed/mainroad/800/500",
    active: false,
  },
  {
    id: "5",
    category: "Fighting",
    title: "Argument turned into a fight at bus park",
    description:
      "An argument between two men at the bus park escalated into a fight. Other passengers stepped in to separate them.",
    location: "North Bank, Makurdi",
    latitude: 7.7566,
    longitude: 8.5405,
    time: "4 hrs ago",
    reporter: "Peter Agena",
    image: "https://picsum.photos/seed/buspark/800/500",
    active: false,
  },
  {
    id: "6",
    category: "Other",
    title: "Fallen electric pole blocking a street",
    description:
      "A pole fell across a residential street after heavy wind. The wires are on the ground and people are avoiding the area.",
    location: "Gboko, Benue",
    latitude: 7.3369,
    longitude: 9.0011,
    time: "Yesterday",
    reporter: "Mercy Adzenga",
    image: "https://picsum.photos/seed/fallenpole/800/500",
    active: true,
  },
];

export const myReports: Incident[] = [incidents[0]!, incidents[3]!];

export function getIncidentById(id: string): Incident | undefined {
  return incidents.find((incident) => incident.id === id);
}
