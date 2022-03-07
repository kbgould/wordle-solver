export const getAllWordsOfLengthX = (dictionary: string[], x: number): string[] => {
  const wordsOfLengthX: string[] = [];
  for (let i = 0; i < dictionary.length; i++) {
    if (dictionary[i].length === x) wordsOfLengthX.push(dictionary[i]);
  }
  return wordsOfLengthX;
};

export type LetterFrequency = { letter: string, frequency: number };
export type LetterFrequencyMap = Map<string, number>;

export const convertLetterFrequencyCountToPercentageOfTotal = (letterFrequencyMap: LetterFrequencyMap): LetterFrequencyMap => {
  const totalOccurences = Array.from(letterFrequencyMap.keys()).reduce<number>((prev, current) => prev + (letterFrequencyMap.get(current) || 0), 0);
  const result = new Map<string, number>();
  Array.from(letterFrequencyMap.entries()).forEach((letterCount) => {
    const letter = letterCount[0];
    const count = letterCount[1];
    result.set(letter, count / totalOccurences);
  });
  return result;
};

export const getMostCommonLettersByPosition = (wordsOfConstantLength: string[]): LetterFrequencyMap[] => {
  const wordLength = wordsOfConstantLength[0].length;

  const letterFrequencyCountMaps: LetterFrequencyMap[] = [];
  for (let i = 0; i < wordLength; i++) {
    letterFrequencyCountMaps.push(new Map<string, number>());
  }

  wordsOfConstantLength.forEach(word => {
    if (word.length !== wordLength) throw new Error('The words passed to the list in getMostCommonLettersByPosition had different lengths.');
    for (let j = 0; j < word.length; j++) {
      const letter = word[j];
      const frequencyMap = letterFrequencyCountMaps[j];
      frequencyMap.set(letter, (frequencyMap.get(letter) || 0) + 1);
    }
  });

  return letterFrequencyCountMaps.map(convertLetterFrequencyCountToPercentageOfTotal);
};

export type LetterAndPosition = { letter: string, position: number };

export type LetterClues = {
  correct: LetterAndPosition[],
  partial: LetterAndPosition[],
  incorrect: LetterAndPosition[],
};

export const filterWordsByLetterClues = (possibleWords: string[], letterClues: LetterClues): string[] => {
  const minimumDesiredLetterCounts = new Map<string, number>();
  const correctAndPartialLetterClues = letterClues.correct.concat(letterClues.partial);
  correctAndPartialLetterClues.forEach((correctClue) => {
    minimumDesiredLetterCounts.set(correctClue.letter, (minimumDesiredLetterCounts.get(correctClue.letter) || 0) + 1);
  })

  return possibleWords.filter((word) => {
    const passesCorrectLetters = letterClues.correct.reduce<boolean>((prev, clue) => {
      if (word[clue.position] !== clue.letter) return false;
      return prev;
    }, true);
    if (!passesCorrectLetters) return false;

    const incorrectAndPartialLetters = letterClues.incorrect.concat(letterClues.partial);
    const passesIncorrectLetters = incorrectAndPartialLetters.reduce<boolean>((prev, clue) => {
      if (word[clue.position] === clue.letter) return false;
      return prev;
    }, true);
    if (!passesIncorrectLetters) return false;

    const letterCounts = new Map<string, number>();
    for (let i = 0; i < word.length; i++) {
      letterCounts.set(word[i], (letterCounts.get(word[i]) || 0) + 1);
    }

    const meetsMinimumLetterCounts = Array.from(minimumDesiredLetterCounts.entries()).every((minimumLetterCount) => {
      const letter = minimumLetterCount[0];
      const minimumCount = minimumLetterCount[1];
      return (letterCounts.get(letter) || 0) >= minimumCount;
    });

    return meetsMinimumLetterCounts;
  });
};

export const findNextBestWordChoice = (possibleWords: string[], letterClues: LetterClues): string | undefined => {
  const newPossibleWords = filterWordsByLetterClues(possibleWords, letterClues);
  let nextBestWord: string | undefined;
  let nextBestWordScore: number = 0;
  const mostCommonLettersByPosition = getMostCommonLettersByPosition(newPossibleWords);
  newPossibleWords.forEach((word) => {
    let score = 0;
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      const letterFrequencyMap = mostCommonLettersByPosition[i];
      score += (letterFrequencyMap.get(letter) || 0);
    }
    if (score > nextBestWordScore) {
      nextBestWord = word;
      nextBestWordScore = score;
    }
  });
  return nextBestWord;
};

export const mergeNewLetterClues = (oldLetterClues: LetterClues, newLetterClues: LetterClues) => {

};
