import { Controller } from "../Controller";
import { Model } from "../Model";

export { };

declare global {
    interface Window {
        disableAdnmbReferenceViewerEnhancementUserScript: boolean | undefined;
        ftoDeubg: { model: Model, controller: Controller };
    }
}