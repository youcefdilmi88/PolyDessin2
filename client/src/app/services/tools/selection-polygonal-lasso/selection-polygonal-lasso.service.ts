import { Injectable } from '@angular/core';
import { SelectionCommand } from '@app/classes/tool-commands/selection-command';
import { Vec2 } from '@app/classes/vec2';
import { CurrentColorService } from '@app/services/current-color/current-color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineCreatorService } from '@app/services/tools/line-creator/line-creator.service';
import { MagnetismService } from '@app/services/tools/magnetism-service/magnetism.service';
import { SelectionService } from '@app/services/tools/selection-service/selection.service';
import { DEFAULT_DOT_RADIUS, DEFAULT_MIN_THICKNESS, MIN_ARRAY_LENGTH } from '@app/services/tools/tools-constants';
import { UndoRedoService } from '@app/services/tools/undo-redo-service/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class SelectionPolygonalLassoService extends LineCreatorService {
    private validePoint: boolean = true;
    magnetismService: MagnetismService;
    constructor(
        drawingService: DrawingService,
        currentColorService: CurrentColorService,
        private undoRedo: UndoRedoService,
        magnetismService: MagnetismService,
    ) {
        super(drawingService, currentColorService, magnetismService);
        this.validePoint = true;
        this.magnetismService = magnetismService;
    }

    registerUndo(imageData: ImageData): void {
        if (!!this.initialTopLeftCorner) {
            this.moveBorderPreview({
                x: this.initialTopLeftCorner?.x - this.topLeftCorner.x,
                y: this.initialTopLeftCorner?.y - this.topLeftCorner.y,
            } as Vec2);
            const finalTopLeftCorner: Vec2 | undefined = SelectionService.selectionActive ? { ...this.topLeftCorner } : undefined;
            const command = new SelectionCommand(
                this,
                { x: this.width, y: this.height },
                imageData,
                this.initialTopLeftCorner,
                finalTopLeftCorner,
                this.pathData,
            );
            this.undoRedo.addCommand(command);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.validePoint && this.mouseDown && !SelectionService.selectionActive && this.buffer) {
            this.defaultMouseUp(event);
            if (this.pathData.length > MIN_ARRAY_LENGTH && this.verifyLastPoint(this.pathData[0])) {
                SelectionService.selectionActive = SelectionService.isSelectionStarted = true;
                this.endOfSelection();
            }
        } else if (!this.buffer) {
            this.buffer = true;
            this.clearPath();
        }
        this.mouseDown = this.dragActive = false;
    }

    onMouseMove(event: MouseEvent): void {
        this.defaultOnMouseMove(event);
        if (this.mouseDown && SelectionService.selectionActive && this.dragActive) {
            this.updateDragPosition(this.getPositionFromMouse(event));
        }
    }

    moveBorderPreview(newPos?: Vec2): void {
        if (!!newPos) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            for (const point of this.pathData) {
                point.x += newPos.x;
                point.y += newPos.y;
            }
            this.drawingService.previewCtx.strokeStyle = 'width: 3px';
            this.drawShape(this.drawingService.previewCtx, this.pathData);
            this.drawingService.previewCtx.stroke();
        }
    }

    getPrimaryColor(): string {
        return this.validePoint && this.pathData.length >= MIN_ARRAY_LENGTH ? '#000000' : '#ff0000';
    }

    verifyValideLine(courrentPosition: Vec2): boolean {
        const pathLength = this.pathData.length - 1;
        const lineToVerify: Vec2[] = [this.pathData[pathLength], courrentPosition];
        for (let i = 0; i < pathLength - 1; i++) {
            const drawnLine: Vec2[] = [this.pathData[i], this.pathData[i + 1]];
            if (this.verifiyCrossedLines(drawnLine, lineToVerify)) {
                this.validePoint = false;
                return false;
            }
        }
        this.validePoint = true;
        return true;
    }

    // verifies if B and C are counter clock wise from A
    private ccw(A: Vec2, B: Vec2, C: Vec2): boolean {
        return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    }

    // algorithm found at https://bryceboe.com/2006/10/23/line-segment-intersection-algorithm/
    private verifiyCrossedLines(line1: Vec2[], line2: Vec2[]): boolean {
        return (
            this.ccw(line1[0], line2[0], line2[1]) !== this.ccw(line1[1], line2[0], line2[1]) &&
            this.ccw(line1[0], line1[1], line2[0]) !== this.ccw(line1[0], line1[1], line2[1])
        );
    }

    private endOfSelection(): void {
        const closedSegment = true;
        this.started = false;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.pathData.pop();
        this.drawLine(
            this.drawingService.previewCtx,
            this.getPrimaryColor(),
            this.currentColorService.getSecondaryColorHex(),
            this.showDots || false,
            this.dotRadius || DEFAULT_DOT_RADIUS,
            this.pathData,
            this.lineThickness || DEFAULT_MIN_THICKNESS,
            closedSegment,
        );
        this.clipArea();
        SelectionService.selectionActive = true;
    }

    private clipArea(): void {
        this.drawingService.clearCanvas(this.drawingService.selectedAreaCtx);

        const coords = this.getClippedCoords();
        const size = this.getClippedSize(coords);

        const imageData = this.drawingService.baseCtx.getImageData(coords[0].x, coords[0].y, size.x, size.y);

        this.replaceEmptyPixels(imageData);
        createImageBitmap(imageData).then((imgBitmap) => {
            this.drawingService.selectedAreaCtx.save();
            this.drawingService.selectedAreaCtx.strokeStyle = 'rgba(255,255,255,0)';
            this.drawShape(this.drawingService.selectedAreaCtx, this.pathData);
            this.drawingService.selectedAreaCtx.stroke();
            this.drawingService.selectedAreaCtx.clip();
            this.drawingService.selectedAreaCtx.drawImage(imgBitmap, coords[0].x, coords[0].y);
            this.drawingService.selectedAreaCtx.restore();
        });
        this.height = imageData.height;
        this.width = imageData.width;

        this.updateSelectedCtx(coords, size);
        this.updateBaseCtx();
        this.updateParent(coords);
    }

    private updateParent(coords: Vec2[]): void {
        this.firstGrid = this.firstGridClip = coords[0];
        this.finalGridClip = coords[1];
        this.updateTopLeftCorner();
        this.initialTopLeftCorner = { ...this.topLeftCorner };
    }

    private drawShape(ctx: CanvasRenderingContext2D, pathData: Vec2[]): void {
        ctx.beginPath();
        ctx.moveTo(pathData[0].x, pathData[0].y);
        for (const point of pathData) ctx.lineTo(point.x, point.y);
        ctx.lineTo(pathData[0].x, pathData[0].y);
    }

    private updateSelectedCtx(coords: Vec2[], size: Vec2): void {
        this.drawingService.selectedAreaCtx.canvas.height = size.y;
        this.drawingService.selectedAreaCtx.canvas.width = size.x;
        this.drawingService.selectedAreaCtx.translate(-coords[0].x, -coords[0].y);
        this.drawingService.selectedAreaCtx.canvas.style.top = coords[0].y - 1 + 'px';
        this.drawingService.selectedAreaCtx.canvas.style.left = coords[0].x - 1 + 'px';
    }

    private updateBaseCtx(): void {
        this.drawShape(this.drawingService.baseCtx, this.pathData);
        this.drawingService.baseCtx.fillStyle = 'white';
        this.drawingService.baseCtx.fill();
    }

    private getClippedSize(coords: Vec2[]): Vec2 {
        const height = Math.abs(coords[1].y - coords[0].y);
        const width = Math.abs(coords[1].x - coords[0].x);
        return { x: width, y: height } as Vec2;
    }

    private getClippedCoords(): Vec2[] {
        let maxCoords = { x: 0, y: 0 } as Vec2;
        let minCoords = { x: 1000, y: 1000 } as Vec2;

        for (const point of this.pathData) {
            maxCoords = { x: Math.max(maxCoords.x, point.x), y: Math.max(maxCoords.y, point.y) } as Vec2;
            minCoords = { x: Math.min(minCoords.x, point.x), y: Math.min(minCoords.y, point.y) } as Vec2;
        }

        return [minCoords, maxCoords];
    }

    executeCommand(command: SelectionCommand): void {
        if (command.path !== undefined) {
            this.drawingService.baseCtx.fillStyle = 'white';
            this.drawShape(this.drawingService.baseCtx, command.path);
            this.drawingService.baseCtx.fill();
        }
        if (command.finalTopLeftCorner !== undefined) {
            const imageData = command.imageData;
            createImageBitmap(imageData).then((imgBitmap) => {
                if (command.finalTopLeftCorner !== undefined)
                    this.drawingService.baseCtx.drawImage(imgBitmap, command.finalTopLeftCorner.x, command.finalTopLeftCorner.y);
            });
        }
    }
}
