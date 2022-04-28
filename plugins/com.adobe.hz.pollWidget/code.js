/* global Adobe: readonly -- Declared by the iframe.ts runtime */
/* global __html__: readonly -- Declared by the iframe.ts runtime */
if (Adobe.editorType === "canvas") {
  Adobe.showUI(__html__);

  Adobe.ui.onmessage = (msg) => {
    switch (msg.type) {
      case "takeScreenshot":
        takeScreenshot && takeScreenshot();
        break;
        break;
    }
  };
}
