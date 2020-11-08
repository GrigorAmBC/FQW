import {Component} from '@angular/core';
import {AgoraCallService} from "../../services/meet/agora-call.service";
import {IAgoraRTCClient} from "agora-rtc-sdk-ng";

@Component({
  selector: 'app-meet',
  templateUrl: './meet.component.html',
  styleUrls: ['./meet.component.css']
})
export class MeetComponent {

  live = false
  client: IAgoraRTCClient;

  constructor(private meetService: AgoraCallService) {
  }

  public start() {
    // initialize
    this.client = this.meetService.getRtcClient();

//todo: fine tune the way you show video streams
    //todo: a helper lib https://github.com/muaz-khan/MultiStreamsMixer

    // subscribe to events
    this.client.on("user-unpublished", user => {
      // Get the dynamically created DIV container.
      const playerContainer = document.getElementById(user.uid.toString());
      // Destroy the container.
      playerContainer.remove();
    });
    this.client.on("user-published", async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);
      console.log("subscribe success");

      if (mediaType === "video") {
        // Get `RemoteVideoTrack` in the `user` object.
        const remoteVideoTrack = user.videoTrack;
        // Dynamically create a container in the form of a DIV element for playing the remote video track.
        const playerContainer = document.createElement("div");
        // Specify the ID of the DIV container. You can use the `uid` of the remote user.
        playerContainer.id = user.uid.toString();
        playerContainer.style.width = "640px";
        playerContainer.style.height = "480px";
        playerContainer.append('<div><label for="name">Other user</label></div>');
        document.body.append(playerContainer);

        // Play the remote video track.
        // Pass the DIV container and the SDK dynamically creates a player in the container for playing the remote video track.
        remoteVideoTrack.play(playerContainer);

        // Or just pass the ID of the DIV container.
        // remoteVideoTrack.play(playerContainer.id);
      }

      // If the subscribed track is audio.
      if (mediaType === "audio") {
        // Get `RemoteAudioTrack` in the `user` object.
        const remoteAudioTrack = user.audioTrack;
        // Play the audio track. No need to pass any DOM element.
        remoteAudioTrack.play();
      }
    });

    // join, publish all things todo: implement authentication to get token, save it in cookies
    const channelNameDoc = document.getElementById("channelName") as HTMLInputElement;
    this.meetService.join(channelNameDoc.value).then(
      ok => {
        this.meetService.publishAudioVideo()
        // close the view
        this.live = true
      }
    ).catch(error => console.log(error))


    // this.meetService.join(channelName.value)
    /*this.meetService.initializeRtcClient();
    this.meetService.join(channelNameInput.value);
    this.meetService.publishAudioVideo();*/
  }

}
