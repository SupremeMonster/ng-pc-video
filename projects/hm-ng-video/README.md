#### 1.配置

（1）引入 npm 包，在==package.json==里面添加：

```
"dependencies":{
 "video.js": "^7.8.2"
 "hm-ng-video": "^1.5.6",
}
```

（2）在==angular.json==的 styles 里面添加：

```
 "node_modules/video.js/dist/video-js.css"
```

或者直接在样式文件中通过 import 引入：

```
  @import "~/node_modules/video.js/dist/video-js.css";
```

（3）在所需该组件的模块文件==xxx.modele.ts==的 imports 中添加：

```
imports: [...,HmNgVideoModule]
```

并引入该模块，如果出现不能自动提示，则手动导入一下该模块，并引用。
import { HmNgVideoModule } from "hm-ng-video";

#### 2.使用

在 html 中使用此标签

```
 <hm-ng-video
    #myPlayer
    [maxReloadTimes]="3"
    [videoHeight]="300"
    [videoWidth]="500"
    [fileOptions]="fileOptions"
    [liveOptions]="liveOptions"
    [autoplay]="false"
    [errorContent]="'出错啦！'"
    [loadingSrc]="'assets/loading.gif'"
    [className]="'video0'"
    [maxLoadTime]="10000"
    [exitFullScreen]="true"
    (ErrorEventListener)="handleError($event)"
    (DataLoadedEventListener)="handleLoaded($event)"
    (WaitingEventListener)="handleWaiting($event)"
    (PlayingEventListener)="handlePlaying($event)"
    (PauseEventListener)="handlePause($event)"
    (ReLoadVideoEventListener)="handleReload($event)"
    (FullScreenToggeleEventListener)="handleFullscreen($event)"
  ></hm-ng-video>
```

当需要切换播放源时，更改 fileOption 和 liveOption，如果其中一个不改，则保留原有的值。

#### 3.参数及事件详解

##### (1) fileOptions

配置文件流，主要包含如下属性：

- preload:'auto' | 'metadata' | 'none' 预加载
- poster：String 默认海报图片地址
- sources:Array<Object> 播放源，包括 src 和 type 两个属性，播放.m3u8 文件通常 type 为"application/x-mpegURL"，src 即流地址

##### 示例：

```
{
        preload: "none",
        poster: 'assets/B.jpg',
        sources: [
          {
            src: 'xxx.m3u8',
            type: 'application/x-mpegURL',
          },
        ],
};
```

##### (2) liveOptions

配置直播流，属性同上

##### (3) autoplay

配置是否自动播放，为了保持一致，须单独设置。（若文件流和直播流都存在，则文件流播放后直播流加载完成后强制自动播放，若只有直播流，则按照设置是否自动播放）

##### (4) className

必填，添加一个 class，当需要同时播放多路视频，className 一定要唯一。

##### (5) videoHeight

video 的高度

##### (6) videoWidth

video 的宽度

##### (6) maxLoadTime

加载直播流最长时间（超出后直接报错）

##### (7) maxReloadTimes

自动重新连接的最大次数

##### (8) loadingSrc

加载时 loading 的图片地址（默认在正中间）

##### (9) errorContent

错误弹框文字。

##### (10) exitFullScreen

传true主动退出全屏（双向绑定）

##### (11) ErrorEventListener

监听到错误后的回调

##### (12) PauseEventListener

暂停的回调

##### (13) PlayingEventListener

播放的回调

##### (14) WaitingEventListener

正在缓冲的回调

##### (15) DataLoadedEventListener

源数据加载完成后的回调(返回的内容包含 bufferTime 为加载时长 单位毫秒)

##### (16) ReLoadVideoEventListener

当自动连接达到最大次数仍旧无法播放时的回调

##### (17) FullScreenToggeleEventListener

切换全屏回调

#### 4.自定义方法

##### (1) 默认加载 loading 图片，如下样式覆盖，自己用不同的图片。

```
:host ::ng-deep .vjs-loading-spinner {
  background: url(assets/loading.gif)no-repeat;
}

```

##### (2) 发生错误的弹框背景自定义，如下样式覆盖。

```
:host ::ng-deep .error {
  background: url(assets/C.jpg)no-repeat;
}

```

##### (3)只播放文件流或直播流

只播放文件流，则只传 fileOption，不传 liveOption，反之亦然，都传则会在直播流加载完成后从文件流自动切换到直播流。
