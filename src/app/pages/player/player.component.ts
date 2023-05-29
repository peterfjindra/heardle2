import { Component } from '@angular/core';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent {
  files: Array<any> = [
    { name: "First Song", artist: "Inder" },
    { name: "Second Song", artist: "You" }
  ];
  state:any;
  currentFile: any = {};

  isFirstPlaying() {
    return false;
  }
  isLastPlaying() {
    return true;
  }

  onSliderChangeEnd(event:any){}

  play(){} pause(){} previous(){} next(){}
}
