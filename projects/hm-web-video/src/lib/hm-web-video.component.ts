import {
  Component,
  OnInit,
  ViewChild,
  Input,
  ElementRef,
  ViewEncapsulation,
  OnDestroy,
  EventEmitter,
  Output,
  OnChanges,
  SimpleChanges,
  Renderer2,
} from "@angular/core";
declare var require;
const Hls = require("hls.js");
@Component({
  selector: "hm-web-video",
  templateUrl: "./hm-web-video.component.html",
  styleUrls: ["./hm-web-video.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class HmWebVideoComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild("fileVideoEl") fileVideo: ElementRef;
  @ViewChild("liveVideoEl") liveVideo: ElementRef;
  @Input() fileOptions?: {
    loop: boolean;
    controls: boolean;
    poster: string;
    preload: "auto" | "metadata" | "none";
    sources: {
      src: string;
      type: string;
    }[];
  };
  @Input() liveOptions?: {
    controls: boolean;
    poster: string;
    preload: "auto" | "metadata" | "none";
    sources: {
      src: string;
      type: string;
    }[];
  };
  @Input() autoplay: boolean;
  @Input() videoHeight: number;
  @Input() videoWidth: number;
  @Input() className: string;
  @Input() loadingSrc: string;
  @Input() maxReloadTimes?: number;
  @Input() errorContent?: string;
  @Input() maxLoadTime?: number;

  @Output() PauseEventListener = new EventEmitter<string>(); // 暂停回调
  @Output() PlayingEventListener = new EventEmitter<string>(); // 开始播放回调
  @Output() WaitingEventListener = new EventEmitter<string>(); // 缓冲回调
  @Output() ErrorEventListener = new EventEmitter<string>(); // 错误回调
  @Output() DataLoadedEventListener = new EventEmitter<string>(); // 数据加载完成回调
  @Output() CanPlayEventListener = new EventEmitter<string>(); // 可以播放回调
  @Output() ReLoadVideoEventListener = new EventEmitter<string>(); // 重新加载

  @Output() FullScreenToggeleEventListener = new EventEmitter<boolean>(); // 切换全屏

  private startTime = 0;
  private endTime = 0;
  private fileHls: any;
  private liveHls: any;
  private fileVideoEl: any;
  public liveVideoEl: any;
  public liveLoaded = false;
  private isVideoBreak: any;
  private isVideoLoadingTimeout: any;

  constructor(private el: ElementRef, public renderer: Renderer2) {}

  public createDom(type: "file" | "live", isAutoPlay?) {
    if (type === "file") {
      this.fileVideo.nativeElement.innerHTML =
        `<video poster='${this.fileOptions.poster || ""}' id='${
          this.className
        }-fileVideo'` +
        (this.fileOptions.loop ? ` 'loop'='loop' ` : ``) +
        `controls controlslist='nofullscreen nodownload noremoteplayback' disablePictureInPicture='true' muted ` +
        (this.autoplay ? ` autoplay ` : ``) +
        `x-webkit-airplay='true' webkit-playsinline='true' playsinline='true' x5-playsinline='true' x5-video-player-type='h5'></video>`;
    } else {
      const guide =
        `<div class='loading ${this.className}-loading'><img src='` +
        (this.loadingSrc || "") +
        `' alt='' ></div>`;
      const error =
        `<div class='error ${this.className}-error'><span>` +
        (this.errorContent || "") +
        `</span></div>`;
      this.liveVideo.nativeElement.innerHTML =
        `<video id='${this.className}-liveVideo' poster='${
          this.liveOptions.poster || ""
        }' controls controlslist='nodownload noremoteplayback' disablePictureInPicture='true' muted ` +
        (isAutoPlay ? ` autoplay ` : ``) +
        `x-webkit-airplay='true' webkit-playsinline='true' playsinline='true' x5-playsinline='true' x5-video-player-type='h5'></video>` +
        guide +
        error;
      this.el.nativeElement
        .querySelector(`.${this.className}-error`)
        .addEventListener("click", () => {
          this.setBgVisible("error", false);
          this.createLivePlayer(true);
        });
    }
  }
  public init() {
    this.liveLoaded = false;
    // 只播放其中一种就传一种类型的option
    if (this.fileOptions) {
      this.createDom("file");
      this.fileVideoEl = this.el.nativeElement.querySelector(
        `#${this.className}-fileVideo`
      );
      if (this.fileVideoEl.canPlayType("application/vnd.apple.mpegurl")) {
        this.fileVideoEl.src = this.fileOptions.sources[0].src;
        console.log("native play");
      } else if (Hls.isSupported()) {
        this.fileHls = new Hls();
        this.fileHls.loadSource(this.fileOptions.sources[0].src);
        this.fileHls.attachMedia(this.fileVideoEl);
      }
      this.fileVideoEl.addEventListener("error", ($event) => {
        this.handleFileError($event);
      });
      this.fileVideoEl.addEventListener("playing", ($event) => {
        this.handleFilePlaying($event);
      });
      this.fileVideoEl.addEventListener("pause", ($event) => {
        this.handleFilePause($event);
      });
    } else {
      this.createLivePlayer(); // 如果没有文件流，则按照设置的是否自动播放执行
    }
  }

  // 创建直播流 ,内部传就按照内部传的，不传则根据调用的决定
  public createLivePlayer(isAutoPlay?, isLoading?) {
    if (!this.liveOptions) {
      return;
    }
    this.createDom("live", isAutoPlay ? isAutoPlay : this.autoplay);
    if (isLoading) {
      this.setBgVisible("loading", true);
    }
    this.liveVideoEl = this.el.nativeElement.querySelector(
      `#${this.className}-liveVideo`
    );
    if (this.liveVideoEl.canPlayType("application/vnd.apple.mpegurl")) {
      this.liveVideoEl.src = this.liveOptions.sources[0].src;
    } else if (Hls.isSupported()) {
      this.liveHls = new Hls();
      this.liveHls.loadSource(this.liveOptions.sources[0].src);
      this.liveHls.attachMedia(this.liveVideoEl);
    }
    this.liveVideoEl.addEventListener("loadstart", ($event) => {
      this.handleLiveLoadStart($event);
    });
    this.liveVideoEl.addEventListener("loadedmetadata", ($event) => {
      this.hanleLiveLoadedMetaData($event);
    });
    this.liveVideoEl.addEventListener("canplaythrough", ($event) => {
      this.handleLiveCanPlayThrough($event);
    });
    this.liveVideoEl.addEventListener("playing", ($event) => {
      this.handleLivePlaying($event);
    });
    this.liveVideoEl.addEventListener("error", ($event) => {
      this.handleLiveError($event);
    });
    this.liveVideoEl.addEventListener("pause", ($event) => {
      this.handleLivePause($event);
    });
    this.liveVideoEl.addEventListener("timeupdate", ($event) => {
      this.handleLiveTimeUpdate($event);
    });
    this.liveVideoEl.addEventListener("fullscreenchange", ($event) => {
      this.handleToggleFullScreen($event);
    });
  }
  // 获取player实例
  public getFilePlayer() {
    return this.fileVideoEl || undefined;
  }
  public getLivePlayer() {
    return this.liveVideoEl || undefined;
  }
  // 销毁播放器
  public dispose(type: "live" | "file") {
    if (type === "live") {
      if (!this.liveVideoEl) {
        return;
      }
      this.liveHls.destroy();
      this.liveVideoEl.remove();
      this.liveVideoEl = undefined;
    } else {
      if (!this.fileVideoEl) {
        return;
      }
      this.fileHls.destroy();
      this.fileVideoEl.remove();
      this.fileVideoEl = undefined;
    }
  }

  // 销毁定时器
  public destroyTimeout() {
    clearTimeout(this.isVideoBreak);
    clearTimeout(this.isVideoLoadingTimeout);
    this.isVideoBreak = undefined;
    this.isVideoLoadingTimeout = undefined;
  }
  // 全部销毁
  public destroy() {
    this.destroyTimeout();
    this.dispose("file");
    this.dispose("live");
  }

  // 错误弹窗
  public openModal() {
    this.fileOptions = null;
    this.destroy();
    this.setBgVisible("loading", false);
    this.setBgVisible("error", true);
  }
  // 设置加载背景/错误背景显示隐藏
  public setBgVisible(type: "loading" | "error", isShow: boolean) {
    const el =
      type === "loading"
        ? this.el.nativeElement.querySelector(`.${this.className}-loading`)
        : this.el.nativeElement.querySelector(`.${this.className}-error`);
    this.renderer.setStyle(el, "display", isShow ? "block" : "none");
  }
  // 判断是ios设备
  public isIOS(): boolean {
    const u = navigator.userAgent;
    const isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // ios终端
    console.log("ios", isIOS);
    return isIOS;
  }

  // 针对文件流的处理
  private handleFileError($event) {
    this.ErrorEventListener.emit($event);
    console.log("文件流出错了！");
    this.dispose("file");
    this.fileOptions = null;
    this.createLivePlayer(true, true);
  }
  private handleFilePlaying($event) {
    this.PlayingEventListener.emit($event);
    if (!this.liveVideoEl) {
      this.createLivePlayer(true); // 文件流和直播流都存在的情况下，如果不是自动播放，则强行创造自动播放的直播流
    }
  }
  private handleFilePause($event) {
    this.PauseEventListener.emit($event);
  }

  // 针对直播流的处理
  private handleLiveError($event) {
    this.ErrorEventListener.emit($event);
    console.log("直播流出错了！");
    this.openModal();
  }
  private handleLiveLoadStart($event) {
    console.log("直播流开始load");
    this.startTime = new Date().getTime();
    this.setBgVisible("loading", true);
    if (!this.isVideoLoadingTimeout) {
      this.isVideoLoadingTimeout = setTimeout(() => {
        if (
          this.liveVideoEl &&
          this.liveVideoEl.readyState !== 3 &&
          this.liveVideoEl.readyState !== 4
        ) {
          this.openModal();
          this.ErrorEventListener.emit("overtime");
          console.log("加载超时！");
        }
      }, this.maxLoadTime || 15000);
    }
  }
  private hanleLiveLoadedMetaData($event) {
    this.liveVideoEl.play();
    this.endTime = new Date().getTime();
    console.log("直播流加载成功");
    this.DataLoadedEventListener.emit(
      Object.assign($event, { bufferTime: this.endTime - this.startTime })
    );
  }
  private handleLivePlaying($event) {
    console.log("直播流正在播放！");
    this.destroyTimeout();
    this.setBgVisible("loading", false);
    this.PlayingEventListener.emit($event);
  }
  private handleLivePause($event) {
    this.PauseEventListener.emit($event);
  }
  private handleLiveCanPlayThrough($event) {
    if (
      this.liveVideoEl &&
      (this.liveVideoEl.readyState === 3 || this.liveVideoEl.readyState === 4)
    ) {
      setTimeout(() => {
        this.dispose("file");
        this.liveLoaded = true;
        this.setBgVisible("loading", false);
      }, 1000);
      this.CanPlayEventListener.emit($event);
    }
    console.log(this.liveVideoEl.readyState, "canplaythrough");
  }
  private handleLiveTimeUpdate($event) {
    if (!this.isVideoBreak) {
      if (
        this.liveVideoEl &&
        this.liveVideoEl.readyState !== 3 &&
        this.liveVideoEl.readyState !== 4
      ) {
        this.WaitingEventListener.emit($event);
        this.isVideoBreak = setTimeout(() => {
          if (
            this.liveVideoEl &&
            this.liveVideoEl.readyState !== 3 &&
            this.liveVideoEl.readyState !== 4
          ) {
            this.openModal();
            this.ErrorEventListener.emit("overtime");
            console.log("缓冲超时！");
          }
        }, this.maxLoadTime || 15000);
      }
    }
  }
  private handleToggleFullScreen($event) {
    console.log("全屏", $event);
  }

  ngOnInit() {
    console.log("hm-web-video 1.0.9");
  }
  ngOnChanges(changes: SimpleChanges) {
    if (
      (changes.fileOptions &&
        changes.fileOptions.firstChange &&
        changes.fileOptions.currentValue) ||
      (changes.liveOptions &&
        changes.liveOptions.firstChange &&
        changes.liveOptions.currentValue)
    ) {
      this.init();
    }
    if (
      (changes.fileOptions &&
        changes.fileOptions.currentValue &&
        !changes.fileOptions.firstChange) ||
      (changes.liveOptions &&
        changes.liveOptions.currentValue &&
        !changes.liveOptions.firstChange)
    ) {
      this.destroy();
      setTimeout(() => {
        this.init();
      }, 1000);
    }
  }
  ngOnDestroy() {
    this.destroy();
  }
}
