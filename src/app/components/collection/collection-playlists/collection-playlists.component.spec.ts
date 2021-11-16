import { Observable, Subject } from 'rxjs';
import { IMock, Mock, Times } from 'typemoq';
import { ContextMenuOpener } from '../../../common/context-menu-opener';
import { Logger } from '../../../common/logger';
import { MouseSelectionWatcher } from '../../../common/mouse-selection-watcher';
import { BaseScheduler } from '../../../common/scheduler/base-scheduler';
import { BaseAppearanceService } from '../../../services/appearance/base-appearance.service';
import { BaseDialogService } from '../../../services/dialog/base-dialog.service';
import { BasePlaylistService } from '../../../services/playlist/base-playlist.service';
import { PlaylistFolderModel } from '../../../services/playlist/playlist-folder-model';
import { BaseTranslatorService } from '../../../services/translator/base-translator.service';
import { CollectionPersister } from '../collection-persister';
import { CollectionTab } from '../collection-tab';
import { CollectionPlaylistsComponent } from './collection-playlists.component';

describe('CollectionPlaylistsComponent', () => {
    let playlistServiceMock: IMock<BasePlaylistService>;
    let appearanceServiceMock: IMock<BaseAppearanceService>;
    let contextMenuOpenerMock: IMock<ContextMenuOpener>;
    let dialogServiceMock: IMock<BaseDialogService>;
    let translatorServiceMock: IMock<BaseTranslatorService>;
    let collectionPersisterMock: IMock<CollectionPersister>;
    let settingsStub: any;
    let schedulerMock: IMock<BaseScheduler>;
    let loggerMock: IMock<Logger>;
    let playlistFoldersSelectionWatcherMock: IMock<MouseSelectionWatcher>;

    let selectedTabChangedMock: Subject<void>;
    let selectedTabChangedMock$: Observable<void>;

    const flushPromises = () => new Promise(setImmediate);

    function createComponent(): CollectionPlaylistsComponent {
        return new CollectionPlaylistsComponent(
            playlistServiceMock.object,
            appearanceServiceMock.object,
            contextMenuOpenerMock.object,
            dialogServiceMock.object,
            translatorServiceMock.object,
            collectionPersisterMock.object,
            settingsStub,
            schedulerMock.object,
            loggerMock.object,
            playlistFoldersSelectionWatcherMock.object
        );
    }

    function createPlaylistFolderModel(name: string, path: string): PlaylistFolderModel {
        const playlistFolderModel: PlaylistFolderModel = new PlaylistFolderModel(name, path);

        return playlistFolderModel;
    }

    beforeEach(() => {
        playlistServiceMock = Mock.ofType<BasePlaylistService>();
        appearanceServiceMock = Mock.ofType<BaseAppearanceService>();
        contextMenuOpenerMock = Mock.ofType<ContextMenuOpener>();
        dialogServiceMock = Mock.ofType<BaseDialogService>();
        translatorServiceMock = Mock.ofType<BaseTranslatorService>();
        collectionPersisterMock = Mock.ofType<CollectionPersister>();
        loggerMock = Mock.ofType<Logger>();
        schedulerMock = Mock.ofType<BaseScheduler>();
        playlistFoldersSelectionWatcherMock = Mock.ofType<MouseSelectionWatcher>();
        translatorServiceMock.setup((x) => x.get('create-playlist-folder')).returns(() => 'Create playlist folder');
        translatorServiceMock.setup((x) => x.get('playlist-folder-name')).returns(() => 'Playlist folder name');
        translatorServiceMock.setup((x) => x.getAsync('create-playlist-folder-error')).returns(async () => 'Create playlist folder error');
        translatorServiceMock.setup((x) => x.getAsync('delete-playlist-folder-error')).returns(async () => 'Delete playlist folder error');
        translatorServiceMock.setup((x) => x.getAsync('confirm-delete-playlist-folder')).returns(async () => 'Delete playlist folder?');
        translatorServiceMock
            .setup((x) =>
                x.getAsync('confirm-delete-playlist-folder-long', {
                    playlistFolderName: 'name1',
                })
            )
            .returns(async () => `Delete playlist folder 'name1'?`);

        settingsStub = { playlistsLeftPaneWidthPercent: 25, playlistsRightPaneWidthPercent: 25 };

        selectedTabChangedMock = new Subject();
        selectedTabChangedMock$ = selectedTabChangedMock.asObservable();
        collectionPersisterMock.setup((x) => x.selectedTabChanged$).returns(() => selectedTabChangedMock$);
    });

    describe('constructor', () => {
        it('should create', () => {
            // Arrange

            // Act
            const component: CollectionPlaylistsComponent = createComponent();

            // Assert
            expect(component).toBeDefined();
        });

        it('should define playlistService', async () => {
            // Arrange

            // Act
            const component: CollectionPlaylistsComponent = createComponent();

            // Assert
            expect(component.playlistService).toBeDefined();
        });

        it('should define appearanceService', async () => {
            // Arrange

            // Act
            const component: CollectionPlaylistsComponent = createComponent();

            // Assert
            expect(component.appearanceService).toBeDefined();
        });

        it('should set left pane size from settings', async () => {
            // Arrange

            // Act
            const component: CollectionPlaylistsComponent = createComponent();

            // Assert
            expect(component.leftPaneSize).toEqual(25);
        });

        it('should set center pane size from settings', async () => {
            // Arrange

            // Act
            const component: CollectionPlaylistsComponent = createComponent();

            // Assert
            expect(component.centerPaneSize).toEqual(50);
        });

        it('should set right pane size from settings', async () => {
            // Arrange

            // Act
            const component: CollectionPlaylistsComponent = createComponent();

            // Assert
            expect(component.rightPaneSize).toEqual(25);
        });

        it('should initialize playlistFolders as empty', async () => {
            // Arrange

            // Act
            const component: CollectionPlaylistsComponent = createComponent();

            // Assert
            expect(component.playlistFolders.length).toEqual(0);
        });
    });

    describe('splitDragEnd', () => {
        it('should save the left pane width to the settings', async () => {
            // Arrange
            const component: CollectionPlaylistsComponent = createComponent();

            // Act
            component.splitDragEnd({ sizes: [30, 55, 15] });

            // Assert
            expect(settingsStub.playlistsLeftPaneWidthPercent).toEqual(30);
        });

        it('should save the right pane width to the settings', async () => {
            // Arrange
            const component: CollectionPlaylistsComponent = createComponent();

            // Act
            component.splitDragEnd({ sizes: [30, 55, 15] });

            // Assert
            expect(settingsStub.playlistsRightPaneWidthPercent).toEqual(15);
        });
    });

    describe('createPlaylistFolderAsync', () => {
        it('should open an input dialog', async () => {
            // Arrange
            const component: CollectionPlaylistsComponent = createComponent();

            // Act
            await component.createPlaylistFolderAsync();

            // Assert
            dialogServiceMock.verify((x) => x.showInputDialogAsync('Create playlist folder', 'Playlist folder name', ''), Times.once());
        });

        it('should not create the playlists folder if playlistFolderName is undefined', async () => {
            // Arrange
            dialogServiceMock
                .setup((x) => x.showInputDialogAsync('Create playlist folder', 'Playlist folder name', ''))
                .returns(async () => undefined);

            const component: CollectionPlaylistsComponent = createComponent();

            // Act
            await component.createPlaylistFolderAsync();

            // Assert
            playlistServiceMock.verify((x) => x.createPlaylistFolder(undefined), Times.never());
        });

        it('should not create the playlists folder if playlistFolderName is empty', async () => {
            // Arrange
            dialogServiceMock
                .setup((x) => x.showInputDialogAsync('Create playlist folder', 'Playlist folder name', ''))
                .returns(async () => undefined);

            const component: CollectionPlaylistsComponent = createComponent();

            // Act
            await component.createPlaylistFolderAsync();

            // Assert
            playlistServiceMock.verify((x) => x.createPlaylistFolder(''), Times.never());
        });

        it('should not create the playlists folder if playlistFolderName is space', async () => {
            // Arrange
            dialogServiceMock
                .setup((x) => x.showInputDialogAsync('Create playlist folder', 'Playlist folder name', ''))
                .returns(async () => undefined);

            const component: CollectionPlaylistsComponent = createComponent();

            // Act
            await component.createPlaylistFolderAsync();

            // Assert
            playlistServiceMock.verify((x) => x.createPlaylistFolder(' '), Times.never());
        });

        it('should create the playlists folder if playlistFolderName is not undefined, empty or space.', async () => {
            // Arrange
            dialogServiceMock
                .setup((x) => x.showInputDialogAsync('Create playlist folder', 'Playlist folder name', ''))
                .returns(async () => 'My playlist folder');

            const component: CollectionPlaylistsComponent = createComponent();

            // Act
            await component.createPlaylistFolderAsync();

            // Assert
            playlistServiceMock.verify((x) => x.createPlaylistFolder('My playlist folder'), Times.once());
        });

        it('should show an error dialog if creation of the playlist folder fails', async () => {
            // Arrange
            dialogServiceMock
                .setup((x) => x.showInputDialogAsync('Create playlist folder', 'Playlist folder name', ''))
                .returns(async () => 'My playlist folder');

            playlistServiceMock.setup((x) => x.createPlaylistFolder('My playlist folder')).throws(new Error('An error occurred'));

            const component: CollectionPlaylistsComponent = createComponent();

            // Act
            await component.createPlaylistFolderAsync();

            // Assert
            dialogServiceMock.verify((x) => x.showErrorDialog('Create playlist folder error'), Times.once());
        });

        it('should get all playlist folders', async () => {
            // Arrange
            collectionPersisterMock.setup((x) => x.selectedTab).returns(() => CollectionTab.playlists);

            const playlistFolder1: PlaylistFolderModel = createPlaylistFolderModel('name1', 'path1');
            const playlistFolder2: PlaylistFolderModel = createPlaylistFolderModel('name2', 'path2');
            playlistServiceMock.setup((x) => x.getPlaylistFoldersAsync()).returns(async () => [playlistFolder1, playlistFolder2]);

            const component: CollectionPlaylistsComponent = createComponent();

            // Act
            await component.createPlaylistFolderAsync();

            // Assert
            playlistServiceMock.verify((x) => x.getPlaylistFoldersAsync(), Times.once());
            expect(component.playlistFolders.length).toEqual(2);
            expect(component.playlistFolders[0]).toEqual(playlistFolder1);
            expect(component.playlistFolders[1]).toEqual(playlistFolder2);
        });
    });

    describe('ngOnInit', () => {
        it('should get all playlist folders if the selected tab is playlists', async () => {
            // Arrange
            collectionPersisterMock.setup((x) => x.selectedTab).returns(() => CollectionTab.playlists);

            const playlistFolder1: PlaylistFolderModel = createPlaylistFolderModel('name1', 'path1');
            const playlistFolder2: PlaylistFolderModel = createPlaylistFolderModel('name2', 'path2');
            playlistServiceMock.setup((x) => x.getPlaylistFoldersAsync()).returns(async () => [playlistFolder1, playlistFolder2]);

            const component: CollectionPlaylistsComponent = createComponent();

            // Act
            await component.ngOnInit();

            // Assert
            playlistServiceMock.verify((x) => x.getPlaylistFoldersAsync(), Times.once());
            expect(component.playlistFolders.length).toEqual(2);
            expect(component.playlistFolders[0]).toEqual(playlistFolder1);
            expect(component.playlistFolders[1]).toEqual(playlistFolder2);
        });

        it('should not get all playlist folders if the selected tab is not playlists', async () => {
            // Arrange
            collectionPersisterMock.setup((x) => x.selectedTab).returns(() => CollectionTab.artists);

            const component: CollectionPlaylistsComponent = createComponent();

            // Act
            await component.ngOnInit();

            // Assert
            playlistServiceMock.verify((x) => x.getPlaylistFoldersAsync(), Times.never());
            expect(component.playlistFolders.length).toEqual(0);
        });

        it('should initialize playlistFoldersSelectionWatcher if the selected tab is playlists', async () => {
            // Arrange
            collectionPersisterMock.setup((x) => x.selectedTab).returns(() => CollectionTab.playlists);

            const playlistFolder1: PlaylistFolderModel = createPlaylistFolderModel('name1', 'path1');
            const playlistFolder2: PlaylistFolderModel = createPlaylistFolderModel('name2', 'path2');
            playlistServiceMock.setup((x) => x.getPlaylistFoldersAsync()).returns(async () => [playlistFolder1, playlistFolder2]);

            const component: CollectionPlaylistsComponent = createComponent();

            // Act
            await component.ngOnInit();

            // Assert
            playlistFoldersSelectionWatcherMock.verify((x) => x.initialize(component.playlistFolders, false), Times.once());
        });

        it('should not initialize playlistFoldersSelectionWatcher if the selected tab is not playlists', async () => {
            // Arrange
            collectionPersisterMock.setup((x) => x.selectedTab).returns(() => CollectionTab.artists);

            const component: CollectionPlaylistsComponent = createComponent();

            // Act
            await component.ngOnInit();

            // Assert
            playlistFoldersSelectionWatcherMock.verify((x) => x.initialize(component.playlistFolders, false), Times.never());
        });

        it('should fill the lists if the selected tab has changed to playlists', async () => {
            // Arrange
            collectionPersisterMock.setup((x) => x.selectedTab).returns(() => CollectionTab.albums);

            const playlistFolder1: PlaylistFolderModel = createPlaylistFolderModel('name1', 'path1');
            const playlistFolder2: PlaylistFolderModel = createPlaylistFolderModel('name2', 'path2');

            playlistServiceMock.setup((x) => x.getPlaylistFoldersAsync()).returns(async () => [playlistFolder1, playlistFolder2]);

            const component: CollectionPlaylistsComponent = createComponent();
            await component.ngOnInit();

            playlistServiceMock.reset();
            playlistServiceMock.setup((x) => x.getPlaylistFoldersAsync()).returns(async () => [playlistFolder1, playlistFolder2]);
            collectionPersisterMock.reset();
            collectionPersisterMock.setup((x) => x.selectedTab).returns(() => CollectionTab.playlists);

            // Act
            selectedTabChangedMock.next();
            await flushPromises();

            // Assert
            playlistServiceMock.verify((x) => x.getPlaylistFoldersAsync(), Times.once());
            expect(component.playlistFolders.length).toEqual(2);
            expect(component.playlistFolders[0].path).toEqual('path1');
            expect(component.playlistFolders[1].path).toEqual('path2');
        });

        it('should clear the lists if the selected tab has changed to not playlists', async () => {
            // Arrange
            collectionPersisterMock.setup((x) => x.selectedTab).returns(() => CollectionTab.playlists);

            const playlistFolder1: PlaylistFolderModel = createPlaylistFolderModel('name1', 'path1');
            const playlistFolder2: PlaylistFolderModel = createPlaylistFolderModel('name2', 'path2');

            playlistServiceMock.setup((x) => x.getPlaylistFoldersAsync()).returns(async () => [playlistFolder1, playlistFolder2]);

            const component: CollectionPlaylistsComponent = createComponent();
            await component.ngOnInit();

            playlistServiceMock.reset();
            playlistServiceMock.setup((x) => x.getPlaylistFoldersAsync()).returns(async () => [playlistFolder1, playlistFolder2]);
            collectionPersisterMock.reset();
            collectionPersisterMock.setup((x) => x.selectedTab).returns(() => CollectionTab.albums);

            // Act
            selectedTabChangedMock.next();
            await flushPromises();

            // Assert
            playlistServiceMock.verify((x) => x.getPlaylistFoldersAsync(), Times.never());
            expect(component.playlistFolders.length).toEqual(0);
        });

        it('should initialize playlistFoldersSelectionWatcher if the selected tab has changed to playlists', async () => {
            // Arrange
            collectionPersisterMock.setup((x) => x.selectedTab).returns(() => CollectionTab.albums);

            const playlistFolder1: PlaylistFolderModel = createPlaylistFolderModel('name1', 'path1');
            const playlistFolder2: PlaylistFolderModel = createPlaylistFolderModel('name2', 'path2');

            playlistServiceMock.setup((x) => x.getPlaylistFoldersAsync()).returns(async () => [playlistFolder1, playlistFolder2]);

            const component: CollectionPlaylistsComponent = createComponent();
            await component.ngOnInit();

            playlistServiceMock.reset();
            playlistServiceMock.setup((x) => x.getPlaylistFoldersAsync()).returns(async () => [playlistFolder1, playlistFolder2]);
            collectionPersisterMock.reset();
            collectionPersisterMock.setup((x) => x.selectedTab).returns(() => CollectionTab.playlists);

            // Act
            selectedTabChangedMock.next();
            await flushPromises();

            // Assert
            playlistFoldersSelectionWatcherMock.verify((x) => x.initialize(component.playlistFolders, false), Times.once());
        });

        it('should not initialize playlistFoldersSelectionWatcher if the selected tab has changed to not playlists', async () => {
            // Arrange
            collectionPersisterMock.setup((x) => x.selectedTab).returns(() => CollectionTab.playlists);

            const playlistFolder1: PlaylistFolderModel = createPlaylistFolderModel('name1', 'path1');
            const playlistFolder2: PlaylistFolderModel = createPlaylistFolderModel('name2', 'path2');

            playlistServiceMock.setup((x) => x.getPlaylistFoldersAsync()).returns(async () => [playlistFolder1, playlistFolder2]);

            const component: CollectionPlaylistsComponent = createComponent();
            await component.ngOnInit();

            playlistServiceMock.reset();
            playlistServiceMock.setup((x) => x.getPlaylistFoldersAsync()).returns(async () => [playlistFolder1, playlistFolder2]);
            collectionPersisterMock.reset();
            collectionPersisterMock.setup((x) => x.selectedTab).returns(() => CollectionTab.albums);

            // Act
            selectedTabChangedMock.next();
            await flushPromises();

            // Assert
            playlistFoldersSelectionWatcherMock.verify((x) => x.initialize(component.playlistFolders, false), Times.never());
        });
    });

    describe('ngOnDestroy', () => {
        it('should clear the playlist folders', () => {
            // Arrange
            const component: CollectionPlaylistsComponent = createComponent();
            const playlistFolder1: PlaylistFolderModel = createPlaylistFolderModel('name1', 'path1');

            component.playlistFolders = [playlistFolder1];

            // Act
            component.ngOnDestroy();

            // Assert
            expect(component.playlistFolders.length).toEqual(0);
        });
    });

    describe('setSelectedPlaylistFolders', () => {
        it('should set the selected playlist folders', () => {
            // Arrange
            const component: CollectionPlaylistsComponent = createComponent();
            const playlistFolder1: PlaylistFolderModel = createPlaylistFolderModel('name1', 'path1');
            const playlistFolder2: PlaylistFolderModel = createPlaylistFolderModel('name2', 'path2');
            component.playlistFolders = [playlistFolder1, playlistFolder2];
            const event: any = {};

            // Act
            component.setSelectedPlaylistFolders(event, playlistFolder1);

            // Assert
            playlistFoldersSelectionWatcherMock.verify((x) => x.setSelectedItems(event, playlistFolder1), Times.once());
        });
    });

    describe('onDeletePlaylistFolderAsync', () => {
        it('should show a confirmation dialog to the user', async () => {
            // Arrange
            const component: CollectionPlaylistsComponent = createComponent();
            const playlistFolder1: PlaylistFolderModel = createPlaylistFolderModel('name1', 'path1');
            const playlistFolder2: PlaylistFolderModel = createPlaylistFolderModel('name2', 'path2');
            component.playlistFolders = [playlistFolder1, playlistFolder2];

            // Act
            await component.onDeletePlaylistFolderAsync(playlistFolder1);

            // Assert
            dialogServiceMock.verify(
                (x) => x.showConfirmationDialogAsync('Delete playlist folder?', `Delete playlist folder 'name1'?`),
                Times.once()
            );
        });

        it('should not delete the playlist folder if the user has not confirmed', async () => {
            // Arrange
            dialogServiceMock
                .setup((x) => x.showConfirmationDialogAsync('Delete playlist folder?', `Delete playlist folder 'name1'?`))
                .returns(async () => false);
            const component: CollectionPlaylistsComponent = createComponent();
            const playlistFolder1: PlaylistFolderModel = createPlaylistFolderModel('name1', 'path1');
            const playlistFolder2: PlaylistFolderModel = createPlaylistFolderModel('name2', 'path2');
            component.playlistFolders = [playlistFolder1, playlistFolder2];

            // Act
            await component.onDeletePlaylistFolderAsync(playlistFolder1);

            // Assert
            playlistServiceMock.verify((x) => x.deletePlaylistFolder(playlistFolder1), Times.never());
        });

        it('should delete the playlist folder if the user has confirmed', async () => {
            // Arrange
            dialogServiceMock
                .setup((x) => x.showConfirmationDialogAsync('Delete playlist folder?', `Delete playlist folder 'name1'?`))
                .returns(async () => true);
            const component: CollectionPlaylistsComponent = createComponent();
            const playlistFolder1: PlaylistFolderModel = createPlaylistFolderModel('name1', 'path1');
            const playlistFolder2: PlaylistFolderModel = createPlaylistFolderModel('name2', 'path2');
            component.playlistFolders = [playlistFolder1, playlistFolder2];

            // Act
            await component.onDeletePlaylistFolderAsync(playlistFolder1);

            // Assert
            playlistServiceMock.verify((x) => x.deletePlaylistFolder(playlistFolder1), Times.once());
        });

        it('should update the playlist folders if the user has confirmed', async () => {
            // Arrange
            const playlistFolder1: PlaylistFolderModel = createPlaylistFolderModel('name1', 'path1');
            const playlistFolder2: PlaylistFolderModel = createPlaylistFolderModel('name2', 'path2');
            playlistServiceMock.setup((x) => x.getPlaylistFoldersAsync()).returns(async () => [playlistFolder1, playlistFolder2]);
            playlistServiceMock.setup((x) => x.getPlaylistFoldersAsync()).returns(async () => [playlistFolder2]);
            collectionPersisterMock.setup((x) => x.selectedTab).returns(() => CollectionTab.playlists);
            dialogServiceMock
                .setup((x) => x.showConfirmationDialogAsync('Delete playlist folder?', `Delete playlist folder 'name1'?`))
                .returns(async () => true);
            const component: CollectionPlaylistsComponent = createComponent();
            await component.ngOnInit();
            const numberOfPlaylistFoldersBeforeDelete: number = component.playlistFolders.length;

            // Act
            await component.onDeletePlaylistFolderAsync(playlistFolder1);
            const numberOfPlaylistFoldersAfterDelete: number = component.playlistFolders.length;

            // Assert
            expect(numberOfPlaylistFoldersBeforeDelete).toEqual(2);
            expect(numberOfPlaylistFoldersAfterDelete).toEqual(1);
            expect(component.playlistFolders[0]).toBe(playlistFolder2);
        });

        it('should show an error dialog if deleting the playlist folder fails', async () => {
            // Arrange
            const playlistFolder1: PlaylistFolderModel = createPlaylistFolderModel('name1', 'path1');
            const playlistFolder2: PlaylistFolderModel = createPlaylistFolderModel('name2', 'path2');
            playlistServiceMock.setup((x) => x.getPlaylistFoldersAsync()).returns(async () => [playlistFolder1, playlistFolder2]);
            playlistServiceMock.setup((x) => x.getPlaylistFoldersAsync()).returns(async () => [playlistFolder2]);
            playlistServiceMock.setup((x) => x.deletePlaylistFolder(playlistFolder1)).throws(new Error('An error occurred'));
            collectionPersisterMock.setup((x) => x.selectedTab).returns(() => CollectionTab.playlists);
            dialogServiceMock
                .setup((x) => x.showConfirmationDialogAsync('Delete playlist folder?', `Delete playlist folder 'name1'?`))
                .returns(async () => true);
            const component: CollectionPlaylistsComponent = createComponent();
            await component.ngOnInit();
            const numberOfPlaylistFoldersBeforeDelete: number = component.playlistFolders.length;

            // Act
            await component.onDeletePlaylistFolderAsync(playlistFolder1);
            const numberOfPlaylistFoldersAfterDelete: number = component.playlistFolders.length;

            // Assert
            dialogServiceMock.verify((x) => x.showErrorDialog('Delete playlist folder error'), Times.once());
        });
    });
});
