/**
 * Topology for the hero diagram.
 *
 * Positions are percentages of the panel so the layout survives any aspect
 * ratio, and the simulation converts them to pixels once on measure. Edges
 * reference nodes by index rather than holding coordinates, which is what lets
 * the lines be rebuilt from live positions every frame instead of being baked
 * into a static `d` attribute.
 */

export type HeroNode = {
  label: string;
  /** Rest position as a fraction of panel width/height. */
  x: number;
  y: number;
  /**
   * Depth, -1 (furthest back) to 1 (nearest the viewer).
   *
   * This is what makes the diagram read as a space rather than a plane. It
   * drives four things at once, the way real depth cues stack: parallax swing
   * under the scene tilt, scale, atmospheric fade, and stacking order. Getting
   * only one of those right looks like a trick; getting all four right looks
   * like a photograph.
   */
  z: number;
  /** Seeds the drift so no two nodes share a phase. */
  phase: number;
  /** Per-node drift radius in px; the hubs move less than the leaves. */
  drift: number;
};

/**
 * Depths are assigned so the graph forms a legible front-to-back arrangement
 * rather than a random scatter: AUTOMATION sits furthest forward because it is
 * the hub every route passes through, the two upper nodes sit back, and the
 * lower pair sits mid-depth. Reading the labels by size tells you the same
 * story the edges do.
 */
export const HERO_NODES: ReadonlyArray<HeroNode> = [
  { label: "AI", x: 0.17, y: 0.23, z: -0.55, phase: 0.0, drift: 7 },
  { label: "SOFTWARE", x: 0.63, y: 0.15, z: -0.85, phase: 1.7, drift: 6 },
  { label: "CLOUD", x: 0.75, y: 0.58, z: 0.35, phase: 3.1, drift: 7 },
  { label: "DATA", x: 0.21, y: 0.74, z: 0.6, phase: 4.4, drift: 6 },
  // The centre node anchors the graph, so it barely moves — and sits nearest
  // the viewer, since every packet route passes through it.
  { label: "AUTOMATION", x: 0.47, y: 0.48, z: 1, phase: 2.3, drift: 3.5 },
];

/** Index into HERO_NODES, for readability at the edge/route definitions. */
const AI = 0;
const SOFTWARE = 1;
const CLOUD = 2;
const DATA = 3;
const AUTOMATION = 4;

export type HeroEdge = {
  from: number;
  to: number;
  /** `dim` edges are scaffold; `active` edges carry packets. */
  kind: "active" | "dim";
};

export const HERO_EDGES: ReadonlyArray<HeroEdge> = [
  { from: AI, to: SOFTWARE, kind: "active" },
  { from: SOFTWARE, to: CLOUD, kind: "active" },
  { from: CLOUD, to: DATA, kind: "active" },
  { from: DATA, to: SOFTWARE, kind: "active" },
  { from: AUTOMATION, to: CLOUD, kind: "active" },
  { from: AI, to: AUTOMATION, kind: "dim" },
  { from: DATA, to: AUTOMATION, kind: "dim" },
];

/**
 * Packet routes, as node indices to visit in order.
 *
 * Each is a plausible path through the product story (data feeds AI, AI ships
 * software, software runs on cloud) rather than a random walk, so a viewer who
 * actually follows a dot sees something coherent.
 */
export const HERO_ROUTES: ReadonlyArray<ReadonlyArray<number>> = [
  [DATA, SOFTWARE, CLOUD],
  [AI, AUTOMATION, CLOUD],
  [DATA, AUTOMATION, CLOUD, SOFTWARE],
];

/** Edges touching `node`, used to light up a hovered node's connections. */
export function incidentEdges(node: number): number[] {
  const result: number[] = [];
  HERO_EDGES.forEach((edge, i) => {
    if (edge.from === node || edge.to === node) result.push(i);
  });
  return result;
}
