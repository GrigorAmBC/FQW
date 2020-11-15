import {Component, OnInit} from '@angular/core';
import {AgoraCallService} from "../../services/meet/agora-call.service";
import AgoraRTC, {IAgoraRTCClient, IRemoteVideoTrack} from "agora-rtc-sdk-ng";
import * as RecordRTC from 'recordrtc';
import {Recorder} from "./utils/record";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-meet',
  templateUrl: './meet.component.html',
  styleUrls: ['./meet.component.css']
})
export class MeetComponent implements OnInit {

  private recorder = new Recorder();

  meetingName: string;
  live = false;
  subContainer: HTMLDivElement;
  mainContainer: HTMLDivElement;
  client: IAgoraRTCClient;
  interviewRecording = false;
  url = null;

  playing = {
    audioPlaying: false,
    videoPlaying: false
  };

  constructor(private meetService: AgoraCallService, private domSanitizer: DomSanitizer) {
  }

  sanitize(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  ngOnInit(): void {
    this.subContainer = document.getElementById("subContainer") as HTMLDivElement;
    this.mainContainer = document.getElementById("mainContainer") as HTMLDivElement;
  }


  public start() {
    //todo: a helper lib https://github.com/muaz-khan/MultiStreamsMixer
    // initialize
    this.client = this.meetService.getRtcClient();

    // subscribe to events
    this.makeSubscriptions();

    // join, publish all things todo: implement authentication to get token, save it in cookies
    const channelNameDoc = document.getElementById("channelName") as HTMLInputElement;
    this.meetService.join(channelNameDoc.value).then(
      () => {
        this.meetService.publishAudioVideo(this.getMainContainer()).then(() => {
          this.live = true;
          this.meetingName = channelNameDoc.value;
          this.recorder.addTrack(this.meetService.getStreams().localAudioTrack.getMediaStreamTrack());//todo:wtf
          this.setVideoPlaying(true);
          this.setAudioPlaying(true);
        });
      }
    ).catch(error => console.log(error));
  }


  private makeSubscriptions() {
    this.client.on("user-unpublished", user => {
      const playerContainer = document.getElementById(user.uid.toString());
      playerContainer.remove();
    });

    this.client.on("user-published", async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);
      console.log("subscribe success");

      if (mediaType === "video") {
        const remoteVideoTrack = user.videoTrack;
        this.addSmallVideoTrackDiv(remoteVideoTrack, user.uid.toString())
      }

      if (mediaType === "audio") {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack.play();
        this.recorder.addTrack(remoteAudioTrack.getMediaStreamTrack());
      }
    });
  }

  private addSmallVideoTrackDiv(videoTrack: IRemoteVideoTrack, uid: string) {
    const container = MeetComponent.getVideoContainer(uid, HtmlValues.smallWidth, HtmlValues.smallHeight);
    const some = this;
    container.onclick = function () {
      some.putToMain(uid);
    }

    this.subContainer.append(container);
    videoTrack.play(container);
  }

  putToMain(uid: string) {
    const elements = this.mainContainer.getElementsByTagName("div");
    this.mainContainer.append(this.getMainContainer())
  }

  private setBigVideoTrackDiv(videoTrack, uid: string) {

  }

  static changeVideoContainer(container, width: string, height: string, padding: string = "0") {
    container.style.width = width;
    container.style.padding = padding;
    container.style.height = height;
  }

  private static getVideoContainer(id: string, width: string, height: string, padding: string = "0"): HTMLDivElement {
    const playerContainer = document.createElement("div");
    playerContainer.id = id;
    playerContainer.style.width = width;
    playerContainer.style.padding = padding;
    playerContainer.style.height = height;
    return playerContainer;
  }

  getMainContainer(): HTMLDivElement {
    let oldContainer = this.mainContainer.childNodes.item(0) as HTMLDivElement;
    // let oldContainer = document.getElementById(this.client.uid.toString()) as HTMLDivElement;


    if (oldContainer == null) {
      oldContainer = MeetComponent
        .getVideoContainer(this.meetService.getLocalClientUid(),
          HtmlValues.fullScreenWidth,
          HtmlValues.fullScreenHeight,
          HtmlValues.bigPadding);
      this.putMyContainerMain(oldContainer);
    }

    return oldContainer;
  }

  putMyContainerMain(container: HTMLDivElement) {
    this.mainContainer.append(container);
  }

  async setVideoPlaying(publish: boolean) {
    this.playing.videoPlaying = publish;

    if (publish) {
      await this.meetService.publishVideo(this.getMainContainer());
    } else {
      await this.meetService.unpublishVideo();
    }
  }

  async setAudioPlaying(publish: boolean) {
    this.playing.audioPlaying = publish;

    if (publish) {
      await this.meetService.publishAudio();
      this.recorder.addTrack(this.meetService.getStreams().localAudioTrack.getMediaStreamTrack())
    } else {
      await this.meetService.unpublishAudio();
      this.recorder.removeTrack(this.meetService.getStreams().localAudioTrack.getMediaStreamTrack())
    }
  }

  startRecordingMeetingAudio() {
    this.url = null;
    this.recorder.startRecording();
    this.interviewRecording = true;
  }

  stopRecordingMeetingAudio() {
    this.interviewRecording = false;
    this.recorder.stopRecording(blob => {
      console.log(blob);
      this.url = URL.createObjectURL(blob);
    });
  }

  endMeetingInterview() {// transcribe audio, return result, maybe later add ability to notify the other user.

  }

  /*async pickMicrophone() {
    //https://agoraio-community.github.io/AgoraWebSDK-NG/api/en/interfaces/microphoneaudiotrackinitconfig.html
    //https://agoraio-community.github.io/AgoraWebSDK-NG/api/en/interfaces/iagorartc.html#createmicrophoneaudiotrack
    const devices = await AgoraRTC.getMicrophones();

    await AgoraRTC.createMicrophoneAudioTrack();

  }*/
}

class HtmlValues {
  static smallWidth = "10vw";
  static smallHeight = "10vh";
  static fullScreenWidth = "100vw";
  static fullScreenHeight = "100vh";
  static bigPadding: string = "20px";
}
