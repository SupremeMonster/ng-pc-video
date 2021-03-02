/*
 * @Descripttion:
 * @version:
 * @Author: yding
 * @Date: 2020-09-18 09:46:19
 * @LastEditors: yding
 * @LastEditTime: 2020-09-18 09:47:53
 */
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  OnDestroy,
} from "@angular/core";
import videojs from "video.js";
@Component({
  selector: "app-video-test",
  templateUrl: "./video-test.component.html",
  styleUrls: ["./video-test.component.less"],
})
export class VideoTestComponent implements OnInit, OnDestroy {
  @ViewChild("target") target: ElementRef;
  // see options: https://github.com/videojs/video.js/blob/mastertutorial-options.html
  @Input() options: {
    fluid: boolean;
    aspectRatio: string;
    autoplay: boolean;
    sources: {
      src: string;
      type: string;
    }[];
  };
  player: videojs.Player;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    // instantiate Video.js
    this.player = videojs(
      this.target.nativeElement,
      this.options,
      function onPlayerReady() {
        console.log("onPlayerReady", this);
      }
    );
  }

  ngOnDestroy() {
    // destroy player
    if (this.player) {
      this.player.dispose();
    }
  }
}
