import { Controller } from "../Controller";
import { Model } from "../Model";

export { };

declare global {
    interface Window {
        disableAdnmbReferenceViewerEnhancementUserScript: boolean | undefined;
        ftoDebug: { model: Model, controller: Controller };
    }
}