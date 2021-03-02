import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable, of } from "rxjs";
import { switchMap, map } from "rxjs/operators";
// const baseUrl = `${environment.GATEWAY_PROXY_URL}/${environment.TGIP_SERVICE}/api/v1/job`;
// const host = '' ;
// const service = 'tgipserver/api';
// const version = 'v3';
// const key = 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1dGgiOiJST0xFX0FETUlOLFJPTEVfVVNFUiIsImV4cCI6MTU5MzkzOTAzMn0.aoSJyiBMOlw-ep4wz514lyLNwiku1fT6vbWDwPa2mLNyR0Y5PrS7bdYro9XVrraTrpm_db-_DJDjNxHf34PKig';
// const config = {headers: {
//     'Authorization': 'Bearer ' + key,
//   }
// };
// const baseUrl = `${host}/${service}/${version}/job`;
@Injectable({
  providedIn: "root",
})
export class HmNgCronService {
  public host = "";
  public service = "";
  public version = "";
  public key = "";
  public config = {
    headers: {
      Authorization: "Bearer " + this.key,
    },
  };
  public baseUrl = `${this.host}/${this.service}/${this.version}/job`;
  constructor(public http: HttpClient) {}

  getCronLists(current, size, cronName?): Observable<any> {
    return this.http
      .get(
        this.baseUrl +
          `/list?page=${current}&pageSize=${size}` +
          (cronName ? `&jobName=${cronName}` : ``),
        this.config
      )
      .pipe(
        switchMap((page: any) => {
          if (
            page &&
            page.data.records.length === 0 &&
            page.data.current !== 1
          ) {
            return this.getCronLists(current - 1, size);
          } else {
            return of(page).pipe(map((res: { data }) => res.data));
          }
        })
      );
  }
  // 新增或编辑定时任务
  saveCron(param): Observable<any> {
    return this.http.post(`${this.baseUrl}`, param, this.config);
  }
  // 停止或恢复定时任务
  stopOrRestartCron(param, isStop): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/${isStop ? "pause" : "resume"}`,
      param,
      this.config
    );
  }
  // 强制停止定时任务
  forceStopOrRestartCron(param): Observable<any> {
    return this.http.post(`${this.baseUrl}/pause?force=1`, param, this.config);
  }
  // 删除定时任务
  deleteCron(param): Observable<any> {
    return this.http.post(`${this.baseUrl}/remove`, param, this.config);
  }
  // 执行一次
  triggerOne(param): Observable<any> {
    return this.http.post(`${this.baseUrl}/trigger`, param, this.config);
  }
  // 检测一个类是否存在
  checkClass(className): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/check-class?className=${className}`,
      this.config
    );
  }
}
