export class AutoOpenConfig {

    target: null | 'ViewsWhoseContentHasBeenCached';
    viewStatusAfterOpened: 'open' | 'collapsed';
    depthLimit: null | number;
    openOtherRefViewsAfterOpenedOneWithSameRef: boolean;

    constructor(
        target: null | 'ViewsWhoseContentHasBeenCached',
        viewStatusAfterOpened: 'open' | 'collapsed',
        depthLimit: null | number,
        openOtherRefViewsAfterOpenedOneWithSameRef: boolean
    ) {

        this.target = target;
        this.viewStatusAfterOpened = viewStatusAfterOpened;
        this.depthLimit = depthLimit;
        this.openOtherRefViewsAfterOpenedOneWithSameRef = openOtherRefViewsAfterOpenedOneWithSameRef;

    }
}
