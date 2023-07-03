import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, count, skipUntil, skipWhile, take, tap } from "rxjs";
import { Song } from "src/app/shared/models/song";
import { environment } from '../../../environments/environment';
import { UserData } from "src/app/shared/models/user-data";
import { JsonBin } from "src/app/shared/models/json-bin";

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
    return this.httpClient.get<JsonBin<UserData>>("https://api.jsonbin.io/v3/b/64a2f9b6b89b1e2299b92dcf",{ 'headers': this.headers }).pipe();
  }

  replaceUsers(users:UserData[]) {
    this.httpClient.put<UserData[]>("https://api.jsonbin.io/v3/b/64a2f9b6b89b1e2299b92dcf", users, { 'headers': this.headers }).subscribe();
  }
}
