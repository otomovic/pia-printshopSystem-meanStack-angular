import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { UserType } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient)

  login(u: string, p: string){
    const data = {username: u, password: p}
    return this.http.post<UserType>("http://localhost:4000/users/login", data)
  }

  loginAdmin(u: string, p: string){
    const data = {username: u, password: p}
    return this.http.post<UserType>("http://localhost:4000/users/loginAdmin", data)
  }

  register(u: FormData){
    return this.http.post<{message: string}>("http://localhost:4000/users/register", u)
  }

  getUnacceptedUsers(){
    return this.http.get<UserType[]>("http://localhost:4000/users/unaccepted")
  }

  getAcceptedUsers(){
    return this.http.get<UserType[]>("http://localhost:4000/users/accepted")
  }

  acceptUser(username: string){
    return this.http.post("http://localhost:4000/users/accept", {username: username})
  }

  rejectUser(username: string){
    return this.http.post("http://localhost:4000/users/reject", {username: username})
  }

  deleteUser(username: string){
    return this.http.post("http://localhost:4000/users/delete", {username: username})
  }

  updateProfile(u: FormData){
    return this.http.post<{message: string, profileImage?: string}>("http://localhost:4000/users/update", u)
  }

  getPrintingCompanyNumber(){
    return this.http.get<number>("http://localhost:4000/stamparije/printingCompanyNumber")
  }
}
