export const REGIONS = [
  { id: 1, name: "Auvergne-Rhône-Alpes" },
  { id: 2, name: "Bourgogne-Franche-Comté" },
  { id: 3, name: "Bretagne" },
  { id: 4, name: "Centre-Val de Loire" },
  { id: 5, name: "Corse" },
  { id: 6, name: "Grand Est" },
  { id: 7, name: "Hauts-de-France" },
  { id: 8, name: "Île-de-France" },
  { id: 9, name: "Normandie" },
  { id: 10, name: "Nouvelle-Aquitaine" },
  { id: 11, name: "Occitanie" },
  { id: 12, name: "Pays de la Loire" },
  { id: 13, name: "Provence-Alpes-Côte d'Azur" },
  { id: 14, name: "Guadeloupe" },
  { id: 15, name: "Martinique" },
  { id: 16, name: "Guyane" },
  { id: 17, name: "La Réunion" },
  { id: 18, name: "Mayotte" },
];

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
