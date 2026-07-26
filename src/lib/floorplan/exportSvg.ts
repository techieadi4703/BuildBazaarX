/**
 * Export a room's SVG node to a standalone downloadable .svg Blob.
 *
 * CSS variable values are inlined by reading getComputedStyle so the
 * exported file renders correctly in any browser / viewer without the
 * host page's CSS context.
 */

function resolveCssVar(varName: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
}

function inlineVars(svgSource: string): string {
  // Replace all var(--xxx) occurrences with their resolved values
  return svgSource.replace(/var\(([^)]+)\)/g, (_match, varRef) => {
    const varName = varRef.trim();
    return resolveCssVar(varName) || "#888888";
  });
}

/**
 * Serialise a room <svg> element to a standalone Blob and trigger download.
 *
 * @param svgElement  The SVG DOM node to export
 * @param filename    Suggested download filename (without extension)
 */
export function exportRoomSvg(
  svgElement: SVGSVGElement,
  filename: string,
): void {
  // Clone to avoid mutating the live DOM
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  // Add XML declaration and namespace
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  const serializer = new XMLSerializer();
  const rawSvg = serializer.serializeToString(clone);

  // Inline CSS variable values
  const resolvedSvg = inlineVars(rawSvg);

  const blob = new Blob(
    [
      `<?xml version="1.0" encoding="UTF-8"?>\n`,
      resolvedSvg,
    ],
    { type: "image/svg+xml;charset=utf-8" },
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.svg`;
  link.click();
  URL.revokeObjectURL(url);
}
