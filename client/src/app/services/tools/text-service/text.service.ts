import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { TextCommand } from '@app/classes/tool-commands/text-command';
import { Vec2 } from '@app/classes/vec2';
import { CurrentColorService } from '@app/services/current-color/current-color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DEFAULT_FONT_SIZE, FONT_HEIGHT_FACTOR, NEW_LINE_SEPARATOR } from '@app/services/tools/tools-constants';
import { UndoRedoService } from '@app/services/tools/undo-redo-service/undo-redo.service';
import { KeyboardButtons } from '@app/utils/enums/keyboard-button-pressed';
import { TextAlign } from '@app/utils/enums/text-align.enum';
import { TextFont } from '@app/utils/enums/text-font.enum';

@Injectable({
    providedIn: 'root',
})
export class TextService extends Tool {
    text: string;
    fontStyle: string;
    textStyles: string[];
    fontFace: TextFont;
    textAlign: TextAlign;
    numberOfRows: number;
    showTextBox: boolean;
    textBoxPosition: Vec2;
    fontSize: number;

    constructor(public currentColorService: CurrentColorService, drawingService: DrawingService, private undoRedo: UndoRedoService) {
        super(drawingService, currentColorService);
        this.text = '';
        this.textStyles = [];
        this.fontSize = DEFAULT_FONT_SIZE;
        this.textAlign = TextAlign.Start;
        this.fontFace = TextFont.Arial;
        this.fontStyle = '';
        this.showTextBox = false;
        this.numberOfRows = 1;
        this.textBoxPosition = { x: 0, y: 0 };
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === KeyboardButtons.Escape && this.showTextBox) {
            this.showTextBox = false;
            this.text = '';
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        this.numberOfRows = this.calculateNumberOfLines(this.text);
    }

    onMouseDown(event: MouseEvent): void {
        const textArea = document.getElementById('textArea');
        // @ts-ignore
        if (textArea !== null && textArea.contains(event.target)) return;

        this.drawStyledTextOnCanvas();
        this.text = '';
        this.numberOfRows = 1;
        this.showTextBox = !this.showTextBox;
        this.textBoxPosition = this.getPositionFromMouse(event);
    }

    drawStyledTextOnCanvas(): void {
        if (this.text === '') return;
        const textFinalPosition = this.calculateTextFinalPosition(this.textBoxPosition);
        const command = new TextCommand(
            this,
            this.currentColorService.getPrimaryColorRgba(),
            this.text,
            this.getCurrentStyle(),
            this.fontFace,
            this.textAlign,
            { ...textFinalPosition },
            this.fontSize,
        );
        this.undoRedo.addCommand(command);
        this.fillTextMultiLine(this.drawingService.baseCtx, command);
    }

    private calculateTextFinalPosition(currentPosition: Vec2): Vec2 {
        const textPosition = { ...currentPosition };
        const textArea = document.getElementById('textArea') as HTMLTextAreaElement;
        if (textArea) {
            switch (this.textAlign) {
                case TextAlign.Start:
                    break;

                case TextAlign.Center:
                    textPosition.x += textArea.clientWidth / 2;
                    break;

                case TextAlign.End:
                    textPosition.x += textArea.clientWidth;
                    break;
            }
        }
        return textPosition;
    }

    fillTextMultiLine(context: CanvasRenderingContext2D, command: TextCommand): void {
        const fontHeight = this.calculateTextHeight(context, command.text);
        const textPosition = { ...command.textBoxPosition };
        context.fillStyle = command.primaryColor;
        context.font = ` ${command.fontStyle} ${command.fontSize}px ${command.fontFace}`;
        context.textAlign = command.textAlign;
        textPosition.y += fontHeight;

        const lines = this.splitTextInToLines(command.text);
        lines.forEach((line: string) => {
            context.fillText(line, textPosition.x, textPosition.y);
            textPosition.y += fontHeight + FONT_HEIGHT_FACTOR * fontHeight;
        });
    }

    private calculateTextHeight(context: CanvasRenderingContext2D, text: string): number {
        const metrics = context.measureText(text);
        return metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
    }

    private calculateNumberOfLines(text: string): number {
        return this.splitTextInToLines(text).length;
    }

    private splitTextInToLines(text: string): string[] {
        return text.split(NEW_LINE_SEPARATOR);
    }

    calculateTextBoxWidth(): number {
        return this.calculateLongestLineWidth(this.text);
    }

    private calculateLongestLineWidth(text: string): number {
        const lines = this.splitTextInToLines(text);
        let longestLineWidth = this.calculateTextWidth(this.drawingService.baseCtx, lines[0]);
        for (const line of lines) {
            const lineWidth = this.calculateTextWidth(this.drawingService.baseCtx, line);
            if (lineWidth > longestLineWidth) {
                longestLineWidth = lineWidth;
            }
        }
        return longestLineWidth;
    }

    private calculateTextWidth(context: CanvasRenderingContext2D, text: string): number {
        context.font = ` ${this.getCurrentStyle()} ${this.fontSize}px ${this.fontFace}`;
        context.textAlign = this.textAlign;
        return context.measureText(text).width;
    }

    private getCurrentStyle(): string {
        const bold = this.getSingleStyle('bold');
        const italic = this.getSingleStyle('italic');

        return bold.concat(' ').concat(italic);
    }

    getSingleStyle(style: string): string {
        let textStyle = '';
        for (const item of this.textStyles) {
            if (style === item) {
                textStyle = item;
            }
        }
        return textStyle;
    }

    executeCommand(command: TextCommand): void {
        this.fillTextMultiLine(this.drawingService.baseCtx, command);
    }
}
