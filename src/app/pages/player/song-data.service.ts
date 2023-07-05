import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
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

  getSongLogs():Observable<JsonBin<SongLog>>{
    return this.httpClient.get<JsonBin<SongLog>>(environment.api.songLogEndpoint,{ 'headers': this.headers }).pipe();
  }

  replaceSongLogs(songLogs:SongLog[]){
    this.httpClient.put<SongLog[]>(environment.api.songLogEndpoint, songLogs, { 'headers': this.headers }).subscribe();
  }
}
