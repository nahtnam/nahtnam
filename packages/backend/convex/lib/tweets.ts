type TweetUser = {
  screen_name: string;
};

export type Tweet = {
  __typename: "Tweet";
  id_str: string;
  in_reply_to_status_id_str?: string;
  text: string;
  user: TweetUser;
  [key: string]: unknown;
};

const TWEET_ID = /^\d+$/u;
const SYNDICATION_FEATURES = [
  "tfw_timeline_list:",
  "tfw_follower_count_sunset:true",
  "tfw_tweet_edit_backend:on",
  "tfw_refsrc_session:on",
  "tfw_fosnr_soft_interventions_enabled:on",
  "tfw_show_birdwatch_pivots_enabled:on",
  "tfw_show_business_verified_badge:on",
  "tfw_duplicate_scribes_to_settings:on",
  "tfw_use_profile_image_shape_enabled:on",
  "tfw_show_blue_verified_badge:on",
  "tfw_legacy_timeline_sunset:true",
  "tfw_show_gov_verified_badge:on",
  "tfw_show_business_affiliate_badge:on",
  "tfw_tweet_edit_frontend:on",
].join(";");

function getTweetToken(id: string) {
  return ((Number(id) / 1e15) * Math.PI).toString(36).replaceAll(/[0.]/gu, "");
}

function isTweet(value: unknown): value is Tweet {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Tweet>;
  return (
    candidate.__typename === "Tweet" &&
    typeof candidate.id_str === "string" &&
    typeof candidate.text === "string" &&
    typeof candidate.user?.screen_name === "string"
  );
}

export async function fetchTweetById(id: string) {
  if (id.length > 40 || !TWEET_ID.test(id)) {
    throw new Error(`Invalid tweet id: ${id}`);
  }

  const url = new URL("https://cdn.syndication.twimg.com/tweet-result");
  url.searchParams.set("id", id);
  url.searchParams.set("lang", "en");
  url.searchParams.set("features", SYNDICATION_FEATURES);
  url.searchParams.set("token", getTweetToken(id));

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch tweet ${id}: ${response.status}`);
  }

  const tweet: unknown = await response.json();

  if (!isTweet(tweet)) {
    throw new Error(`Tweet ${id} was not found`);
  }

  return tweet;
}
