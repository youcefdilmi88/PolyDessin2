import { Observable, of } from 'rxjs';
import { DrawingDataMock } from './drawing-data-mock';

export class HttpServiceMock {
    constructor() {}

    // private readonly BASE_URL: string = 'http://localhost:3000';

    // For later !
    // getDrawingsByTags(): Observable<Metadata[]> {
    //     return this.http.get<Metadata[]>(this.BASE_URL + '/api/drawings');
    // }

    deleteDrawing(drawingID: string): Observable<string> {
        return of();
    }

    insertDrawing(newDrawing: DrawingDataMock): Observable<string> {
        return of();
    }

    getOneDrawing(index: number): Observable<DrawingDataMock> {
        return of();
    }

    getLengthOfDrawings(): Observable<number> {
        return of();
    }

    // getDrawingsByTags(tags: string[]): Observable<DrawingDataMock[]> {}

    // private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {}

    // openErrorDialog(message: string): void {}
}
