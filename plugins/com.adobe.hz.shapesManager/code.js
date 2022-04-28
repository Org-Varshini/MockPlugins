/* global Adobe: readonly -- Declared by the QuickJS runtime */
/* global __html__: readonly -- Declared by the QuickJS runtime */
if (Adobe.editorType === 'canvas') {
    Adobe.showUI(__html__);

    const notifySelectionToUi = (selectedNodes) => {
        const selectionData = selectedNodes.map(node => ({
            id: node,
            type: Adobe.currentPage.getShape(node)
        }));
        Adobe.postToUI(JSON.stringify({
            message: "selectionChanged",
            data: selectionData
        }));
    };
    

    Adobe.currentPage.onSelectionChange = notifySelectionToUi;
    
    Adobe.ui.onmessage = msg => {
        switch (msg.type) {
            case 'get-selection':
                notifySelectionToUi(Adobe.currentPage.getSelection());
                break;
            case 'updateWidgetSize':
                const size = msg.data ? msg.data.size : msg.size;
                Adobe.currentPage.updateWidgetSize(JSON.stringify(size));
            case 'add-sticker': {
                const nodes = msg.data ? msg.data.nodes : msg.nodes;
                if (nodes.length > 0) {
                    for (const node of nodes) {
                        Adobe.addStickerOnNode(node);
                    }
                }
            }
            break;
        }
    };
}
