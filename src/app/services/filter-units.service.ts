import { Injectable } from "@angular/core";
import { Location } from "../types/location.interface";

const OPENING_HOURS = {
  morning: {
    first: "06",
    last: "12",
  },
  afternoon: {
    first: "12",
    last: "18",
  },
  night: {
    first: "18",
    last: "23",
  },
};

@Injectable({
  providedIn: "root",
})
export class FilterUnitsService {
  constructor() {}

  transformWeekday(weekday: number) {
    switch (weekday) {
      case 0:
        return "Dom.";
      case 6:
        return "Sab.";
      default:
        return "Seg. à Sex.";
    }
  }

  filterUnits(unit: Location, open_hour: string, close_hour: string): boolean {
    if (!unit.schedules) {
      return true;
    }

    const open_hour_filter = parseInt(open_hour, 10);
    const close_hour_filter = parseInt(close_hour, 10);

    const todays_weekday = this.transformWeekday(new Date().getDay());

    for (let i = 0; i < unit.schedules.length; i++) {
      const schedule_hour = unit.schedules[i].hour;
      const schedule_weekday = unit.schedules[i].weekdays;

      if (todays_weekday === schedule_weekday) {
        if (schedule_hour !== "Fechada") {
          const [unit_open_hour, unit_close_hour] = schedule_hour.split(" às ");
          const unit_open_hour_int = parseInt(
            unit_open_hour.replace("h", ""),
            10
          );
          const unit_close_hour_int = parseInt(
            unit_close_hour.replace("h", ""),
            10
          );

          if (
            (unit_open_hour_int <= open_hour_filter &&
              unit_close_hour_int >= open_hour_filter) ||
            (unit_open_hour_int <= close_hour_filter &&
              unit_close_hour_int >= close_hour_filter)
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  filter(results: Location[], showClosed: boolean, hour: string) {
        let intermediateResults = results;

        if (!showClosed) {
          intermediateResults = results.filter(
            (location) => location.opened === true
          );
        }

        if (hour) {
          const OPEN_HOUR =
            OPENING_HOURS[
              hour as keyof typeof OPENING_HOURS
            ].first;
          const CLOSE_HOUR =
            OPENING_HOURS[
              hour as keyof typeof OPENING_HOURS
            ].last;

          return intermediateResults.filter((location) =>
            this.filterUnits(location, OPEN_HOUR, CLOSE_HOUR)
          );
        } else {
          return intermediateResults;
        }
  }
}
