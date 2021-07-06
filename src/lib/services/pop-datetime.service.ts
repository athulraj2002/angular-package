import {Injectable} from '@angular/core';
import {PopBusiness, PopLog, PopPipe, PopUser} from '../pop-common.model';
import * as spacetime from 'spacetime/builds/spacetime.min';
import {IsArray, IsNumber, IsObject, IsString} from '../pop-common-utility';


@Injectable({
  providedIn: 'root'
})
export class PopDatetimeService {

  private timezone: string | number = 'America/Denver';
  private hourFormat = 12;
  private dateFormat = `dd/mm/yyyy`;

  protected srv: {
    spacetime: typeof spacetime
  } = {
    spacetime: spacetime
  };


  constructor() {
  }


  transform(value, format: string = 'date', seconds = true) {
    return this._display({timestamp: value, format: format, seconds: seconds});
  }


  toIso(timestamp) {
    const dt = this.srv.spacetime(timestamp, this.timezone);
    return dt.format('iso');
  }

  toIsoShort(timestamp) {
    const dt = this.srv.spacetime(timestamp, this.timezone);
    return dt.format('iso-short');
  }


  getTommorow(date) {
    return this.srv.spacetime(date).add(1, 'day').format('iso');
  }


  add(date: any, direction: number = 1, unit = 'day') {
    return this.srv.spacetime(date).add(direction, unit).format('iso');
  }


  subtract(date: any, direction: number = 1, unit = 'day') {
    return this.srv.spacetime(date).subtract(direction, unit).format('iso');
  }


  getYesterday(date) {

    return this.srv.spacetime(date).subtract(1, 'day').format('iso');
  }


  getLatest(dates: any[]) {
    let latest = null;
    if (IsArray(dates, true)) {
      latest = dates.reduce((a, b) => (this.toIso(a) > this.toIso(b) ? a : b));
      return this.toIso(latest);
    }
  }


  getEarliest(dates: any[]) {
    let latest = null;
    if (IsArray(dates, true)) {
      latest = dates.reduce((a, b) => (this.toIso(a) < this.toIso(b) ? a : b));
      return this.toIso(latest);
    }
  }


  setCurrentBusinessUnitSettings() {
    if (IsObject(PopBusiness, true)) {
      if (IsNumber(PopBusiness.hour_format, true)) this.hourFormat = +PopBusiness.hour_format;
      if (IsString(PopBusiness.date_format, true)) this.dateFormat = PopBusiness.date_format;
      if (!(IsNumber(PopBusiness.timezone)) && IsString(PopBusiness.timezone, true)) this.timezone = PopBusiness.timezone;
    }
    if (IsObject(PopUser, ['setting'])) {
      if (IsNumber(PopUser.setting.hour_format, true)) this.hourFormat = +PopUser.setting.hour_format;
      if (IsString(PopUser.setting.date_format, true)) this.dateFormat = PopUser.setting.date_format;

      if (IsNumber(PopUser.setting.timezone)) {
        const transformToName = PopPipe.transform(PopUser.setting.timezone, {type: 'timezone'});
        if (IsString(transformToName, true)) {
          this.timezone = transformToName;
        }
      } else {
        if (!(IsNumber(PopUser.setting.timezone)) && IsString(PopUser.setting.timezone, true)) this.timezone = PopUser.setting.timezone;
      }

    }
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/


  /**
   * Formats a datetime string to the correct datetime according to the timezone and formats for the user.
   *  - format enum: [date, time, datetime]
   */
  private _display(datetime: { timestamp: string, format?: string, seconds?: boolean }) {
    const hourFormat = (this.hourFormat == 24 ? 'HH:mm' + (datetime.seconds ? ':ss' : '') : 'h:mm' + (datetime.seconds ? ':ss' : '') + ' a');
    let dt = this.srv.spacetime(datetime.timestamp);
    if (IsString(this.timezone, true) && String(this.timezone).length > 10) {
      dt = dt.goto(this.timezone);
    }


    switch (datetime.format) {
      case 'datetime':
        return dt.format(this._displayFormat()) + (['full', 'full-short'].includes(this.dateFormat) ? ', ' : ' ') + dt.unixFmt(hourFormat);
      case 'date':
        return dt.format(this._displayFormat());
      case 'time':
        return dt.unixFmt(hourFormat);
      default:
        return dt.format(this._displayFormat() + ' ' + hourFormat);
    }
  }


  private _displayFormat() {
    switch (this.dateFormat) {
      case 'yyyymmdd':
        return '{year}{month-pad}{date-pad}';
      case 'yyyy-mm-dd':
        return 'iso-short';
      case 'dd/mm/yyyy':
        return 'numeric-uk';
      case 'mm/dd/yyyy':
        return 'numeric-us';
      case 'yyyy/mm/dd':
        return '{year}/{month-pad}/{date-pad}';
      case 'dd-mm-yyyy':
        return '{date-pad}-{month-pad}-{year}';
      case 'yyyy/dd/mm':
        return '{year}/{date-pad}/{month-pad}';
      case 'yyyy-dd-mm':
        return '{year}-{date-pad}-{month-pad}';
      case 'mm-dd-yyyy':
        return '{month-pad}-{date-pad}-{year}';
      case 'full':
        return '{month} {date-pad}, {year}';
      case 'full-short':
        return '{month-short} {date-pad}, {year}';
      default:
        return 'iso-short';
    }
  }

}
