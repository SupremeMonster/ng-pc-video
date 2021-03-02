/*
 * @Descripttion:
 * @version:
 * @Author: yding
 * @Date: 2020-06-15 09:36:35
 * @LastEditors: yding
 * @LastEditTime: 2020-06-17 18:37:36
 */

import { NgModule } from "@angular/core";
import { HmWebVideoComponent } from "./hm-web-video.component";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [HmWebVideoComponent],
  imports: [CommonModule],
  exports: [HmWebVideoComponent],
})
export class HmWebVideoModule {}
