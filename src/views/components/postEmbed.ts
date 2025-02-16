import { AppContext } from "#/index";
import { html } from "#/lib/view";

export async function embeddedPost(ctx: AppContext, uri: string) {
  const postId = uri.split("/").pop();
  if (!postId) return html`<p>Invalid post URI: ${uri}</p>`;
  const elId = `post-embed-${postId}`;
  const embedded = await getCachedPostEmbed(ctx, uri);
  return html` <div id="${elId}" class="post-embed">${embedded}</div> `;
}

function bskyUrl(atUri: string) {
  console.log("atUri: ", atUri);
  const pieces = atUri.split("/");
  const author = pieces[2];
  const postId = pieces[4];
  if (!author || !postId) throw new Error("Invalid bsky post URI");
  return `https://bsky.app/profile/${author}/post/${postId}`;
}

export async function getCachedPostEmbed(ctx: AppContext, uri: string) {
  ctx.logger.trace("checking for cached embed");
  const cached = await ctx.db
    .selectFrom("posts")
    .select("embed")
    .where("uri", "=", uri)
    .executeTakeFirst();

  // @ts-ignore
  if (cached) return html([cached.embed]);

  return await fetchAndCachePostEmbed(ctx, uri);
}

async function fetchAndCachePostEmbed(ctx: AppContext, uri: string) {
  try {
    const embed = await getPostEmbed(uri);
    await ctx.db
      .insertInto("posts")
      .values({ uri, embed })
      .onConflict((oc) => oc.column("uri").doUpdateSet({ embed }))
      .execute();

    // @ts-ignore
    return html([embed]);
  } catch (e) {
    ctx.logger.error(e);
    return html`<p>Failed to load post embed</p>`;
  }
}

async function getPostEmbed(uri: string) {
  const url = uri.startsWith("at://") ? bskyUrl(uri) : uri;
  console.log("fetching embed for url: ", url);
  const response = await fetch(
    `https://embed.bsky.app/oembed?url=${encodeURIComponent(url)}`
  );
  if (!response.ok) throw new Error("Failed to fetch embed");
  const json = await response.json();
  console.log("got embeddded post");
  return json.html as string;
}
