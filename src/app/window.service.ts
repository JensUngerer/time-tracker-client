import { Injectable } from '@angular/core';


function getWindow(): any {
  return window;
}

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  constructor() { }

  get nativeWindow(): any {
    return getWindow();
  }
}
