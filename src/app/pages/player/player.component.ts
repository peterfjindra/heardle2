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

  constructor(){
    this.audio.loadTrack('../../../assets/SABLE_132_F_Vibes_4_Percussion_132BPM_Fmajor_BANDLAB.wav');

    this.audio.getState()
      .subscribe(state => {
          this.state = state;
      });
  }

  isFirstPlaying() {
    return false;
  }
  isLastPlaying() {
    return true;
  }

  onSliderChangeEnd(event:any){}

  play(){
    this.audio.play();
  }

  pause(){
    this.audio.pause();
  }
}
