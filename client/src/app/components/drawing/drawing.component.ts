import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolManagerService } from '@app/services/tool-manager/tool-manager.service';
import { ToolsNames } from '@app/utils/enums/tools-names';

// TODO : Avoir un fichier séparé pour les constantes ?
export const DEFAULT_WIDTH = 1000;
export const DEFAULT_HEIGHT = 800;

export const MINIMUM_WIDTH = 250;
export const MINIMUM_HEIGHT = 250;

export const LOWER_BOUND_WIDTH = 500;
export const LOWER_BOUND_HEIGHT = 500;

export const DEFAULT_WHITE = '#fff';

export const SIDEBAR_WIDTH = 425;

const WORKING_ZONE_VISIBLE_PORTION = 100;

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit, OnInit {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    // On utilise ce canvas pour dessiner sans affecter le dessin final
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;
    @Output() editorMinWidthEmitter: EventEmitter<number> = new EventEmitter<number>();

    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private canvasSize: Vec2 = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    // private currentDrawing: CanvasRenderingContext2D;
    currentTool: Tool;
    toolManagerService: ToolManagerService;

    constructor(private drawingService: DrawingService, toolManagerService: ToolManagerService) {
        this.toolManagerService = toolManagerService;
    }

    ngOnInit(): void {
        this.updateCurrentTool();
        this.setCanvasSize();
        this.subscribeToToolChange();
    }

    subscribeToToolChange(): void {
        this.toolManagerService.toolChangeEmitter.subscribe((toolName: ToolsNames) => {
            this.updateCurrentTool();
        });
    }

    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.drawingService.canvas.style.backgroundColor = DEFAULT_WHITE;
        this.drawingService.restoreCanvas();
    }

    updateCurrentTool(): void {
        this.currentTool = this.toolManagerService.getCurrentToolInstance();
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this.currentTool.onMouseMove(event);
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        this.currentTool.onMouseDown(event);
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.currentTool.onMouseUp(event);
    }

    @HostListener('window:beforeunload', ['$event'])
    unloadHandler(): void {
        this.drawingService.saveCanvas();
    }

    @HostListener('mouseleave', ['$event'])
    onMouseLeave(event: MouseEvent): void {
        this.currentTool.onMouseLeave(event);
    }

    @HostListener('dblclick', ['$event'])
    onDblClick(): void {
        this.currentTool.onDblClick();
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        this.currentTool.onKeyDown(event);
    }

    @HostListener('keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.currentTool.onKeyUp(event);
    }

    setCanvasSize(): void {
        this.canvasSize.x = this.workingZoneSize().x / 2;
        this.canvasSize.y = this.workingZoneSize().y / 2;
        if (this.workingZoneSize().x < LOWER_BOUND_WIDTH || this.workingZoneSize().y < LOWER_BOUND_HEIGHT) {
            this.canvasSize.x = MINIMUM_WIDTH;
            this.canvasSize.y = MINIMUM_HEIGHT;
        }
        this.emitEditorMinWidth();
    }

    workingZoneSize(): Vec2 {
        return {
            x: window.innerWidth - SIDEBAR_WIDTH,
            y: window.innerHeight,
        };
    }

    isCanvasBlank(): boolean {
        // return this.currentDrawing;
        return false;
    }

    saveDrawing(): void {
        this.baseCtx.save();
    }

    restoreDrawing(): void {
        this.baseCtx.restore();
    }

    emitEditorMinWidth(): void {
        const editorMinWidth = this.computeEditorMinWidth();
        this.editorMinWidthEmitter.emit(editorMinWidth);
    }
    computeEditorMinWidth(): number {
        return this.width + SIDEBAR_WIDTH + WORKING_ZONE_VISIBLE_PORTION;
    }
}
