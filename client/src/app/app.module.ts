import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ColourHistoryComponent } from '@app/components/colour-components/colour-history/colour-history.component';
import { ColourPaletteSelectorComponent } from '@app/components/colour-components/colour-palette-selector/colour-palette-selector.component';
import { ColourSelectorComponent } from '@app/components/colour-components/colour-selector/colour-selector.component';
import { CurrentColourComponent } from '@app/components/colour-components/current-color/current-colour.component';
import { HueSelectorComponent } from '@app/components/colour-components/hue-selector/hue-selector.component';
import { ToolAttributeComponent } from '@app/components/toolbar-components/tool-attribute/tool-attribute.component';
import { ToolbarComponent } from '@app/components/toolbar-components/toolbar/toolbar.component';
import { AppMaterialModule } from './app-material/app-material.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { CarouselComponent } from './components/carousel-components/carousel/carousel.component';
import { DrawingCardComponent } from './components/carousel-components/drawing-card/drawing-card.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { ExportDrawingComponent } from './components/export-drawing/export-drawing.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { SaveDrawingComponent } from './components/save-drawing/save-drawing.component';
import { SearchByTagsComponent } from './components/search-by-tags/search-by-tags.component';
import { ServerErrorMessageComponent } from './components/server-error-message/server-error-message.component';

@NgModule({
    declarations: [
        AppComponent,
        EditorComponent,
        DrawingComponent,
        MainPageComponent,
        ToolAttributeComponent,
        ColourHistoryComponent,
        ColourSelectorComponent,
        ToolbarComponent,
        CurrentColourComponent,
        HueSelectorComponent,
        ColourPaletteSelectorComponent,
        ExportDrawingComponent,
        SaveDrawingComponent,
        ServerErrorMessageComponent,
        SearchByTagsComponent,
        CarouselComponent,
        DrawingCardComponent,
    ],
    imports: [
        BrowserModule,
        MatProgressBarModule,
        MatChipsModule,
        HttpClientModule,
        MatExpansionModule,
        AppRoutingModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
        AppMaterialModule,
        MatTooltipModule,
        FormsModule,
        MatCardModule,
        HttpClientModule,
        MatDialogModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatSelectModule,
        ReactiveFormsModule,
    ],
    providers: [
        {
            provide: MatDialogRef,
            useValue: {},
        },
        ExportDrawingComponent,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
