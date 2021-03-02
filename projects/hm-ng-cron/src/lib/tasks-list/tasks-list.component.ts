import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd/message";
import { ConfirmModalService } from "../confirm-modal.service";
import { EventBusService, EventType } from "../event-bus.service";
import { HmNgCronService } from "../hm-ng-cron.service";
@Component({
  selector: "app-tasks-list",
  templateUrl: "./tasks-list.component.html",
  styleUrls: ["./tasks-list.component.less"],
})
export class TasksListComponent implements OnInit {
  public pageIndex = 0;
  public pageSize = 10;
  public total = 0;
  public totalPages = 0;
  public pageSizeOptions = [5, 10, 15, 20];
  public searchForm: FormGroup;
  public setUpForm: FormGroup;
  public searchConditions = [];
  public urlHeader = "http://192.168.8.151:8888";
  public listOfData = [];
  public isVisible = true;
  public message: any;
  public localStorageArray = [];
  public currentUrlName = "";
  public setting = false;
  constructor(
    private fb: FormBuilder,
    private scheduledTasksService: HmNgCronService,
    private confirmModalService: ConfirmModalService,
    private eventBus: EventBusService,
    private nzMessageService: NzMessageService
  ) {}
  compare = function (obj1, obj2) {
    const val1 = obj1.jobName;
    const val2 = obj2.jobName;
    if (val1 < val2) {
      return -1;
    } else if (val1 > val2) {
      return 1;
    } else {
      return 0;
    }
  };
  search($event) {
    this.getDataList(true, $event.cronName);
  }
  getDataList(reset: boolean = false, cronName?) {
    if (reset) {
      this.pageIndex = 1;
    }
    this.scheduledTasksService
      .getCronLists(this.pageIndex, this.pageSize, cronName)
      .subscribe(
        (res) => {
          this.listOfData = res.records;
          this.listOfData.sort(this.compare);
          this.total = res.total;
          this.pageIndex = res.current;
          this.totalPages = res.pages;
          this.isVisible = false;
          this.setUpLocalStorage(
            this.setUpForm.value.name,
            this.setUpForm.value.host,
            this.setUpForm.value.service,
            this.setUpForm.value.version,
            this.setUpForm.value.key
          );
          this.setUpForm.reset();
          this.setting = false;
        },
        (error) => {
          this.nzMessageService.error(error.message, error);
          // this.message.create(error.message, `ddddd ${error.message}`);
          this.setting = false;
          console.log(error.message);
        }
      );
  }
  getDataListNoSetLocalStorage(reset: boolean = false, cronName?) {
    if (reset) {
      this.pageIndex = 1;
    }
    this.scheduledTasksService
      .getCronLists(this.pageIndex, this.pageSize, cronName)
      .subscribe(
        (res) => {
          this.listOfData = res.records;
          this.listOfData.sort(this.compare);
          this.total = res.total;
          this.pageIndex = res.current;
          this.totalPages = res.pages;
          this.isVisible = false;
        },
        (error) => {
          this.nzMessageService.error(error.message, error);
          // this.message.create(error.message, `ddddd ${error.message}`);
          console.log(error.message);
        }
      );
  }
  edit(data?) {
    this.eventBus.send({
      type: EventType.CronValue,
      data,
    });
  }

