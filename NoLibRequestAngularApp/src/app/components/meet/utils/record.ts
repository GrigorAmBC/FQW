import * as RecordRTC from 'recordrtc';
import MultiStreamsMixer from 'multistreamsmixer';

export class Recorder {
  private audioMediaStream = new MediaStream();
  private record;
  private blob: Blob;
  private blobParts: Blob[] = [];
  private url: string;
  private recording = false;
  private resolve: (value: Blob) => void = null

  constructor() {
  }

  startRecording() {
    this.resolve = null;
    const options = {
      mimeType: "audio/wav",
      numberOfAudioChannels: 1,
      desiredSampRate: 16000
    };

    const StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.record = new StereoAudioRecorder(this.audioMediaStream, options);
    this.record.record();
    this.recording = true;
  }

  async stopRecording(resolve: (value: Blob) => void) {
    if (typeof this.record.stop == "undefined") {
      return;
    }
    this.resolve = resolve;
    this.record.stop(this.appendBlob.bind(this));
    this.recording = false;
  }

  getBlob(): Blob {
    if (!this.blob) {
      this.blob = new Blob(this.blobParts, {type: "audio/wav"});//, { type: "text/plain" });
      this.blobParts.length = 0;
    }
    return this.blob;
  }

  addTrack(audioTrack: MediaStreamTrack) {
    this.audioMediaStream.addTrack(audioTrack);
    if (this.recording) {
      this.restartInterim();
    }
  }

  removeTrack(audioTrack: MediaStreamTrack) {
    if (this.recording) {
      this.restartInterim();
    }
    this.audioMediaStream.removeTrack(audioTrack);
  }

  private restartInterim() {
    if (typeof this.record == "undefined") {
      return;
    }
    this.record.stop(this.appendBlob.bind(this));
    const count = this.audioMediaStream.getAudioTracks().length;
    if (count < 1) {
      return;
    }
    const options = {
      mimeType: "audio/wav",
      numberOfAudioChannels: 1,
      desiredSampRate: 16000
    };

    const StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.record = new StereoAudioRecorder(this.audioMediaStream, options);
    this.record.record();
  }

  private appendBlob(blob: Blob) {
    console.log(`Blob No. ${this.blobParts.length}`);
    console.log(blob)
    this.blobParts.push(blob);
    this.blob = undefined;

    if (this.resolve != null) {
      this.resolve(this.getBlob());
      this.resolve = null;
    }
  }

}
