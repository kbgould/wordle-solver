import * as React from 'react';
import { Word } from '../Word';
import styled from 'styled-components';
import { LetterAndState, LetterState, WordState } from '../../types';

const WORD_SIZE = 5;

const OuterContainer = styled.div`
  width: 100%;
  height: 100vh;
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
`;

const InnerContainer = styled.div`
  margin: 0 auto;
`;

export type GameState = {
  pastWords: Array<WordState>,
  currentWord: WordState,
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
  };
};

const getCurrentWordWithErrors = (currentWord: WordState): WordState | null => {
  let flag = false;
  const validated: WordState = currentWord.map((letterAndState) => {
    const updated = {
      ...letterAndState,
    };
    updated.hasError = !(letterAndState.letter.length == 1 && letterAndState.state !== LetterState.UNSELECTED);
    flag = flag || updated.hasError;
    return updated;
  });
  return flag ? validated : null;
};

export const GameDisplay = () => {
  const [gameState, setGameState] = React.useState<GameState>(createNewGameState(WORD_SIZE));
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
                />
            );
          })}
          <Word
              size={WORD_SIZE}
              isEditable={true}
              wordState={currentWord}
              onChangeLetterAndState={(index, letterAndState) => {
                currentWord[index] = letterAndState;
                setGameState({
                  ...gameState,
                  currentWord,
                });
              }}
              onCompleteEntry={() => {
                const currentWordWithErrors = getCurrentWordWithErrors(currentWord);
                if (currentWordWithErrors) {
                  setGameState({
                    ...gameState,
                    currentWord: currentWordWithErrors,
                  });
                } else {
                  pastWords.push(currentWord);
                  setGameState({
                    ...gameState,
                    pastWords,
                    currentWord: createEmptyWord(WORD_SIZE),
                  })
                }
              }}
          />
        </InnerContainer>
      </OuterContainer>
  );
};