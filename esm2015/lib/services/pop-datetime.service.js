import { Injectable } from '@angular/core';
import { PopBusiness, PopPipe, PopUser } from '../pop-common.model';
import * as spacetime from 'spacetime/builds/spacetime.min';
import { IsArray, IsNumber, IsObject, IsString } from '../pop-common-utility';
import * as i0 from "@angular/core";
export class PopDatetimeService {
    constructor() {
        this.timezone = 'America/Denver';
        this.hourFormat = 12;
        this.dateFormat = `dd/mm/yyyy`;
        this.srv = {
            spacetime: spacetime
        };
    }
    transform(value, format = 'date', seconds = true) {
        return this._display({ timestamp: value, format: format, seconds: seconds });
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
    add(date, direction = 1, unit = 'day') {
        return this.srv.spacetime(date).add(direction, unit).format('iso');
    }
    subtract(date, direction = 1, unit = 'day') {
        return this.srv.spacetime(date).subtract(direction, unit).format('iso');
    }
    getYesterday(date) {
        return this.srv.spacetime(date).subtract(1, 'day').format('iso');
    }
    getLatest(dates) {
        let latest = null;
        if (IsArray(dates, true)) {
            latest = dates.reduce((a, b) => (this.toIso(a) > this.toIso(b) ? a : b));
            return this.toIso(latest);
        }
    }
    getEarliest(dates) {
        let latest = null;
        if (IsArray(dates, true)) {
            latest = dates.reduce((a, b) => (this.toIso(a) < this.toIso(b) ? a : b));
            return this.toIso(latest);
        }
    }
    setCurrentBusinessUnitSettings() {
        if (IsObject(PopBusiness, true)) {
            if (IsNumber(PopBusiness.hour_format, true))
                this.hourFormat = +PopBusiness.hour_format;
            if (IsString(PopBusiness.date_format, true))
                this.dateFormat = PopBusiness.date_format;
            if (!(IsNumber(PopBusiness.timezone)) && IsString(PopBusiness.timezone, true))
                this.timezone = PopBusiness.timezone;
        }
        if (IsObject(PopUser, ['setting'])) {
            if (IsNumber(PopUser.setting.hour_format, true))
                this.hourFormat = +PopUser.setting.hour_format;
            if (IsString(PopUser.setting.date_format, true))
                this.dateFormat = PopUser.setting.date_format;
            if (IsNumber(PopUser.setting.timezone)) {
                const transformToName = PopPipe.transform(PopUser.setting.timezone, { type: 'timezone' });
                if (IsString(transformToName, true)) {
                    this.timezone = transformToName;
                }
            }
            else {
                if (!(IsNumber(PopUser.setting.timezone)) && IsString(PopUser.setting.timezone, true))
                    this.timezone = PopUser.setting.timezone;
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
    _display(datetime) {
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
    _displayFormat() {
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
PopDatetimeService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopDatetimeService_Factory() { return new PopDatetimeService(); }, token: PopDatetimeService, providedIn: "root" });
PopDatetimeService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
PopDatetimeService.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWRhdGV0aW1lLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvc2VydmljZXMvcG9wLWRhdGV0aW1lLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUMsV0FBVyxFQUFVLE9BQU8sRUFBRSxPQUFPLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMxRSxPQUFPLEtBQUssU0FBUyxNQUFNLGdDQUFnQyxDQUFDO0FBQzVELE9BQU8sRUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQzs7QUFNNUUsTUFBTSxPQUFPLGtCQUFrQjtJQWE3QjtRQVhRLGFBQVEsR0FBb0IsZ0JBQWdCLENBQUM7UUFDN0MsZUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNoQixlQUFVLEdBQUcsWUFBWSxDQUFDO1FBRXhCLFFBQUcsR0FFVDtZQUNGLFNBQVMsRUFBRSxTQUFTO1NBQ3JCLENBQUM7SUFJRixDQUFDO0lBR0QsU0FBUyxDQUFDLEtBQUssRUFBRSxTQUFpQixNQUFNLEVBQUUsT0FBTyxHQUFHLElBQUk7UUFDdEQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFHRCxLQUFLLENBQUMsU0FBUztRQUNiLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEQsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCxVQUFV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T0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2hDO2dCQUNFLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEdBQUcsR0FBRyxHQUFHLFVBQVUsQ0FBQyxDQUFDO1NBQzlEO0lBQ0gsQ0FBQztJQUdPLGNBQWM7UUFDcEIsUUFBUSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3ZCLEtBQUssVUFBVTtnQkFDYixPQUFPLDZCQUE2QixDQUFDO1lBQ3ZDLEtBQUssWUFBWTtnQkFDZixPQUFPLFdBQVcsQ0FBQztZQUNyQixLQUFLLFlBQVk7Z0JBQ2YsT0FBTyxZQUFZLENBQUM7WUFDdEIsS0FBSyxZQUFZO2dCQUNmLE9BQU8sWUFBWSxDQUFDO1lBQ3RCLEtBQUssWUFBWTtnQkFDZixPQUFPLCtCQUErQixDQUFDO1lBQ3pDLEtBQUssWUFBWTtnQkFDZixPQUFPLCtCQUErQixDQUFDO1lBQ3pDLEtBQUssWUFBWTtnQkFDZixPQUFPLCtCQUErQixDQUFDO1lBQ3pDLEtBQUssWUFBWTtnQkFDZixPQUFPLCtCQUErQixDQUFDO1lBQ3pDLEtBQUssWUFBWTtnQkFDZixPQUFPLCtCQUErQixDQUFDO1lBQ3pDLEtBQUssTUFBTTtnQkFDVCxPQUFPLDRCQUE0QixDQUFDO1lBQ3RDLEtBQUssWUFBWTtnQkFDZixPQUFPLGtDQUFrQyxDQUFDO1lBQzVDO2dCQUNFLE9BQU8sV0FBVyxDQUFDO1NBQ3RCO0lBQ0gsQ0FBQzs7OztZQTlKRixVQUFVLFNBQUM7Z0JBQ1YsVUFBVSxFQUFFLE1BQU07YUFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtQb3BCdXNpbmVzcywgUG9wTG9nLCBQb3BQaXBlLCBQb3BVc2VyfSBmcm9tICcuLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCAqIGFzIHNwYWNldGltZSBmcm9tICdzcGFjZXRpbWUvYnVpbGRzL3NwYWNldGltZS5taW4nO1xuaW1wb3J0IHtJc0FycmF5LCBJc051bWJlciwgSXNPYmplY3QsIElzU3RyaW5nfSBmcm9tICcuLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuXG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuZXhwb3J0IGNsYXNzIFBvcERhdGV0aW1lU2VydmljZSB7XG5cbiAgcHJpdmF0ZSB0aW1lem9uZTogc3RyaW5nIHwgbnVtYmVyID0gJ0FtZXJpY2EvRGVudmVyJztcbiAgcHJpdmF0ZSBob3VyRm9ybWF0ID0gMTI7XG4gIHByaXZhdGUgZGF0ZUZvcm1hdCA9IGBkZC9tbS95eXl5YDtcblxuICBwcm90ZWN0ZWQgc3J2OiB7XG4gICAgc3BhY2V0aW1lOiB0eXBlb2Ygc3BhY2V0aW1lXG4gIH0gPSB7XG4gICAgc3BhY2V0aW1lOiBzcGFjZXRpbWVcbiAgfTtcblxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICB9XG5cblxuICB0cmFuc2Zvcm0odmFsdWUsIGZvcm1hdDogc3RyaW5nID0gJ2RhdGUnLCBzZWNvbmRzID0gdHJ1ZSkge1xuICAgIHJldHVybiB0aGlzLl9kaXNwbGF5KHt0aW1lc3RhbXA6IHZhbHVlLCBmb3JtYXQ6IGZvcm1hdCwgc2Vjb25kczogc2Vjb25kc30pO1xuICB9XG5cblxuICB0b0lzbyh0aW1lc3RhbXApIHtcbiAgICBjb25zdCBkdCA9IHRoaXMuc3J2LnNwYWNldGltZSh0aW1lc3RhbXAsIHRoaXMudGltZXpvbmUpO1xuICAgIHJldHVybiBkdC5mb3JtYXQoJ2lzbycpO1xuICB9XG5cbiAgdG9Jc29TaG9ydCh0aW1lc3RhbXApIHtcbiAgICBjb25zdCBkdCA9IHRoaXMuc3J2LnNwYWNldGltZSh0aW1lc3RhbXAsIHRoaXMudGltZXpvbmUpO1xuICAgIHJldHVybiBkdC5mb3JtYXQoJ2lzby1zaG9ydCcpO1xuICB9XG5cblxuICBnZXRUb21tb3JvdyhkYXRlKSB7XG4gICAgcmV0dXJuIHRoaXMuc3J2LnNwYWNldGltZShkYXRlKS5hZGQoMSwgJ2RheScpLmZvcm1hdCgnaXNvJyk7XG4gIH1cblxuXG4gIGFkZChkYXRlOiBhbnksIGRpcmVjdGlvbjogbnVtYmVyID0gMSwgdW5pdCA9ICdkYXknKSB7XG4gICAgcmV0dXJuIHRoaXMuc3J2LnNwYWNldGltZShkYXRlKS5hZGQoZGlyZWN0aW9uLCB1bml0KS5mb3JtYXQoJ2lzbycpO1xuICB9XG5cblxuICBzdWJ0cmFjdChkYXRlOiBhbnksIGRpcmVjdGlvbjogbnVtYmVyID0gMSwgdW5pdCA9ICdkYXknKSB7XG4gICAgcmV0dXJuIHRoaXMuc3J2LnNwYWNldGltZShkYXRlKS5zdWJ0cmFjdChkaXJlY3Rpb24sIHVuaXQpLmZvcm1hdCgnaXNvJyk7XG4gIH1cblxuXG4gIGdldFllc3RlcmRheShkYXRlKSB7XG5cbiAgICByZXR1cm4gdGhpcy5zcnYuc3BhY2V0aW1lKGRhdGUpLnN1YnRyYWN0KDEsICdkYXknKS5mb3JtYXQoJ2lzbycpO1xuICB9XG5cblxuICBnZXRMYXRlc3QoZGF0ZXM6IGFueVtdKSB7XG4gICAgbGV0IGxhdGVzdCA9IG51bGw7XG4gICAgaWYgKElzQXJyYXkoZGF0ZXMsIHRydWUpKSB7XG4gICAgICBsYXRlc3QgPSBkYXRlcy5yZWR1Y2UoKGEsIGIpID0+ICh0aGlzLnRvSXNvKGEpID4gdGhpcy50b0lzbyhiKSA/IGEgOiBiKSk7XG4gICAgICByZXR1cm4gdGhpcy50b0lzbyhsYXRlc3QpO1xuICAgIH1cbiAgfVxuXG5cbiAgZ2V0RWFybGllc3QoZGF0ZXM6IGFueVtdKSB7XG4gICAgbGV0IGxhdGVzdCA9IG51bGw7XG4gICAgaWYgKElzQXJyYXkoZGF0ZXMsIHRydWUpKSB7XG4gICAgICBsYXRlc3QgPSBkYXRlcy5yZWR1Y2UoKGEsIGIpID0+ICh0aGlzLnRvSXNvKGEpIDwgdGhpcy50b0lzbyhiKSA/IGEgOiBiKSk7XG4gICAgICByZXR1cm4gdGhpcy50b0lzbyhsYXRlc3QpO1xuICAgIH1cbiAgfVxuXG5cbiAgc2V0Q3VycmVudEJ1c2luZXNzVW5pdFNldHRpbmdzKCkge1xuICAgIGlmIChJc09iamVjdChQb3BCdXNpbmVzcywgdHJ1ZSkpIHtcbiAgICAgIGlmIChJc051bWJlcihQb3BCdXNpbmVzcy5ob3VyX2Zvcm1hdCwgdHJ1ZSkpIHRoaXMuaG91ckZvcm1hdCA9ICtQb3BCdXNpbmVzcy5ob3VyX2Zvcm1hdDtcbiAgICAgIGlmIChJc1N0cmluZyhQb3BCdXNpbmVzcy5kYXRlX2Zvcm1hdCwgdHJ1ZSkpIHRoaXMuZGF0ZUZvcm1hdCA9IFBvcEJ1c2luZXNzLmRhdGVfZm9ybWF0O1xuICAgICAgaWYgKCEoSXNOdW1iZXIoUG9wQnVzaW5lc3MudGltZXpvbmUpKSAmJiBJc1N0cmluZyhQb3BCdXNpbmVzcy50aW1lem9uZSwgdHJ1ZSkpIHRoaXMudGltZXpvbmUgPSBQb3BCdXNpbmVzcy50aW1lem9uZTtcbiAgICB9XG4gICAgaWYgKElzT2JqZWN0KFBvcFVzZXIsIFsnc2V0dGluZyddKSkge1xuICAgICAgaWYgKElzTnVtYmVyKFBvcFVzZXIuc2V0dGluZy5ob3VyX2Zvcm1hdCwgdHJ1ZSkpIHRoaXMuaG91ckZvcm1hdCA9ICtQb3BVc2VyLnNldHRpbmcuaG91cl9mb3JtYXQ7XG4gICAgICBpZiAoSXNTdHJpbmcoUG9wVXNlci5zZXR0aW5nLmRhdGVfZm9ybWF0LCB0cnVlKSkgdGhpcy5kYXRlRm9ybWF0ID0gUG9wVXNlci5zZXR0aW5nLmRhdGVfZm9ybWF0O1xuXG4gICAgICBpZiAoSXNOdW1iZXIoUG9wVXNlci5zZXR0aW5nLnRpbWV6b25lKSkge1xuICAgICAgICBjb25zdCB0cmFuc2Zvcm1Ub05hbWUgPSBQb3BQaXBlLnRyYW5zZm9ybShQb3BVc2VyLnNldHRpbmcudGltZXpvbmUsIHt0eXBlOiAndGltZXpvbmUnfSk7XG4gICAgICAgIGlmIChJc1N0cmluZyh0cmFuc2Zvcm1Ub05hbWUsIHRydWUpKSB7XG4gICAgICAgICAgdGhpcy50aW1lem9uZSA9IHRyYW5zZm9ybVRvTmFtZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCEoSXNOdW1iZXIoUG9wVXNlci5zZXR0aW5nLnRpbWV6b25lKSkgJiYgSXNTdHJpbmcoUG9wVXNlci5zZXR0aW5nLnRpbWV6b25lLCB0cnVlKSkgdGhpcy50aW1lem9uZSA9IFBvcFVzZXIuc2V0dGluZy50aW1lem9uZTtcbiAgICAgIH1cblxuICAgIH1cbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICAvKipcbiAgICogRm9ybWF0cyBhIGRhdGV0aW1lIHN0cmluZyB0byB0aGUgY29ycmVjdCBkYXRldGltZSBhY2NvcmRpbmcgdG8gdGhlIHRpbWV6b25lIGFuZCBmb3JtYXRzIGZvciB0aGUgdXNlci5cbiAgICogIC0gZm9ybWF0IGVudW06IFtkYXRlLCB0aW1lLCBkYXRldGltZV1cbiAgICovXG4gIHByaXZhdGUgX2Rpc3BsYXkoZGF0ZXRpbWU6IHsgdGltZXN0YW1wOiBzdHJpbmcsIGZvcm1hdD86IHN0cmluZywgc2Vjb25kcz86IGJvb2xlYW4gfSkge1xuICAgIGNvbnN0IGhvdXJGb3JtYXQgPSAodGhpcy5ob3VyRm9ybWF0ID09IDI0ID8gJ0hIOm1tJyArIChkYXRldGltZS5zZWNvbmRzID8gJzpzcycgOiAnJykgOiAnaDptbScgKyAoZGF0ZXRpbWUuc2Vjb25kcyA/ICc6c3MnIDogJycpICsgJyBhJyk7XG4gICAgbGV0IGR0ID0gdGhpcy5zcnYuc3BhY2V0aW1lKGRhdGV0aW1lLnRpbWVzdGFtcCk7XG4gICAgaWYgKElzU3RyaW5nKHRoaXMudGltZXpvbmUsIHRydWUpICYmIFN0cmluZyh0aGlzLnRpbWV6b25lKS5sZW5ndGggPiAxMCkge1xuICAgICAgZHQgPSBkdC5nb3RvKHRoaXMudGltZXpvbmUpO1xuICAgIH1cblxuXG4gICAgc3dpdGNoIChkYXRldGltZS5mb3JtYXQpIHtcbiAgICAgIGNhc2UgJ2RhdGV0aW1lJzpcbiAgICAgICAgcmV0dXJuIGR0LmZvcm1hdCh0aGlzLl9kaXNwbGF5Rm9ybWF0KCkpICsgKFsnZnVsbCcsICdmdWxsLXNob3J0J10uaW5jbHVkZXModGhpcy5kYXRlRm9ybWF0KSA/ICcsICcgOiAnICcpICsgZHQudW5peEZtdChob3VyRm9ybWF0KTtcbiAgICAgIGNhc2UgJ2RhdGUnOlxuICAgICAgICByZXR1cm4gZHQuZm9ybWF0KHRoaXMuX2Rpc3BsYXlGb3JtYXQoKSk7XG4gICAgICBjYXNlICd0aW1lJzpcbiAgICAgICAgcmV0dXJuIGR0LnVuaXhGbXQoaG91ckZvcm1hdCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZHQuZm9ybWF0KHRoaXMuX2Rpc3BsYXlGb3JtYXQoKSArICcgJyArIGhvdXJGb3JtYXQpO1xuICAgIH1cbiAgfVxuXG5cbiAgcHJpdmF0ZSBfZGlzcGxheUZvcm1hdCgpIHtcbiAgICBzd2l0Y2ggKHRoaXMuZGF0ZUZvcm1hdCkge1xuICAgICAgY2FzZSAneXl5eW1tZGQnOlxuICAgICAgICByZXR1cm4gJ3t5ZWFyfXttb250aC1wYWR9e2RhdGUtcGFkfSc7XG4gICAgICBjYXNlICd5eXl5LW1tLWRkJzpcbiAgICAgICAgcmV0dXJuICdpc28tc2hvcnQnO1xuICAgICAgY2FzZSAnZGQvbW0veXl5eSc6XG4gICAgICAgIHJldHVybiAnbnVtZXJpYy11ayc7XG4gICAgICBjYXNlICdtbS9kZC95eXl5JzpcbiAgICAgICAgcmV0dXJuICdudW1lcmljLXVzJztcbiAgICAgIGNhc2UgJ3l5eXkvbW0vZGQnOlxuICAgICAgICByZXR1cm4gJ3t5ZWFyfS97bW9udGgtcGFkfS97ZGF0ZS1wYWR9JztcbiAgICAgIGNhc2UgJ2RkLW1tLXl5eXknOlxuICAgICAgICByZXR1cm4gJ3tkYXRlLXBhZH0te21vbnRoLXBhZH0te3llYXJ9JztcbiAgICAgIGNhc2UgJ3l5eXkvZGQvbW0nOlxuICAgICAgICByZXR1cm4gJ3t5ZWFyfS97ZGF0ZS1wYWR9L3ttb250aC1wYWR9JztcbiAgICAgIGNhc2UgJ3l5eXktZGQtbW0nOlxuICAgICAgICByZXR1cm4gJ3t5ZWFyfS17ZGF0ZS1wYWR9LXttb250aC1wYWR9JztcbiAgICAgIGNhc2UgJ21tLWRkLXl5eXknOlxuICAgICAgICByZXR1cm4gJ3ttb250aC1wYWR9LXtkYXRlLXBhZH0te3llYXJ9JztcbiAgICAgIGNhc2UgJ2Z1bGwnOlxuICAgICAgICByZXR1cm4gJ3ttb250aH0ge2RhdGUtcGFkfSwge3llYXJ9JztcbiAgICAgIGNhc2UgJ2Z1bGwtc2hvcnQnOlxuICAgICAgICByZXR1cm4gJ3ttb250aC1zaG9ydH0ge2RhdGUtcGFkfSwge3llYXJ9JztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnaXNvLXNob3J0JztcbiAgICB9XG4gIH1cblxufVxuIl19