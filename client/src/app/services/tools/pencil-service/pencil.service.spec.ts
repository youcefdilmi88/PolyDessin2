import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { PencilCommand } from '@app/classes/tool-commands/pencil-command';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MouseButtons } from '@app/utils/enums/mouse-button-pressed';
import { PencilService } from './pencil.service';

// tslint:disable:no-any
describe('PencilService', () => {
    let service: PencilService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawLineSpy: jasmine.Spy<any>;
    let drawDotSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(PencilService);
        drawLineSpy = spyOn<any>(service, 'drawLine').and.callThrough();
        drawDotSpy = spyOn<any>(service, 'drawDot').and.callThrough();
        spyOn<any>(service, 'getPositionFromMouse').and.returnValue({ x: 100, y: 100 });

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButtons.Left,
        } as MouseEvent;
    });

    it('should be created', () => {
        service['lineThickness'] = undefined;
        expect(service).toBeTruthy();
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 100, y: 100 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButtons.Right,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should call drawLine if mouse was already down and mouse moved', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.mouseMoved = true;
        service['lineThickness'] = undefined;

        service.onMouseUp(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should call drawDot if mouse was already down and mouse moved', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.mouseMoved = false;
        service['lineThickness'] = undefined;

        service.onMouseUp(mouseEvent);
        expect(drawDotSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawLine if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawDot if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEvent);
        expect(drawDotSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLine if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseLeave should not call drawLine if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseLeave(mouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseLeave should call drawLine if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseLeave(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('executeCommand draws a line for each point in path', () => {
        const command = new PencilCommand(service, '0,0,0,1', 2, [
            [
                { x: 0, y: 0 },
                { x: 2, y: 2 },
            ],
        ]);
        spyOn(TestBed.inject(DrawingService).baseCtx, 'lineTo');
        service.executeCommand(command);
        expect(TestBed.inject(DrawingService).baseCtx.lineTo).toHaveBeenCalledTimes(2);
    });

    it('executeCommand draws a dot if a dot was previously drawn', () => {
        const command = new PencilCommand(service, '0,0,0,1', 2, [[{ x: 0, y: 0 }]]);
        spyOn(TestBed.inject(DrawingService).baseCtx, 'arc');
        service.executeCommand(command);
        expect(TestBed.inject(DrawingService).baseCtx.arc).toHaveBeenCalledTimes(1);
    });

    it('onMouseUp  uses defined thickness if defined', () => {
        const definedValue = 10;
        service.lineThickness = definedValue;
        service.mouseDown = true;
        spyOn(TestBed.inject(DrawingService).baseCtx, 'lineTo');
        service.onMouseUp(mouseEvent);
        expect(TestBed.inject(DrawingService).baseCtx.lineWidth).toBe(definedValue);
    });
    it('onMouseMove  uses default thickness if undefined', () => {
        const definedValue = 1;
        service.lineThickness = undefined;
        service.mouseDown = true;
        spyOn(TestBed.inject(DrawingService).baseCtx, 'lineTo');
        service.onMouseMove(mouseEvent);
        expect(TestBed.inject(DrawingService).baseCtx.lineWidth).toBe(definedValue);
    });

    it('onMouseleave uses default thickness if undefined', () => {
        const definedValue = 1;
        service.lineThickness = undefined;
        service.mouseDown = true;
        spyOn(TestBed.inject(DrawingService).baseCtx, 'lineTo');
        service.onMouseLeave(mouseEvent);
        expect(TestBed.inject(DrawingService).baseCtx.lineWidth).toBe(definedValue);
    });
});
