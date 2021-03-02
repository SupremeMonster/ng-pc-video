import { Pipe, PipeTransform } from "@angular/core";
const parser = require("cron-parser");
@Pipe({
  name: "cronParser",
})
export class CronParserPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    try {
      const interval = parser.parseExpression(value);
      return args === "prev"
        ? interval.prev().toString()
        : interval.next().toString();
    } catch (err) {
      console.log("Error: " + err.message);
    }
  }
}
