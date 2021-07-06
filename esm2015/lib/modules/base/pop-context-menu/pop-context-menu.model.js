import { Subject } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { PopPipe } from '../../../pop-common.model';
import { TitleCase } from '../../../pop-common-utility';
export class PopContextMenuConfig {
    constructor(config) {
        this.emitter = new EventEmitter();
        this.toggle = new Subject();
        this.x = 0;
        this.y = 0;
        this.options = [];
        this.newTabUrl = '';
        if (config != undefined && config.newTabUrl) {
            const newTabOption = {
                label: 'Open Link in new tab',
                type: 'new_tab',
                url: config.newTabUrl,
            };
            this.options.push(newTabOption);
        }
        if (config != undefined && config.options !== undefined && config.options.length != 0) {
            for (const option of config.options)
                this.options.push(option);
        }
    }
    addNewTabOption(url) {
        const newTabOption = {
            label: 'Open Link in new tab',
            type: 'new_tab',
            url: url,
        };
        this.options.push(newTabOption);
    }
    addPortalOption(internal_name = '', id) {
        const label = TitleCase(PopPipe.transform(internal_name, { type: 'entity', arg1: 'alias', arg2: 'singular' })).replace(/_/g, ' ').trim();
        const newTabOption = {
            label: `View ${label}`,
            type: 'portal',
            metadata: {
                internal_name: internal_name,
                id: id
            }
        };
        this.options.push(newTabOption);
    }
    addOption(option) {
        this.options.push(option);
    }
    resetOptions() {
        this.options = [];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWNvbnRleHQtbWVudS5tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWNvbnRleHQtbWVudS9wb3AtY29udGV4dC1tZW51Lm1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDL0IsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM3QyxPQUFPLEVBQXlCLE9BQU8sRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzNFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQVV4RCxNQUFNLE9BQU8sb0JBQW9CO0lBUy9CLFlBQVksTUFBc0M7UUFIbEQsWUFBTyxHQUF3QyxJQUFJLFlBQVksRUFBeUIsQ0FBQztRQUl2RixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksT0FBTyxFQUFXLENBQUM7UUFDckMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksTUFBTSxJQUFJLFNBQVMsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFO1lBQzNDLE1BQU0sWUFBWSxHQUF5QjtnQkFDekMsS0FBSyxFQUFFLHNCQUFzQjtnQkFDN0IsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsR0FBRyxFQUFFLE1BQU0sQ0FBQyxTQUFTO2FBQ3RCLENBQUM7WUFDRixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUNqQztRQUNELElBQUksTUFBTSxJQUFJLFNBQVMsSUFBSSxNQUFNLENBQUMsT0FBTyxLQUFLLFNBQVMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7WUFDckYsS0FBSyxNQUFNLE1BQU0sSUFBSSxNQUFNLENBQUMsT0FBTztnQkFBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNqRTtJQUNILENBQUM7SUFHTSxlQUFlLENBQUMsR0FBVztRQUNoQyxNQUFNLFlBQVksR0FBeUI7WUFDekMsS0FBSyxFQUFFLHNCQUFzQjtZQUM3QixJQUFJLEVBQUUsU0FBUztZQUNmLEdBQUcsRUFBRSxHQUFHO1NBQ1QsQ0FBQztRQUNGLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFHTSxlQUFlLENBQUMsZ0JBQXdCLEVBQUUsRUFBRSxFQUFVO1FBQzNELE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxFQUFDLElBQUksRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdEksTUFBTSxZQUFZLEdBQXlCO1lBQ3pDLEtBQUssRUFBRSxRQUFRLEtBQUssRUFBRTtZQUN0QixJQUFJLEVBQUUsUUFBUTtZQUNkLFFBQVEsRUFBRTtnQkFDUixhQUFhLEVBQUUsYUFBYTtnQkFDNUIsRUFBRSxFQUFFLEVBQUU7YUFDUDtTQUNGLENBQUM7UUFDRixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBR00sU0FBUyxDQUFDLE1BQTRCO1FBQzNDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFHTSxZQUFZO1FBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ3BCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUG9wQmFzZUV2ZW50SW50ZXJmYWNlLCBQb3BQaXBlIH0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBUaXRsZUNhc2UgfSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgUG9wQ29udGV4dE1lbnVDb25maWdJbnRlcmZhY2Uge1xuICAvLyBkZWZhdWx0T3B0aW9uczogc3RyaW5nW107XG4gIG9wdGlvbnM/OiBQb3BDb250ZXh0TWVudU9wdGlvbltdO1xuICBuZXdUYWJVcmw/OiBzdHJpbmc7XG59XG5cblxuZXhwb3J0IGNsYXNzIFBvcENvbnRleHRNZW51Q29uZmlnIHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG4gIHRvZ2dsZTogU3ViamVjdDxib29sZWFuPjtcbiAgb3B0aW9uczogUG9wQ29udGV4dE1lbnVPcHRpb25bXTtcbiAgbmV3VGFiVXJsPzogc3RyaW5nO1xuICBlbWl0dGVyOiBFdmVudEVtaXR0ZXI8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPiA9IG5ldyBFdmVudEVtaXR0ZXI8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPigpO1xuXG5cbiAgY29uc3RydWN0b3IoY29uZmlnPzogUG9wQ29udGV4dE1lbnVDb25maWdJbnRlcmZhY2Upe1xuICAgIHRoaXMudG9nZ2xlID0gbmV3IFN1YmplY3Q8Ym9vbGVhbj4oKTtcbiAgICB0aGlzLnggPSAwO1xuICAgIHRoaXMueSA9IDA7XG4gICAgdGhpcy5vcHRpb25zID0gW107XG4gICAgdGhpcy5uZXdUYWJVcmwgPSAnJztcbiAgICBpZiggY29uZmlnICE9IHVuZGVmaW5lZCAmJiBjb25maWcubmV3VGFiVXJsICl7XG4gICAgICBjb25zdCBuZXdUYWJPcHRpb246IFBvcENvbnRleHRNZW51T3B0aW9uID0ge1xuICAgICAgICBsYWJlbDogJ09wZW4gTGluayBpbiBuZXcgdGFiJyxcbiAgICAgICAgdHlwZTogJ25ld190YWInLFxuICAgICAgICB1cmw6IGNvbmZpZy5uZXdUYWJVcmwsXG4gICAgICB9O1xuICAgICAgdGhpcy5vcHRpb25zLnB1c2gobmV3VGFiT3B0aW9uKTtcbiAgICB9XG4gICAgaWYoIGNvbmZpZyAhPSB1bmRlZmluZWQgJiYgY29uZmlnLm9wdGlvbnMgIT09IHVuZGVmaW5lZCAmJiBjb25maWcub3B0aW9ucy5sZW5ndGggIT0gMCApe1xuICAgICAgZm9yKCBjb25zdCBvcHRpb24gb2YgY29uZmlnLm9wdGlvbnMgKSB0aGlzLm9wdGlvbnMucHVzaChvcHRpb24pO1xuICAgIH1cbiAgfVxuXG5cbiAgcHVibGljIGFkZE5ld1RhYk9wdGlvbih1cmw6IHN0cmluZyl7XG4gICAgY29uc3QgbmV3VGFiT3B0aW9uOiBQb3BDb250ZXh0TWVudU9wdGlvbiA9IHtcbiAgICAgIGxhYmVsOiAnT3BlbiBMaW5rIGluIG5ldyB0YWInLFxuICAgICAgdHlwZTogJ25ld190YWInLFxuICAgICAgdXJsOiB1cmwsXG4gICAgfTtcbiAgICB0aGlzLm9wdGlvbnMucHVzaChuZXdUYWJPcHRpb24pO1xuICB9XG5cblxuICBwdWJsaWMgYWRkUG9ydGFsT3B0aW9uKGludGVybmFsX25hbWU6IHN0cmluZyA9ICcnLCBpZDogbnVtYmVyKXtcbiAgICBjb25zdCBsYWJlbCA9IFRpdGxlQ2FzZShQb3BQaXBlLnRyYW5zZm9ybShpbnRlcm5hbF9uYW1lLCB7dHlwZTonZW50aXR5JywgYXJnMTogJ2FsaWFzJywgYXJnMjogJ3Npbmd1bGFyJ30pKS5yZXBsYWNlKC9fL2csICcgJykudHJpbSgpO1xuICAgIGNvbnN0IG5ld1RhYk9wdGlvbjogUG9wQ29udGV4dE1lbnVPcHRpb24gPSB7XG4gICAgICBsYWJlbDogYFZpZXcgJHtsYWJlbH1gLFxuICAgICAgdHlwZTogJ3BvcnRhbCcsXG4gICAgICBtZXRhZGF0YToge1xuICAgICAgICBpbnRlcm5hbF9uYW1lOiBpbnRlcm5hbF9uYW1lLFxuICAgICAgICBpZDogaWRcbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMub3B0aW9ucy5wdXNoKG5ld1RhYk9wdGlvbik7XG4gIH1cblxuXG4gIHB1YmxpYyBhZGRPcHRpb24ob3B0aW9uOiBQb3BDb250ZXh0TWVudU9wdGlvbil7XG4gICAgdGhpcy5vcHRpb25zLnB1c2gob3B0aW9uKTtcbiAgfVxuXG5cbiAgcHVibGljIHJlc2V0T3B0aW9ucygpe1xuICAgIHRoaXMub3B0aW9ucyA9IFtdO1xuICB9XG59XG5cblxuZXhwb3J0IGludGVyZmFjZSBQb3BDb250ZXh0TWVudU9wdGlvbiB7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIHR5cGU6IHN0cmluZztcbiAgdXJsPzogc3RyaW5nO1xuICBzdWJNZW51cz86IFBvcENvbnRleHRNZW51T3B0aW9uW107XG4gIG1ldGFkYXRhPzogYW55O1xufVxuXG5cbmV4cG9ydCBpbnRlcmZhY2UgUG9wQ29udGV4dE1lbnVFdmVudCB7XG4gIG9wdGlvbjogUG9wQ29udGV4dE1lbnVPcHRpb247XG59XG4iXX0=