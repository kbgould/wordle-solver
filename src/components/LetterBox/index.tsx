import * as React from 'react';
import styled from 'styled-components';
import {
  backgroundBlack, errorOutline,
  gray999,
  letterCorrect,
  letterIncorrect,
  letterPartial,
  textWhite
} from '../../styles/colors';
import { LetterAndState, LetterState } from '../../types';
import { ChangeEvent } from 'react';

const Container = styled.div`
  display: inline-block;
  padding: 12px;
  @media screen and (max-width: 768px) {
    padding: 4px;
  }
`;

const StyledInput = styled.input<{ state: LetterState, hasError: boolean }>`
  border: 2px solid ${gray999};
  border-radius: 3px;
  height: 64px;
  width: 48px;
  background-color: ${backgroundBlack};
  font-size: 32px;
  padding: 0;
  @media screen and (max-width: 768px) {
    height: 44px;
    width: 28px;
    font-size: 24px;
  }
  text-transform: capitalize;
  text-align: center;
  color: ${textWhite};
  ${({hasError}) => hasError && `border-color: ${errorOutline};`}
  ${({state}) => state === LetterState.UNSELECTED && `background-color: ${backgroundBlack};`}
  ${({state}) => state === LetterState.CORRECT && `background-color: ${letterCorrect};`}
  ${({state}) => state === LetterState.INCORRECT && `background-color: ${letterIncorrect};`}
  ${({state}) => state === LetterState.PARTIAL && `background-color: ${letterPartial};`}
`;

const StateSelectorBar = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 1px;
  margin-top: 4px;
`;

const StateSelectorButton = styled.div<{ state: LetterState }>`
  ${({state}) => state === LetterState.CORRECT && `background-color: ${letterCorrect};`}
  ${({state}) => state === LetterState.INCORRECT && `background-color: ${letterIncorrect};`}
  ${({state}) => state === LetterState.PARTIAL && `background-color: ${letterPartial};`}
  box-sizing: border-box;
  height: 16px;
  width: 100%;
  cursor: pointer;
  border: 1px solid ${gray999};
  border-radius: 2px;
`;

type Props = {
  isEditable: boolean;
  onChange: (letterAndState: LetterAndState, event?: ChangeEvent<HTMLInputElement>) => void;
  state: LetterAndState;
};

const handleChangeLetter = (
    event: ChangeEvent<HTMLInputElement>,
    state: LetterAndState,
    onChange: (letterAndState: LetterAndState, event?: ChangeEvent<HTMLInputElement>) => void
) => {
  if (event.target.value === '' || /[a-zA-Z]/i.test(event.target.value)) {
    const updated = {
      ...state,
      letter: event.target.value.toUpperCase(),
      hasError: false,
    };
    onChange(updated, event);
  }
};

const handleKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>,
) => {
  if (event.key === '' || /[a-zA-Z\s]/i.test(event.key)) {
    event.currentTarget.value = '';
  }
};

export const LetterBox = ({isEditable, onChange, state}: Props) => {
  return (
      <Container>
        <StyledInput
            onKeyPress={(event: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(event)}
            onChange={(event) => handleChangeLetter(event, state, onChange)}
            readOnly={!isEditable}
            state={state.state}
            value={state.letter}
            hasError={state.hasError}
        />
        {isEditable ? (
            <StateSelectorBar>
              <StateSelectorButton state={LetterState.CORRECT} onClick={() => onChange({
                letter: state.letter,
                state: LetterState.CORRECT,
                hasError: false,
              })} />
              <StateSelectorButton state={LetterState.PARTIAL} onClick={() => onChange({
                letter: state.letter,
                state: LetterState.PARTIAL,
                hasError: false,
              })} />
              <StateSelectorButton state={LetterState.INCORRECT} onClick={() => onChange({
                letter: state.letter,
                state: LetterState.INCORRECT,
                hasError: false,
              })} />
            </StateSelectorBar>
        ) : null}
      </Container>
  );
};