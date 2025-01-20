/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { LexiconDoc, Lexicons } from '@atproto/lexicon'

export const schemaDict = {
  AppBskyActorProfile: {
    lexicon: 1,
    id: 'app.bsky.actor.profile',
    defs: {
      main: {
        type: 'record',
        description: 'A declaration of a Bluesky account profile.',
        key: 'literal:self',
        record: {
          type: 'object',
          properties: {
            displayName: {
              type: 'string',
              maxGraphemes: 64,
              maxLength: 640,
            },
            description: {
              type: 'string',
              description: 'Free-form profile description text.',
              maxGraphemes: 256,
              maxLength: 2560,
            },
            avatar: {
              type: 'blob',
              description:
                "Small image to be displayed next to posts from account. AKA, 'profile picture'",
              accept: ['image/png', 'image/jpeg'],
              maxSize: 1000000,
            },
            banner: {
              type: 'blob',
              description:
                'Larger horizontal image to display behind profile view.',
              accept: ['image/png', 'image/jpeg'],
              maxSize: 1000000,
            },
            labels: {
              type: 'union',
              description:
                'Self-label values, specific to the Bluesky application, on the overall account.',
              refs: ['lex:com.atproto.label.defs#selfLabels'],
            },
            joinedViaStarterPack: {
              type: 'ref',
              ref: 'lex:com.atproto.repo.strongRef',
            },
            pinnedPost: {
              type: 'ref',
              ref: 'lex:com.atproto.repo.strongRef',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
            },
          },
        },
      },
    },
  },
  SocialPmskyLabel: {
    lexicon: 1,
    id: 'social.pmsky.label',
    defs: {
      main: {
        type: 'record',
        key: 'tid',
        record: {
          type: 'object',
          description:
            'Replicates `com.atproto.label.defs#label, but as a concrete record type',
          required: ['src', 'uri', 'val', 'cts'],
          properties: {
            ver: {
              type: 'integer',
              description: 'The AT Protocol version of the label object.',
            },
            src: {
              type: 'string',
              format: 'did',
              description: 'DID of the actor who created this label.',
            },
            uri: {
              type: 'string',
              format: 'uri',
              description:
                'AT URI of the record, repository (account), or other resource that this label applies to.',
            },
            cid: {
              type: 'string',
              format: 'cid',
              description:
                "Optionally, CID specifying the specific version of 'uri' resource this label applies to.",
            },
            val: {
              type: 'string',
              maxLength: 128,
              description:
                'The short string name of the value or type of this label.',
            },
            neg: {
              type: 'boolean',
              description:
                'If true, this is a negation label, overwriting a previous label.',
            },
            cts: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp when this label was created.',
            },
            exp: {
              type: 'string',
              format: 'datetime',
              description:
                'Timestamp at which this label expires (no longer applies).',
            },
            sig: {
              type: 'bytes',
              description: 'Signature of dag-cbor encoded label.',
            },
          },
        },
      },
    },
  },
  SocialPmskyVote: {
    lexicon: 1,
    id: 'social.pmsky.vote',
    defs: {
      main: {
        type: 'record',
        key: 'tid',
        record: {
          type: 'object',
          description:
            "a vote record, representing a user's agreement or disagreement with the referenced record, be it a label, post, or user.",
          properties: {
            src: {
              type: 'string',
              format: 'did',
              description:
                'the account creating the vote, not necessarily the same as the user who voted',
            },
            uri: {
              type: 'string',
              format: 'uri',
              description:
                'AT URI of the record, repository (account), or other resource that this label applies to.',
            },
            cid: {
              type: 'string',
              format: 'cid',
              description:
                "Optionally, CID specifying the specific version of 'uri' resource this label applies to.",
            },
            val: {
              type: 'integer',
              description: 'The value of the vote, either +1 or -1',
            },
            cts: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp when this label was created.',
            },
            sig: {
              type: 'bytes',
              description: 'Signature of dag-cbor encoded label.',
            },
          },
          required: ['src', 'uri', 'val', 'cts'],
        },
      },
    },
  },
}
export const schemas: LexiconDoc[] = Object.values(schemaDict) as LexiconDoc[]
export const lexicons: Lexicons = new Lexicons(schemas)
export const ids = {
  AppBskyActorProfile: 'app.bsky.actor.profile',
  SocialPmskyLabel: 'social.pmsky.label',
  SocialPmskyVote: 'social.pmsky.vote',
}
