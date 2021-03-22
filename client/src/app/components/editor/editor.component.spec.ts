import { HttpClientModule } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Vec2 } from '@app/classes/vec2';
import { CarouselComponent } from '@app/components/carousel-components/carousel/carousel.component';
import { ColourHistoryComponent } from '@app/components/colour-components/colour-history/colour-history.component';
import { ColourPaletteSelectorComponent } from '@app/components/colour-components/colour-palette-selector/colour-palette-selector.component';
import { ColourSelectorComponent } from '@app/components/colour-components/colour-selector/colour-selector.component';
import { CurrentColourComponent } from '@app/components/colour-components/current-color/current-colour.component';
import { HueSelectorComponent } from '@app/components/colour-components/hue-selector/hue-selector.component';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { ExportDrawingComponent } from '@app/components/export-drawing/export-drawing.component';
import { PipettePreviewComponent } from '@app/components/pipette-preview/pipette-preview.component';
import { ToolAttributeComponent } from '@app/components/toolbar-components/tool-attribute/tool-attribute.component';
import { ToolbarComponent } from '@app/components/toolbar-components/toolbar/toolbar.component';
import { DialogControllerService } from '@app/services/dialog-controller/dialog-controller.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolManagerService } from '@app/services/tool-manager/tool-manager.service';
import { ToolManagerServiceMock } from '@app/tests-mocks/tool-manager-mock';
import { KeyboardButtons } from '@app/utils/enums/keyboard-button-pressed';
import { EditorComponent } from './editor.component';

class DrawingServiceMock {
    // tslint:disable:no-empty
    newDrawing: EventEmitter<Vec2> = new EventEmitter<Vec2>();
    createNewDrawingEmitter: EventEmitter<boolean> = new EventEmitter();

    saveCanvas(): void {}

    restoreCanvas(): void {}

    clearCanvas(): void {}

    isCanvasBlank(): boolean {
        return true;
    }

    createNewDrawing(): void {}

    openDrawing(): void {}
}

// tslint:disable-next-line:max-classes-per-file
class DialogServiceMock {
    noDialogOpened: boolean = true;
    openDialog(): void {}
}

describe('EditorComponent', () => {
    let component: EditorComponent;
    let fixture: ComponentFixture<EditorComponent>;
    let toolManagerServiceMock: ToolManagerServiceMock;
    let drawingServiceSpy: DrawingServiceMock;
    let dialogServiceMock: DialogServiceMock;

    beforeEach(async(() => {
        drawingServiceSpy = new DrawingServiceMock();
        toolManagerServiceMock = new ToolManagerServiceMock();
        dialogServiceMock = new DialogServiceMock();
        TestBed.configureTestingModule({
            declarations: [
                EditorComponent,
                DrawingComponent,
                ToolAttributeComponent,
                ToolbarComponent,
                ColourSelectorComponent,
                ColourPaletteSelectorComponent,
                ColourHistoryComponent,
                CurrentColourComponent,
                HueSelectorComponent,
                ExportDrawingComponent,
                PipettePreviewComponent,
            ],
            imports: [
                MatCheckboxModule,
                MatButtonToggleModule,
                MatInputModule,
                BrowserAnimationsModule,
                MatSliderModule,
                MatDividerModule,
                MatButtonModule,
                MatIconModule,
                FormsModule,
                MatTooltipModule,
                HttpClientModule,
                MatDialogModule,
            ],
            providers: [
                { provide: ToolManagerService, useValue: toolManagerServiceMock },
                { provide: DrawingService, useValue: drawingServiceSpy },
                // { provide: MatDialogRef, useValue: {} },
                { provide: CarouselComponent, useValue: {} },
                { provide: DialogControllerService, useValue: dialogServiceMock },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        // tslint:disable:no-any
        spyOn<any>(toolManagerServiceMock, 'emitToolChange').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#ngAfterViewInit should call #setEditorMinWidth', () => {
        spyOn(component, 'setEditorMinWidth').and.callThrough();
        component.ngAfterViewInit();
        expect(component.setEditorMinWidth).toHaveBeenCalled();
    });

    it('#saveEditorMinWidth should set this.editorMinWidth to correct value', () => {
        const EDITOR_MIN_WIDTH_FAKE_VALUE = 100;
        component.saveEditorMinWidth(EDITOR_MIN_WIDTH_FAKE_VALUE);
        expect(component.editorMinWidth).toEqual(EDITOR_MIN_WIDTH_FAKE_VALUE);
    });

    it("#setEditorMinWidth should set editor's css min-width to correct value ", () => {
        const EDITOR_MIN_WIDTH_FAKE_VALUE = 100;
        component.editorMinWidth = EDITOR_MIN_WIDTH_FAKE_VALUE;
        component.setEditorMinWidth();
        const editorMinWidthString = component.editor.nativeElement.style.minWidth;
        const editorMinWidth = parseInt(editorMinWidthString, 10);
        expect(editorMinWidth).toEqual(EDITOR_MIN_WIDTH_FAKE_VALUE);
    });

    it(' #onKeyDown should call set the right tool if input is valid', () => {
        const goodInput = { key: KeyboardButtons.Rectangle } as KeyboardEvent;
        component.onKeyDown(goodInput);
        expect(toolManagerServiceMock.emitToolChange).toHaveBeenCalled();
    });

    it(' onKeyDown should not call emitToolChange if shift is pressed or the key is inalid ', () => {
        component.onKeyDown({ shiftKey: true } as KeyboardEvent);
        expect(toolManagerServiceMock.emitToolChange).not.toHaveBeenCalled();

        const badInput = { key: KeyboardButtons.InvalidInput } as KeyboardEvent;
        component.onKeyDown(badInput);
        expect(toolManagerServiceMock.emitToolChange).not.toHaveBeenCalled();
    });

    it(' #onKeyDown should not call create new drawing if input is invalid ', () => {
        const goodInput = { key: KeyboardButtons.NewDrawing, ctrlKey: false } as KeyboardEvent;
        component.onKeyDown(goodInput);
        spyOn(drawingServiceSpy, 'createNewDrawing').and.stub();
        expect(drawingServiceSpy.createNewDrawing).not.toHaveBeenCalled();
    });

    it(' #onKeyDown should call create new drawing if input is valid ', () => {
        const goodInput = { key: KeyboardButtons.NewDrawing, ctrlKey: true } as KeyboardEvent;
        const creatNewDrawing = spyOn(component, 'onCreateNewDrawing').and.stub();
        component.onKeyDown(goodInput);
        expect(creatNewDrawing).toHaveBeenCalled();
    });

    it('should create new drawing when new drawing button is clicked', () => {
        const creatNewDrawing = spyOn(drawingServiceSpy, 'createNewDrawing').and.callThrough();
        component.onCreateNewDrawing();
        expect(creatNewDrawing).toHaveBeenCalled();
    });
});
