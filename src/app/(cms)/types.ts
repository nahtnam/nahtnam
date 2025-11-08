export type Experience = {
  title: string;
  homepage: string;
  startDate: string;
  endDate?: string;
  metadataImage: string;
};

type Post = {
  summary: string;
};

export type Documents = {
  experiences: Experience;
  posts: Post;
};
