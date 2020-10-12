import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {IDialogPart, IRecognizeResponse} from './types';

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private api_key = "AIzaSyCj5RJJYhm9vi-nF04AJQqtdjZNz3UkRgU"

  private speechUrl = `https://speech.googleapis.com/v1p1beta1/speech:recognize?key=${this.api_key}`;

  constructor(private http: HttpClient) {

  }

  public async makeRecognizeCall(blob: Blob) {
    // Reads a local audio file and converts it to base64
    const reader = new FileReader();
    const audioBytes = await new Promise((resolve, reject) => {
      reader.onloadend = function () {
        const dataUrl = reader.result;
        let base64;
        if (typeof dataUrl === "string") {//todo: what if array?
          base64 = dataUrl.split(',')[1];
        }
        resolve(base64);
      }
      reader.readAsDataURL(blob);
    });

    console.log("decoded");

    const audio = {
      content: audioBytes,
    };
    const config = {
      languageCode: 'en-US',
      enableSpeakerDiarization: true,
      diarizationSpeakerCount: 2,
    };
    const request = {
      audio: audio,
      config: config,
    };

    return this.http.post<IRecognizeResponse>(this.speechUrl, request, {
      headers: {
        'Content-Type': 'application/json'
      },
      responseType: 'json',
      observe: "body"
    }).toPromise();
  }

  getRecognizeResponseTranscript(res: IRecognizeResponse) {
    if (typeof res.results === "undefined") {
      return null;
    }
    return res.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
  }

  getRecognizeResponseDialog(res: IRecognizeResponse) {
    if (typeof res.results === "undefined") {
      return [];
    }
    const result = res.results[res.results.length - 1];
    const wordsInfo = result.alternatives[0].words;

    let cur: number = -1;
    let str: string = "";
    const array: IDialogPart[] = []
    wordsInfo.forEach((word, index) => {
      if (index == 0) {
        cur = word.speakerTag;
        str += " " + word.word;
        if (wordsInfo.length - 1 == index) {
          array.push({speakerTag: cur, content: str});
          str = "";
        }
        return;
      }

      if (cur !== word.speakerTag) {
        array.push({speakerTag: cur, content: str});
        cur = word.speakerTag;
        str = "";
      }

      str += " " + word.word;

      if (index == wordsInfo.length - 1) {
        array.push({speakerTag: cur, content: str});
      }
    });
    return array;
  }


  startStreaming() {

  }


}
