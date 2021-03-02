/*
 * @Descripttion:
 * @version:
 * @Author: yding
 * @Date: 2020-05-08 18:43:11
 * @LastEditors: yding
 * @LastEditTime: 2020-09-18 09:30:56
 */

import { Component, OnInit, ViewChild } from "@angular/core";
import VConsole from "vconsole";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.less"],
})
export class AppComponent implements OnInit {
  @ViewChild("myPlayer") videoNgComponent: any;
  fileOptions: any = null;
  liveOptions: any = null;
  autoplay = false;
  isMobile = true;
  public text = "http://61.155.108.86:83/openUrl/z57sRiw/live.m3u8";
  public list = [0];
  constructor() {}

  play(src?) {
    if (src) {
      this.text = src;
    }
    //this.fileOptions = null;
    this.fileOptions = Object.assign({}, this.fileOptions, {
      //poster: "assets/C.jpg",
      sources: [
        {
          src: "assets/test2.mp4",
          type: "video/mp4",
        },
      ],
    });
    // this.liveOptions[0] = null;
    this.liveOptions[0] = Object.assign({}, this.liveOptions[0], {
      //poster: "assets/C.jpg",
      sources: [
        {
          src: this.text,
          type: "application/x-mpegURL",
        },
      ],
    });
  }
  handleWaiting($event) {
    console.log("正在缓冲");
  }
  handlePause($event) {
    console.log("暂停");
  }
  handlePlaying($event) {
    console.log("正在播放", $event);
    if (!this.liveOptions) {
      this.fileOptions = null;
      this.liveOptions = {
        poster: "assets/C.jpg",
        sources: [
          {
            //src: "http://zhibo.hkstv.tv/livestream/mutfysrq/playlist.m3u8",
            src: "http://61.155.108.86:83/openUrl/z57sRiw/live.m3u8",
            type: "application/x-mpegURL",
          },
        ],
      };
      this.autoplay = true;
    }
  }
  handleError($event) {
    console.log("出错了", $event);
  }
  handleLoaded($event) {
    console.log($event);
  }
  handleReload($event) {
    console.log($event);
  }
  handleToggleFullScreen($event) {
    console.log("全屏", $event);
  }
  ngOnInit() {
    const vConsole = new VConsole();

    this.liveOptions = {
      poster: "assets/C.jpg",
      sources: [
        {
          src: "http://180.96.50.162:83/openUrl/i4CT9WE/live.m3u8",
          //src: "http://61.155.108.86:83/openUrl/z57sRiw/live.m3u8",
          type: "application/x-mpegURL",
        },
      ],
    };
    setTimeout(() => {
      this.liveOptions = {
        poster: "assets/C.jpg",
        sources: [
          {
            src: "http://180.96.50.162:83/openUrl/lCVjGN2/live.m3u8",
            //src: "http://61.155.108.86:83/openUrl/z57sRiw/live.m3u8",
            type: "application/x-mpegURL",
          },
        ],
      };
    }, 5000);
    // this.fileOptions = {
    //   // loop: true,
    //   poster: "assets/C.jpg",
    //   sources: [
    //     {
    //       src:
    //         "http://180.96.50.164:8180/hls/d60965d306e6402c858664b67e342fe2/d60965d306e6402c858664b67e342fe2.m3u8",
    //       type: "application/x-mpegURL",
    //     },
    //   ],
    // };
  }
}
