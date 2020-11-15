import {IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, UID} from "agora-rtc-sdk-ng";

export interface RTC {
  client: null | IAgoraRTCClient,
  localAudioTrack: null | IMicrophoneAudioTrack,
  localVideoTrack: null | ICameraVideoTrack,
  params: {uid: null | UID, channelName: null | string}
}
