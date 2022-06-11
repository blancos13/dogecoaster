export const isDev = (typeof window !== "undefined" ? window : self).location.hostname === "localhost";
export const maxRideBlocks = 255;
export const minRideBlocks = 1;

export const blockIntervalMs = 3000;

/** The number of blocks to render offscreen on each side. A higher number increases the lag before seeing a given block.
 * A two-block lead is typically necessary to ensure that a line through the newest block is fully-formed when it becomes visible. */
export const offscreenRenderBlocksPerSide = 2;

export const blocksOnscreen = 10;

/** The number of blocks to retain in memory after passing offscreen in addition to offscreenRenderBlocks. These blocks are
 * notably used in the calculation of the zoom level. A larger number will generally result in gentler changes from one block
 * to the next. */
export const additionalTrailingBlockCount = 4;

export const maxBlocksInMemory = offscreenRenderBlocksPerSide * 2 + blocksOnscreen + additionalTrailingBlockCount;
