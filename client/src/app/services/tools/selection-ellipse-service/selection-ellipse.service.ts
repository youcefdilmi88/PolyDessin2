import { Injectable } from '@angular/core';
import { SelectionCommand } from '@app/classes/tool-commands/selection-command';
import { Vec2 } from '@app/classes/vec2';
import { CurrentColorService } from '@app/services/current-color/current-color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetismService } from '@app/services/tools/magnetism-service/magnetism.service';
import { MousePositionHandlerService } from '@app/services/tools/mouse-position-handler-service/mouse-position-handler.service';
import { SelectionService } from '@app/services/tools/selection-service/selection.service';
import { LINE_DASH } from '@app/services/tools/tools-constants';
import { UndoRedoService } from '@app/services/tools/undo-redo-service/undo-redo.service';
import { KeyboardButtons } from '@app/utils/enums/keyboard-button-pressed';
import { MouseButtons } from '@app/utils/enums/mouse-button-pressed';
@Injectable({
    providedIn: 'root',
})
export class SelectionEllipseService extends SelectionService {
    currentColorService: CurrentColorService;
    mousePositionHandler: MousePositionHandlerService;
    magnetismService: MagnetismService;

    constructor(
        drawingService: DrawingService,
        currentColorService: CurrentColorService,
        mousePositionHandler: MousePositionHandlerService,
        private undoRedo: UndoRedoService,
        magnetismeService: MagnetismService,
    ) {
        super(drawingService, currentColorService, magnetismeService);
        this.currentColorService = currentColorService;
        this.topLeftCorner = { x: 0, y: 0 };
        this.offset = { x: 0, y: 0 };
        SelectionService.isSelectionStarted = this.dragActive = false;
        this.drawingService.selectedAreaCtx = this.drawingService.baseCtx;
        this.mousePositionHandler = mousePositionHandler;
        this.magnetismService = magnetismeService;
    }

    registerUndo(imageData: ImageData): void {
        const finalTopLeftCorner: Vec2 | undefined = SelectionService.isSelectionStarted ? { ...this.topLeftCorner } : undefined;
        const command = new SelectionCommand(this, { x: this.width, y: this.height }, imageData, this.initialTopLeftCorner, finalTopLeftCorner);
        this.undoRedo.addCommand(command);
    }

    onMouseDown(event: MouseEvent): void {
        this.resetFirstGrid();
        this.mouseDown = event.button === MouseButtons.Left;
        this.firstGrid = this.getPositionFromMouse(event);
        this.mouseMoved = false;
        if (!this.mouseDown) return;
        if (!SelectionService.isSelectionStarted) {
            this.drawingService.clearCanvas(this.drawingService.selectedAreaCtx);
            this.firstGridClip = this.getPositionFromMouse(event);
            this.updatePreview();
            SelectionService.isSelectionStarted = true;
        } else {
            this.defaultOnMouseDown(event);
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && SelectionService.isSelectionStarted && !this.dragActive) {
            this.mouseMoved = true;
            this.mouseDownCoord.x = this.getPositionFromMouse(event).x - this.firstGrid.x;
            this.mouseDownCoord.y = this.getPositionFromMouse(event).y - this.firstGrid.y;
            this.updatePreview();
        } else if (this.mouseDown && SelectionService.isSelectionStarted && this.dragActive) {
            this.updateDragPosition(this.getPositionFromMouse(event));
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown && SelectionService.isSelectionStarted && !this.dragActive && this.mouseMoved) {
            SelectionService.selectionActive = true;
            SelectionService.isSelectionStarted = true;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.finalGridClip = this.getPositionFromMouse(event);
            this.updateTopLeftCorner();
            this.drawingService.selectedAreaCtx.strokeStyle = 'white';
            if (this.shiftDown) {
                this.mousePositionHandler.makeCircle(this.mouseDownCoord, this.mouseDownCoord);
            }
            this.selectEllipse(this.drawingService.selectedAreaCtx, this.mouseDownCoord);
            this.moveBorderPreview();
        }
        this.mouseDown = this.dragActive = this.mouseMoved = false;
    }

