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

const getMinimumDesiredLetterCounts = (letterClues: LetterClues): Map<string, number> => {
  const minimumDesiredLetterCounts = new Map<string, number>();
  const desiredLetterCountsFromPartialClues = new Map<string, number>();
  letterClues.partial.forEach((correctClue) => {
    desiredLetterCountsFromPartialClues.set(correctClue.letter, 1);
  });
  const desiredLetterCountsFromCorrectClues = new Map<string, number>();
  letterClues.correct.forEach((correctClue) => {
    desiredLetterCountsFromCorrectClues.set(correctClue.letter, (minimumDesiredLetterCounts.get(correctClue.letter) || 0) + 1);
  });
  desiredLetterCountsFromPartialClues.forEach((count, letter) => {
    desiredLetterCountsFromCorrectClues.set(letter, (minimumDesiredLetterCounts.get(letter) || 0) + (count || 0));
  });
  desiredLetterCountsFromCorrectClues.forEach((count, letter) => {
    minimumDesiredLetterCounts.set(letter, (minimumDesiredLetterCounts.get(letter) || 0) + (count || 0));
  });
  return minimumDesiredLetterCounts;
};

const checkIfWordMeetsMinimumLetterCounts = (word: string, minimumDesiredLetterCounts: Map<string, number>): boolean => {
  const letterCounts = new Map<string, number>();
  for (let i = 0; i < word.length; i++) {
    letterCounts.set(word[i], (letterCounts.get(word[i]) || 0) + 1);
  }
  return Array.from(minimumDesiredLetterCounts.entries()).every((minimumLetterCount) => {
    const letter = minimumLetterCount[0];
    const minimumCount = minimumLetterCount[1];
    return (letterCounts.get(letter) || 0) >= minimumCount;
  });
};

export const filterWordsByLetterClues = (possibleWords: string[], letterClues: LetterClues): string[] => {
  const minimumDesiredLetterCounts = getMinimumDesiredLetterCounts(letterClues);

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

    const meetsMinimumLetterCounts = checkIfWordMeetsMinimumLetterCounts(word, minimumDesiredLetterCounts);

    return meetsMinimumLetterCounts;
  });
};

const DUPLICATE_NEGATIVE_WEIGHT = -1.0;

export const findNextBestWordChoice = (possibleWords: string[], letterClues: LetterClues, prioritizeSpreadLetters: boolean = true): {
  recommendation: string | undefined,
  updatedDictionary: Array<string>,
} => {
  const newPossibleWords = filterWordsByLetterClues(possibleWords, letterClues);
  // let nextBestWord: string | undefined;
  // let nextBestWordScore: number = 0;
  const mostCommonLettersByPosition = getMostCommonLettersByPosition(newPossibleWords);
  const wordsWithScores: Array<{ word: string, score: number }> = newPossibleWords.map((word) => {
    let score = 0;
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      const letterFrequencyMap = mostCommonLettersByPosition[i];
      score += (letterFrequencyMap.get(letter) || 0);
    }
    return { word, score };
  });
  wordsWithScores.sort((a, b) => {
    if (a.score < b.score) return 1;
    if (a.score > b.score) return -1;
    return 0;
  });
  if (prioritizeSpreadLetters) {
    const minimumDesiredLetterCounts = getMinimumDesiredLetterCounts(letterClues);
    const wordsWithScoresAndSpreadLettersPrioritized = wordsWithScores.map((wordWithScore) => {
      const minimumLetterCounts = new Map(minimumDesiredLetterCounts);
      const lettersSeen = new Set<string>();
      let duplicateCount = 0;
      for (let i = 0; i < wordWithScore.word.length; i++) {
        const letter = wordWithScore.word[i];
        if (minimumLetterCounts.has(letter) && (minimumLetterCounts.get(letter) || 0) > 0) {
          minimumLetterCounts.set(letter, (minimumLetterCounts.get(letter) || 1) - 1);
        } else {
          if (lettersSeen.has(letter)) duplicateCount++;
          lettersSeen.add(letter);
        }
      }
      return {
        word: wordWithScore.word,
        score: wordWithScore.score + (duplicateCount * DUPLICATE_NEGATIVE_WEIGHT),
      };
    });
    wordsWithScoresAndSpreadLettersPrioritized.sort((a, b) => {
      if (a.score < b.score) return 1;
      if (a.score > b.score) return -1;
      return 0;
    });
    return {
      recommendation: wordsWithScoresAndSpreadLettersPrioritized[0].word,
      updatedDictionary: newPossibleWords,
    };
  }
  // newPossibleWords.forEach((word) => {
  //   let score = 0;
  //   for (let i = 0; i < word.length; i++) {
  //     const letter = word[i];
  //     const letterFrequencyMap = mostCommonLettersByPosition[i];
  //     score += (letterFrequencyMap.get(letter) || 0);
  //   }
  //   if (score > nextBestWordScore) {
  //     nextBestWord = word;
  //     nextBestWordScore = score;
  //   }
  // });
  return {
    recommendation: wordsWithScores[0].word,
    updatedDictionary: newPossibleWords,
  };
};

export const mergeNewLetterClues = (oldLetterClues: LetterClues, newLetterClues: LetterClues) => {

};
