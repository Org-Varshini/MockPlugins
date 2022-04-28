/* eslint-disable tsdoc/syntax -- JSX pragma commands */
/** @jsx Adobe.Element */
/** @jsxFrag Adobe.Fragment */
/* eslint-enable tsdoc/syntax -- JSX pragma commands */
/* global Adobe: readonly -- Declared by the managed-ui.ts runtime */
/* global hz: readonly -- Declared by the async.ts plugin runtime */

const { Ellipse, Rectangle } = hz.canvas;

let selectedTab = "circular";
async function onTabChange(event) {
  selectedTab = await event.target.get("selected");
}

let disabled = true;
hz.addEventListener("selectionchange", ({ detail }) => {
  disabled = detail.length < 2;
  render();
});
hz.ready.then(async () => {
  const { length } = await hz.canvas.selection();
  disabled = length < 2;
  render();
});

let angle = 360;

async function arrange() {
  const selection = await hz.canvas.selection();
  const dimensions = await Promise.all(selection.map(sizeAndCenter));

  const { x, y, radius } = centerAndRadius(dimensions);
  const step = (angle / selection.length / 180) * Math.PI;
  selection.forEach((node, i) => {
    const a = i * step;
    node.transform = {
      x: x + radius * Math.sin(a),
      y: y + radius * Math.cos(a),
    };
  });
}

async function sizeAndCenter(node) {
  const [{ width, height }, { x, y }] = await Promise.all([
    nodeSize(node),
    node.transform,
  ]);
  return {
    width,
    height,
    x,
    y,
  };
}

async function nodeSize(node) {
  if (node instanceof Ellipse) {
    const { rx, ry } = await node.geometry;
    return { width: rx * 2, height: ry * 2 };
  } else if (node instanceof Rectangle) {
    return node.geometry;
  } else {
    return { width: 100, height: 100 }; // arbitrary
  }
}

function centerAndRadius(dimensions) {
  let xMax = -Infinity;
  let xMin = Infinity;
  let yMax = -Infinity;
  let yMin = Infinity;
  let radius = 0;
  for (const { width, height, x, y } of dimensions) {
    xMax = Math.max(x, xMax);
    xMin = Math.min(x, xMin);
    yMax = Math.max(y, yMax);
    yMin = Math.min(y, yMin);
    radius = Math.max(radius, Math.max(width, height));
  }
  return {
    x: (xMin + xMax) / 2,
    y: (yMin + yMax) / 2,
    radius,
  };
}

function render() {
  Adobe.render(
    <>
      <style>{styles}</style>
      <sp-tabs className="panel" selected={selectedTab} onchange={onTabChange}>
        <sp-tab value="circular">
          <sp-icon-select-circular
            size="m"
            slot="icon"
          ></sp-icon-select-circular>
        </sp-tab>
        <sp-tab value="grid">
          <sp-icon-view-grid size="m" slot="icon"></sp-icon-view-grid>
        </sp-tab>
        <sp-tab-panel className="panel" value="circular">
          <sp-slider
            variant="fill"
            label="Angle"
            disabled={disabled}
            min={0}
            max={360}
            value={angle}
            formatOptions={degreeFormat}
            oninput={onAngle}
          />
        </sp-tab-panel>
        <sp-tab-panel className="panel" value="grid">
          The Second
        </sp-tab-panel>
      </sp-tabs>
      <div className="button-panel">
        <sp-action-button disabled={disabled} onclick={arrange}>
          Arrange
        </sp-action-button>
      </div>
    </>
  );
}

const styles = `
:host {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    gap: var(--spectrum-global-dimension-size-200);
}

sp-tabs, sp-slider {
    width: 100%;
}

.button-panel {
    align-self: center;
    width: fit-content;
}
`;

async function onAngle({ target }) {
  angle = await target.get("value");
}

const degreeFormat = { style: "unit", unit: "°", unitDisplay: "narrow" };

render();
