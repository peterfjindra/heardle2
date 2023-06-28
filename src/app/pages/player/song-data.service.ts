import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, take } from "rxjs";
import { Song } from "src/app/shared/models/song";

@Injectable({
  providedIn:'root'
})
export class SongDataService {

  constructor(private httpClient:HttpClient){

  }

  getRandomSong():Observable<Song[]> {
    return this.httpClient.get<Song[]>("assets/song_data.json")
      .pipe(take(1));
  }
}
