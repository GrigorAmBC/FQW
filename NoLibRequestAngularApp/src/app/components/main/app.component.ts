import {Component} from '@angular/core';
import {SpeechService} from "../../services/google/speech.service"
import {DomSanitizer} from '@angular/platform-browser';
import * as RecordRTC from 'recordrtc';
import {IDialogPart} from "../../services/google/types";
import {google} from "@google-cloud/speech/build/protos/protos";
import ISpeechRecognitionResult = google.cloud.speech.v1.ISpeechRecognitionResult;
import {BucketStorageService} from "../../services/google/bucket-storage.service";
import {GoogleLoginProvider, SocialAuthService, SocialUser} from "angularx-social-login";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private clientId = "488169954951-ci2554if1a5ndjf7icd9l8b88uquc3id.apps.googleusercontent.com";
  title = 'NoLibRequestAngularApp';
  //Lets initiate Record OBJ
  record;
  streamingRecord;
  //Will use this flag to detect recording
  recording: boolean = false;
  //Url of Blob
  url: string;
  error;
  blob: Blob;
  file;
  private user: SocialUser;
  private loggedIn: boolean;
  private gsAudioUri: string;

  constructor(private http: HttpClient, private authService: SocialAuthService, private bucketService: BucketStorageService, private speechService: SpeechService, private domSanitizer: DomSanitizer) {
    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
    });
  }

  signInWithRest() {
    const url = "https://accounts.google.com/o/oauth2/v2/auth?" +
      "redirect_uri=http://localhost:4200/&prompt=consent&response_type=code&" +
      "client_id=488169954951-ci2554if1a5ndjf7icd9l8b88uquc3id.apps.googleusercontent.com" +
      "&scope=https://www.googleapis.com/auth/devstorage.full_control&" +
      "access_type=offline";
    // location.href = url;
    this.http.get(url).toPromise().then(res => {
      console.log(res);
    }).catch((reason) => console.log(reason));
  }

  signInWithGoogle() {
    const options = {
      redirect_uri: 'http://localhost:4200/',
      prompt: 'consent',
      // response_type: 'code'
      client_id: '488169954951-ci2554if1a5ndjf7icd9l8b88uquc3id.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/devstorage.full_control',
      access_type: 'offline'
    }
    return this.authService.signIn(GoogleLoginProvider.PROVIDER_ID, options).then(res => {
      console.log(res);
    }).catch(onrejected => console.log(onrejected));
  }

  signOut(): void {
    this.authService.signOut();
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
    if (typeof this.record.stop == "undefined") {
      return;
    }
    this.recording = false;
    this.record.stop(this.processRecording.bind(this));
  }

  /**
   * processRecording Do what ever you want with blob
   * @param  {any} blob Blog
   */
  processRecording(blob: Blob) {
    this.blob = blob;
    this.url = URL.createObjectURL(blob);
  }

  /**
   * Process Error.
   */
  errorCallback(error) {
    this.error = 'Can not play audio in your browser';
  }


  async recordedAudioToText() {
    if (this.url == null) {
      console.log("No audio recorded!");
      return;
    }
    const file = this.bucketService.blobToFile(this.blob, "some.wav")
    this.gsAudioUri = await this.bucketService.uploadFile(file);
    this.speechService
      .makeLongRunningRecognizeCall(
        this.gsAudioUri,
        this.showLongRunningRecognizeDialog, 1);
  }

  async speechToText() {
    if (this.url == null) {
      console.log("No audio recorded!")
      return
    }
    this.speechService.makeRecognizeCall(this.blob, 2).then(
      res => {
        const textArea = document.getElementById("recognize_conten");
        const dialog: IDialogPart[] = SpeechService.getRecognizeResponseDialog(res.results);
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
  }

  async speechToTextLongRunning() {//TODO()
    if (this.url == null && false) {
      console.log("No audio recorded!")
      return
    }

    // this.speechService.uploadAudioFileToBucket(this.file);

    // this.speechService.uploadAudioFileToBucket();
    console.log(this.gsAudioUri);
    // this.speechService.makeLongRunningRecognizeCall(this.gsAudioUri, this.showLongRunningRecognizeDialog);
    this.speechService
      .makeLongRunningRecognizeCall(
        this.gsAudioUri,
        this.showLongRunningRecognizeDialog, 1);
  }

  async uploadFile() {
    /* if (!this.loggedIn && false) {
       this.signInWithGoogle();
     }*/
    if (this.file == null) {
      console.log("no audio chosen");
      return;
    }

    this.gsAudioUri = await this.bucketService.uploadFile(this.file);
  }

  onFileChange(e) {
    if (e.target.files.length > 0) {
      this.file = e.target.files[0];
    }
  }

  showLongRunningRecognizeDialog(results: ISpeechRecognitionResult[]) {
    console.log("writing to user");
    const textArea = document.getElementById("recognize_conten");
    const dialog: IDialogPart[] = SpeechService.getRecognizeResponseDialog(results);
    if (dialog.length == 0) {
      textArea.innerText += "could not recognize\n";
    } else {
      dialog.forEach(part => {
        textArea.textContent += `speaker-${part.speakerTag}: ${part.content}\n`;
      });
    }
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
}
