import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const colors = {
  red: "#F84A4B",
  orange: "#FC7427",
  blue: "#4363ED",
  black: "#000000",
  white: "#ffffff",
  green: "#3BB755",
  yellow: "#f9dc46",
  gray: "#C7CED4",
  purple: "#6D47EA",
};

const fontFamily = '"Virgil"';
const backgroundColor = colors.white;
const arrowColor = colors.gray;
const lineHeight = 1.3;
const padding = "2px";

const excalidraw: Theme = {
  font: {
    fontFamily,
    fontSize: defaultFontSize,
    files: [{ url: "Virgil.woff2", name: "Virgil" }],
    lineHeight: lineHeight,
  },
  value: "excalidraw",
  bg: backgroundColor,
  fg: colors.black,
  safeBg: backgroundColor,
  minWidth: 0,
  minHeight: 0,
  colors,
  styles: [
    {
      selector: "node[label!='']",
      style: {
        width: "data(shapeWidth)",
        height: "data(shapeHeight)",
        "text-margin-y": "data(textMarginY)" as any,
        "text-margin-x": "data(textMarginX)" as any,
      },
    },
    {
      selector: "node",
      style: {
        "font-family": fontFamily,
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        color: colors.black,
        shape: "rectangle",
        backgroundColor: backgroundColor,
        "background-opacity": 0,
        "padding-left": padding,
        "padding-right": padding,
        "padding-top": padding,
        "padding-bottom": padding,
        "line-height": lineHeight,
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "bezier",
        "segment-distances": "60",
        "edge-distances": "intersection",
        width: 1.3,
        "line-color": arrowColor,
        "line-style": "solid",
        label: "data(label)",
        color: colors.black,
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "source-distance-from-node": 4,
        "target-distance-from-node": 4,
        // @ts-ignore
        "text-rotation": "-15deg",
        "target-arrow-shape": "triangle-backcurve",
        "target-arrow-color": arrowColor,
        "arrow-scale": 1,
      },
    },
    {
      selector: ":parent",
      style: {
        "text-valign": "top",
        "text-halign": "center",
        // @ts-ignore
        "text-margin-y": `-${padding}`,
        "text-wrap": "none",
      },
    },
    ...Object.entries(colors).map<StylesheetStyle>(([color, value]) => ({
      selector: `.${color}`,
      style: {
        "background-color": `${value}`,
        "background-opacity": 1,
        color: ["purple", "blue", "red", "green", "black", "orange"].includes(
          color
        )
          ? colors.white
          : colors.black,
      },
    })),
  ],
};

export default excalidraw;
