import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import {
  getAllWordsOfLengthX,
} from '../src/helpers/dictionaryTools';

const rawDictionary: string = readFileSync(join(__dirname, '../dictionaries/ScrabbleDict.txt')).toString();
const parsedDict: string[] = rawDictionary.split('\n');

const TARGET_WORD_LENGTH = 5;

const writeAllXLetterWordsToFile = (numLetters: number = TARGET_WORD_LENGTH, filename: string) => {
  const allXLetterWords = getAllWordsOfLengthX(parsedDict, numLetters);

  const outputFile = join(__dirname, `../dictionaries/${filename}`);
  let result = '';

  result += `[\n`;
  for (let i = 0; i < allXLetterWords.length; i++) {
    const word = allXLetterWords[i];
    result += `  "${word}"${i < allXLetterWords.length - 1 ? ',' : ''}\n`;
  }
  result += `]\n`;

  writeFileSync(outputFile, result);
}

writeAllXLetterWordsToFile(TARGET_WORD_LENGTH, `ScrabbleDict${TARGET_WORD_LENGTH}LetterWords.json`);
