import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  ValidationErrors,
} from "@angular/forms";
import { Observable, Observer, Subject } from "rxjs";

import { takeUntil } from "rxjs/operators";
import { ConfirmModalService } from "../confirm-modal.service";
import { EventBusService, EventType } from "../event-bus.service";
import { HmNgCronService } from "../hm-ng-cron.service";

const parser = require("cron-parser");
@Component({
  selector: "app-tasks-edit",
  templateUrl: "./tasks-edit.component.html",
  styles: [],
})
export class TasksEditComponent implements OnInit, OnDestroy {
  isVisible = false;
  isEdit = false;
  isLoading = false;
  public cacheData: any = {}; // 保留修改时候的原来值，
  public cronForm: FormGroup;
  public prev: any;
  public next: any;
  private $destroy = new Subject();
  @Output() update = new EventEmitter<string>();
  constructor(
    private fb: FormBuilder,
    private cronService: HmNgCronService,
    private eventBus: EventBusService,
    private confirmModalService: ConfirmModalService
  ) {}
  cancelSave() {
    this.isVisible = false;
  }
  saveCron($event, value) {
    const param = value;
    if (this.cacheData) {
      param.oldJobGroup = this.cacheData.jobGroup;
      param.oldJobName = this.cacheData.jobName;
    }
    this.isLoading = true;
    this.cronService.saveCron(param).subscribe(
      (res) => {
        this.isLoading = false;
        this.confirmModalService.msg.success("保存成功");
        this.isVisible = false;
        this.update.emit($event);
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  loadModal(res) {
    this.isEdit = res.data ? true : false;
    this.cronForm.reset();
    this.isVisible = true;
    if (res.data) {
      this.cacheData = res.data;
      const controls = this.cronForm.controls;
      Object.keys(res.data).forEach((key) => {
        if (controls[key]) {
          controls[key].setValue(res.data[key]);
        }
      });
    }
  }
  // 验证定时任务类是否存在
  confirmParamValueValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      setTimeout(() => {
        if (this.cacheData.jobClassName === control.value) {
          observer.next(null);
          observer.complete();
        } else {
          this.cronService.checkClass(control.value).subscribe(
            (res) => {
              if (!res.success) {
                observer.next({ error: true, duplicated: true });
              } else {
                observer.next(null);
              }
              observer.complete();
            },
            (error) => {
              observer.next(null);
              observer.complete();
            }
          );
        }
      }, 1000);
    });
  // 验证Cron表达式
  confirmCronExpressionValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      setTimeout(() => {
        console.log(control.value);
        if (!control.value) {
          observer.next(null);
          observer.next({ required: true });
        } else {
          try {
            const interval = parser.parseExpression(control.value);
            console.log(this.cronForm.get("cronExpression"));
            console.log(this.cronForm.get("cronExpression").valid);
            observer.next({ valid: true });
            this.prev = interval.prev().toString();
            this.next = interval.next().toString();
            observer.next(null);
          } catch (err) {
            console.log("Error: " + err.message);
            observer.next({ error: true, duplicated: true });
          }
        }
        observer.complete();
      }, 1000);
    });
  // new Observable((observer: Observer<ValidationErrors | null>) => {
  //   setTimeout(() => {
  //     console.log(control + '第一步');
  //     if (!control.value) {
  //       console.log(control.value + '第二步');
  //       observer.next(null);
  //       observer.next({ required: true });
  //     }
  //     try {
  //       const interval = parser.parseExpression(control.value);
  //       console.log( interval + '第三步');
  //       console.log(interval.prev().toString());
  //       console.log(interval.next().toString());
  //       console.log(this.cronForm.get('cronExpression')?.valid);
  //       this.prev = interval.prev().toString();
  //       this.next = interval.next().toString();
  //       observer.next(null);
  //     } catch (err) {
  //       console.log('Error: ' + err.message);
  //       observer.next({ error: true, duplicated: true });
  //     }
  //     observer.complete();
  //   }, 1000);
  // })

  validateAll() {
    for (const key in this.cronForm.controls) {
      if (this.cronForm.controls.hasOwnProperty(key)) {
        this.cronForm.controls[key].markAsDirty();
        this.cronForm.controls[key].updateValueAndValidity();
      }
    }
  }
  ngOnInit() {
    this.eventBus
      .Observable(EventType.CronValue)
      .pipe(takeUntil(this.$destroy))
      .subscribe((res) => {
        console.log(res);
        this.loadModal(res);
      });
    this.cronForm = this.fb.group({
      jobName: [null, [Validators.required]],
      jobGroup: [null, [Validators.required]],
      jobClassName: [
        null,
        [Validators.required],
        [this.confirmParamValueValidator],
      ],
      cronExpression: [
        null,
        [Validators.required],
        this.confirmCronExpressionValidator,
      ],
      description: [null, [Validators.required]],
    });
  }
  ngOnDestroy() {
    this.$destroy.next(0);
    this.$destroy.unsubscribe();
  }
}
