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
  latitude: number | null;
  longitude: number | null;
  time: string;
  reporter: string;
  image: string;
  active: boolean;
};
