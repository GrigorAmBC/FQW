import {Component} from '@angular/core';
import {SpeechService} from "./speech.service"
import {DomSanitizer} from '@angular/platform-browser';
import * as RecordRTC from 'recordrtc';
import {IDialogPart} from "./types";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'NoLibRequestAngularApp';
  //Lets initiate Record OBJ
  record;
  streamingRecord;
  //Will use this flag to detect recording
  recording: boolean = false;
  streaming: boolean = false;
  //Url of Blob
  url: string;
  error;
  blob: Blob;

  constructor(private speechService: SpeechService, private domSanitizer: DomSanitizer) {
  }


  ngOnInit() {

  }

  sanitize(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  /**
   * Start recording.
   */
  initiateRecording() {
    this.recording = true;
    let mediaConstraints = {
      video: false,
      audio: true
    };
    this.url = null
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(this.successCallback.bind(this), this.errorCallback.bind(this));

    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(this.successCallbackStreaming.bind(this), this.errorCallback.bind(this));
  }

  /**
   * Will be called automatically.
   */
  successCallback(stream) {
    const options = {
      mimeType: "audio/wav",
      numberOfAudioChannels: 1,
      desiredSampRate: 16000
    };
    //Start Actuall Recording
    const StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.record = new StereoAudioRecorder(stream, options);
    this.record.record();
  }

  /**
   * Stop recording.
   */
  stopRecording() {
    this.recording = false;
    this.record.stop(this.processRecording.bind(this));
  }

  /**
   * processRecording Do what ever you want with blob
   * @param  {any} blob Blog
   */
  processRecording(blob: Blob) {
    this.blob = blob
    this.url = URL.createObjectURL(blob);
  }

  /**
   * Process Error.
   */
  errorCallback(error) {
    this.error = 'Can not play audio in your browser';
  }


  async speechToText() {
    if (this.url == null) {
      console.log("No audio recorded!")
      return
    }
    this.speechService.makeRecognizeCall(this.blob).then(
      res => {
        const textArea = document.getElementById("recognize_conten");
        const dialog: IDialogPart[] = this.speechService.getRecognizeResponseDialog(res);
        if (dialog.length == 0) {
          textArea.innerText += "could not recognize\n";
        } else {
          dialog.forEach(part => {
            textArea.textContent += `speaker-${part.speakerTag}: ${part.content}\n`;
          });
        }
        console.log(res);
      }
    );

    /*this.speechService.makeRecognizeCall(this.blob).then(
      res => {
        const transriptionResult = this.speechService.getRecognizeResponseTranscript(res);
        const textArea = document.getElementById("recognize_conten");
        textArea.textContent += transriptionResult;
        console.log(res);
      }
    );*/
  }

  downloadAudio() {
    console.log("download audio")
    const element = document.createElement('a');
    // element.setAttribute('href', 'data:wav');
    element.href = this.url;
    element.download = 'audio.wav';
    element.innerHTML = 'download';

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  successCallbackStreaming(stream) {
    const options = {
      mimeType: "audio/wav",
      numberOfAudioChannels: 1,
      desiredSampRate: 16000
    };
    const StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.streamingRecord = new StereoAudioRecorder(stream, options);
    this.streamingRecord.record()
  }

  startStreaming() {
    console.log("stream started");
    this.streaming = true;

  }

  stopStreaming() {
    this.streaming = false;
  }
}
