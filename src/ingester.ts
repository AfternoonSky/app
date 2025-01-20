import type { IdResolver } from "@atproto/identity";
import {
  type CommitCreateEvent,
  type CommitUpdateEvent,
  Jetstream,
} from "@skyware/jetstream";

import pino from "pino";
import type { Database } from "#/db/db";
import {
  type Record as Label,
  isRecord as isLabel,
  validateRecord as validateLabel,
} from "#/lexicon/types/social/pmsky/label";
import {
  isRecord,
  validateRecord,
  Record as Vote,
} from "#/lexicon/types/social/pmsky/vote";
import { env } from "./lib/env";

const COM_ATPROTO_LABEL = "com.atproto.label.defs#label";
const SOCIAL_PMSKY_VOTE = "social.pmsky.vote";
const ALL_SOCIAL_PMSKY_RECORDS = "social.pmsky.*";
const DESIRED_COLLECTIONS = [
  // COM_ATPROTO_LABEL,
  SOCIAL_PMSKY_VOTE,
];

export function createIngester(db: Database, idResolver: IdResolver) {
  const logger = pino({ name: "firehose ingestion" });
  if (!env.PUBLISH_TO_ATPROTO) {
    logger.warn("PUBLISH_TO_ATPROTO off, not running ingester");
    return;
  }
  const jetstream = new Jetstream({
    wantedCollections: DESIRED_COLLECTIONS,
    wantedDids: [env.SVC_ACT_DID],
    cursor: new Date("2025-01-19").getTime(),
  });

  jetstream.on("open", () => {
    logger.info("jetstream opened");
  });

  jetstream.on("error", (err) => {
    logger.error(err, "jetstream error");
  });

  jetstream.onCreate(COM_ATPROTO_LABEL, async (evt) => {
    if (
      isLabel(evt.commit.record) &&
      validateLabel(evt.commit.record).success
    ) {
      logger.trace(evt, "creating label");
      saveLabel(db, evt);
    } else {
      logger.warn(evt, "invalid label record");
    }
  });

  jetstream.onUpdate(COM_ATPROTO_LABEL, async (evt) => {
    logger.trace(evt, "updating label");
    saveLabel(db, evt);
  });

  jetstream.onDelete(COM_ATPROTO_LABEL, async (evt) => {
    logger.trace(evt, "deleting label");
    await db
      .deleteFrom("labels")
      .where("uri", "=", evt.commit.rkey.toString())
      .execute();
  });

  jetstream.onCreate(SOCIAL_PMSKY_VOTE, async (evt) => {
    if (
      isRecord(evt.commit.record) &&
      validateRecord(evt.commit.record).success
    ) {
      logger.trace(evt, "creating vote");
      saveVote(db, evt);
    } else {
      logger.warn(evt, "invalid vote record");
    }
  });

  jetstream.onUpdate(SOCIAL_PMSKY_VOTE, async (evt) => {
    logger.trace(evt, "updating vote");
    saveVote(db, evt);
  });

  jetstream.onDelete(SOCIAL_PMSKY_VOTE, async (evt) => {
    logger.trace(evt, "deleting vote");
    await db
      .deleteFrom("label_votes")
      .where("uri", "=", evt.commit.rkey.toString())
      .execute();
  });

  return jetstream;
}

async function saveLabel(
  db: Database,
  evt:
    | CommitCreateEvent<"com.atproto.label.defs#label">
    | CommitUpdateEvent<"com.atproto.label.defs#label">
) {
  const record: Label = evt.commit.record as unknown as Label;
  const now = new Date();
  await db
    .insertInto("labels")
    .values({
      uri: evt.commit.rkey.toString(), // is this right?
      src: evt.did,
      val: record.val,
      subject: record.uri,
      createdAt: record.cts,
      indexedAt: now.toISOString(),
    })
    .onConflict((oc) =>
      oc.column("uri").doUpdateSet({
        val: record.val,
        subject: record.uri,
        indexedAt: now.toISOString(),
      })
    )
    .execute();
}

async function saveVote(
  db: Database,
  evt:
    | CommitCreateEvent<"social.pmsky.vote">
    | CommitUpdateEvent<"social.pmsky.vote">
) {
  const record: Vote = evt.commit.record as unknown as Vote;
  const now = new Date();
  if (record.val !== 1 && record.val !== -1) {
    throw new Error("invalid vote value");
  }
  await db
    .insertInto("label_votes")
    .values({
      uri: evt.commit.rkey.toString(), // is this right?
      val: record.val,
      subject: record.uri,
      createdAt: record.cts,
      indexedAt: now.toISOString(),
    })
    .onConflict((oc) =>
      oc.column("uri").doUpdateSet({
        val: record.val as 1 | -1,
        subject: record.uri,
        indexedAt: now.toISOString(),
      })
    )
    .execute();
}
