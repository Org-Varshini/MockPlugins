/* global Adobe: readonly -- Declared by the iframe.ts runtime */
/* global __html__: readonly -- Declared by the iframe.ts runtime */
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
            case 'group-shapes': {
                const nodes = msg.data ? msg.data.nodes : msg.nodes;
                if (nodes && nodes.length > 0) {
                    Adobe.createGroupWithNodes(nodes);
                }
            }
            break;
        }
    };
}
