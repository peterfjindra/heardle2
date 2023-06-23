import { Component } from '@angular/core';
import { AudioStream, StreamState } from 'rxjs-audio';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent {
  audio:AudioStream = new AudioStream();
  state:StreamState = {playing:false, trackInfo:{currentTrack:0, duration:0, currentTime:0}};
  callback:any;

  constructor(){
    this.audio.loadTrack('http://open.spotify.com/embed/track/6rqhFgbbKwnb9MLmUQDhG6');

    this.audio.getState()
      .subscribe(state => {
          this.state = state;
      });
  }

  createIFrame() {
    const iFrameScript = document.createElement('script');
    iFrameScript.src='https://open.spotify.com/embed-podcast/iframe-api/v1';
    iFrameScript.addEventListener('load', (e) => {
      console.log(e);
    });
    document.head.appendChild(iFrameScript);
    document.head.appendChild(iFrameScript);
    // @ts-ignore
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      const element = document.getElementById('embed-iframe');
      const options = {
        uri: 'spotify:episode:7makk4oTQel546B0PZlDM5'
      };
      // @ts-ignore
      const callback = (EmbedController) => {
          EmbedController.play();
      };
      IFrameAPI.createController(element, options, callback);
    };
  }

  isFirstPlaying() {
    return false;
  }
  isLastPlaying() {
    return true;
  }

  onSliderChangeEnd(event:any){}

  play(){
    this.createIFrame();
  }

  pause(){
    this.audio.pause();
  }
}
