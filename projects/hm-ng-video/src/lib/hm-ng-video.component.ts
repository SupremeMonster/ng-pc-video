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
// import videojs from "hm-videojs";
import videojs from "video.js";
@Component({
  selector: "hm-ng-video",
  templateUrl: "./hm-ng-video.component.html",
  styleUrls: ["./hm-ng-video.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class HmNgVideoComponent implements OnInit, OnDestroy, OnChanges {
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

  @Input() exitFullScreen?: boolean;

  @Output() PauseEventListener = new EventEmitter<string>(); // 暂停回调
  @Output() PlayingEventListener = new EventEmitter<string>(); // 开始播放回调
  @Output() WaitingEventListener = new EventEmitter<string>(); // 缓冲回调
  @Output() ErrorEventListener = new EventEmitter<string>(); // 错误回调
  @Output() DataLoadedEventListener = new EventEmitter<string>(); // 数据加载完成回调
  @Output() CanPlayEventListener = new EventEmitter<string>(); // 可以播放回调
  @Output() ReLoadVideoEventListener = new EventEmitter<string>(); // 重新加载

  @Output() FullScreenToggeleEventListener = new EventEmitter<boolean>(); // 切换全屏

  public liveLoaded = false;
  private filePlayer: videojs.Player;
  private livePlayer: videojs.Player;
  private isVideoBreak: any;
  private isVideoLoadingTimeout: any;

  private fullScreenTimer: any; // 监听全屏

  constructor(private el: ElementRef, public renderer: Renderer2) {}

  public createDom(type: "file" | "live") {
    if (type === "file") {
      this.fileVideo.nativeElement.innerHTML = `<video id='${this.className}-fileVideo' class='video-js vjs-big-play-centered'  controls muted preload='none' x-webkit-airplay='true' webkit-playsinline='isiPhoneShowPlaysinline' playsinline='isiPhoneShowPlaysinline' x5-playsinline='true' x5-video-player-type='h5'></video>`;
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
        `<video id='${this.className}-liveVideo' class='video-js vjs-big-play-centered'  controls muted preload='none' x-webkit-airplay='true' webkit-playsinline='isiPhoneShowPlaysinline' playsinline='isiPhoneShowPlaysinline' x5-playsinline='true' x5-video-player-type='h5'></video>` +
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
      const fileVideoEl = this.el.nativeElement.querySelector(
        `#${this.className}-fileVideo`
      );
      this.filePlayer = videojs(
        fileVideoEl,
        Object.assign(this.fileOptions, {
          autoplay: this.autoplay,
          errorDisplay: false,
          controlBar: {
            playToggle: true,
            volumePanel: false, // 不需要静音按钮
            pictureInPictureToggle: false, // 不需要画中画
            fullscreenToggle: false,
          },
        })
      );

      this.setDefaultProperty(this.filePlayer);
      this.filePlayer.on("error", ($event) => {
        this.ErrorEventListener.emit($event);
        console.log("文件流出错了！");
        this.dispose(this.filePlayer);
        this.fileOptions = null;
        this.createLivePlayer(true, true);
      });

      this.filePlayer.on("playing", ($event) => {
        this.PlayingEventListener.emit($event);
        if (!this.livePlayer) {
          this.createLivePlayer(true); // 文件流和直播流都存在的情况下，如果不是自动播放，则强行创造自动播放的直播流
        }
      });
      this.filePlayer.on("pause", ($event) => {
        this.PauseEventListener.emit($event);
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
    this.createDom("live");
    if (isLoading) {
      this.setBgVisible("loading", true);
    }
    const liveVideoEl = this.el.nativeElement.querySelector(
      `#${this.className}-liveVideo`
    );
    let startTime = 0,
      endTime = 0;
    this.livePlayer = videojs(
      liveVideoEl,
      Object.assign(this.liveOptions, {
        autoplay: isAutoPlay ? isAutoPlay : this.autoplay,
        errorDisplay: false,
        liveui: true,
        controlBar: {
          playToggle: true,
          volumePanel: false, // 不需要静音按钮
          pictureInPictureToggle: false, // 不需要画中画
          fullscreenToggle: false,
        },
      })
    );
    this.addFullScreen();
    this.setDefaultProperty(this.livePlayer);
    this.livePlayer.on("loadstart", ($event) => {
      console.log("直播流开始load");
      startTime = new Date().getTime();
      // this.setBgVisible("loading", true);
      if (!this.isVideoLoadingTimeout) {
        this.isVideoLoadingTimeout = setTimeout(() => {
          if (
            this.livePlayer &&
            this.livePlayer.readyState() !== 3 &&
            this.livePlayer.readyState() !== 4
          ) {
            this.openModal();
            this.ErrorEventListener.emit("overtime");
            console.log("加载超时！");
          }
        }, this.maxLoadTime || 15000);
      }
    });
    this.livePlayer.on("loadedmetadata", ($event) => {
      endTime = new Date().getTime();
      console.log("直播流加载成功");
      this.setBgVisible("loading", false);
      this.DataLoadedEventListener.emit(
        Object.assign($event, { bufferTime: endTime - startTime })
      );
    });
    this.livePlayer.on("canplaythrough", ($event) => {
      if (
        this.livePlayer.readyState() === 3 ||
        this.livePlayer.readyState() === 4
      ) {
        setTimeout(() => {
          if (this.filePlayer) {
            this.dispose(this.filePlayer);
          }
          this.liveLoaded = true;
          this.setBgVisible("loading", false);
        }, 1000);

        this.CanPlayEventListener.emit($event);
      }
      console.log(this.livePlayer.readyState(), "canplaythrough");
    });
    this.livePlayer.on("playing", ($event) => {
      console.log("直播流正在播放！");
      this.destroyTimeout();
      this.setBgVisible("loading", false);
      this.PlayingEventListener.emit($event);
    });
    this.livePlayer.on("error", ($event) => {
      this.ErrorEventListener.emit($event);
      console.log("直播流出错了！");
      this.openModal();
    });
    this.livePlayer.on("pause", ($event) => {
      this.PauseEventListener.emit($event);
    });
    this.livePlayer.on("timeupdate", ($event) => {
      if (!this.isVideoBreak) {
        if (
          this.livePlayer.readyState() !== 3 &&
          this.livePlayer.readyState() !== 4
        ) {
          this.WaitingEventListener.emit($event);
          this.isVideoBreak = setTimeout(() => {
            if (
              this.livePlayer &&
              this.livePlayer.readyState() !== 3 &&
              this.livePlayer.readyState() !== 4
            ) {
              this.openModal();
              this.ErrorEventListener.emit("overtime");
              console.log("缓冲超时！");
            }
          }, this.maxLoadTime || 15000);
        }
      }
    });
  }
  // 获取player实例
  public getFilePlayer() {
    return this.filePlayer || undefined;
  }
  public getLivePlayer() {
    return this.livePlayer || undefined;
  }
  // 默认配置
  public setDefaultProperty(player: videojs.Player) {
    player.playsinline(true);
    //player.crossOrigin("anonymous");
  }
  // 销毁
  public dispose(player: videojs.Player | undefined) {
    if (!player) {
      return;
    }
    if (!player.isDisposed()) {
      player.dispose();
      player = undefined;
    }
  }
  // 销毁定时器
  public destroyTimeout() {
    clearTimeout(this.isVideoBreak);
    clearTimeout(this.isVideoLoadingTimeout);
    clearInterval(this.fullScreenTimer);
    this.isVideoBreak = undefined;
    this.isVideoLoadingTimeout = undefined;
    this.fullScreenTimer = undefined;
  }
  // 全部销毁
  public destroy() {
    this.destroyTimeout();
    this.dispose(this.filePlayer);
    this.dispose(this.livePlayer);
  }
  // 绑定错误事件
  // 自定义错误显示方式
  // 0,1,2,3,4,5
  // MEDIA_ERR_CUSTOM、
  // MEDIA_ERR_ABORTED、取回过程被用户中止
  // MEDIA_ERR_NETWORK、当下载时发生错误
  // MEDIA_ERR_DECODE、当解码时发生错误
  // MEDIA_ERR_SRC_NOT_SUPPORTED、不支持音频/视频
  // MEDIA_ERR_ENCRYPTED // 被加密

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
  // 添加自定义全屏和播放按钮
  public addFullScreen() {
    const vjsButtonComponent = videojs.getComponent("Button");
    videojs.registerComponent(
      "FullScreenButton",
      videojs.extend(vjsButtonComponent, {
        handleClick: () => {
          if (!this.livePlayer.isFullscreen()) {
            try {
              this.toFullScreen();
              if (this.isIOS()) {
                this.fullScreenTimer = setInterval(() => {
                  if (!this.livePlayer.isFullscreen()) {
                    // 退出了全屏
                    this.FullScreenToggeleEventListener.emit(false);
                    this.destroy();
                    this.createLivePlayer(true);
                    // clearInterval(this.fullScreenTimer);
                    // setTimeout(() => {
                    //   this.livePlayer.play();
                    // }, 1000);
                  }
                }, 1000);
              }
            } catch (error) {
              console.warn(error);
            }
          } else {
            this.FullScreenToggeleEventListener.emit(false);
            this.livePlayer.exitFullscreen();
          }
        },
        buildCSSClass: () => {
          return "my_fullscreen";
        },
      })
    );
    this.livePlayer.getChild("controlBar").addChild("FullScreenButton", {});
  }
  // 自定义全屏
  public toFullScreen() {
    this.FullScreenToggeleEventListener.emit(true);
    if (this.livePlayer.requestFullscreen) {
      return this.livePlayer.requestFullscreen();
    } else if (this.livePlayer.webkitRequestFullScreen) {
      return this.livePlayer.webkitRequestFullScreen();
    } else if (this.livePlayer.mozRequestFullScreen) {
      return this.livePlayer.mozRequestFullScreen();
    } else {
      return this.livePlayer.msRequestFullscreen();
    }
  }

  ngOnInit() {
    console.log("hm-ng-video 1.5.6");
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.exitFullScreen) {
      console.log("按返回键退出全屏");
      this.FullScreenToggeleEventListener.emit(false);
      this.livePlayer.exitFullscreen();
    }
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
