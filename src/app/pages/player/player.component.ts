import { Component, NgZone, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from '@auth0/auth0-angular';
import { firstValueFrom, map } from 'rxjs';
import { AudioStream } from 'rxjs-audio';
import { Song } from 'src/app/shared/models/song';
import { SongLog } from 'src/app/shared/models/song-log';
import { UserData, UserDataContext } from 'src/app/shared/models/user-data';
import { SongDataService } from './song-data.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  user$ = this.auth.user$;
  currentUserID:string = "";
  userDataContext:UserDataContext = {} as UserDataContext;

  allSongLogs: SongLog[] = [];

  audio:AudioStream = new AudioStream();
  playerLoaded:boolean = false;
  pleasePlay:boolean = false;
  playing = false;
  played = false;

  currentTime = 0;
  GUESS_TIMES = [1000, 2000, 3000, 5000, 10000, 20000];
  currentGuess = 0;
  todaysSong:Song = {artist:"a song", title:"Please select", id:"dummy"} as Song;
  filteredSongs:Song[] = [];
  allSongs:Song[] = [];
  guessForm: UntypedFormGroup;
  searchType:string = "both";
  selectedSong:Song = {artist:"a song", title:"Please select", id:"dummy"} as Song;
  guessState:string[] = ["⬜️","⬜️","⬜️","⬜️","⬜️","⬜️"];

  gameOver:boolean = true;
  gameOverText:string = ""

  constructor(private _ngZone: NgZone, private songDataService:SongDataService, private fb:UntypedFormBuilder, private auth: AuthService){
    this.guessForm = this.fb.group({
      'guessText':["", [Validators.required, Validators.pattern('[a-zA-Z0-9 ."=]*$')]]
    });

    this.songDataService.getAllSongs()
      .subscribe({
        next:(songs: Song[]) => {
          this.allSongs = songs;
        }
      });
  }


  ngOnInit(): void {
    this.initData();
  }

  async initData(){
    const p1 = () => new Promise<string>(async (res) => {await this.loadSong(); res("resolved");});
    const p2 = () => new Promise<string>(async (res) => {await this.loadUser(); res("resolved");});

    p1().then((val) => { p2().then((val) => {this.createIFrame();})});
  }

  async loadSong(){
    this.todaysSong = await firstValueFrom(this.songDataService.getTodaysSong());
  }

  async loadUser(){
    this.currentUserID = await firstValueFrom(this.user$.pipe(map((user: any) => { return user.sub; })));

    this.userDataContext = await firstValueFrom(this.songDataService.getAllUsers(this.currentUserID));
  }

  async createIFrame() {
    if(this.userDataContext.currentUser.lastPlayed == this.today()) {
      this.guessState = this.userDataContext.currentUser.lastScore.split('');
      this.currentGuess = -1;
      this.played = true;
      this.endGame();
      return;
    }

    this.gameOver = false;

    const iFrameScript = document.createElement('script');
    iFrameScript.src='https://open.spotify.com/embed-podcast/iframe-api/v1';
    iFrameScript.addEventListener('load', (e) => {
    });
    document.head.appendChild(iFrameScript);
    // @ts-ignore
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      const element = document.getElementById('embed-iframe');
      const options = {
        width: 0,
        height: 0,
        uri: `spotify:track:${this.todaysSong.id}`,
        allow:'autoplay'
      };
      // @ts-ignore
      const callback = (EmbedController) => {
        // @ts-ignore
        const timer = ms => new Promise(res => setTimeout(res, ms));
        const timer1000 = () => new Promise(res => setTimeout(res, 1000));

        var playButton = document.querySelector('.custom-play-button');
        if(playButton){
          playButton.addEventListener('click', async () => {
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
                      if(!this.pleasePlay)
                        break;
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
              }
        )}


      };

      IFrameAPI.createController(element, options, callback);
      this.playerLoaded = true;

      const element2 = document.getElementById('embed-iframe-2');
          const options2 = {
            width: 400,
            height: 200,
            uri: `spotify:track:${this.todaysSong.id}`
          };
          // @ts-ignore
          const callback2 = (EmbedController) => {
            EmbedController.addListener('ready', () => {
              EmbedController.play();
            })
          };

        IFrameAPI.createController(element2, options2, callback2);
    };
  }

  play(){
    if(this.currentGuess < 6)
      this.pleasePlay = true;

    if(!this.playerLoaded)
      this.createIFrame();
  }

  stop(){
    this.pleasePlay = false;
    this.currentTime = 0;
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
        this.guessState[this.currentGuess] = "🟩";
        this.endGame();
      }
      else {
        if(this.selectedSong.artist == this.todaysSong.artist) {
          this.guessState[this.currentGuess] = "🟨";
        }
        else {
          this.guessState[this.currentGuess] = "⬛️";
        }

        if(this.currentGuess === 5) {
          this.currentGuess = -1;
          this.endGame();
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

  endGame(){
    this.gameOver = true;
    var finalScore = this.currentGuess + 1;
    this.gameOverText = this.displayGuessState().includes('🟩') ? "Winner winner!" : "Try again tomorrow!";

    if(this.played) {
      const iFrameScript = document.createElement('script');
      iFrameScript.src='https://open.spotify.com/embed-podcast/iframe-api/v1';
      iFrameScript.addEventListener('load', (e) => {
      });
      document.head.appendChild(iFrameScript);

    // @ts-ignore
      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        const element2 = document.getElementById('embed-iframe-2');
          const options2 = {
            width: 400,
            height: 200,
            uri: `spotify:track:${this.todaysSong.id}`
          };
          // @ts-ignore
          const callback2 = (EmbedController) => {
            EmbedController.addListener('ready', () => {
              EmbedController.play();
            })
          };

        IFrameAPI.createController(element2, options2, callback2);
      }
    }

    this.userDataContext.allUsers.forEach(u => {
      if(u.uid == this.currentUserID) {
        u.lastPlayed = this.today();
        u.lastScore = this.displayGuessState();
        switch(finalScore) {
          case 0: u.scores[0]++; break;
          case 1: u.scores[1]++; break;
          case 2: u.scores[2]++; break;
          case 3: u.scores[3]++; break;
          case 4: u.scores[4]++; break;
          case 5: u.scores[5]++; break;
          case 6: u.scores[6]++; break;
        }
      }
    })

    this.songDataService.replaceUsers(this.userDataContext.allUsers as UserData[]);
  }

  displayTime(time:number):string {
    if(isNaN(time))
      time = 20;

    return time > 9 ? "0:" + time.toString() : "0:0" + time.toString();
  }

  displayGuessState():string {
    var guessStateDisplay = "";
    this.guessState.forEach((guess) => {
      guessStateDisplay += guess;
    });
    return guessStateDisplay;
  }

  displayGuessStateCopy():string {
    var guessStateDisplay = "";
    this.guessState.forEach((guess) => {
      guessStateDisplay += guess;
    });
    return "Heardle2 " + this.today() + "\n" + guessStateDisplay;
  }

  today():string{
    var today = new Date();
    return today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
  }

  currentMaxTime = () => this.GUESS_TIMES[this.currentGuess] / 1000;
}
