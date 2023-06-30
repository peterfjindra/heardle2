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
  todaysSong:Song = {artist:"a song", title:"Please select", id:"dummy"} as Song;
  filteredSongs:Song[] = [];
  allSongs:Song[] = [];
  guessForm: UntypedFormGroup;
  searchType:string = "both";
  selectedSong:Song = {artist:"a song", title:"Please select", id:"dummy"} as Song;

  constructor(private _ngZone: NgZone, private songDataService:SongDataService, private fb:UntypedFormBuilder){
    this.songDataService.getRandomSong()
      .subscribe({
        next:(songs: Song[]) => {
          var randomIndex = Math.floor(Math.random()*songs.length);
          this.todaysSong = songs[randomIndex];
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
        uri: `spotify:track:${this.todaysSong.id}`
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

  selectSong(song:Song){
    this.selectedSong = song;
  }

  guess(){
    if(this.currentGuess < 6) {
      if(this.selectedSong.id === this.todaysSong.id) {
        this.currentGuess = 6;
        console.log("WINNER");
      }
      else {
        console.log("TRY AGAIN");

        if(this.currentGuess === 5) {
          console.log(this.todaysSong.artist + " - " + this.todaysSong.title)
        }

        this.currentGuess++;
        this.currentTime = 0;
      }
    }
  }

  onInput(){
    this.filteredSongs = [];
    var guess:string = this.guessForm.value.guessText.toLowerCase();

    if(!guess || guess.length < 2)
      return;

    var limit = () => {
      switch(guess.length) {
        case 2: return 10;
        case 3: return 15;
        default: return 25;
      }
    }
    if(guess && guess.length > 1) {
      this.allSongs.forEach((song) => {
        if(this.filteredSongs.length > limit())
          return;

        switch(this.searchType) {
          case "song":
            if(song.title.toLowerCase().includes(guess)) {
              this.filteredSongs.push(song);
            }
            break;
          case "artist":
            if(song.artist.toLowerCase().includes(guess)) {
              this.filteredSongs.push(song);
            }
            break;
          case "both":
          default:
            if(song.artist.toLowerCase().includes(guess) || song.title.toLowerCase().includes(guess)) {
              this.filteredSongs.push(song);
            }
            break;

        }
      })
    }
  }

  displayTime(time:number):string {
    if(isNaN(time))
      time = 20;

    return time > 9 ? "0:" + time.toString() : "0:0" + time.toString();
  }

  currentMaxTime = () => this.GUESS_TIMES[this.currentGuess] / 1000;
}
