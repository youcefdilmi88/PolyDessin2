import { Injectable } from '@angular/core';
import { DEFAULT_WHITE } from '@app/services/services-constants';
import { ImageFilter } from '@app/utils/enums/image-filter.enum';
import { ImageFormat } from '@app/utils/enums/image-format.enum';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ExportDrawingService {
    imageFilters: Map<string, string>;
    currentFilter: BehaviorSubject<string>;
    currentFormat: BehaviorSubject<string>;
    imageSource: string;
    link: HTMLAnchorElement; /* for the image downloading */
    canvas: HTMLCanvasElement;

    constructor() {
        this.currentFilter = new BehaviorSubject<string>(ImageFilter.None);
        this.currentFormat = new BehaviorSubject<string>(ImageFormat.PNG);
        this.imageSource = '';
        this.initializeImageFilters();
    }

    private initializeImageFilters(): void {
        this.imageFilters = new Map<ImageFilter, string>();
        this.imageFilters
            .set(ImageFilter.None, 'none')
            .set(ImageFilter.Blur, 'blur(5px)')
            .set(ImageFilter.Brightness, 'brightness(80%)')
            .set(ImageFilter.BlackAndWhite, 'grayscale(100%)')
            .set(ImageFilter.Contrast, 'contrast(200%)')
            .set(ImageFilter.HueRotate, 'hue-rotate(180deg)')
            .set(ImageFilter.Opacity, 'opacity(50%)')
            .set(ImageFilter.Inversion, 'invert(100%)')
            .set(ImageFilter.Saturation, 'saturate(200%)')
            .set(ImageFilter.Sepia, 'sepia(100%)');
    }

    downloadDrawingAsImage(fileName: string, format: string): void {
        const image = new Image();
        image.src = this.imageSource;

        this.drawImageOnCanvas(image, this.canvas, this.currentFilter.getValue());

        // set the image to image with current filter applied on
        image.src = this.canvas.toDataURL(`image/${format}`) as string;

        // download the image
        this.link.download = fileName;
        this.link.href = image.src;
        this.link.click();
    }

    canvasToBase64Image(format: string): string {
        const image = new Image();
        image.src = this.imageSource;

        this.drawImageOnCanvas(image, this.canvas, this.currentFilter.getValue());

        // set the image to image with current filter applied on
        image.src = this.canvas.toDataURL(`image/${format}`) as string;

        return image.src.split(';base64,')[1];
    }

    private drawImageOnCanvas(image: HTMLImageElement, canvas: HTMLCanvasElement, filter?: string): void {
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvas.width = image.width;
        canvas.height = image.height;

        context.fillStyle = DEFAULT_WHITE;
        if (filter !== undefined) this.applyFilterOnCanvas(this.currentFilter.getValue(), canvas);
        // set context background color to white
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        context.drawImage(image, 0, 0);
    }

    private applyFilterOnCanvas(filter: string, canvas: HTMLCanvasElement): void {
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        context.filter = this.imageFilters.get(filter) as string;
    }
}
