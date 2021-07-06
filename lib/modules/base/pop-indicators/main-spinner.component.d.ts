import { OnInit } from '@angular/core';
import { MainSpinner } from './pop-indicators.model';
export declare class MainSpinnerComponent implements OnInit {
    options: MainSpinner;
    color: string;
    mode: string;
    diameter: number;
    strokeWidth: number;
    ngOnInit(): void;
}
