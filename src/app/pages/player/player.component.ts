import { Component, NgZone } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AudioStream } from 'rxjs-audio';
import { Song } from 'src/app/shared/models/song';
import { SongDataService } from './song-data.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent {
  audio:AudioStream = new AudioStream();
  playerLoaded:boolean = false;
  pleasePlay:boolean = false;
  playing = false;
  currentTime = 0;
  GUESS_TIMES = [1000, 2000, 3000, 5000, 10000, 20000];
  currentGuess = 0;
  songID:string = "";
  filteredSongs:Song[] = [];
  allSongs:Song[] = [];
  guessForm: UntypedFormGroup;

  constructor(private _ngZone: NgZone, private songDataService:SongDataService, private fb:UntypedFormBuilder){
    this.songDataService.getRandomSong()
      .subscribe({
        next:(songs: Song[]) => {
          var randomIndex = Math.floor(Math.random()*songs.length);
          this.songID = songs[randomIndex].id;
          this.allSongs = songs;
        }
      });

    this.guessForm = this.fb.group({
      'guessText':["", [Validators.required, Validators.pattern('[a-zA-Z0-9 ."=]*$')]]
    })
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
        uri: `spotify:track:${this.songID}`
      };
      // @ts-ignore
      const callback = (EmbedController) => {
        // @ts-ignore
        const timer = ms => new Promise(res => setTimeout(res, ms));
        const timer1000 = () => new Promise(res => setTimeout(res, 1000));


        EmbedController.addListener('ready', async () => {
          const load = async () => {
            if(this.pleasePlay) {
              EmbedController.play();

              this._ngZone.run(() => {
                this.playing = true;
              });

              this.currentTime = 0;
              for(let i = 0; i < this.currentMaxTime(); i++) {
                await timer1000();
                this._ngZone.run(() => {
                  this.currentTime++;
                });
              }
              this._ngZone.run(() => {
                this.playing = false;
                this.pleasePlay = false;
              });

              EmbedController.pause();
              EmbedController.seek(0);
            }
            await timer(500);
            if(this.currentGuess < 6)
              load();
          }

          load();
        })
      };

      IFrameAPI.createController(element, options, callback);
      this.playerLoaded = true;
    };
  }

  onSliderChangeEnd(event:any){}

  play(){
    if(this.currentGuess < 6)
      this.pleasePlay = true;

    if(!this.playerLoaded)
      this.createIFrame();
  }

  pause(){
  }

  updateCurrentTime(){
    this.currentTime++;
  }

  guess(){
    if(this.currentGuess < 6) {
      this.currentGuess++;
      this.currentTime = 0;
    }
  }

  onInput(){
    var guess:string = this.guessForm.value.guessText.toLowerCase();
    this.filteredSongs = [];
    if(guess && guess.length > 0) {
      this.allSongs.forEach((song) => {
        if(song.artist.toLowerCase().includes(guess) || song.title.toLowerCase().includes(guess)) {
          this.filteredSongs.push(song);
        }
      })
    }
  }

  currentMaxTime = () => this.GUESS_TIMES[this.currentGuess] / 1000;
}
