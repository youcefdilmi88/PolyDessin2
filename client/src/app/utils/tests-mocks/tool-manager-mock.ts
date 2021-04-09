import { EventEmitter } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { CurrentColorService } from '@app/services/current-color/current-color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShapeStyle } from '@app/utils/enums/shape-style';
import { Stamp } from '@app/utils/enums/stamp';
import { ToolsNames } from '@app/utils/enums/tools-names';
import { ToolStub } from '@app/utils/tests-mocks/tool-stub';
export class ToolManagerServiceMock {
    toolChangeEmitter: EventEmitter<ToolsNames> = new EventEmitter<ToolsNames>();
    currentTool: ToolStub = new ToolStub({} as DrawingService, {} as CurrentColorService);
    getCurrentToolInstance(): Tool {
        return this.currentTool;
    }

    getCurrentTolerance(): number {
        return 0;
    }
    isCurrentTool(): boolean {
        return true;
    }

    getCurrentLineThickness(): number {
        return 1;
    }
    getCurrentShapeStyle(): ShapeStyle {
        return ShapeStyle.Outline;
    }

    getCurrentFrequency(): number {
        return 1;
    }

    getCurrentDropletDiameter(): number {
        return 1;
    }

    getCurrentJetDiameter(): number {
        return 1;
    }

    getCurrentNumberOfSides(): number {
        return 1;
    }

    emitToolChange(): void {
        return;
    }

    setCurrentTool(): void {
        return;
    }
    getCurrentDotRadius(): void {
        return;
    }

    getStampScalingFactor(): number {
        return 1;
    }

    getSelectedStamp(): Stamp {
        return Stamp.House;
    }

    setStampScalingFactor(): void {
        /*empty*/
    }

    setSelectedStamp(): void {
        /*empty*/
    }
}
