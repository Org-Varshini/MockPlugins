/* eslint-disable tsdoc/syntax -- JSX pragma commands */
/** @jsx Adobe.Element */
/** @jsxFrag Adobe.Fragment */
/* eslint-enable tsdoc/syntax -- JSX pragma commands */
/* global Adobe: readonly -- Declared by the managed-ui.ts runtime */

const DEFAULT_MAX_SIZE = 600;
const DEFAULT_MIN_SIZE = 250;

const color = { self: "#f2e33aff", selection: { indeterminate: true } };
const width = { self: 485, selection: { indeterminate: true }, max: DEFAULT_MAX_SIZE, min: DEFAULT_MIN_SIZE };
const height = { self: 300, selection: { indeterminate: true }, max: DEFAULT_MAX_SIZE, min: DEFAULT_MIN_SIZE };

function selectedColor() {
    if (hasSelection) {
        const { selection } = color;
        return selection.indeterminate ? "" : selection.value;
    } else {
        return color.self;
    }
}

function clampedSize({ self, selection, max, min }) {
    return selection.indeterminate ? Math.min(max, Math.max(min, self)) : selection.value;
}

Adobe.onPositionPane = ({ width: w, height: h }) => {
    width.selection = w;
    width.max = w.indeterminate ? DEFAULT_MAX_SIZE : Math.max(w.value, width.max, DEFAULT_MAX_SIZE);
    width.min = w.indeterminate ? DEFAULT_MIN_SIZE : Math.min(w.value, width.min, DEFAULT_MIN_SIZE);

    height.selection = h;
    height.max = h.indeterminate ? DEFAULT_MAX_SIZE : Math.max(h.value, height.max, DEFAULT_MAX_SIZE);
    height.min = h.indeterminate ? DEFAULT_MIN_SIZE : Math.min(h.value, height.min, DEFAULT_MIN_SIZE);

    render();
};

Adobe.onFills = ({ fillColor }) => {
    color.selection = fillColor;
    render();
};

let selection = [];
let hasSelection = false;
let isSelectionOnlyRects = false;

Adobe.onSelection = ({ types }) => {
    selection = types;
    hasSelection = selection.length > 0;
    isSelectionOnlyRects = selection.every(t => t === "rectangle");
    render();
};

let timeout;

/* eslint-disable new-cap -- managed-ui runtime uses uppercase method name */
const toastRef = Adobe.Ref();

async function onWidth({ target }) {
    width.self = await target.get("value");
    if (hasSelection && isSelectionOnlyRects) {
        Adobe.setWidth(width.self);
    }
}

async function onHeight({ target }) {
    height.self = await target.get("value");
    if (hasSelection && isSelectionOnlyRects) {
        Adobe.setHeight(height.self);
    }
}

function onColor({ detail }) {
    const value = (color.self = detail.value);
    if (hasSelection) {
        Adobe.setFillColor(value);
    }
}

async function onButtonClick() {
    render(); // updates the contents of the toast
    toastRef.set("open", true);

    clearTimeout(timeout);
    timeout = setTimeout(removeToast, 2500);

    const geo = await Adobe.canvasGeometry();

    Adobe.createRectangle();
    Adobe.setFillColor(color.self);
    Adobe.setHeight(height.self);
    Adobe.setWidth(width.self);
    Adobe.setX(geo.x + (geo.width - width.self) / 2);
    Adobe.setY(geo.y + (geo.height - height.self) / 2);
}

function onToastClosed() {
    clearTimeout(timeout);
}

function removeToast() {
    toastRef.set("open", false);
}

function isSliderDisabled(dimension) {
    return hasSelection && (!isSelectionOnlyRects || dimension.selection.indeterminate);
}

function render() {
    const colorValue = selectedColor();
    const widthValue = clampedSize(width);
    const heightValue = clampedSize(height);

    Adobe.render(
        <>
            <style>{styles}</style>
            <div className="panel">
                <hz-color-picker
                    color={colorValue}
                    disabled={!colorValue}
                    editable
                    label="Fill Color"
                    onchange={onColor}
                    variant="square"
                    wellType="fill"
                ></hz-color-picker>
            </div>

            <div className="panel">
                <sp-slider
                    disabled={isSliderDisabled(width)}
                    label="Width"
                    oninput={onWidth}
                    value={widthValue}
                    variant="filled"
                    min={width.min}
                    max={width.max}
                />
                <sp-slider
                    disabled={isSliderDisabled(height)}
                    label="Height"
                    oninput={onHeight}
                    value={heightValue}
                    variant="filled"
                    min={height.min}
                    max={height.max}
                />
            </div>

            <div className="button-panel">
                <sp-button disabled={hasSelection} onclick={onButtonClick}>
                    Create Rectangle
                </sp-button>
            </div>

            <sp-toast ref={toastRef} onclose={onToastClosed}>
                A {width.self}×{height.self}{" "}
                <span className="color-indicator" style={{ background: color.self }}>
                    {color.self}
                </span>{" "}
                rectangle is being created...
            </sp-toast>
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

.panel {
    width: 100%;
}

.button-panel {
    align-self: center;
    width: fit-content;
}

sp-toast {
    position: fixed;
    right: var(--spectrum-global-dimension-size-100);
    top: var(--spectrum-global-dimension-size-100);
}

.color-indicator {
    border-radius: 50%;
    color: transparent;
    display: inline-block;
    height: 1em;
    overflow: hidden;
    vertical-align: middle;
    width: 1em;
}
`;

render();