import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { JsonBin } from "src/app/shared/models/json-bin";
import { Song } from "src/app/shared/models/song";
import { SongLog } from "src/app/shared/models/song-log";
import { UserData } from "src/app/shared/models/user-data";
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn:'root'
})
export class SongDataService {
  headers:HttpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('X-Master-Key', environment.api.xMasterKey);

  constructor(private httpClient:HttpClient){
  }

  getAllSongs():Observable<Song[]> {
    return this.httpClient.get<Song[]>("assets/song_data.json").pipe();
  }

  getAllUsers():Observable<JsonBin<UserData>> {
    return this.httpClient.get<JsonBin<UserData>>(environment.api.userEndpoint,{ 'headers': this.headers }).pipe();
  }

  replaceUsers(users:UserData[]) {
    this.httpClient.put<UserData[]>(environment.api.userEndpoint, users, { 'headers': this.headers }).subscribe();
  }

  getTodaysSong():Observable<Song>{
    let allSongs:Song[] = [];

    this.getAllSongs()
      .subscribe({
        next:(songs: Song[]) => {
          allSongs = songs;
        }
      });

    return this.httpClient.get<JsonBin<SongLog>>(environment.api.songLogEndpoint,{ 'headers': this.headers })
      .pipe(
        map(songLogs => {
          let todaysSong:Song = {} as Song;
          let allSongLogs = songLogs.record;
          var firstLog = allSongLogs[0];
          if(firstLog.date == this.today()) {
            var tempSong = allSongs.find(s => s.id == firstLog.id);
            if(tempSong)
              todaysSong = tempSong;
          }
          else {
            var randomIndex = Math.floor(Math.random()*allSongs.length);
            tempSong = allSongs[randomIndex];
            while(allSongLogs.find(sl => sl.id == tempSong?.id)) {
              randomIndex = Math.floor(Math.random()*allSongs.length);
              tempSong = allSongs[randomIndex];
            }
            todaysSong = tempSong;
            let todaysLog = {id:todaysSong.id, date:this.today()} as SongLog;
            if(allSongLogs.length > 700) {
              allSongLogs.splice(699);
            }
            allSongLogs.unshift(todaysLog);
            let newAllSongLogs = allSongLogs;
            this.replaceSongLogs(newAllSongLogs);

          }
          return todaysSong;
        })
      );
  }

  replaceSongLogs(songLogs:SongLog[]){
    this.httpClient.put<SongLog[]>(environment.api.songLogEndpoint, songLogs, { 'headers': this.headers }).subscribe();
  }

  today():string{
    var today = new Date();
    return today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
  }
}