    moveBorderPreview(newPos?: Vec2): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawEllipse(this.drawingService.previewCtx, { x: this.width, y: this.height }, this.topLeftCorner);
        this.drawingService.previewCtx.stroke();
        this.drawingService.selectedAreaCtx.setLineDash([]);
        this.drawingService.previewCtx.setLineDash([]);
        this.drawingService.baseCtx.setLineDash([]);
    }

    private drawEllipse(ctx: CanvasRenderingContext2D, finalGrid: Vec2, firstGrid: Vec2): void {
        ctx.beginPath();
        ctx.setLineDash([LINE_DASH, LINE_DASH]);
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 1;
        const startCoord = { ...firstGrid };
        const width = finalGrid.x;
        const height = finalGrid.y;

        ctx.ellipse(startCoord.x + width / 2, startCoord.y + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, 2 * Math.PI, false);
        ctx.closePath();
    }

    private clipArea(ctx: CanvasRenderingContext2D, finalGrid: Vec2): void {
        ctx.save();
        this.drawEllipse(ctx, finalGrid, this.firstGrid);
        ctx.clip('evenodd');
    }

    private selectEllipse(ctx: CanvasRenderingContext2D, finalGrid: Vec2): void {
        this.initialTopLeftCorner = { ...this.topLeftCorner };
        this.drawingService.clearCanvas(ctx);
        const imageData = this.drawingService.baseCtx.getImageData(this.firstGrid.x, this.firstGrid.y, finalGrid.x, finalGrid.y);
        const bottomRightCorner: Vec2 = { x: imageData.width, y: imageData.height };
        this.replaceEmptyPixels(imageData);
        createImageBitmap(imageData).then((imgBitmap) => {
            ctx.setLineDash([]);
            this.clipArea(ctx, finalGrid);
            this.drawingService.selectedAreaCtx.drawImage(imgBitmap, this.topLeftCorner.x, this.topLeftCorner.y);
            ctx.restore();
        });
        this.height = imageData.height;
        this.width = imageData.width;
        ctx.canvas.width = bottomRightCorner.x;
        ctx.canvas.height = bottomRightCorner.y;
        ctx.translate(-this.topLeftCorner.x, -this.topLeftCorner.y);
        ctx.canvas.style.top = this.topLeftCorner.y - 1 + 'px';
        ctx.canvas.style.left = this.topLeftCorner.x - 1 + 'px';
        this.drawingService.baseCtx.fillStyle = 'white';
        this.drawEllipse(this.drawingService.baseCtx, finalGrid, this.firstGrid);
        this.drawingService.baseCtx.fill();
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === KeyboardButtons.Shift) {
            this.shiftDown = false;
            this.updatePreview();
        } else this.defaultOnKeyUp(event);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === KeyboardButtons.Shift) {
            this.shiftDown = true;
            this.updatePreview();
        } else this.defaultOnKeyDown(event);
    }

    updatePreview(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        const currentCoord = { ...this.mouseDownCoord };
        this.drawingService.previewCtx.beginPath();
        if (this.shiftDown) {
            this.mousePositionHandler.makeCircle(this.mouseDownCoord, currentCoord);
        }
        this.drawEllipse(this.drawingService.previewCtx, currentCoord, this.firstGrid);
        this.drawingService.previewCtx.stroke();
    }

    executeCommand(command: SelectionCommand): void {
        if (command.initialTopLeftCorner !== undefined) {
            this.drawingService.baseCtx.fillStyle = 'white';
            this.drawingService.baseCtx.beginPath();
            this.drawingService.baseCtx.strokeStyle = 'rgba(255, 255, 255, 1)';
            this.drawingService.baseCtx.lineWidth = 1;
            const startCoord = { ...command.initialTopLeftCorner };
            const width = command.selectionSize.x;
            const height = command.selectionSize.y;
            this.drawingService.baseCtx.ellipse(
                startCoord.x + width / 2,
                startCoord.y + height / 2,
                Math.abs(width / 2),
                Math.abs(height / 2),
                0,
                0,
                2 * Math.PI,
                false,
            );
            this.drawingService.baseCtx.closePath();
            this.drawingService.baseCtx.fill();
        }
        if (command.finalTopLeftCorner !== undefined) {
            this.drawingService.selectedAreaCtx.canvas.style.top = command.finalTopLeftCorner.y + 'px';
            this.drawingService.selectedAreaCtx.canvas.style.left = command.finalTopLeftCorner.x + 'px';
            const imageData = command.imageData;
            createImageBitmap(imageData).then((imgBitmap) => {
                if (command.finalTopLeftCorner !== undefined)
                    this.drawingService.baseCtx.drawImage(imgBitmap, command.finalTopLeftCorner.x, command.finalTopLeftCorner.y);
            });
            this.drawingService.selectedAreaCtx.canvas.width = this.drawingService.selectedAreaCtx.canvas.height = 0;
        }
    }
}
