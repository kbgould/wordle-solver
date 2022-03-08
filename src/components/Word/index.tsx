import * as React from 'react';
import { LetterBox } from '../LetterBox';
import { LetterAndState, WordState } from '../../types';
import styled from 'styled-components';
import { gray666, gray999, textWhite } from '../../styles/colors';

const Container = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 128px;
  width: 560px;
  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 80px;
    width: 340px;
  }
  align-items: center;
`;

const EnterButton = styled.button`
  margin-left: 20px;
  margin-bottom: 20px;
  background-color: ${gray666};
  color: ${textWhite};
  border: 2px solid ${gray999};
  border-radius: 3px;
  height: 70px;
  width: 128px;
  text-align: center;
  padding: 0;
  @media screen and (max-width: 768px) {
    margin-left: 4px;
    height: 48px;
    width: 80px;
    font-size: 16px;
  }
  cursor: pointer;
  :hover {
    background-color: ${gray999};
  }
  :active {
    background-color: ${gray666};
  }
`;

type Props = {
  size: number;
  isEditable: boolean;
  onCompleteEntry: () => void;
  onChangeLetterAndState: (index: number, letterAndState: LetterAndState) => void;
  wordState: WordState;
  gameComplete: boolean;
  onResetGame: () => void;
};

export const Word = ({ isEditable, size, wordState, onChangeLetterAndState, onCompleteEntry, gameComplete, onResetGame }: Props) => {
  return (
      <Container>
        {(Array.apply(null, Array(size))).map((_, idx) => {
          return (
              <div key={`letter-${idx}`}>
                <LetterBox
                    isEditable={isEditable && !gameComplete}
                    onChange={(letterAndState, event) => {
                      if (event) {
                        const form = event.target.form;
                        if (form) {
                          const index = [...form].indexOf(event.target);
                          // @ts-ignore
                          form.elements[index + 1].focus();
                          event.preventDefault();
                        }
                      }
                      onChangeLetterAndState(idx, letterAndState);
                    }}
                    state={wordState[idx]}
                />
              </div>
          );
        })}
        {(isEditable && !gameComplete) ? (
            <EnterButton onClick={(e) => {
              onCompleteEntry();
              e.preventDefault();
            }}>SUBMIT</EnterButton>
        ): null}
        {gameComplete ? (
            <EnterButton onClick={(e) => {
              onResetGame();
              e.preventDefault();
            }}>RESET</EnterButton>
        ): null}
      </Container>
  );
};