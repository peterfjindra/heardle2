import { Component, NgZone, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from '@auth0/auth0-angular';
import { tap } from 'rxjs';
import { AudioStream } from 'rxjs-audio';
import { JsonBin } from 'src/app/shared/models/json-bin';
import { Song } from 'src/app/shared/models/song';
import { UserData } from 'src/app/shared/models/user-data';
import { SongDataService } from './song-data.service';
import { SongLog } from 'src/app/shared/models/song-log';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  user$ = this.auth.user$;
  currentUserID:string = "";
  currentUserData:UserData = {} as UserData;
  allUsers: UserData[] = [];

  allSongLogs: SongLog[] = [];

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
  guessState:string[] = ["⬜️","⬜️","⬜️","⬜️","⬜️","⬜️"];

  gameOver:boolean = true;
  gameOverText:string = ""

  constructor(private _ngZone: NgZone, private songDataService:SongDataService, private fb:UntypedFormBuilder, private auth: AuthService){
    this.guessForm = this.fb.group({
      'guessText':["", [Validators.required, Validators.pattern('[a-zA-Z0-9 ."=]*$')]]
    })
  }


  ngOnInit(): void {
    this.loadSong().then(() => this.loadUser());
  }

  async loadSong(){
    this.songDataService.getAllSongs()
      .subscribe({
        next:(songs: Song[]) => {
          this.allSongs = songs;
        }
      });

    var tempSongLogs$ = await this.songDataService.getSongLogs();

    tempSongLogs$
      .subscribe({
        next:(songLogs:JsonBin<SongLog>) => {
          this.allSongLogs = songLogs.record;
          var firstLog = this.allSongLogs[0];
          if(firstLog.date == this.today()) {
            var tempSong = this.allSongs.find(s => s.id == firstLog.id);
            if(tempSong)
              this.todaysSong = tempSong;
          }
          else {
            var randomIndex = Math.floor(Math.random()*this.allSongs.length);
            tempSong = this.allSongs[randomIndex];
            while(this.allSongLogs.find(sl => sl.id == tempSong?.id)) {
              randomIndex = Math.floor(Math.random()*this.allSongs.length);
              tempSong = this.allSongs[randomIndex];
            }
            this.todaysSong = tempSong;
            let todaysLog = {id:this.todaysSong.id, date:this.today()} as SongLog;
            if(this.allSongLogs.length > 700) {
              this.allSongLogs.splice(699);
            }
            this.allSongLogs.unshift(todaysLog);
            let newAllSongLogs = this.allSongLogs;
            this.songDataService.replaceSongLogs(newAllSongLogs);
          }
        }
      })
  }

  async loadUser() {
    this.user$.pipe(tap((user: any) => { console.log(user); this.currentUserID = user.sub; })).subscribe();

    var tempUsers$ = await this.songDataService.getAllUsers();

    tempUsers$
      .subscribe({
        next:(users:JsonBin<UserData>) => {
          users.record.forEach(user => {
            this.allUsers.push(user);
            if(user.uid == this.currentUserID) {
              this.currentUserData = user;
            }
          });

          if(!this.currentUserData?.uid) {
            this.allUsers.push({
              uname:"name",
              uid:this.currentUserID,
              lastPlayed:"",
              scores:{0:0,1:0,2:0,3:0,4:0,5:0,6:0}
            } as UserData);
            this.songDataService.replaceUsers(this.allUsers);
          }

          if(this.currentUserData.lastPlayed == this.today()) {
            this.guessState = this.currentUserData.lastScore.split('');
            if(!this.playerLoaded)
              this.createIFrame();
          }
          else {
            this.gameOver = false;
          }
        }
      });
  }

  async createIFrame() {
    while(!this.playerLoaded && this.todaysSong.id == "dummy"){
      await setTimeout(()=>{}, 500)
    }

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
        width: 1,
        height: 1,
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
        })
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
    this.gameOverText = finalScore == 0 ? "Try again tomorrow!" : "Winner winner!";

    if(!this.playerLoaded)
      this.createIFrame();

    this.allUsers.forEach(u => {
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

    this.songDataService.replaceUsers(this.allUsers as UserData[]);
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

  today():string{
    var today = new Date();
    return today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
  }

  currentMaxTime = () => this.GUESS_TIMES[this.currentGuess] / 1000;
}
