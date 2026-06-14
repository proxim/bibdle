import { ERAS, type Character } from "@/data/types";
import { bookByName } from "@/data/books";

export type TileResult = "correct" | "partial" | "wrong";
export type EraHint = "correct" | "earlier" | "later";

export interface GuessFeedback {
  guess: Character;
  testament: TileResult;
  book: TileResult; // partial = same section
  roles: TileResult; // partial = overlap
  tribeNation: TileResult;
  era: { result: TileResult; hint: EraHint }; // earlier/later = answer is earlier/later
  gender: TileResult;
  isWin: boolean;
}

export function compareGuess(guess: Character, answer: Character): GuessFeedback {
  const eq = (a: string, b: string): TileResult => (a === b ? "correct" : "wrong");

  const guessBook = bookByName.get(guess.book);
  const answerBook = bookByName.get(answer.book);
  const book: TileResult =
    guess.book === answer.book
      ? "correct"
      : guessBook && answerBook && guessBook.section === answerBook.section
        ? "partial"
        : "wrong";

  const sharedRoles = guess.roles.filter((r) => answer.roles.includes(r));
  const roles: TileResult =
    sharedRoles.length === answer.roles.length && guess.roles.length === answer.roles.length
      ? "correct"
      : sharedRoles.length > 0
        ? "partial"
        : "wrong";

  const guessEra = ERAS.indexOf(guess.era);
  const answerEra = ERAS.indexOf(answer.era);
  const era: GuessFeedback["era"] =
    guessEra === answerEra
      ? { result: "correct", hint: "correct" }
      : { result: "wrong", hint: answerEra < guessEra ? "earlier" : "later" };

  return {
    guess,
    testament: eq(guess.testament, answer.testament),
    book,
    roles,
    tribeNation: eq(guess.tribeNation, answer.tribeNation),
    era,
    gender: eq(guess.gender, answer.gender),
    isWin: guess.id === answer.id,
  };
}
