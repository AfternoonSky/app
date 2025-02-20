import { proposalCard } from "#/views/components/labelCard";
import { getCachedPostEmbed } from "#/views/components/postEmbed";
import { Hole, html } from "#/lib/view";
import { shell } from "./shell";
import { Proposal, ProposalType } from "#/db/types";
import { AppContext } from "#/index";
import { feedButtons } from "../components/buttons";

export type FeedProposal = {
  rkey: string;
  uri: string;
  val: string;
  type: ProposalType;
  subject: string;
  voted: boolean;
  score: number;
  embed: Hole | undefined; // only on post labels
  handle: string | undefined; // only on users
  createdAt: string;
  indexedAt: string;
};

export async function feedProposalFromDB(
  p: Proposal,
  embed: string | undefined,
  alreadyVoted: { subject: string }[],
  scores: { [uri: string]: number },
  ctx: AppContext
): Promise<FeedProposal> {
  return {
    rkey: p.rkey,
    uri: p.uri,
    val: p.val,
    type: p.type,
    subject: p.subject,
    voted: alreadyVoted.some((v) => v.subject === p.uri),
    embed: embed
      ? // @ts-ignore
        html([embed])
      : p.type === ProposalType.POST_LABEL
        ? await getCachedPostEmbed(ctx, p.subject)
        : undefined,
    score: scores[p.uri] || 0,
    handle:
      p.type === ProposalType.ALLOWED_USER
        ? await ctx.resolver.resolveDidToHandle(p.subject)
        : undefined,
    createdAt: p.createdAt,
    indexedAt: p.indexedAt,
  };
}

type Props = {
  proposals: FeedProposal[];
  // didHandleMap: Record<string, string>;
  // profile: { displayName?: string };
  isMeta: boolean; // is the meta feed or not
};

export function home(props: Props) {
  return shell({ path: [], title: "Home", content: content(props) });
}

function content({ proposals, isMeta }: Props) {
  const pageName = isMeta ? "meta proposals" : "proposals";
  return html`
    <div class="container">
      ${feedButtons(pageName, isMeta)}
      <div class="feed">${feed(proposals)}</div>
    </div>
  `;
}

function toBskyLink(did: string) {
  return `https://bsky.app/profile/${did}`;
}

function feed(proposals: FeedProposal[]) {
  // returns a list of labels to vote on
  // TODO: add pagination, filters
  if (proposals.length === 0) {
    return html`<p class="empty-feed">
      Nothing to vote on right now. Create a proposal!
    </p>`;
  }
  return html`${proposals.map(proposalCard)}`;
}
