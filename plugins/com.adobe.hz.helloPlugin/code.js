/* global Adobe: readonly -- Declared by the iframe.ts runtime */
/* global __html__: readonly -- Declared by the iframe.ts runtime */
if (Adobe.editorType === 'canvas') {
    Adobe.showUI(__html__);
    Adobe.ui.onmessage = msg => {
        if (msg.type === 'create-shapes') {
            const count = msg.data ? msg.data.count: msg.count;
            for (let i = 0; i < count; i++) {
                Adobe.createRectangle();
            }
        }
    };
}
