import { Injectable } from '@angular/core';
import { ColorHistoryService } from '@app/services/color-history/color-history.service';
import { RgbSettings } from '@app/utils/enums/rgb-settings';

@Injectable({
    providedIn: 'root',
})
export class CurrentColorService {
    private primaryColorRgb: string;
    private secondaryColorRgb: string;
    private primaryColorTransparency: string;
    private secondaryColorTransparency: string;

    constructor(private colorHistory: ColorHistoryService) {
        this.primaryColorRgb = RgbSettings.DEFAULT_PRIMARY_RGB;
        this.secondaryColorRgb = RgbSettings.DEFAULT_SECONDARY_RGB;

        this.primaryColorTransparency = RgbSettings.DEFAULT_TRANSPARENCY;
        this.secondaryColorTransparency = RgbSettings.DEFAULT_TRANSPARENCY;
    }

    getPrimaryColorRgb(): string {
        return RgbSettings.RGB_START + this.primaryColorRgb + RgbSettings.RGB_RGBA_END;
    }
    getPrimaryColorRgba(): string {
        return (
            RgbSettings.RGBA_START + this.primaryColorRgb + RgbSettings.RGB_RGBA_SEPARATOR + this.primaryColorTransparency + RgbSettings.RGB_RGBA_END
        );
    }

    getSecondaryColorRgb(): string {
        return RgbSettings.RGB_START + this.secondaryColorRgb + RgbSettings.RGB_RGBA_END;
    }
    getSecondaryColorRgba(): string {
        return (
            RgbSettings.RGBA_START +
            this.secondaryColorRgb +
            RgbSettings.RGB_RGBA_SEPARATOR +
            this.secondaryColorTransparency +
            RgbSettings.RGB_RGBA_END
        );
    }

    setPrimaryColorRgb(rgb: string): void {
        if (this.primaryColorRgb !== rgb) {
            this.primaryColorRgb = rgb;
            this.colorHistory.pushColor(this.getPrimaryColorRgb());
        }
    }

    setSecondaryColorRgb(rgb: string): void {
        if (this.secondaryColorRgb !== rgb) {
            this.secondaryColorRgb = rgb;
            this.colorHistory.pushColor(this.getSecondaryColorRgb());
        }
    }

    setPrimaryColorTransparency(transparency: string): void {
        this.primaryColorTransparency = transparency;
    }

    setSecondaryColorTransparency(transparency: string): void {
        this.secondaryColorTransparency = transparency;
    }

    swapColors(): void {
        const temp = this.primaryColorRgb;
        this.primaryColorRgb = this.secondaryColorRgb;
        this.secondaryColorRgb = temp;
    }

    getPrimaryColorHex(): string {
        const colorRGB = this.primaryColorRgb.split(RgbSettings.RGB_RGBA_SEPARATOR, RgbSettings.RGB_NUMBER_OF_COLORS);
        return this.rgbToHex(parseInt(colorRGB[0], 10), parseInt(colorRGB[1], 10), parseInt(colorRGB[2], 10));
    }

    getSecondaryColorHex(): string {
        const colorRGB = this.secondaryColorRgb.split(RgbSettings.RGB_RGBA_SEPARATOR, RgbSettings.RGB_NUMBER_OF_COLORS);
        return this.rgbToHex(parseInt(colorRGB[0], 10), parseInt(colorRGB[1], 10), parseInt(colorRGB[2], 10));
    }

    // Inspired from Stack Overflow
    private rgbToHex(r: number, g: number, b: number): string {
        return '#' + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }

    private componentToHex(component: number): string {
        const hex = component.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }
}