  // 删除
  delete(data) {
    this.confirmModalService.confirmDelete(() => {
      this.scheduledTasksService.deleteCron(data).subscribe((res) => {
        this.getDataListNoSetLocalStorage();
      });
    });
  }
  triggerOne(data) {
    this.confirmModalService.confirmImplement(() => {
      this.scheduledTasksService.triggerOne(data).subscribe((res) => {
        this.getDataListNoSetLocalStorage();
      });
    });
  }
  // 更改状态
  changeState(data) {
    this.scheduledTasksService
      .stopOrRestartCron(data, data.triggerState !== "PAUSED")
      .subscribe((res) => {
        this.confirmModalService.msg.success("操作成功");
        this.getDataListNoSetLocalStorage();
      });
  }
  // 强制停止
  forcechangeState(data) {
    this.confirmModalService.confirmForce(() => {
      this.scheduledTasksService
        .forceStopOrRestartCron(data)
        .subscribe((res) => {
          this.confirmModalService.msg.success("操作成功");
          this.getDataListNoSetLocalStorage();
        });
    });
  }
  clearAllUrl() {
    this.confirmModalService.confirmCancellation(() => {
      this.isVisible = true;
      this.setUp("", "", "", "");
      this.listOfData = [];
      localStorage.clear();
      this.localStorageArray = [];
      this.currentUrlName = " ";
    });
  }
  clearUrl(v) {
    this.confirmModalService.confirmCancellation(() => {
      this.localStorageArray.forEach((res, index) => {
        if (res.name === v) {
          this.localStorageArray.splice(index, 1);
          console.log(this.localStorageArray);
          localStorage.setItem(
            "LocalStorageArray",
            JSON.stringify(this.localStorageArray)
          );
        }
      });
      if (this.currentUrlName === v) {
        this.listOfData = [];
        this.setUp("", "", "", "");
        localStorage.removeItem("currentUrl");
        if (this.localStorageArray.length > 0) {
          this.currentUrlName = this.localStorageArray[0].name;
          localStorage.setItem(
            "currentUrl",
            JSON.stringify(this.currentUrlName)
          );
          this.setUp(
            this.localStorageArray[0].host,
            this.localStorageArray[0].service,
            this.localStorageArray[0].version,
            this.localStorageArray[0].key
          );
          this.getDataListNoSetLocalStorage();
        }
        if (this.localStorageArray.length === 0) {
          this.isVisible = true;
        }
      }
    });
  }
  switchUrl(v) {
    this.localStorageArray.forEach((res, index) => {
      if (res.name === v) {
        this.listOfData = [];
        this.setUp(res.host, res.service, res.version, res.key);
        this.getDataListNoSetLocalStorage();
        this.currentUrlName = v;
        localStorage.setItem("currentUrl", JSON.stringify(v));
      }
    });
  }
  AddUrl() {
    this.isVisible = true;
  }
  handleOk(): void {
    this.setting = true;
    this.setUp(
      this.setUpForm.value.host,
      this.setUpForm.value.service,
      this.setUpForm.value.version,
      this.setUpForm.value.key
    );
    this.getDataList();
  }
  setUp(host, service, version, key) {
    this.scheduledTasksService.config = {
      headers: {
        Authorization: "Bearer " + key,
      },
    };
    this.scheduledTasksService.baseUrl = `${host}/${service}/${version}/job`;
  }
  // 设置缓存
  setUpLocalStorage(
    nameValue,
    hostValue,
    serviceValue,
    versionValue,
    keyValue
  ) {
    this.currentUrlName = nameValue;
    this.localStorageArray.push({
      name: nameValue,
      host: hostValue,
      service: serviceValue,
      version: versionValue,
      key: keyValue,
    });
    localStorage.setItem(
      "LocalStorageArray",
      JSON.stringify(this.localStorageArray)
    );
    localStorage.setItem("currentUrl", JSON.stringify(nameValue));
  }
  // 获取缓存
  getLocalStorage() {
    if (localStorage.currentUrl || localStorage.LocalStorageArray) {
      this.isVisible = false;
      this.localStorageArray = JSON.parse(
        localStorage.getItem("LocalStorageArray")
      );
      const dd = JSON.parse(localStorage.getItem("currentUrl"));
      let istrue = true;
      this.localStorageArray.forEach((res, index) => {
        if (res.name === dd) {
          this.setUp(
            this.localStorageArray[index].host,
            this.localStorageArray[index].service,
            this.localStorageArray[index].version,
            this.localStorageArray[index].key
          );
          this.getDataListNoSetLocalStorage();
          this.currentUrlName = this.localStorageArray[index].name;
          istrue = false;
        }
      });
      if (istrue && this.localStorageArray.length !== 0) {
        this.setUp(
          this.localStorageArray[0].host,
          this.localStorageArray[0].service,
          this.localStorageArray[0].version,
          this.localStorageArray[0].key
        );
        this.getDataListNoSetLocalStorage();
        this.currentUrlName = this.localStorageArray[0].name;
      }
    }
  }
  filterjson(v) {
    if (v === "NONE") {
      return "无";
    } else if (v === "NORMAL") {
      return "正常";
    } else if (v === "PAUSED") {
      return "暂停中";
    } else if (v === "COMPLETE") {
      return "完成";
    } else if (v === "ERROR") {
      return "异常";
    } else if (v === "BLOCKED") {
      return "运行中";
    } else if (v === "WAITING") {
      return "等待中";
    } else if (v === "ACQUIRED") {
      return "获取中";
    } else if (v === "PAUSED_BLOCKED") {
      return "暂停手动执行中";
    }
  }
  ngOnInit() {
    // 初始化表单
    this.setUpForm = this.fb.group({
      name: ["175"],
      host: ["http://192.168.8.175:9993"],
      service: ["api"],
      version: ["v1"],
      key: [null],
    });
    this.getLocalStorage();
    this.searchForm = this.fb.group({
      cronName: [null],
    });
    this.searchConditions = [
      {
        formName: "cronName",
        formNameCn: "任务名称",
      },
    ];
  }
}
