// One Word, First Thought — writes the single word "sniggle".
//
// sniggle (Merriam-Webster, verb): to fish for eels by thrusting a baited hook
// into their hiding places. It carries a second, unrelated sense too — to
// chuckle or snicker — so the sound and the meaning pull in different
// directions, which is the whole reason for choosing it.
//
// The gate: 1 to 24 characters of UTF-8 text, not only white space. The word is
// written with no trailing newline, so its byte count is its character count.

import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const WORD = 'sniggle';

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const ENTRY_FILE = 'entry.txt';

// A single bare lowercase token: no spaces, no punctuation, no digits. It keeps
// the entry honest against the brief ("exactly one word, nothing else") and it
// keeps the bytes equal to the characters, which is what the tie-break weighs.
const SINGLE_TOKEN = /^[a-z]+$/;

function check(candidate: string): string | null {
  const chars = [...candidate];
  if (chars.length < 1 || chars.length > 24) {
    return `length ${chars.length} outside 1..24 characters`;
  }
  if (candidate.trim() === '') {
    return 'text is only white space';
  }
  if (candidate !== candidate.trim()) {
    return 'text carries leading or trailing white space';
  }
  if (!SINGLE_TOKEN.test(candidate)) {
    return 'text is not one bare lowercase word';
  }
  return null;
}

function main(): void {
  const problem = check(WORD);
  if (problem !== null) {
    throw new Error(`entry would be refused by the gate: ${problem}`);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const target = join(OUTPUT_DIR, ENTRY_FILE);
  writeFileSync(target, WORD, { encoding: 'utf8' });

  // Read the bytes back and hold them to the same gate, so a failed write or a
  // stray newline can never reach the judge unnoticed.
  const written = readFileSync(target);
  if (!Buffer.from(WORD, 'utf8').equals(written)) {
    throw new Error('the file on disk is not the word that was written');
  }
  const reread = written.toString('utf8');
  const rereadProblem = check(reread);
  if (rereadProblem !== null) {
    throw new Error(`the bytes on disk fail the gate: ${rereadProblem}`);
  }

  process.stdout.write(`${ENTRY_FILE}: ${reread} (${written.length} bytes)\n`);
}

main();
