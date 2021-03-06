import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetismService } from '@app/services/tools/magnetism-service/magnetism.service';
import { SelectionStatus } from '@app/utils/enums/selection-resizer-status';

describe('MagnetismServiceService', () => {
    let service: MagnetismService;
    let drawingService: DrawingService;
    let canvasTestHelper: CanvasTestHelper;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let selectedAreaCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        // tslint:disable:no-any

        service = TestBed.inject(MagnetismService);
        drawingService = TestBed.inject(DrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        selectedAreaCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;

        drawingService.baseCtx = baseCtxStub;
        drawingService.previewCtx = previewCtxStub;
        drawingService.selectedAreaCtx = selectedAreaCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onMouseUp sets mouse down to false and stop magnetism', () => {
        service.onMouseUp(new MouseEvent(''));
        expect(service.mouseDown).toBeFalse();
        expect(service.isMagnetismOnGoing).toBeFalse();
    });

    it('startKeys should set the defaul status and gridSize', () => {
        const gridSize = 50;
        drawingService.gridSize = gridSize;

        service.startKeys();
        expect(service.status).toBe(SelectionStatus.TOP_LEFT_BOX);
        expect(service.gridSize).toBe(drawingService.gridSize);
    });

    it('findNearestLineLeft should calculate the proper distance when the position of the resizer locker is not a multiple of gridSize', () => {
        const positionLockedResizer = { x: 98, y: 98 };
        const gridSize = 50;

        service.lockedResizer = positionLockedResizer;
        service.gridSize = gridSize;
        const expectedDistance = 48;
        const distance = service.findNearestLineLeft();

        service.findLockedResizer();
        expect(distance).toEqual(expectedDistance);
    });

    it('findNearestLineLeft should calculate the proper distance when the position of the resizer locker is a multiple of gridSize', () => {
        const positionLockedResizer = { x: 100, y: 100 };
        const gridSize = 50;

        service.lockedResizer = positionLockedResizer;
        service.gridSize = gridSize;
        const expectedDistance = 50;
        const distance = service.findNearestLineLeft();

        service.findLockedResizer();
        expect(expectedDistance).toEqual(distance);
    });

    it('findNearestRight should calculate the proper distance when the position of the resizer locker is not a multiple of gridSize', () => {
        const positionLockedResizer = { x: 198, y: 98 };
        const gridSize = 50;

        service.lockedResizer = positionLockedResizer;
        service.gridSize = gridSize;
        const expectedDistance = -2;
        const distance = service.findNearestLineRight();

        service.findLockedResizer();
        expect(distance).toEqual(expectedDistance);
    });

    it('findNearestLineRight should calculate the proper distance when the position of the resizer locker is a multiple of gridSize', () => {
        const positionLockedResizer = { x: 200, y: 100 };

        const gridSize = 50;

        service.lockedResizer = positionLockedResizer;
        service.gridSize = gridSize;
        const expectedDistance = -50;
        const distance = service.findNearestLineRight();

        service.findLockedResizer();
        expect(distance).toEqual(expectedDistance);
    });

    it('findNearestLineTop should calculate the proper distance when the position of the resizer locker is not a multiple of gridSize', () => {
        const positionLockedResizer = { x: 100, y: 198 };

        const gridSize = 50;

        service.lockedResizer = positionLockedResizer;
        service.gridSize = gridSize;
        const expectedDistance = 48;
        const distance = service.findNearestLineTop();
        service.findLockedResizer();
        expect(distance).toEqual(expectedDistance);
    });

    it('findNearestLineTop should calculate the proper distance when the position of the resizer locker is a multiple of gridSize', () => {
        const positionLockedResizer = { x: 100, y: 200 };

        const gridSize = 50;

        service.lockedResizer = positionLockedResizer;
        service.gridSize = gridSize;
        const expectedDistance = 50;
        const distance = service.findNearestLineTop();

        service.findLockedResizer();
        expect(distance).toEqual(expectedDistance);
    });

    it(' findNearestLineDown should calculate the proper distance when the position of the resizer locker is not a multiple of gridSize', () => {
        const positionLockedResizer = { x: 100, y: 198 };

        const gridSize = 50;

        service.lockedResizer = positionLockedResizer;
        service.gridSize = gridSize;
        const expectedDistance = -2;
        const distance = service.findNearestLineDown();

        service.findLockedResizer();
        expect(distance).toEqual(expectedDistance);
    });

    it(' 333 findNearestLineDown should calculate the proper distance when the position of the resizer locker is a multiple of gridSize', () => {
        const positionLockedResizer = { x: 100, y: 200 };

        const gridSize = 50;

        service.lockedResizer = positionLockedResizer;
        service.gridSize = gridSize;
        const expectedDistance = -50;
        const distance = service.findNearestLineDown();

        service.findLockedResizer();
        expect(distance).toEqual(expectedDistance);
    });

    it(' updatePosition should set the grid and update the selection"s position with respect to the top left corner ', () => {
        const grid = 50;
        const positionLockedResizer = { x: 100, y: 200 };
        service.lockedResizer = positionLockedResizer;
        service.status = SelectionStatus.TOP_LEFT_BOX;

        const findNearestLineLeftSpy = spyOn<any>(service, 'findNearestLineLeft').and.callThrough();
        const findNearestLineTopSpy = spyOn<any>(service, 'findNearestLineTop').and.callThrough();
        service.updatePosition(grid);

        expect(findNearestLineLeftSpy).toHaveBeenCalled();
        expect(findNearestLineTopSpy).toHaveBeenCalled();
    });

    it(' updatePosition should not set the grid and update the selection"s position if no corner is selected ', () => {
        const grid = 50;
        const positionLockedResizer = { x: 100, y: 200 };
        service.lockedResizer = positionLockedResizer;
        service.status = SelectionStatus.OFF;

        const findNearestLineLeftSpy = spyOn<any>(service, 'findNearestLineLeft').and.callThrough();
        const findNearestLineTopSpy = spyOn<any>(service, 'findNearestLineTop').and.callThrough();
        service.updatePosition(grid);

        expect(findNearestLineLeftSpy).not.toHaveBeenCalled();
        expect(findNearestLineTopSpy).not.toHaveBeenCalled();
    });

    it(' setStatus should set ready the service for a magnetic positionning ', () => {
        const findLockedResizerSpy = spyOn<any>(service, 'findLockedResizer').and.callThrough();

        service.setStatus(SelectionStatus.TOP_LEFT_BOX);
        expect(service.mouseDown).toBe(true);
        expect(service.isMagnetismOnGoing).toBe(true);
        expect(findLockedResizerSpy).toHaveBeenCalled();
    });

    it(' setStatus should set ready the service for a magnetic positionning ', () => {
        const findLockedResizerSpy = spyOn<any>(service, 'findLockedResizer').and.callThrough();

        service.setStatus(SelectionStatus.TOP_LEFT_BOX);
        expect(service.mouseDown).toBe(true);
        expect(service.isMagnetismOnGoing).toBe(true);
        expect(findLockedResizerSpy).toHaveBeenCalled();
    });

    it(' updateDragPositionMagnetism should set the selectedArea canvas with the proper dimension ', () => {
        const coord = { x: 80, y: 80 };
        service.updateDragPositionMagnetism(coord);
        service.setStatus(SelectionStatus.TOP_LEFT_BOX);
        const expectedValue = drawingService.selectedAreaCtx.canvas.style.top;
        expect(expectedValue).toEqual('79px');
    });

    it(' verifyInRangeCross should return false when the selected resizer is not near an intersection on the grid ', () => {
        const positionLockedResizer = { x: 100, y: 100 };
        const gridSize = 50;
        service.lockedResizer = positionLockedResizer;

        service.gridSize = gridSize;
        const coord = { x: 80, y: 80 };
        const result = service.verifyInRangeCross(coord);

        expect(result).toBe(false);
    });

    it(' verifyInRangeCross should return true when the selected resizer is near an intersection on the grid ', () => {
        const positionLockedResizer = { x: 51, y: 51 };
        service.lockedResizer = positionLockedResizer;

        const gridSize = 50;
        service.gridSize = gridSize;

        const coord = { x: 0, y: 0 };
        const result = service.verifyInRangeCross(coord);

        expect(result).toBe(false);
    });

    it(' isUsingMagnetism return true when the status is set defaut resizer ', () => {
        service.status = SelectionStatus.TOP_LEFT_BOX;
        const result = service.isUsingMagnetism();
        expect(result).toBe(true);
    });

    it(' isUsingMagnetism return false when the status is not set defaut resizer ', () => {
        service.status = SelectionStatus.OFF;
        const result = service.isUsingMagnetism();
        expect(result).toBe(false);
    });
});
