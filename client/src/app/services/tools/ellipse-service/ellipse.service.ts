import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { ShapeCommand } from '@app/classes/tool-commands/shape-command';
import { Vec2 } from '@app/classes/vec2';
import { CurrentColourService } from '@app/services/current-colour/current-colour.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DEFAULT_MIN_THICKNESS } from '@app/services/tools/tools-constants';
import { UndoRedoService } from '@app/services/tools/undo-redo-service/undo-redo.service';
import { KeyboardButtons } from '@app/utils/enums/keyboard-button-pressed';
import { MouseButtons } from '@app/utils/enums/mouse-button-pressed';
import { Sign } from '@app/utils/enums/rgb-settings';
import { ShapeStyle } from '@app/utils/enums/shape-style';

@Injectable({
    providedIn: 'root',
})
export class EllipseService extends Tool {
    private firstGrid: Vec2;
    private shiftDown: boolean;
    private undoRedo: UndoRedoService;
    currentColourService: CurrentColourService;

    constructor(drawingService: DrawingService, currentColourService: CurrentColourService, undoRedo: UndoRedoService) {
        super(drawingService, currentColourService);
        this.currentColourService = currentColourService;
        this.undoRedo = undoRedo;
    }

    onMouseDown(event: MouseEvent): void {
        this.clearPath();
        this.mouseDown = event.button === MouseButtons.Left;
        if (this.mouseDown) {
            this.firstGrid = this.getPositionFromMouse(event);
            this.updatePreview();
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.mouseDownCoord.x = this.getPositionFromMouse(event).x - this.firstGrid.x;
            this.mouseDownCoord.y = this.getPositionFromMouse(event).y - this.firstGrid.y;
            this.updatePreview();
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            if (this.shiftDown) {
                this.drawCircle(this.mouseDownCoord);
            }
            this.drawEllipse(
                this.drawingService.baseCtx,
                this.firstGrid,
                this.mouseDownCoord,
                this.currentColourService.getPrimaryColorRgba(),
                this.currentColourService.getSecondaryColorRgba(),
                this.lineThickness || DEFAULT_MIN_THICKNESS,
                this.shapeStyle,
            );
            const command = new ShapeCommand(
                this,
                this.currentColourService.getPrimaryColorRgba(),
                this.currentColourService.getSecondaryColorRgba(),
                this.lineThickness || DEFAULT_MIN_THICKNESS,
                this.firstGrid,
                this.mouseDownCoord,
                this.shapeStyle,
            );
            this.undoRedo.addCommand(command);
            this.clearPath();
        }
        this.mouseDown = false;
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === KeyboardButtons.Escape) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.clearPath();
        }
        if (event.key === KeyboardButtons.Shift) {
            this.shiftDown = true;
            this.updatePreview();
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (this.shiftDown && event.key === KeyboardButtons.Shift) {
            this.shiftDown = false;
            this.updatePreview();
        }
    }

    drawPerimeter(ctx: CanvasRenderingContext2D, finalGrid: Vec2): void {
        ctx.strokeStyle = 'black';

        const startCoord = { ...this.firstGrid };
        const width = Math.abs(finalGrid.x);
        const height = Math.abs(finalGrid.y);

        if (finalGrid.x < 0) {
            startCoord.x += finalGrid.x;
        }
        if (finalGrid.y < 0) {
            startCoord.y += finalGrid.y;
        }
        ctx.strokeRect(startCoord.x, startCoord.y, width, height);
    }

    drawOutline(ctx: CanvasRenderingContext2D, firstGrid: Vec2, finalGrid: Vec2, secondaryColor: string, strokeThickness: number): void {
        ctx.beginPath();
        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = strokeThickness;

        const startCoord = { ...firstGrid };
        const width = finalGrid.x;
        const height = finalGrid.y;

        ctx.ellipse(startCoord.x + width / 2, startCoord.y + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, 2 * Math.PI, false);
        ctx.stroke();
    }

    drawFilled(ctx: CanvasRenderingContext2D, firstGrid: Vec2, finalGrid: Vec2, primaryColor: string, strokethickness: number): void {
        ctx.beginPath();
        ctx.fillStyle = primaryColor;
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = DEFAULT_MIN_THICKNESS;
        // ctx.lineWidth = strokethickness;
        // strokethickness peut surement etre enlevé de cette fonction car pas utile
        const startCoord = { ...firstGrid };
        const width = finalGrid.x;
        const height = finalGrid.y;

        ctx.ellipse(startCoord.x + width / 2, startCoord.y + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.stroke();
    }

    drawFilledOutline(
        ctx: CanvasRenderingContext2D,
        firstGrid: Vec2,
        finalGrid: Vec2,
        primaryColor: string,
        secondaryColor: string,
        strokeThickness: number,
    ): void {
        ctx.beginPath();
        ctx.fillStyle = primaryColor;
        ctx.lineWidth = strokeThickness;
        ctx.strokeStyle = secondaryColor;

        const startCoord = { ...firstGrid };
        const width = finalGrid.x;
        const height = finalGrid.y;

        ctx.ellipse(
            startCoord.x + width / 2,
            startCoord.y + height / 2,
            Math.abs(width / 2 - strokeThickness),
            Math.abs(height / 2 - strokeThickness),
            0,
            0,
            2 * Math.PI,
            false,
        );
        ctx.fill();
        ctx.stroke();
        ctx.ellipse(startCoord.x + width / 2, startCoord.y + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, 2 * Math.PI, false);
        ctx.stroke();
    }

    private isMouseInFirstQuadrant(): boolean {
        //  mouse is in first quadrant (+/+)
        return Math.sign(this.mouseDownCoord.x) === Sign.Positive && Math.sign(this.mouseDownCoord.y) === Sign.Positive;
    }

    private isMouseInSecondQuadrant(): boolean {
        // mouse is in third quadrant (-/-)
        return Math.sign(this.mouseDownCoord.x) === Sign.Negative && Math.sign(this.mouseDownCoord.y) === Sign.Negative;
    }

    private isMouseInThirdQuadrant(): boolean {
        // mouse is in fourth quadrant (-/+)
        return Math.sign(this.mouseDownCoord.x) === Sign.Negative && Math.sign(this.mouseDownCoord.y) === Sign.Positive;
    }

    private isMouseInFourthQuadrant(): boolean {
        // mouse is in second quadrant (+/-)
        return Math.sign(this.mouseDownCoord.x) === Sign.Positive && Math.sign(this.mouseDownCoord.y) === Sign.Negative;
    }

    private isXGreaterThanY(): boolean {
        return Math.abs(this.mouseDownCoord.x) > Math.abs(this.mouseDownCoord.y);
    }

    private isYGreaterThanX(): boolean {
        return Math.abs(this.mouseDownCoord.y) > Math.abs(this.mouseDownCoord.x);
    }

    private drawCircle(grid: Vec2): void {
        if (this.isMouseInFirstQuadrant()) {
            grid.x = grid.y = Math.min(this.mouseDownCoord.x, this.mouseDownCoord.y);
        }

        if (this.isMouseInSecondQuadrant()) {
            grid.x = grid.y = Math.max(this.mouseDownCoord.x, this.mouseDownCoord.y);
        }

        if (this.isMouseInThirdQuadrant()) {
            this.isXGreaterThanY() ? (grid.x = -grid.y) : (grid.y = -grid.x);
        }

        if (this.isMouseInFourthQuadrant()) {
            this.isYGreaterThanX() ? (grid.y = -grid.x) : (grid.x = -grid.y);
        }
    }

    private drawEllipse(
        ctx: CanvasRenderingContext2D,
        firstGrid: Vec2,
        finalGrid: Vec2,
        primaryColor: string,
        secondaryColor: string,
        strokeThickness: number,
        shapeStyle?: ShapeStyle,
    ): void {
        switch (shapeStyle) {
            case ShapeStyle.Outline:
                this.drawOutline(ctx, firstGrid, finalGrid, secondaryColor, strokeThickness);
                break;

            case ShapeStyle.Filled:
                this.drawFilled(ctx, firstGrid, finalGrid, primaryColor, strokeThickness);
                break;

            case ShapeStyle.FilledOutline:
                this.drawFilledOutline(ctx, firstGrid, finalGrid, primaryColor, secondaryColor, strokeThickness);
                break;

            default:
                this.drawOutline(ctx, firstGrid, finalGrid, secondaryColor, strokeThickness);
                break;
        }
    }

    private updatePreview(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        const currentCoord = { ...this.mouseDownCoord };
        this.drawingService.previewCtx.beginPath();
        this.drawPerimeter(this.drawingService.previewCtx, currentCoord);
        if (this.shiftDown) {
            this.drawCircle(currentCoord);
        }
        this.drawEllipse(
            this.drawingService.previewCtx,
            this.firstGrid,
            currentCoord,
            this.currentColourService.getPrimaryColorRgba(),
            this.currentColourService.getSecondaryColorRgba(),
            this.lineThickness || DEFAULT_MIN_THICKNESS,
            this.shapeStyle,
        );
        this.drawingService.previewCtx.closePath();
    }

    private clearPath(): void {
        this.firstGrid = this.mouseDownCoord = { x: 0, y: 0 };
    }

    executeCommand(command: ShapeCommand): void {
        this.drawEllipse(
            this.drawingService.baseCtx,
            command.initialPosition,
            command.finalPosition,
            command.primaryColor,
            command.secondaryColor,
            command.strokeThickness,
            command.shapeStyle,
        );
        return;
    }
}
