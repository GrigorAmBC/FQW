import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {IDialogPart, IRecognizeResponse} from './types';
import {google} from "@google-cloud/speech/build/protos/protos";
import Operation = google.longrunning.Operation;
import ISpeechRecognitionResult = google.cloud.speech.v1.ISpeechRecognitionResult;

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private api_key = "AIzaSyCj5RJJYhm9vi-nF04AJQqtdjZNz3UkRgU";
  private speechUrl = `https://speech.googleapis.com/v1p1beta1/speech:recognize?key=${this.api_key}`;
  private longRunningSpeechUrl = `https://speech.googleapis.com/v1p1beta1/speech:longrunningrecognize?key=${this.api_key}`;
  private longRunningOperationUrl = `https://speech.googleapis.com/v1p1beta1/operations/`;

  constructor(private http: HttpClient) {

  }

  public async makeRecognizeCall(blob: Blob, speakerCount: number) {
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
      diarizationSpeakerCount: speakerCount,
    };
    const request = {
      audio: audio,
      config: config,
    };

    return this.http.post<IRecognizeResponse>(this.speechUrl, request, {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'json',
      observe: "body"
    }).toPromise();
  }

  public async makeLongRunningRecognizeCall(gsFileUri: string,
                                            callback: (results: ISpeechRecognitionResult[]) => void,
                                            speakerCount: number = 1) {
    // Reads a local audio file and converts it to base64

    const audio = {
      uri: gsFileUri,
    };
    const config = {
      languageCode: 'en-US',
      enableSpeakerDiarization: true,
      diarizationSpeakerCount: speakerCount,
    };
    const request = {
      audio: audio,
      config: config,
    };
    let operation: Operation = await this.http.post<Operation>(this.longRunningSpeechUrl, request, {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'json',
      observe: "body"
    }).toPromise();

    window.setTimeout(
      function (service: SpeechService, operation: Operation) {
        service.request(operation, callback);
      },
      5000,
      this,
      operation);
  }

  request(operation: Operation, callback) {
    this.http.get<any>(this.getLongRunningOperationUrl(operation.name))
      .toPromise().then(res => {
      if (typeof res === "undefined" || typeof res.done === "undefined" || res.done === false) {
        console.log("not yet");
        window.setTimeout(
          function (service: SpeechService, operation: Operation) {
            service.request(operation, callback)
          },
          5000,
          this,
          operation);
      } else {
        console.log(res);
        if (typeof res.response.results === "undefined") {
          console.log("Longrunning: no transcription");
          callback();
        } else {
          callback(res.response.results);
        }
      }
    });
  }

  static getRecognizeResponseTranscript(results: ISpeechRecognitionResult[]) {
    if (typeof results === "undefined") {
      return null;
    }
    return results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
  }

  static getRecognizeResponseDialog(results: ISpeechRecognitionResult[]) {
    console.log(results);
    if (typeof results === "undefined") {
      return [];
    }
    const result = results[results.length - 1];
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


  private getLongRunningOperationUrl(operation: string) {
    return this.longRunningOperationUrl + `${operation}?key=${this.api_key}`;
  }


}
