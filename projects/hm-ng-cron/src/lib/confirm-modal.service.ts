import { Injectable } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd/message";
import { NzModalService } from "ng-zorro-antd/modal";
@Injectable({
  providedIn: "root",
})
// 统一提醒类
export class ConfirmModalService {
  constructor(private modal: NzModalService, public msg: NzMessageService) {}
  // 确认删除提醒 传匿名函数
  public confirmDelete(fn, title?) {
    this.modal.confirm({
      nzTitle: title || "您确定要删除吗?",
      nzOnOk: () => {
        fn();
      },
    });
  }
  // 确认提交提醒
  public confirmSubmit(fn) {
    this.modal.confirm({
      nzTitle: "您确定要提交吗?",
      nzOnOk: () => {
        fn();
      },
    });
  }

  // 强制停止提醒
  public confirmForce(fn) {
    this.modal.confirm({
      nzTitle: "您确定要强制停止吗?",
      nzOnOk: () => {
        fn();
      },
    });
  }
  // 确认提交提醒
  public confirmImplement(fn) {
    this.modal.confirm({
      nzTitle: "您确定要执行一次吗?",
      nzOnOk: () => {
        fn();
      },
    });
  }
  // 确认注销提醒
  public confirmCancellation(fn) {
    this.modal.confirm({
      nzTitle: "您确定要注销吗?",
      nzOnOk: () => {
        fn();
      },
    });
  }
}
