import { Controller } from "../Controller";
import { Model } from "../Model";

export { };

declare global {
    interface Window {
        disableAdnmbReferenceViewerEnhancementUserScript?: boolean;
        fto?: {
            AdnmbReferenceViewerEnhancement?: {
                debug?: { model: Model, controller: Controller };
                setup?(document: HTMLDocument): void;
            }
        };
    }
}