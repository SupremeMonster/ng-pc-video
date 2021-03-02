import { Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";
import { filter } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class EventBusService {
  private eventSubject: Subject<EBEvent> = new Subject<EBEvent>();
  private $ob = this.eventSubject.asObservable();
  public Observable(type: EventType): Observable<EBEvent> {
    return this.$ob.pipe(filter((e) => e.type === type));
  }

  public get $Observable(): Observable<EBEvent> {
    return this.$ob;
  }

  send(e: EBEvent) {
    this.eventSubject.next(e);
  }

  constructor() {}
}

export class EBEvent {
  constructor(public type: EventType, public data?: any) {}
}

export enum EventType {
  // 定时任务相关
  CronValue = "CronValue",
}
