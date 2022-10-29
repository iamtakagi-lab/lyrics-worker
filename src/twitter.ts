import { TwitterApi } from "twitter-api-v2";

export const updateAccountProfile = async (description: string) => {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_CK ?? "",
    appSecret: process.env.TWITTER_CS ?? "",
    accessToken: process.env.TWITTER_AT ?? "",
    accessSecret: process.env.TWITTER_ATS ?? "",
  });

  return await client.v1.updateAccountProfile({
    description,
  });
};
