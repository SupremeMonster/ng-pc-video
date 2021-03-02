/*
 * @Descripttion:
 * @version:
 * @Author: yding
 * @Date: 2020-05-08 18:43:11
 * @LastEditors: yding
 * @LastEditTime: 2020-07-21 15:52:52
 */

import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { HmWebVideoModule } from "../../dist/hm-web-video";
import { HmNgVideoModule } from "../../dist/hm-ng-video";
import { VideoTestComponent } from './video/video-test/video-test.component';
import { VideoTestOneComponent } from './video/video-test-one/video-test-one.component';

@NgModule({
  declarations: [AppComponent, VideoTestComponent, VideoTestOneComponent],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HmNgVideoModule,
    HmWebVideoModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
