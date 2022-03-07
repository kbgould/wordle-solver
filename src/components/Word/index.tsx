import * as React from 'react';
import { LetterBox } from '../LetterBox';
import { LetterAndState, LetterState, WordState } from '../../types';
import styled from 'styled-components';
import { gray666, gray999, textWhite } from '../../styles/colors';

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 128px;
  width: 560px;
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
  font-size: 24px;
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
};

export const Word = ({ isEditable, size, wordState, onChangeLetterAndState, onCompleteEntry }: Props) => {
  return (
      <Container>
        {(Array.apply(null, Array(size))).map((_, idx) => {
          return (
              <div>
                <LetterBox
                    isEditable={isEditable}
                    onChange={(letterAndState) => onChangeLetterAndState(idx, letterAndState)}
                    state={wordState[idx]}
                />
              </div>
          );
        })}
        {isEditable ? (
            <EnterButton onClick={() => onCompleteEntry()}>SUBMIT</EnterButton>
        ): null}
      </Container>
  );
};