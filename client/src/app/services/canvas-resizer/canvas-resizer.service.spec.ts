import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { MouseHandlerService } from '@app/services/mouse-handler/mouse-handler.service';
import { Status } from '@app/utils/enums/canvas-resizer-status';
import { MockMouseService } from '@app/utils/tests-mocks/mock-mouse-service';
import { CanvasResizerService } from './canvas-resizer.service';

// tslint:disable:no-any
describe('CanvasResizerService', () => {
    let mouseMock: MockMouseService;
    let service: CanvasResizerService;
    let mouseEvent: MouseEvent;

    beforeAll(() => {
        // tslint:disable:typedef
        // @ts-ignore
        matchMedia(window);
        window.resizeTo = function resizeTo(width, height) {
            // tslint:disable:no-invalid-this
            Object.assign(this, {
                innerWidth: width,
                innerHeight: height,
            }).dispatchEvent(new this.Event('resize'));
        };
    });

    beforeEach(() => {
        mouseMock = new MockMouseService();
        TestBed.configureTestingModule({
            providers: [{ provide: MouseHandlerService, useValue: mouseMock }],
        });
        service = TestBed.inject(CanvasResizerService);
        spyOn<any>(mouseMock, 'calculateDeltaX').and.callThrough();
        spyOn<any>(mouseMock, 'calculateDeltaY').and.callThrough();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it("should call MouseHandlerService's #onMouseDown on mousedown", () => {
        mouseEvent = {} as MouseEvent;
        spyOn<any>(mouseMock, 'onMouseDown').and.callThrough();
        service.onMouseDown(mouseEvent);
        expect(mouseMock.onMouseDown).toHaveBeenCalled();
    });

    it("should call MouseHandlerService's #onMousemove on mousemove", () => {
        service.status = Status.BOTTOM_RIGHT_RESIZE;
        mouseEvent = {} as MouseEvent;
        spyOn<any>(mouseMock, 'onMouseMove').and.callThrough();
        spyOn(service, 'resizePreviewCanvas');
        service.onMouseMove(mouseEvent);
        expect(mouseMock.onMouseMove).toHaveBeenCalled();
        expect(service.resizePreviewCanvas).toHaveBeenCalled();
    });

    it('should not resize preview canvas when status is not resizing', () => {
        service.status = Status.OFF;
        mouseEvent = {} as MouseEvent;
        spyOn<any>(mouseMock, 'onMouseMove').and.callThrough();
        spyOn(service, 'resizePreviewCanvas');
        service.onMouseMove(mouseEvent);
        expect(mouseMock.onMouseMove).toHaveBeenCalled();
        expect(service.resizePreviewCanvas).not.toHaveBeenCalled();
    });

    it("should call MouseHandlerService's #onMouseLeave on mouseup", () => {
        mouseEvent = {} as MouseEvent;
        spyOn<any>(mouseMock, 'onMouseUp').and.callThrough();
        service.onMouseUp(mouseEvent);
        expect(mouseMock.onMouseUp).toHaveBeenCalled();
    });

    it('should  change status when #onMiddleRightResizerClicked is called', () => {
        service.onMiddleRightResizerClick();
        expect(service.status).toBe(Status.MIDDLE_RIGHT_RESIZE);
    });

    it('should  change status when #onMiddleBottomResizerClick is called', () => {
        service.onMiddleBottomResizerClick();
        expect(service.status).toBe(Status.MIDDLE_BOTTOM_RESIZE);
    });

    it('should  change status when #onBottomRightResizerClick is called', () => {
        service.onBottomRightResizerClick();
        expect(service.status).toBe(Status.BOTTOM_RIGHT_RESIZE);
    });

    it('should be able to calculate new canvas size on middle right resizer click', () => {
        service.setStatus(Status.MIDDLE_RIGHT_RESIZE);

        const canvasSize = { x: 150, y: 300 } as Vec2;
        const expectedCanvasSize = { x: 550, y: 300 } as Vec2;

        const calculatedCanvasSize = service.calculateNewCanvasSize(canvasSize);
        expect(calculatedCanvasSize).toEqual(expectedCanvasSize);
    });

    it('should be able to calculate new canvas size on middle bottom resizer click', () => {
        service.setStatus(Status.MIDDLE_BOTTOM_RESIZE);

        const canvasSize = { x: 500, y: 300 } as Vec2;
        const expectedCanvasSize = { x: 500, y: 600 } as Vec2;

        const calculatedCanvasSize = service.calculateNewCanvasSize(canvasSize);
        expect(calculatedCanvasSize).toEqual(expectedCanvasSize);
    });

    it('should be able to calculate new canvas size on bottom resizer click', () => {
        service.setStatus(Status.BOTTOM_RIGHT_RESIZE);

        const canvasSize = { x: 500, y: 300 } as Vec2;
        const expectedCanvasSize = { x: 900, y: 600 } as Vec2;

        const calculatedCanvasSize = service.calculateNewCanvasSize(canvasSize);
        expect(calculatedCanvasSize).toEqual(expectedCanvasSize);
    });

    it('new canvas size should be 250 pixels when canvas width is lower than 250 pixels', () => {
        service.setStatus(Status.BOTTOM_RIGHT_RESIZE);

        const canvasSize = { x: -350, y: -300 } as Vec2;
        const expectedCanvasSize = { x: 250, y: 250 } as Vec2;

        const calculatedCanvasSize = service.calculateNewCanvasSize(canvasSize);
        expect(calculatedCanvasSize).toEqual(expectedCanvasSize);
    });

    it('new canvas size should be 250 pixels when canvas height is lower than 250 pixels', () => {
        service.setStatus(Status.BOTTOM_RIGHT_RESIZE);

        const canvasSize = { x: 350, y: -300 } as Vec2;
        const expectedCanvasSize = { x: 750, y: 250 } as Vec2;

        const calculatedCanvasSize = service.calculateNewCanvasSize(canvasSize);
        expect(calculatedCanvasSize).toEqual(expectedCanvasSize);
    });

    it('should be able to calculate previewCanvas width on middle right resize', () => {
        service.setStatus(Status.MIDDLE_RIGHT_RESIZE);
        service.resizePreviewCanvas();
        const expectedWidth = 250;
        expect(service.canvasPreviewWidth).toEqual(expectedWidth);
    });

    it('should be able to calculate previewCanvas height on middle bottom resize', () => {
        service.setStatus(Status.MIDDLE_BOTTOM_RESIZE);
        service.resizePreviewCanvas();
        const expectedHeight = 450;
        expect(service.canvasPreviewHeight).toEqual(expectedHeight);
    });

    it('#updatePreviewCanvasSize should update previewCanvas size', () => {
        const mockCanvasSize = { x: 350, y: 300 } as Vec2;

        service.updatePreviewCanvasSize(mockCanvasSize);

        expect(service.canvasPreviewWidth).toEqual(mockCanvasSize.x);
        expect(service.canvasPreviewHeight).toEqual(mockCanvasSize.y);
    });

    it('should be able to calculate previewCanvas width and height on bottom right resize', () => {
        service.setStatus(Status.BOTTOM_RIGHT_RESIZE);
        service.resizePreviewCanvas();
        const expectedWidth = 250;
        const expectedHeight = 450;
        expect(service.canvasPreviewWidth).toEqual(expectedWidth);
        expect(service.canvasPreviewHeight).toEqual(expectedHeight);
    });

    it('should be able to calculate canvas size', () => {
        const windowWidth = 1215;
        const windowHeight = 800;
        const expectedCanvasSize = { x: 428, y: 400 };

        // we resize the window to always have the size during the test
        window.resizeTo(windowWidth, windowHeight);

        const calculatedCanvasSize = service.calculateCanvasSize();
        expect(calculatedCanvasSize.x).toBe(expectedCanvasSize.x);
        expect(calculatedCanvasSize.y).toBe(expectedCanvasSize.y);
    });

    it('canvasSize should be 250x250 pixels when working zone size is lower than 500x500 pixels ', () => {
        const windowWidth = 500;
        const windowHeight = 400;
        const expectedCanvasSize = { x: 250, y: 250 };

        // we resize the window to always have the size during the test
        window.resizeTo(windowWidth, windowHeight);

        const calculatedCanvasSize = service.calculateCanvasSize();
        expect(calculatedCanvasSize.x).toEqual(expectedCanvasSize.x);
        expect(calculatedCanvasSize.y).toEqual(expectedCanvasSize.y);
    });
});
