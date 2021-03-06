import { ENTER } from '@angular/cdk/keycodes';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { HttpService } from '@app/services/http/http.service';
import { TAG_NAME_REGEX } from '@app/services/services-constants';
import { Tag } from '@app/utils/interfaces/tag';

@Component({
    selector: 'app-search-by-tags',
    templateUrl: './search-by-tags.component.html',
    styleUrls: ['./search-by-tags.component.scss'],
})
export class SearchByTagsComponent {
    tagName: FormControl;
    tags: Tag[];
    readonly separatorKeysCodes: number[] = [ENTER];
    @Output() tagFlag: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(private httpService: HttpService) {
        this.tagName = new FormControl('', [Validators.pattern(TAG_NAME_REGEX)]);
        this.tags = [];
    }

    addChip(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        if ((value || '').trim() && TAG_NAME_REGEX.test(value)) {
            this.tags.push({ name: value.trim() });
        }
        if (input) {
            input.value = '';
        }
    }

    remove(tagToRemove: Tag): void {
        const indexToRemove = this.tags.indexOf(tagToRemove);
        if (indexToRemove >= 0) this.tags.splice(indexToRemove, 1);
    }

    getErrorMessageTag(): string {
        return this.tagName.invalid ? 'Peut seulement être composé de chiffres, lettres et espaces' : '';
    }

    toStringArray(tags: Tag[]): string[] {
        const tempArray = new Array<string>();
        let i: number;
        for (i = 0; i < tags.length; i++) tempArray.push(tags[i].name);
        return tempArray;
    }

    sendTags(): void {
        let tags = this.toStringArray(this.tags);
        tags = this.tags != undefined ? tags : ['none'];
        this.httpService.sendTags(tags).subscribe(() => {
            this.tagFlag.emit(true);
        });
    }
}
