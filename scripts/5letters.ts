import { join } from 'path';
import { readFileSync } from 'fs';
import {
  findNextBestWordChoice,
  getAllWordsOfLengthX,
  getMostCommonLettersByPosition
} from '../src/helpers/dictionaryTools';

const rawDictionary: string = readFileSync(join(__dirname, '../dictionaries/ScrabbleDict.txt')).toString();
const parsedDict: string[] = rawDictionary.split('\n');

const all5LetterWords = getAllWordsOfLengthX(parsedDict, 5);

const letterFrequenciesFor5LetterWords = getMostCommonLettersByPosition(all5LetterWords);

debugger;

const nextBestWord = findNextBestWordChoice(all5LetterWords, { correct: [], partial: [], incorrect: [] });

debugger;
