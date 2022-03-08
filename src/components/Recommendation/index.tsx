import * as React from 'react';
import styled from 'styled-components';
import { letterCorrect } from '../../styles/colors';
import { LetterBox } from '../LetterBox';

const Container = styled.div`
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 128px;
  width: 560px;
  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 80px;
    width: 360px;
  }
  align-items: center;
`;

const Letter = styled.div`
  font-size: 28px;
  color: ${letterCorrect};
  text-align: center;
  @media screen and (max-width: 768px) {
    width: 28px;
    max-width: 28px;
  }
`;

type Props = {
  word: string,
};

export const Recommendation = ({ word }: Props) => {
  return (
      <Container>
        {word.split('').map((letter, idx) => {
          return (
              <div key={`recommended-letter-${idx}`}>
                <Letter>{letter}</Letter>
              </div>
          );
        })}
      </Container>
  );
};