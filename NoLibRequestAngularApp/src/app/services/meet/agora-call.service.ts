import {Injectable} from '@angular/core';
import AgoraRTC, {IAgoraRTCClient} from 'agora-rtc-sdk-ng';
import {RTC} from "../../types/agora-types";

//todo: not nice

@Injectable({
  providedIn: 'root'
})
export class AgoraCallService {

  private appId: string = 'd3c3da2e4e3d469db0c0bb6f76daa1dd';

  // private appCertificate = '080db8738b284ee4ac54be42d46ca94b';
  // private tempToken: string = null

  private rtc: RTC = {
    client: null,
    localAudioTrack: null,
    localVideoTrack: null,
    params: {uid: null, channelName: null}
  };

  constructor() {
  }

  getRtcClient(): IAgoraRTCClient {
    if (this.rtc.client == null) {
      this.rtc.client = AgoraRTC.createClient({mode: "rtc", codec: "vp8"});
    }

    return this.rtc.client;
  }

  join(channelName: string) {
    const promise = this.rtc.client.join(this.appId, channelName, null, null)
    promise.then(ok => {
      this.rtc.params.uid = ok
    })
    return promise
  }

  getStreams(): RTC {
    return this.rtc;
  }

  async unpublishAudio() {
    await this.rtc.client.unpublish(this.rtc.localAudioTrack);
  }

  async unpublishVideo() {
    await this.rtc.client.unpublish(this.rtc.localVideoTrack);
    await this.rtc.localVideoTrack.setEnabled(false);
  }

  async publishVideo(container: HTMLDivElement) {
    if (this.rtc.localVideoTrack == null) {
      this.rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    }
    if (!this.rtc.client.localTracks.includes(this.rtc.localVideoTrack)) {
      await this.rtc.localVideoTrack.setEnabled(true);
      await this.rtc.client.publish([this.rtc.localVideoTrack]);
      this.rtc.localVideoTrack.play(container);
    }
  }

  async publishAudio() {
    if (this.rtc.localAudioTrack == null) {
      this.rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    }

    if (!this.rtc.client.localTracks.includes(this.rtc.localAudioTrack)) {
      await this.rtc.client.publish([this.rtc.localAudioTrack]);
    }
  }

  async leave() {

  }

  async publishAudioVideo(container: HTMLDivElement) {
    await this.publishAudio();
    await this.publishVideo(container);
    console.log("publish success!");

    /*// Create an audio track from the audio sampled by a microphone.
    this.rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    // Create a video track from the video captured by a camera.
    this.rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    // Publish the local audio and video tracks to the channel.
    await this.rtc.client.publish([this.rtc.localAudioTrack, this.rtc.localVideoTrack]);*/
  }

  getLocalClientUid(): string {
    if (this.rtc.client != null) {
      if (this.rtc.params.uid != null) {
        return this.rtc.params.uid.toString();
      }
    }
    console.log("Unknown client!");
    return undefined;
  }


  async leaveChannel() {
    this.rtc.localAudioTrack.close();
    this.rtc.localVideoTrack.close();

    // Traverse all remote users.
    this.rtc.client.remoteUsers.forEach(user => {
      // Destroy the dynamically created DIV container.
      const playerContainer = document.getElementById(user.uid.toString());
      playerContainer && playerContainer.remove();
    });

    // Leave the channel.
    await this.rtc.client.leave();
  }
}
