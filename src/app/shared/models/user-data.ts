export interface UserData {
  uname:string;
  uid:string;
  lastPlayed:string;
  lastScore:string;
  scores:Scores;
}

export interface Scores {
  0:number;
  1:number;
  2:number;
  3:number;
  4:number;
  5:number;
  6:number;
}

export interface UserDataContext {
  currentUser:UserData;
  allUsers:UserData[];
}
