import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { SelectionCommand } from '@app/classes/tool-commands/selection-command';
import { Vec2 } from '@app/classes/vec2';
import { CurrentColorService } from '@app/services/current-color/current-color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ALPHA_POS, BLUE_POS, GREEN_POS, MAX_BYTE_VALUE, RED_POS } from '@app/services/services-constants';
import { MousePositionHandlerService } from '@app/services/tools/mousePositionHandler-service/mouse-position-handler.service';
import { RectangleService } from '@app/services/tools/rectangle-service/rectangle.service';
import { LINE_DASH, PIXELS_ARROW_STEPS } from '@app/services/tools/tools-constants';
import { UndoRedoService } from '@app/services/tools/undo-redo-service/undo-redo.service';
import { KeyboardButtons } from '@app/utils/enums/keyboard-button-pressed';
import { MouseButtons } from '@app/utils/enums/mouse-button-pressed';
@Injectable({
    providedIn: 'root',
})
export class SelectionEllipseService extends Tool {
    private firstGrid: Vec2;
    private begin: Vec2;
    private end: Vec2;
    private shiftDown: boolean;
    private dragActive: boolean;
    private offset: Vec2;
    private upPressed: boolean;
    private downPressed: boolean;
    private leftPressed: boolean;
    private rightPressed: boolean;
    private mousePositionHandler: MousePositionHandlerService;
    private initialTopLeftCorner: Vec2;
    topLeftCorner: Vec2;
    selectionActive: boolean;
    isSelectionDone: boolean;
    height: number;
    width: number;
    rectangleService: RectangleService;
    currentColorService: CurrentColorService;

    constructor(
        drawingService: DrawingService,
        currentColorService: CurrentColorService,
        mousePositionHandler: MousePositionHandlerService,
        private undoRedo: UndoRedoService,
    ) {
        super(drawingService, currentColorService);
        this.currentColorService = currentColorService;
        this.topLeftCorner = { x: 0, y: 0 };
        this.offset = { x: 0, y: 0 };
        this.selectionActive = this.dragActive = false;
        this.drawingService.selectedAreaCtx = this.drawingService.baseCtx;
        this.mousePositionHandler = mousePositionHandler;
    }

    onMouseDown(event: MouseEvent): void {
        this.clearPath();
        this.mouseDown = event.button === MouseButtons.Left;
        this.firstGrid = this.getPositionFromMouse(event);
        this.mouseMoved = false;
        if (this.mouseDown) {
            if (!this.selectionActive) {
                this.drawingService.clearCanvas(this.drawingService.selectedAreaCtx);
                this.begin = this.getPositionFromMouse(event);
                this.updatePreview();
                this.selectionActive = true;
            } else {
                if (this.isClickIn(this.firstGrid)) {
                    const initial = this.getPositionFromMouse(event);
                    this.offset.x = this.topLeftCorner.x - initial.x;
                    this.offset.y = this.topLeftCorner.y - initial.y;
                    this.dragActive = true;
                } else {
                    this.selectionActive = false;
                    const imageData = this.drawingService.selectedAreaCtx.getImageData(0, 0, this.width, this.height);
                    createImageBitmap(imageData).then((imgBitmap) => {
                        this.drawingService.baseCtx.drawImage(imgBitmap, this.topLeftCorner.x + 1, this.topLeftCorner.y + 1);
                    });
                    this.drawingService.selectedAreaCtx.canvas.width = this.drawingService.selectedAreaCtx.canvas.height = 0;
                    this.isSelectionDone = false;
                    const command = new SelectionCommand(
                        this,
                        this.initialTopLeftCorner,
                        { ...this.topLeftCorner },
                        { x: this.width, y: this.height },
                        imageData,
                    );
                    this.undoRedo.addCommand(command);
                }
            }
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && this.selectionActive && !this.dragActive) {
            this.mouseMoved = true;
            this.mouseDownCoord.x = this.getPositionFromMouse(event).x - this.firstGrid.x;
            this.mouseDownCoord.y = this.getPositionFromMouse(event).y - this.firstGrid.y;
            this.updatePreview();
        } else if (this.mouseDown && this.selectionActive && this.dragActive) {
            this.updateDragPosition(this.getPositionFromMouse(event));
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown && this.selectionActive && !this.dragActive && this.mouseMoved) {
            this.isSelectionDone = true;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.end = this.getPositionFromMouse(event);
            this.updateTopLeftCorner();
            this.drawingService.selectedAreaCtx.strokeStyle = 'white';
            if (this.shiftDown) {
                this.mousePositionHandler.makeCircle(this.mouseDownCoord, this.mouseDownCoord);
            }
            this.selectEllipse(this.drawingService.selectedAreaCtx, this.mouseDownCoord);
            this.drawEllipse(this.drawingService.selectedAreaCtx, this.mouseDownCoord);
            this.drawingService.selectedAreaCtx.stroke();
            this.drawingService.selectedAreaCtx.setLineDash([]);
            this.drawingService.previewCtx.setLineDash([]);
            this.drawingService.baseCtx.setLineDash([]);
        }
        this.mouseDown = this.dragActive = this.mouseMoved = false;
    }

    onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case KeyboardButtons.Up: {
                if (this.selectionActive) {
                    this.upPressed = true;
                }
                break;
            }
            case KeyboardButtons.Down: {
                if (this.selectionActive) {
                    this.downPressed = true;
                }
                break;
            }
            case KeyboardButtons.Right: {
                if (this.selectionActive) {
                    this.rightPressed = true;
                }
                break;
            }
            case KeyboardButtons.Left: {
                if (this.selectionActive) {
                    this.leftPressed = true;
                }
                break;
            }
            case KeyboardButtons.Shift: {
                this.shiftDown = true;
                this.updatePreview();
                break;
            }
            case KeyboardButtons.Escape: {
                this.clearPath();
                this.drawingService.clearCanvas(this.drawingService.selectedAreaCtx);
                this.drawingService.selectedAreaCtx.canvas.width = this.drawingService.selectedAreaCtx.canvas.height = 0;
            }
        }
        this.updateArrowPosition();
    }

    onKeyUp(event: KeyboardEvent): void {
        switch (event.key) {
            case KeyboardButtons.Up: {
                if (this.selectionActive) {
                    this.upPressed = false;
                }
                break;
            }
            case KeyboardButtons.Down: {
                if (this.selectionActive) {
                    this.downPressed = false;
                }
                break;
            }
            case KeyboardButtons.Right: {
                if (this.selectionActive) {
                    this.rightPressed = false;
                }
                break;
            }
            case KeyboardButtons.Left: {
                if (this.selectionActive) {
                    this.leftPressed = false;
                }
                break;
            }
            case KeyboardButtons.Shift: {
                this.shiftDown = false;
                this.updatePreview();
                break;
            }
        }
    }

    private updateTopLeftCorner(): void {
        if (this.begin.x > this.end.x) {
            this.topLeftCorner.x = this.end.x;
        }
        if (this.begin.x < this.end.x) {
            this.topLeftCorner.x = this.begin.x;
        }
        if (this.begin.y > this.end.y) {
            this.topLeftCorner.y = this.end.y;
        }
        if (this.begin.y < this.end.y) {
            this.topLeftCorner.y = this.begin.y;
        }
    }

    private drawEllipse(ctx: CanvasRenderingContext2D, finalGrid: Vec2): void {
        ctx.beginPath();
        ctx.setLineDash([LINE_DASH, LINE_DASH]);
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 1;
        const startCoord = { ...this.firstGrid };
        const width = finalGrid.x;
        const height = finalGrid.y;

        ctx.ellipse(startCoord.x + width / 2, startCoord.y + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, 2 * Math.PI, false);
        ctx.closePath();
    }

    private clipArea(ctx: CanvasRenderingContext2D, finalGrid: Vec2): void {
        ctx.save();
        this.drawEllipse(ctx, finalGrid);
        ctx.clip('evenodd');
    }

    private selectEllipse(ctx: CanvasRenderingContext2D, finalGrid: Vec2): void {
        this.initialTopLeftCorner = { ...this.topLeftCorner };
        this.drawingService.clearCanvas(ctx);
        const imageData = this.drawingService.baseCtx.getImageData(this.firstGrid.x, this.firstGrid.y, finalGrid.x, finalGrid.y);
        const bottomRightCorner: Vec2 = { x: imageData.width, y: imageData.height };
        for (let i = 3; i < imageData.data.length; i += ALPHA_POS) {
            if (imageData.data[i] === 0) {
                imageData.data[i - RED_POS] = MAX_BYTE_VALUE;
                imageData.data[i - GREEN_POS] = MAX_BYTE_VALUE;
                imageData.data[i - BLUE_POS] = MAX_BYTE_VALUE;
                imageData.data[i] = MAX_BYTE_VALUE;
            }
        }
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
        ctx.canvas.style.top = this.topLeftCorner.y + 'px';
        ctx.canvas.style.left = this.topLeftCorner.x + 'px';
        this.drawingService.baseCtx.fillStyle = 'white';
        this.drawEllipse(this.drawingService.baseCtx, finalGrid);
        this.drawingService.baseCtx.fill();
    }

    private updatePreview(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        const currentCoord = { ...this.mouseDownCoord };
        this.drawingService.previewCtx.beginPath();
        if (this.shiftDown) {
            this.mousePositionHandler.makeCircle(this.mouseDownCoord, currentCoord);
        }
        this.drawEllipse(this.drawingService.previewCtx, currentCoord);
        this.drawingService.previewCtx.stroke();
    }

    private isClickIn(firstGrid: Vec2): boolean {
        if (firstGrid.x < this.topLeftCorner.x || firstGrid.x > this.topLeftCorner.x + this.width) {
            return false;
        }
        if (firstGrid.y < this.topLeftCorner.y || firstGrid.y > this.topLeftCorner.y + this.height) {
            return false;
        }
        return true;
    }

    private updateDragPosition(grid: Vec2): void {
        const currentCoord = { ...grid };
        this.topLeftCorner.x = currentCoord.x + this.offset.x;
        this.topLeftCorner.y = currentCoord.y + this.offset.y;
        this.drawingService.selectedAreaCtx.canvas.style.top = this.topLeftCorner.y + 'px';
        this.drawingService.selectedAreaCtx.canvas.style.left = this.topLeftCorner.x + 'px';
    }

    private updateArrowPosition(): void {
        if (this.selectionActive && this.upPressed) {
            this.topLeftCorner.y -= PIXELS_ARROW_STEPS;
            this.firstGrid.y -= PIXELS_ARROW_STEPS;
        }
        if (this.selectionActive && this.downPressed) {
            this.topLeftCorner.y += PIXELS_ARROW_STEPS;
            this.firstGrid.y += PIXELS_ARROW_STEPS;
        }
        if (this.selectionActive && this.rightPressed) {
            this.topLeftCorner.x += PIXELS_ARROW_STEPS;
            this.firstGrid.x += PIXELS_ARROW_STEPS;
        }
        if (this.selectionActive && this.leftPressed) {
            this.topLeftCorner.x -= PIXELS_ARROW_STEPS;
            this.firstGrid.x -= PIXELS_ARROW_STEPS;
        }
        this.drawingService.selectedAreaCtx.canvas.style.top = this.topLeftCorner.y + 'px';
        this.drawingService.selectedAreaCtx.canvas.style.left = this.topLeftCorner.x + 'px';
    }

    private clearPath(): void {
        this.firstGrid = this.mouseDownCoord = { x: 0, y: 0 };
    }

    executeCommand(command: SelectionCommand): void {
        this.drawingService.selectedAreaCtx.canvas.style.top = command.finalTopLeftCorner.y + 'px';
        this.drawingService.selectedAreaCtx.canvas.style.left = command.finalTopLeftCorner.x + 'px';
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
        const imageData = command.imageData;
        createImageBitmap(imageData).then((imgBitmap) => {
            this.drawingService.baseCtx.drawImage(imgBitmap, command.finalTopLeftCorner.x, command.finalTopLeftCorner.y);
        });
        this.drawingService.selectedAreaCtx.canvas.width = this.drawingService.selectedAreaCtx.canvas.height = 0;
    }
}
