import { NgModule } from "@angular/core";
import { TasksListComponent } from "./tasks-list/tasks-list.component";
import { TasksEditComponent } from "./tasks-edit/tasks-edit.component";
import { CronParserPipe } from "./cron.pipe";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { HmNgCronRoutingModule } from "./hm-ng-cron-routing.module";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzModalModule } from "ng-zorro-antd/modal";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzPipesModule } from "ng-zorro-antd/core/pipe";
import { NzDropDownModule } from "ng-zorro-antd/dropdown";
import { NzTableModule } from "ng-zorro-antd/table";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { NzMessageModule } from "ng-zorro-antd/message";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzInputModule,
    NzModalModule,
    NzButtonModule,
    NzPipesModule,
    NzDropDownModule,
    NzTableModule,
    NzSpinModule,
    NzMessageModule,
    NzFormModule,
    HmNgCronRoutingModule,
  ],
  declarations: [TasksListComponent, TasksEditComponent, CronParserPipe],
})
export class HmNgCronModule {}
