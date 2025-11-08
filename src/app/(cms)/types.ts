export type Experience = {
  title: string;
  homepage: string;
  startDate: string;
  endDate?: string;
  metadataImage: string;
};

export type Documents = {
  experiences: Experience;
};
