export abstract class BaseItem {

    abstract get postId(): number;
    abstract get postOwnerId(): string;
    abstract get belongsToThreadId(): number;

    abstract get parentItem(): BaseItem | null;

    get countOfAncestorsWithSameContent() {
        let n = 0;
        for (let item = this.parentItem; item; item = item.parentItem) {
            console.log(item);
            if (item.postId === this.postId) {
                n++;
            }
        }
        return n;
    }

}