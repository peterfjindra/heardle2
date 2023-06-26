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
  playerLoaded:boolean = false;
  pleasePlay:boolean = false;

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
    // @ts-ignore
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      const element = document.getElementById('embed-iframe');
      const options = {
        width: 0,
        height: 0,
        uri: 'spotify:track:3ri4y4r1BFc9YiPNgFXeGW'
      };
      // @ts-ignore
      const callback = (EmbedController) => {
        // @ts-ignore
        const timer = ms => new Promise(res => setTimeout(res, ms));

        EmbedController.addListener('ready', async () => {
          const load = async () => {
            if(this.pleasePlay) {
              EmbedController.play();
              await timer(5000);
              EmbedController.pause();
              EmbedController.seek(0);
              this.pleasePlay = false;
            }
            await timer(500);
            load();
          }

          load();
        })
      };

      IFrameAPI.createController(element, options, callback);
      this.playerLoaded = true;
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
    this.pleasePlay = true;

    if(!this.playerLoaded)
      this.createIFrame();
  }

  pause(){
    this.audio.pause();
  }
}
