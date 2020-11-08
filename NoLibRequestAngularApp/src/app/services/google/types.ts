import * as Long from "long";

interface IDuration {

  /** Duration seconds */
  seconds?: (number|Long|string|null);

  /** Duration nanos */
  nanos?: (number|null);
}

export interface IDialogPart {
  speakerTag: number;
  content: string;
}

interface IWordInfo {

  /** WordInfo startTime */
  startTime?: (IDuration|null);

  /** WordInfo endTime */
  endTime?: (IDuration|null);

  /** WordInfo word */
  word?: (string|null);

  /** WordInfo speakerTag */
  speakerTag?: (number|null);
}

interface ISpeechRecognitionAlternative {

  /** SpeechRecognitionAlternative transcript */
  transcript?: (string|null);

  /** SpeechRecognitionAlternative confidence */
  confidence?: (number|null);

  /** SpeechRecognitionAlternative words */
  words?: (IWordInfo[]|null);
}

interface ISpeechRecognitionResult {

  /** SpeechRecognitionResult alternatives */
  alternatives?: (ISpeechRecognitionAlternative[]|null);

  /** SpeechRecognitionResult channelTag */
  channelTag?: (number|null);
}

export interface IRecognizeResponse {

  /** RecognizeResponse results */
  results?: (ISpeechRecognitionResult[]|null);
}
