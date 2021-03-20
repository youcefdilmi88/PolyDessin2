import { Metadata } from '@app/classes/metadata';
import { DrawingData } from '@common/communication/drawing-data';
import * as fs from 'fs';
import { injectable } from 'inversify';

const FILE_NAME_REGEX = /^[a-zA-Z0-9-_]*$/;
const TAG_NAME_REGEX = /^[a-zA-Z0-9 ]*$/;
@injectable()
export class ImageDataService {
    drawingData: DrawingData[] = new Array();
    firstTimeFlag: boolean = true;

    updateDrawing(drawingData: DrawingData): boolean {
        const index = this.drawingData.findIndex((item: DrawingData) => item.id === drawingData.id);
        if (index >= 0 && drawingData.dataURL) {
            const data = drawingData.dataURL.split(',')[1];
            const buf = Buffer.from(data, 'base64');
            try {
                fs.writeFileSync(`./app/drawings/${drawingData.id}.png`, buf, { flag: 'w' });
            } catch (err) {
                console.error("Une erreur est survenue lors de l'écriture sur le disque");
                console.error(err);
                return false;
            }
            console.log("L'image a bien été écrite sur le disque !");
            this.drawingData[index].title = drawingData.title;
            this.drawingData[index].tags = drawingData.tags;
            this.drawingData[index].width = drawingData.width;
            this.drawingData[index].height = drawingData.height;
            this.drawingData[index].dataURL = drawingData.dataURL;
            return true;
        } else {
            console.error("Aucun dessin trouvé, l'image n'a pas été écrite sur le disque !");
            return false;
        }
    }
    writeDrawingToDisk(drawingData: DrawingData): boolean {
        if (drawingData.dataURL) {
            const data = drawingData.dataURL.split(',')[1];
            const buf = Buffer.from(data, 'base64');
            try {
                fs.writeFileSync(`./app/drawings/${drawingData.id}.png`, buf, { flag: 'w' });
            } catch (err) {
                console.error("Une erreur est survenue lors de l'écriture sur le disque !");
                console.error(err);
                return false;
            }
            this.drawingData.push(drawingData);
            console.log("L'image a bien été écrite sur le disque !");
            return true;
        } else {
            console.error('Le dataURL est indéfinie');
            return false;
        }
    }

    populateArray(result: Metadata[]): void {
        result.forEach((element) => {
            const path = `./app/drawings/${element._id?.toString()}.png`;
            if (fs.existsSync(path)) {
                const drawingData = new DrawingData(element._id?.toString(), element.title, element.tags, undefined, element.width, element.height);
                this.drawingData.push(drawingData);
            }
        });
    }

    getImagesFromDisk(databaseResult: Metadata[]): DrawingData[] {
        const drawingsToSend: DrawingData[] = [];
        databaseResult.forEach((element) => {
            const path = `./app/drawings/${element._id?.toString()}.png`;
            if (fs.existsSync(path)) {
                const mime = 'image/png';
                const encoding = 'base64';
                let data = '';
                try {
                    data = fs.readFileSync(path).toString(encoding);
                } catch (err) {
                    console.error('Une erreur est survenue lors de la lecture du disque !');
                    console.error(err);
                }
                console.log("L'image a bien été lue du disque !");
                const uri = `data:${mime};${encoding},${data}`;
                drawingsToSend.push(new DrawingData(element._id?.toString(), element.title, element.tags, uri, element.width, element.height));
            }
        });
        return drawingsToSend;
    }

    getOneImageFromDisk(index: number): DrawingData | undefined {
        const size = this.drawingData.length;
        if (size > 0) {
            const drawing = this.drawingData[(index + size) % size];
            const mime = 'image/png';
            const encoding = 'base64';
            let data = '';
            const path = `./app/drawings/${drawing.id}.png`;
            if (fs.existsSync(path)) {
                try {
                    data = fs.readFileSync(path).toString(encoding);
                } catch (err) {
                    console.error('Une erreur est survenue lors de la lecture du disque !');
                    console.error(err);
                }
                console.log("L'image a bien été lue du disque !");
                const uri = `data:${mime};${encoding},${data}`;
                return new DrawingData(drawing.id, drawing.title, drawing.tags, uri, drawing.width, drawing.height);
            } else return undefined;
        } else {
            return undefined;
        }
    }
    removeID(id: string): void {
        try {
            fs.unlinkSync(`./app/drawings/${id}.png`);
        } catch (err) {
            console.error('Une erreur est survenue lors de la suppression sur le disque !');
            console.error(err);
        }
        console.log("L'image a bien été supprimée du disque !");
        this.drawingData = this.drawingData.filter((drawingData) => !(drawingData.id === id));
    }

    insertNameCheckUp(drawingImage: DrawingData): boolean {
        return FILE_NAME_REGEX.test(drawingImage.title);
    }

    insertTagsCheckUp(drawingImage: DrawingData): boolean {
        let valideInput = true;
        drawingImage.tags.forEach((tag) => {
            if (!TAG_NAME_REGEX.test(tag)) valideInput = false;
        });
        return valideInput;
    }
}
