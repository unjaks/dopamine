import { CanShowHeader } from '../../common/can-show-header';
import { Strings } from '../../common/strings';
import { BaseTranslatorService } from '../translator/base-translator.service';

export class ArtistModel extends CanShowHeader {
    constructor(public name: string, private translatorService: BaseTranslatorService) {
        super();
    }

    public isSelected: boolean = false;

    public get displayName(): string {
        if (Strings.isNullOrWhiteSpace(this.name)) {
            return this.translatorService.get('Artist.UnknownArtist');
        }

        return this.name;
    }
}
