/*
 * @Descripttion:
 * @version:
 * @Author: yding
 * @Date: 2020-05-08 19:01:09
 * @LastEditors: yding
 * @LastEditTime: 2020-06-17 20:11:04
 */

import { NgModule } from "@angular/core";
import { HmNgVideoComponent } from "./hm-ng-video.component";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [HmNgVideoComponent],
  imports: [CommonModule],
  exports: [HmNgVideoComponent],
})
export class HmNgVideoModule {}
