import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../../core/logger';
import { MouseSelectionWatcher } from '../../../core/mouse-selection-watcher';
import { BasePlaybackIndicationService } from '../../../services/playback-indication/base-playback-indication.service';
import { BasePlaybackService } from '../../../services/playback/base-playback.service';
import { PlaybackStarted } from '../../../services/playback/playback-started';
import { TrackModel } from '../../../services/track/track-model';
import { TrackModels } from '../../../services/track/track-models';
import { BaseTracksPersister } from '../base-tracks-persister';
import { TrackOrder } from '../track-order';

@Component({
    selector: 'app-track-browser',
    host: { style: 'display: block' },
    templateUrl: './track-browser.component.html',
    styleUrls: ['./track-browser.component.scss'],
    providers: [MouseSelectionWatcher],
})
export class TrackBrowserComponent implements OnInit, OnDestroy {
    private _tracks: TrackModels = new TrackModels();
    private _tracksPersister: BaseTracksPersister;
    private subscription: Subscription = new Subscription();

    public orderedTracks: TrackModel[] = [];

    constructor(
        public playbackService: BasePlaybackService,
        private playbackIndicationService: BasePlaybackIndicationService,
        private mouseSelectionWatcher: MouseSelectionWatcher,
        private logger: Logger
    ) {}

    public get tracksPersister(): BaseTracksPersister {
        return this._tracksPersister;
    }

    public trackOrderEnum: typeof TrackOrder = TrackOrder;
    public selectedTrackOrder: TrackOrder;

    @Input()
    public set tracksPersister(v: BaseTracksPersister) {
        this._tracksPersister = v;
        this.orderTracks();
    }

    public get tracks(): TrackModels {
        return this._tracks;
    }

    @Input()
    public set tracks(v: TrackModels) {
        this._tracks = v;
        this.mouseSelectionWatcher.initialize(this.tracks.tracks, false);
        this.orderTracks();
    }

    public selectedTrack: TrackModel;

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    public ngOnInit(): void {
        this.subscription.add(
            this.playbackService.playbackStarted$.subscribe(async (playbackStarted: PlaybackStarted) => {
                this.playbackIndicationService.setPlayingTrack(this.orderedTracks, playbackStarted.currentTrack);
            })
        );

        this.selectedTrackOrder = this.tracksPersister.getSelectedTrackOrder();
    }

    public setSelectedTracks(event: any, trackToSelect: TrackModel): void {
        this.mouseSelectionWatcher.setSelectedItems(event, trackToSelect);
    }

    public toggleTrackOrder(): void {
        switch (this.selectedTrackOrder) {
            case TrackOrder.byTrackTitleAscending:
                this.selectedTrackOrder = TrackOrder.byTrackTitleDescending;
                break;
            case TrackOrder.byTrackTitleDescending:
                this.selectedTrackOrder = TrackOrder.byAlbum;
                break;
            case TrackOrder.byAlbum:
                this.selectedTrackOrder = TrackOrder.byTrackTitleAscending;
                break;
            default: {
                this.selectedTrackOrder = TrackOrder.byTrackTitleAscending;
                break;
            }
        }

        this.tracksPersister.setSelectedTrackOrder(this.selectedTrackOrder);
        this.orderTracks();
    }

    private orderTracks(): void {
        let orderedTracks: TrackModel[] = [];

        try {
            switch (this.selectedTrackOrder) {
                case TrackOrder.byTrackTitleAscending:
                    orderedTracks = this.getTracksOrderedByTitleAscending();
                    this.hideAllHeaders(orderedTracks);
                    break;
                case TrackOrder.byTrackTitleDescending:
                    orderedTracks = this.getTracksOrderedByTitleDescending();
                    this.hideAllHeaders(orderedTracks);
                    break;
                case TrackOrder.byAlbum:
                    orderedTracks = this.getTracksOrderedByAlbum();
                    this.enableAlbumHeaders(orderedTracks);
                    break;
                default: {
                    orderedTracks = this.getTracksOrderedByTitleAscending();
                    this.hideAllHeaders(orderedTracks);
                    break;
                }
            }
        } catch (e) {
            this.logger.error(`Could not order tracks. Error: ${e.message}`, 'TrackBrowserComponent', 'orderTracks');
        }

        this.orderedTracks = [...orderedTracks];

        this.playbackIndicationService.setPlayingTrack(this.orderedTracks, this.playbackService.currentTrack);
    }

    private hideAllHeaders(orderedTracks: TrackModel[]): void {
        for (const track of orderedTracks) {
            track.showHeader = false;
        }
    }

    private enableAlbumHeaders(orderedTracks: TrackModel[]): void {
        let previousAlbumKey: string = uuidv4();

        for (const track of orderedTracks) {
            if (track.albumKey !== previousAlbumKey) {
                track.showHeader = true;
            }

            previousAlbumKey = track.albumKey;
        }
    }

    private getTracksOrderedByTitleAscending(): TrackModel[] {
        return this.tracks.tracks.sort((a, b) => (a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1));
    }

    private getTracksOrderedByTitleDescending(): TrackModel[] {
        return this.tracks.tracks.sort((a, b) => (a.title.toLowerCase() < b.title.toLowerCase() ? 1 : -1));
    }

    private getTracksOrderedByAlbum(): TrackModel[] {
        return this.tracks.tracks.sort((a, b) => {
            if (a.albumArtists > b.albumArtists) {
                return 1;
            } else if (a.albumArtists < b.albumArtists) {
                return -1;
            }

            if (a.albumTitle > b.albumTitle) {
                return 1;
            } else if (a.albumTitle < b.albumTitle) {
                return -1;
            }

            if (a.number > b.number) {
                return 1;
            } else if (a.number < b.number) {
                return -1;
            } else {
                return 0;
            }
        });
    }
}
