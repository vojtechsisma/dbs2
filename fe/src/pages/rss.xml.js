import rss from "@astrojs/rss";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";

export async function GET(context) {
  const response = await fetch(`${import.meta.env.API_URL}/posts`);

  const posts = await response.json();

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.title,
      pubDate: post.createdAt,
      description: `${post.content
        .substring(0, post.content.length > 200 ? 200 : post.content.length)
        .replace(/([*_~\`#]|(?:\[(.*?)\]\(.*?\)))/g, "")}...`,
      link: `/post/${post.slug}`,
    })),
  });
}
