import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SearchByTagsComponent } from '@app/components/search-by-tags/search-by-tags.component';
import { CarouselService } from '@app/services/carousel/carousel.service';
import { KeyboardButtons } from '@app/utils/enums/keyboard-button-pressed';
import { CarouselServiceMock } from '@app/utils/tests-mocks/carousel-service-mock';
import { MockDrawingCardComponent } from '@app/utils/tests-mocks/drawing-card-component-mock';
import { DrawingDataMock } from '@app/utils/tests-mocks/drawing-data-mock';
import { of } from 'rxjs';
import { CarouselComponent } from './carousel.component';

const dialogMock = {
    // tslint:disable-next-line:no-empty
    close: () => {},
};

describe('CarouselComponent', () => {
    let component: CarouselComponent;
    let fixture: ComponentFixture<CarouselComponent>;
    let carouselServiceMock: CarouselServiceMock;

    beforeEach(async () => {
        carouselServiceMock = new CarouselServiceMock();
        await TestBed.configureTestingModule({
            declarations: [CarouselComponent, SearchByTagsComponent, MockDrawingCardComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogMock },
                { provide: MAT_DIALOG_DATA, useValue: [] },
                { provide: CarouselService, useValue: carouselServiceMock },
            ],
            imports: [
                MatDialogModule,
                HttpClientTestingModule,
                BrowserAnimationsModule,
                MatOptionModule,
                MatSelectModule,
                MatProgressBarModule,
                MatInputModule,
                MatChipsModule,
                MatExpansionModule,
                MatToolbarModule,
                MatIconModule,
                MatCardModule,
                MatFormFieldModule,
                ReactiveFormsModule,
                MatToolbarModule,
                MatChipsModule,
                MatExpansionModule,
                MatSnackBarModule,
                MatCardModule,
                ReactiveFormsModule,
                MatIconModule,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CarouselComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('initCarousel should change value of isLoading if component has recieved the drawings', () => {
        carouselServiceMock.initMock(1);
        // tslint:disable:no-string-literal
        component['initCarousel']();
        expect(component.isLoading).toBe(false);
    });

    it('deleteDrawing sould remove one drawing from the list of drawing ', () => {
        // tslint:disable:no-magic-numbers
        carouselServiceMock.initMock(3);
        component.deleteDrawing('1');
        expect(component.drawingArray.length).toEqual(2);
    });

    it('onDialogClose should empty array of drawing and reset isLoading', () => {
        const spy = spyOn(component.dialogRef, 'close').and.callThrough();
        component['onDialogClose']();
        expect(spy).toHaveBeenCalled();
    });

    it('onKeyDown left key should shift left drawings', () => {
        const shiftLeftSpy = spyOn(component, 'shiftLeft').and.stub();
        fixture.detectChanges();
        component['onKeyDown']({ key: KeyboardButtons.Left } as KeyboardEvent);
        expect(shiftLeftSpy).toHaveBeenCalled();
    });

    it('onKeyDown right key should right left drawings', () => {
        const shiftRightSpy = spyOn(component, 'shiftRight').and.stub();
        fixture.detectChanges();
        component['onKeyDown']({ key: KeyboardButtons.Right } as KeyboardEvent);
        expect(shiftRightSpy).toHaveBeenCalled();
    });

    it('onKeyDown right key should right left drawings', () => {
        const shiftRightSpy = spyOn(component, 'shiftRight').and.stub();
        fixture.detectChanges();
        component['onKeyDown']({ key: KeyboardButtons.Aerosol } as KeyboardEvent);
        expect(shiftRightSpy).not.toHaveBeenCalled();
    });

    it('openDrawing should call openDrawing from carouselService if drawing is stil avaible', async(() => {
        const expectedValue = new DrawingDataMock('1');
        component.drawingArray.push(expectedValue);
        component.drawingArray.push(expectedValue);
        spyOn(carouselServiceMock, 'getDrawing').and.returnValue(of(expectedValue));
        const openDrawingStub = spyOn(carouselServiceMock, 'openDrawing').and.stub();
        component.openDrawing();
        fixture.detectChanges();
        expect(openDrawingStub).toHaveBeenCalled();
    }));

    it('openDrawing should call openDrawing from carouselService if drawing is stil avaible', async(() => {
        const expectedValue = new DrawingDataMock('1');
        component.drawingArray.push(expectedValue);
        component.drawingArray.push(expectedValue);
        spyOn(carouselServiceMock, 'getDrawing').and.returnValue(of((undefined as unknown) as DrawingDataMock));
        const openDrawingStub = spyOn(carouselServiceMock, 'openDrawing').and.stub();
        component.openDrawing();
        fixture.detectChanges();
        expect(openDrawingStub).not.toHaveBeenCalled();
    }));

    it('shift left should get the next drawing provided by the service', async(() => {
        const response: DrawingDataMock = new DrawingDataMock('1');
        spyOn(carouselServiceMock, 'getDrawing').and.returnValue(of(response));
        component.shiftLeft();
        fixture.detectChanges();
        expect(component.drawingArray).toEqual([response]);
    }));

    it('shift right should get the next drawing provided by the service', async(() => {
        const response: DrawingDataMock = new DrawingDataMock('1');
        spyOn(carouselServiceMock, 'getDrawing').and.returnValue(of(response));
        component.shiftRight();
        fixture.detectChanges();
        expect(component.drawingArray).toEqual([response]);
    }));

    it('toggleTagFlag should call initcarousel', () => {
        // tslint:disable-next-line:no-any
        spyOn<any>(component, 'initCarousel').and.stub();
        component.toggleTagFlag(true);
        expect(component['initCarousel']).toHaveBeenCalled();
    });

    it('cantOpenDrawing should open the snackbar', () => {
        spyOn(component.snackBar, 'open').and.stub();
        component['cantOpenDrawing']();
        expect(component.snackBar.open).toHaveBeenCalled();
    });
});
