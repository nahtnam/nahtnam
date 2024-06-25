export type ProjectCardData = {
  name: string;
  imageSrc?: string;
  url: string;
};
export const projectCards = [
  {
    name: "ShipZen",
    url: "https://www.shipzen.dev",
  },
  {
    name: "Caddie",
    url: "https://www.caddiedash.com",
  },
  {
    name: "CostPerUse",
    url: "https://www.costperuse.com",
  },
] satisfies ProjectCardData[];
