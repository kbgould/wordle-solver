export enum LetterState {
  INCORRECT = 'INCORRECT',
  CORRECT = 'CORRECT',
  PARTIAL = 'PARTIAL',
  UNSELECTED = 'UNSELECTED',
}

export type LetterAndState = {
  letter: string;
  state: LetterState;
  hasError: boolean;
};

export type WordState = Array<LetterAndState>;