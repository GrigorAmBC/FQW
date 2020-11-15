import * as RecordRTC from 'recordrtc';

export class Recorder {
  private audioMediaStream = new MediaStream();
  private record;
  private blob: Blob;
  private url: string;

  constructor() {
  }

  startRecording() {
    const options = {
      mimeType: "audio/wav",
      numberOfAudioChannels: 1,
      desiredSampRate: 16000
    };

    const StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.record = new StereoAudioRecorder(this.audioMediaStream, options);
    this.record.record();
  }

  stopRecording(resolve: (value: Blob) => void) {
    if (typeof this.record.stop == "undefined") {
      return;
    }
    this.record.stop(resolve.bind(this));

  }

  processRecording(blob: Blob) {
    this.blob = blob
    this.url = URL.createObjectURL(blob);
  }

  addTrack(audioTrack: MediaStreamTrack) {
    this.audioMediaStream.addTrack(audioTrack);
  }

  removeTrack(audioTrack: MediaStreamTrack) {
    this.audioMediaStream.removeTrack(audioTrack)
  }
}
