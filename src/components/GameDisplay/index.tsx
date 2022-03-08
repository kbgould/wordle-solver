import * as React from 'react';
import { Word } from '../Word';
import styled from 'styled-components';
import { LetterState, WordState } from '../../types';
import { findNextBestWordChoice, LetterClues } from '../../helpers/dictionaryTools';
import Scrabble5LetterDictionary from '../../dictionaries/ScrabbleDict5LetterWords.json';
import { Recommendation } from '../Recommendation';
import { gray999 } from '../../styles/colors';

const WORD_SIZE = 5;

const OuterContainer = styled.div`
  width: 100%;
  height: 100vh;
  padding: 16px;
  @media screen and (max-width: 768px) {
    padding: 8px;
  }
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
`;

const InnerContainer = styled.div`
  margin: 0 auto;
`;

const TextBlock = styled.div`
  padding: 16px;
  color: ${gray999};
  font-size: 18px;
  @media screen and (max-width: 768px) {
    font-size: 14px;
  }
`;

const StyledLink = styled.a`
  color: ${gray999};
`;

export type GameState = {
  pastWords: Array<WordState>,
  currentWord: WordState,
  complete: boolean,
};

const createEmptyWord = (size: number): WordState => {
  const wordState: WordState = [];
  for (let i = 0; i < size; i++) {
    wordState.push({letter: '', state: LetterState.UNSELECTED, hasError: false});
  }
  return wordState;
};

const createNewGameState = (size: number): GameState => {
  return {
    pastWords: [],
    currentWord: createEmptyWord(size),
    complete: false,
  };
};

const getCurrentWordWithErrors = (currentWord: WordState): WordState | null => {
  let flag = false;
  const validated: WordState = currentWord.map((letterAndState) => {
    const updated = {
      ...letterAndState,
    };
    updated.hasError = !(letterAndState.letter.length === 1 && letterAndState.state !== LetterState.UNSELECTED);
    flag = flag || updated.hasError;
    return updated;
  });
  return flag ? validated : null;
};

const convertPastWordsToLetterClues = (pastWords: WordState[]): LetterClues => {
  const letterClues: LetterClues = {
    correct: [],
    partial: [],
    incorrect: [],
  };
  pastWords.forEach(pastWord => {
    pastWord.forEach((letterAndState, idx) => {
      let clueIsDuplicate: boolean;
      switch (letterAndState.state) {
        case LetterState.CORRECT:
          clueIsDuplicate = !!letterClues.correct.find((e) => e.letter === letterAndState.letter && e.position === idx);
          if (!clueIsDuplicate) {
            letterClues.correct.push({letter: letterAndState.letter, position: idx});
          }
          // If we just added a correct clue for a letter, make sure to remove any past partial clues for that letter
          letterClues.partial = letterClues.partial.filter((e) => e.letter !== letterAndState.letter);
          break;
        case LetterState.PARTIAL:
          clueIsDuplicate = !!letterClues.partial.find((e) => e.letter === letterAndState.letter && e.position === idx);
          if (!clueIsDuplicate) {
            letterClues.partial.push({letter: letterAndState.letter, position: idx});
          }
          // If we added a partial clue, make sure we also add a corresponding incorrect clue for that letter at that position
          letterClues.incorrect.push({ letter: letterAndState.letter, position: idx });
          break;
        case LetterState.INCORRECT:
          clueIsDuplicate = !!letterClues.incorrect.find((e) => e.letter === letterAndState.letter && e.position === idx);
          if (!clueIsDuplicate) {
            letterClues.incorrect.push({letter: letterAndState.letter, position: idx});
          }
          // If we added an incorrect clue, and there is no corresponding partial clue,
          // let's add incorrect clues for this letter across the entire word
          const hasCorrespondingPartialClue = !!letterClues.partial.find((e) => e.letter === letterAndState.letter && e.position === idx);
          if (!hasCorrespondingPartialClue) {
            for (let i = 0; i < pastWord.length; i++) {
              if (i !== idx && !letterClues.correct.find((e) => e.letter === letterAndState.letter && e.position === i)) {
                letterClues.incorrect.push({ letter: letterAndState.letter, position: i });
              }
            }
          }
          break;
        default:
          throw new Error(`Error: Previous word has letterAndState: ${letterAndState}`);
      }
    });
  });
  return letterClues;
};

const getNextBestWord = (remainingDictionary: Array<string>, pastWords: Array<WordState>): {
  recommendation: string | undefined,
  updatedDictionary: Array<string>
} => {
  const letterClues = convertPastWordsToLetterClues(pastWords);
  return findNextBestWordChoice(remainingDictionary, letterClues);
};

const { recommendation, updatedDictionary } = getNextBestWord(Scrabble5LetterDictionary, []);
const newGameNextBestWordAndDictionary = {
  nextBestWord: recommendation,
  dictionary: updatedDictionary,
};

export const GameDisplay = () => {
  const [gameState, setGameState] = React.useState<GameState>(createNewGameState(WORD_SIZE));
  const [nextBestWordAndDictionary, setNextBestWordAndDictionary] = React.useState<{
    nextBestWord: string | undefined,
    dictionary: Array<string>
  }>(newGameNextBestWordAndDictionary);
  const {currentWord, pastWords} = gameState;
  return (
      <OuterContainer>
        <InnerContainer>
          {pastWords.map(pastWord => {
            return (
                <Word
                    size={WORD_SIZE}
                    isEditable={false}
                    onCompleteEntry={() => null}
                    onChangeLetterAndState={() => null}
                    wordState={pastWord}
                    gameComplete={false}
                    onResetGame={() => {}}
                />
            );
          })}
          <Word
              size={WORD_SIZE}
              isEditable={true}
              gameComplete={gameState.complete}
              onResetGame={() => {
                setGameState(createNewGameState(WORD_SIZE));
                setNextBestWordAndDictionary({
                  ...newGameNextBestWordAndDictionary,
                });
              }}
              wordState={currentWord}
              onChangeLetterAndState={(index, letterAndState) => {
                currentWord[index] = letterAndState;
                setGameState({
                  ...gameState,
                  currentWord,
                });
              }}
              onCompleteEntry={() => {
                if (currentWord.every((l) => l.state === LetterState.CORRECT)) {
                  setGameState({
                    ...gameState,
                    complete: true,
                  });
                  return;
                }
                const currentWordWithErrors = getCurrentWordWithErrors(currentWord);
                if (currentWordWithErrors) {
                  setGameState({
                    ...gameState,
                    currentWord: currentWordWithErrors,
                  });
                } else {
                  // Entry completed successfully!
                  pastWords.push(currentWord);
                  setGameState({
                    ...gameState,
                    pastWords,
                    currentWord: createEmptyWord(WORD_SIZE),
                  });
                  const { recommendation, updatedDictionary } = getNextBestWord(nextBestWordAndDictionary.dictionary, pastWords);
                  setNextBestWordAndDictionary({
                    nextBestWord: recommendation,
                    dictionary: updatedDictionary,
                  });
                }
              }}
          />
          <Recommendation word={nextBestWordAndDictionary.nextBestWord || ''} />
          <TextBlock>
            The green word below the inputs is the recommended next best move. Use the text inputs and the clue color selectors below each input to enter the results for each guess. Hit submit to see the next recommendation.
          </TextBlock>
          <TextBlock>
            Built by Keith Gould (<StyledLink href="mailto:keithbgould@gmail.com">keithbgould@gmail.com</StyledLink>)
          </TextBlock>
        </InnerContainer>
      </OuterContainer>
  );
};