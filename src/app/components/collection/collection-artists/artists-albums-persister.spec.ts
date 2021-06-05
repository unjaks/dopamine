import { IMock, Mock } from 'typemoq';
import { Logger } from '../../../core/logger';
import { AlbumData } from '../../../data/album-data';
import { AlbumModel } from '../../../services/album/album-model';
import { BaseTranslatorService } from '../../../services/translator/base-translator.service';
import { AlbumOrder } from '../album-order';
import { ArtistsAlbumsPersister } from './artists-albums-persister';

describe('ArtistsAlbumsPersister', () => {
    let settingsStub: any;
    let loggerMock: IMock<Logger>;
    let translatorServiceMock: IMock<BaseTranslatorService>;

    let persister: ArtistsAlbumsPersister;

    let albumData1: AlbumData;
    let albumData2: AlbumData;
    let albumData3: AlbumData;
    let album1: AlbumModel;
    let album2: AlbumModel;
    let album3: AlbumModel;
    let availableAlbums: AlbumModel[];

    beforeEach(() => {
        settingsStub = { artistsTabSelectedAlbum: '', genresTabSelectedAlbumOrder: '' };
        loggerMock = Mock.ofType<Logger>();
        translatorServiceMock = Mock.ofType<BaseTranslatorService>();

        albumData1 = new AlbumData();
        albumData1.albumKey = 'albumKey1';
        albumData2 = new AlbumData();
        albumData2.albumKey = 'albumKey2';
        albumData3 = new AlbumData();
        albumData3.albumKey = 'albumKey3';
        album1 = new AlbumModel(albumData1, translatorServiceMock.object);
        album2 = new AlbumModel(albumData2, translatorServiceMock.object);
        album3 = new AlbumModel(albumData3, translatorServiceMock.object);
        availableAlbums = [album1, album2, album3];

        persister = new ArtistsAlbumsPersister(settingsStub, loggerMock.object);
    });

    describe('constructor', () => {
        it('should create', () => {
            // Arrange

            // Act

            // Assert
            expect(persister).toBeDefined();
        });

        it('should initialize from the settings', () => {
            // Arrange
            settingsStub.artistsTabSelectedAlbum = 'albumKey1';
            settingsStub.artistsTabSelectedAlbumOrder = 'byYearDescending';
            persister = new ArtistsAlbumsPersister(settingsStub, loggerMock.object);

            // Act

            // Assert
            expect(persister.getSelectedAlbums(availableAlbums).length).toEqual(1);
            expect(persister.getSelectedAlbums(availableAlbums)[0]).toBe(album1);
            expect(persister.getSelectedAlbumOrder()).toEqual(AlbumOrder.byYearDescending);
        });
    });

    describe('getSelectedAlbumFromSettings', () => {
        it('should get the selected album from the settings', () => {
            // Arrange
            settingsStub.artistsTabSelectedAlbum = 'someAlbumKey';
            persister = new ArtistsAlbumsPersister(settingsStub, loggerMock.object);

            // Act
            const selectedAlbumFromSettings: string = persister.getSelectedAlbumFromSettings();

            // Assert
            expect(selectedAlbumFromSettings).toEqual('someAlbumKey');
        });
    });

    describe('saveSelectedAlbumToSettings', () => {
        it('should save the selected album to the settings', () => {
            // Arrange
            settingsStub.artistsTabSelectedAlbum = '';
            persister = new ArtistsAlbumsPersister(settingsStub, loggerMock.object);

            // Act
            persister.saveSelectedAlbumToSettings('someAlbumKey');

            // Assert
            expect(settingsStub.artistsTabSelectedAlbum).toEqual('someAlbumKey');
        });
    });

    describe('getSelectedAlbumOrderFromSettings', () => {
        it('should get the selected album order from the settings', () => {
            // Arrange
            settingsStub.artistsTabSelectedAlbumOrder = 'byYearDescending';
            persister = new ArtistsAlbumsPersister(settingsStub, loggerMock.object);

            // Act
            const selectedAlbumOrderFromSettings: string = persister.getSelectedAlbumOrderFromSettings();

            // Assert
            expect(selectedAlbumOrderFromSettings).toEqual('byYearDescending');
        });
    });

    describe('saveSelectedAlbumOrderToSettings', () => {
        it('should save the selected album to the settings', () => {
            // Arrange
            settingsStub.artistsTabSelectedAlbumOrder = '';
            persister = new ArtistsAlbumsPersister(settingsStub, loggerMock.object);

            // Act
            persister.saveSelectedAlbumOrderToSettings('byYearDescending');

            // Assert
            expect(settingsStub.artistsTabSelectedAlbumOrder).toEqual('byYearDescending');
        });
    });

    describe('getSelectedAlbums', () => {
        it('should return an empty collection given that availableAlbums is undefined', () => {
            // Arrange

            // Act
            const selectedAlbums: AlbumModel[] = persister.getSelectedAlbums(undefined);

            // Assert
            expect(selectedAlbums.length).toEqual(0);
        });

        it('should return an empty collection given that availableAlbums is empty', () => {
            // Arrange

            // Act
            const selectedAlbums: AlbumModel[] = persister.getSelectedAlbums([]);

            // Assert
            expect(selectedAlbums.length).toEqual(0);
        });

        it('should return the selected album given valid availableAlbums', () => {
            // Arrange
            persister.setSelectedAlbums([album1, album2]);

            // Act
            const selectedAlbums: AlbumModel[] = persister.getSelectedAlbums(availableAlbums);

            // Assert
            expect(selectedAlbums.length).toEqual(2);
            expect(selectedAlbums[0]).toBe(album1);
            expect(selectedAlbums[1]).toBe(album2);
        });
    });

    describe('setSelectedAlbums', () => {
        it('should empty the selected albums if selectedAlbums is undefined', () => {
            // Arrange

            // Act
            persister.setSelectedAlbums(undefined);

            // Assert
            expect(persister.getSelectedAlbums(availableAlbums)).toEqual([]);
        });

        it('should empty the selected albums if selectedAlbums is empty', () => {
            // Arrange

            // Act
            persister.setSelectedAlbums([]);

            // Assert
            expect(persister.getSelectedAlbums(availableAlbums)).toEqual([]);
        });

        it('should set the selected albums if selectedAlbums is valid', () => {
            // Arrange

            // Act
            persister.setSelectedAlbums([album2, album3]);

            // Assert
            expect(persister.getSelectedAlbums(availableAlbums)).toEqual([album2, album3]);
        });

        it('should save an empty selected album to the settings if selectedAlbums is undefined', () => {
            // Arrange
            settingsStub.artistsTabSelectedAlbum = 'someAlbum';

            // Act
            persister.setSelectedAlbums(undefined);

            // Assert
            expect(settingsStub.artistsTabSelectedAlbum).toEqual('');
        });

        it('should save an empty selected album to the settings if selectedAlbums is empty', () => {
            // Arrange
            settingsStub.artistsTabSelectedAlbum = 'someAlbum';

            // Act
            persister.setSelectedAlbums([]);

            // Assert
            expect(settingsStub.artistsTabSelectedAlbum).toEqual('');
        });

        it('should save the first selected album to the settings if selectedAlbums is valid', () => {
            // Arrange
            settingsStub.artistsTabSelectedAlbum = 'someAlbum';

            // Act
            persister.setSelectedAlbums([album2, album3]);

            // Assert
            expect(settingsStub.artistsTabSelectedAlbum).toEqual('albumKey2');
        });
    });

    describe('getSelectedAlbumOrder', () => {
        it('should return byAlbumTitleAscending if there is no selected album order', () => {
            // Arrange

            // Act
            const selectedAlbumorder: AlbumOrder = persister.getSelectedAlbumOrder();

            // Assert
            expect(selectedAlbumorder).toEqual(AlbumOrder.byAlbumTitleAscending);
        });

        it('should return the selected album order if there is a selected album order', () => {
            // Arrange
            settingsStub.artistsTabSelectedAlbumOrder = 'byYearDescending';
            persister = new ArtistsAlbumsPersister(settingsStub, loggerMock.object);

            // Act
            const selectedAlbumorder: AlbumOrder = persister.getSelectedAlbumOrder();

            // Assert
            expect(selectedAlbumorder).toEqual(AlbumOrder.byYearDescending);
        });
    });

    describe('setSelectedAlbumOrder', () => {
        it('should set the selected album order', () => {
            // Arrange

            // Act
            persister.setSelectedAlbumOrder(AlbumOrder.byYearDescending);

            // Assert
            expect(persister.getSelectedAlbumOrder()).toEqual(AlbumOrder.byYearDescending);
        });

        it('should save the selected album order to the settings', () => {
            // Arrange

            // Act
            persister.setSelectedAlbumOrder(AlbumOrder.byYearDescending);

            // Assert
            expect(settingsStub.artistsTabSelectedAlbumOrder).toEqual('byYearDescending');
        });
    });
});
