import { EventEmitter, Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { AerosolService } from '@app/services/tools/aerosol-service/aerosol.service';
import { EllipseService } from '@app/services/tools/ellipse-service/ellipse.service';
import { EraserService } from '@app/services/tools/eraser-service/eraser.service';
import { LineService } from '@app/services/tools/line-service/line.service';
import { PaintBucketService } from '@app/services/tools/paint-bucket-service/paint-bucket.service';
import { PencilService } from '@app/services/tools/pencil-service/pencil.service';
import { PipetteService } from '@app/services/tools/pipette-service/pipette.service';
import { PolygonService } from '@app/services/tools/polygon-service/polygon.service';
import { RectangleService } from '@app/services/tools/rectangle-service/rectangle.service';
import { SelectionEllipseService } from '@app/services/tools/selection-ellipse-service/selection-ellipse.service';
import { SelectionPolygonalLassoService } from '@app/services/tools/selection-polygonal-lasso/selection-polygonal-lasso.service';
import { SelectionRectangleService } from '@app/services/tools/selection-rectangle-service/selection-rectangle.service';
import { SelectionResizerService } from '@app/services/tools/selection-resizer-service/selection-resizer.service';
import { StampService } from '@app/services/tools/stamp-service/stamp.service';
import { TextService } from '@app/services/tools/text-service/text.service';
import { DEFAULT_FONT_SIZE } from '@app/services/tools/tools-constants';
import { ShapeStyle } from '@app/utils/enums/shape-style';
import { Stamp } from '@app/utils/enums/stamp';
import { TextFont } from '@app/utils/enums/text-font.enum';
import { ToolsNames } from '@app/utils/enums/tools-names';
import { CurrentAttributes } from '@app/utils/types/current-attributes';
import { ToolBox } from '@app/utils/types/tool-box';

@Injectable({
    providedIn: 'root',
})
export class ToolManagerService {
    currentTool: ToolsNames = ToolsNames.Pencil;
    toolChangeEmitter: EventEmitter<ToolsNames> = new EventEmitter<ToolsNames>();
    toolBox: ToolBox;
    currentAttributes: CurrentAttributes;
    shapeStyleSelection: Map<string, ShapeStyle> = new Map<string, ShapeStyle>();

    constructor(
        pencilService: PencilService,
        rectangleService: RectangleService,
        ellipseService: EllipseService,
        private lineService: LineService,
        private eraserService: EraserService,
        aerosolService: AerosolService,
        pipetteService: PipetteService,
        selectBoxService: SelectionRectangleService,
        selectEllipseService: SelectionEllipseService,
        polygonService: PolygonService,
        public textService: TextService,
        paintBucket: PaintBucketService,
        selectionResizer: SelectionResizerService,
        stampService: StampService,
        selectPolygonalLassoService: SelectionPolygonalLassoService,
    ) {
        this.toolBox = {
            Pencil: pencilService,
            Rectangle: rectangleService,
            Ellipse: ellipseService,
            Line: lineService,
            Eraser: eraserService,
            Aerosol: aerosolService,
            Pipette: pipetteService,
            SelectBox: selectBoxService,
            SelectEllipse: selectEllipseService,
            SelectPolygon: selectPolygonalLassoService,
            Polygon: polygonService,
            PaintBucket: paintBucket,
            SelectionResizer: selectionResizer,
            Stamp: stampService,
            Text: textService,
        };
        this.currentAttributes = {
            LineThickness: 1,
            ShapeStyle: ShapeStyle.Outline,
            DotRadius: 1,
            ShowDots: false,
            DropletDiameter: 1,
            Frequency: 1,
            JetDiameter: 1,
            numberOfSides: 3,
            BucketTolerance: 0,
            FontSize: DEFAULT_FONT_SIZE,
            FontFace: TextFont.Arial,
        };
        this.shapeStyleSelection.set('Outline', ShapeStyle.Outline).set('Filled', ShapeStyle.Filled).set('FilledOutline', ShapeStyle.FilledOutline);
        this.toolChangeEmitter.subscribe((toolName: ToolsNames) => {
            this.currentTool = toolName;
            const currentTool = this.toolBox[this.currentTool];
            this.currentAttributes.ShapeStyle = currentTool.shapeStyle;
            this.currentAttributes.LineThickness = currentTool.lineThickness;
            this.currentAttributes.DotRadius = lineService.dotRadius;
            this.currentAttributes.ShowDots = lineService.showDots;
            this.currentAttributes.Frequency = currentTool.frequency;
            this.currentAttributes.JetDiameter = currentTool.jetDiameter;
            this.currentAttributes.DropletDiameter = currentTool.dropletDiameter;
            this.currentAttributes.BucketTolerance = currentTool.bucketTolerance;
        });
    }

    setCurrentTool(toolName: ToolsNames): void {
        // if (
        //     this.currentTool === ToolsNames.SelectPolygon ||
        //     this.currentTool === ToolsNames.SelectBox ||
        //     this.currentTool === ToolsNames.SelectEllipse
        // )
        //     this.selectEllipseService.cancelSelection();
        this.currentTool = toolName;
    }

    setCurrentLineThickness(lineThickness?: number): void {
        this.toolBox[this.currentTool].lineThickness = lineThickness;
        this.currentAttributes.LineThickness = lineThickness;
    }
    getCurrentLineThickness(): number | undefined {
        return this.currentAttributes.LineThickness;
    }

    setCurrentShowDots(checked: boolean): void {
        if (this.currentTool === ToolsNames.Line) this.lineService.showDots = checked;
        this.currentAttributes.ShowDots = checked;
    }

    setCurrentDotRadius(dotRadius?: number): void {
        if (this.currentTool === ToolsNames.Line) this.lineService.dotRadius = dotRadius;
        this.currentAttributes.DotRadius = dotRadius;
    }

    setCurrentTolerance(tolerance?: number): void {
        this.toolBox[this.currentTool].bucketTolerance = tolerance;
        this.currentAttributes.BucketTolerance = tolerance;
    }

    getCurrentDotRadius(): number | undefined {
        return this.currentAttributes.DotRadius;
    }

    setCurrentShapeStyle(shapeStyleStr: string): void {
        const shapeStyle = this.shapeStyleSelection.get(shapeStyleStr);
        this.toolBox[this.currentTool].shapeStyle = shapeStyle;
        this.currentAttributes.ShapeStyle = shapeStyle;
    }
    getCurrentShapeStyle(): ShapeStyle | undefined {
        return this.currentAttributes.ShapeStyle;
    }

    getCurrentFrequency(): number | undefined {
        return this.currentAttributes.Frequency;
    }

    getCurrentTolerance(): number | undefined {
        return this.currentAttributes.BucketTolerance;
    }

    getCurrentDropletDiameter(): number | undefined {
        return this.currentAttributes.DropletDiameter;
    }

    getCurrentJetDiameter(): number | undefined {
        return this.currentAttributes.JetDiameter;
    }

    setCurrentFrequency(frequency?: number): void {
        this.toolBox[this.currentTool].frequency = frequency;
        this.currentAttributes.Frequency = frequency;
    }

    setCurrentDropletDiameter(dropletDiameter?: number): void {
        this.toolBox[this.currentTool].dropletDiameter = dropletDiameter;
        this.currentAttributes.DropletDiameter = dropletDiameter;
    }

    setCurrentJetDiameter(jetDiameter?: number): void {
        this.toolBox[this.currentTool].jetDiameter = jetDiameter;
        this.currentAttributes.JetDiameter = jetDiameter;
    }

    getCurrentToolInstance(): Tool {
        return this.toolBox[this.currentTool];
    }

    getCurrentSelectionTool(): SelectionEllipseService | SelectionRectangleService | SelectionPolygonalLassoService | undefined {
        const tool = this.toolBox[this.currentTool];
        if (tool === this.toolBox[ToolsNames.SelectBox]) return tool as SelectionRectangleService;
        if (tool === this.toolBox[ToolsNames.SelectEllipse]) return tool as SelectionEllipseService;
        if (tool === this.toolBox[ToolsNames.SelectPolygon]) return tool as SelectionPolygonalLassoService;
        return undefined;
    }

    setCurrentNumberOfSides(numberOfSides?: number): void {
        this.toolBox[this.currentTool].numberOfSides = numberOfSides;
        this.currentAttributes.numberOfSides = numberOfSides;
    }

    getCurrentNumberOfSides(): number | undefined {
        return this.currentAttributes.numberOfSides;
    }

    getStampScalingFactor(): number {
        const stamp = this.toolBox.Stamp as StampService;
        return stamp.scalingFactor;
    }

    getSelectedStamp(): Stamp {
        const stamp = this.toolBox.Stamp as StampService;
        return stamp.selectedStamp;
    }

    getStampRotationAngle(): number {
        const stamp = this.toolBox.Stamp as StampService;
        return stamp.rotationAngle;
    }

    setStampScalingFactor(factor?: number): void {
        if (factor != undefined) {
            const stamp = this.toolBox.Stamp as StampService;
            stamp.scalingFactor = factor;
        }
    }

    setStampRotationAngle(angle?: number): void {
        if (angle != undefined) {
            const stamp = this.toolBox.Stamp as StampService;
            stamp.rotationAngle = angle;
        }
    }

    setSelectedStamp(stampName: string): void {
        const stampTool = this.toolBox.Stamp as StampService;
        switch (stampName) {
            case Stamp.House:
                stampTool.selectedStamp = Stamp.House;
                break;
            case Stamp.Letter:
                stampTool.selectedStamp = Stamp.Letter;
                break;
            case Stamp.Star:
                stampTool.selectedStamp = Stamp.Star;
                break;
            case Stamp.Hashtag:
                stampTool.selectedStamp = Stamp.Hashtag;
                break;
            default:
                stampTool.selectedStamp = Stamp.Smile;
                break;
        }
    }

    getCurrentFontSize(): number {
        return this.textService.fontSize;
    }

    setCurrentFontFace(selectedFont: string): void {
        this.textService.fontFace = selectedFont as TextFont;
    }

    setCurrentFontSize(fontSize: number): void {
        this.textService.fontSize = fontSize;
    }

    eraserActive(): boolean {
        return this.eraserService.isActive;
    }

    isCurrentTool(toolName: ToolsNames): boolean {
        return this.currentTool === toolName;
    }

    emitToolChange(toolName: ToolsNames): void {
        if (this.currentTool === ToolsNames.Text) {
            this.textService.drawStyledTextOnCanvas();
            this.textService.showTextBox = false;
        }
        this.toolChangeEmitter.emit(toolName);
    }
}
