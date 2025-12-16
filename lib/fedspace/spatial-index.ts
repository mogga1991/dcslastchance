/**
 * R-Tree Spatial Index for Federal Properties
 *
 * Enables O(log n) queries for nearby federal properties
 * PATENT #1: Federal Neighborhood Score - Spatial Indexing Component
 */

import type {
  SpatialNode,
  BoundingBox,
  FederalProperty,
  RTreeConfig,
} from './types';

const EARTH_RADIUS_MILES = 3959;

/**
 * R-Tree implementation optimized for federal property queries
 */
export class FederalPropertyRTree {
  private root: SpatialNode | null = null;
  private config: RTreeConfig;
  private size = 0;

  constructor(config?: Partial<RTreeConfig>) {
    this.config = {
      maxEntries: config?.maxEntries ?? 9,
      minEntries: config?.minEntries ?? 4,
      bulkLoad: config?.bulkLoad ?? true,
    };
  }

  /**
   * Insert a federal property into the spatial index
   */
  insert(property: FederalProperty): void {
    const node: SpatialNode = {
      id: property.id,
      bounds: this.pointToBounds(property.latitude, property.longitude),
      isLeaf: true,
      data: property,
    };

    if (!this.root) {
      this.root = {
        id: 'root',
        bounds: node.bounds,
        isLeaf: false,
        children: [node],
      };
    } else {
      this.insertNode(this.root, node);
    }

    this.size++;
  }

  /**
   * Bulk load multiple properties efficiently
   * Sorts properties by Hilbert curve for optimal spatial locality
   */
  bulkLoad(properties: FederalProperty[]): void {
    if (!this.config.bulkLoad || properties.length === 0) {
      properties.forEach((p) => this.insert(p));
      return;
    }

    // Sort by Hilbert curve value for better spatial locality
    const sorted = properties
      .map((p) => ({
        property: p,
        hilbert: this.hilbertValue(p.latitude, p.longitude),
      }))
      .sort((a, b) => a.hilbert - b.hilbert)
      .map((item) => item.property);

    // Build tree bottom-up
    this.root = this.buildTree(sorted, 0, sorted.length - 1);
    this.size = properties.length;
  }

  /**
   * Find all properties within radius (miles) of a point
   * O(log n) average case performance
   */
  searchRadius(
    lat: number,
    lng: number,
    radiusMiles: number
  ): FederalProperty[] {
    if (!this.root) return [];

    const bounds = this.circleToBounds(lat, lng, radiusMiles);
    const results: FederalProperty[] = [];

    this.searchNode(this.root, bounds, (property) => {
      const distance = this.haversineDistance(
        lat,
        lng,
        property.latitude,
        property.longitude
      );

      if (distance <= radiusMiles) {
        results.push(property);
      }
    });

    return results;
  }

  /**
   * Find all properties within a bounding box
   */
  searchBounds(bounds: BoundingBox): FederalProperty[] {
    if (!this.root) return [];

    const results: FederalProperty[] = [];
    this.searchNode(this.root, bounds, (property) => {
      if (this.pointInBounds(property.latitude, property.longitude, bounds)) {
        results.push(property);
      }
    });

    return results;
  }

  /**
   * Get k-nearest properties to a point
   */
  kNearest(lat: number, lng: number, k: number): FederalProperty[] {
    if (!this.root) return [];

    const candidates: Array<{ property: FederalProperty; distance: number }> =
      [];

    this.traverseAll(this.root, (property) => {
      const distance = this.haversineDistance(
        lat,
        lng,
        property.latitude,
        property.longitude
      );
      candidates.push({ property, distance });
    });

    return candidates
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k)
      .map((c) => c.property);
  }

  /**
   * Get total number of indexed properties
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Clear the index
   */
  clear(): void {
    this.root = null;
    this.size = 0;
  }

  // ==================== Private Methods ====================

  private insertNode(parent: SpatialNode, node: SpatialNode): void {
    if (!parent.children) {
      parent.children = [];
    }

    // Find best child to insert into
    if (parent.isLeaf) {
      parent.children.push(node);
      parent.bounds = this.expandBounds(parent.bounds, node.bounds);

      // Split if overflow
      if (parent.children.length > this.config.maxEntries) {
        this.splitNode(parent);
      }
    } else {
      const bestChild = this.chooseSubtree(parent, node.bounds);
      this.insertNode(bestChild, node);
      parent.bounds = this.expandBounds(parent.bounds, node.bounds);
    }
  }

  private chooseSubtree(parent: SpatialNode, bounds: BoundingBox): SpatialNode {
    if (!parent.children || parent.children.length === 0) {
      throw new Error('Invalid node');
    }

    let minEnlargement = Infinity;
    let bestChild = parent.children[0]!;

    for (const child of parent.children) {
      const enlargement = this.enlargement(child.bounds, bounds);
      if (enlargement < minEnlargement) {
        minEnlargement = enlargement;
        bestChild = child;
      }
    }

    return bestChild;
  }

  private splitNode(node: SpatialNode): void {
    if (!node.children || node.children.length <= this.config.maxEntries) {
      return;
    }

    // Choose split axis and index
    const { axis, index } = this.chooseSplitAxis(node.children);

    // Split children
    const sorted = [...node.children].sort((a, b) => {
      const centerA =
        axis === 'lat'
          ? (a.bounds.minLat + a.bounds.maxLat) / 2
          : (a.bounds.minLng + a.bounds.maxLng) / 2;
      const centerB =
        axis === 'lat'
          ? (b.bounds.minLat + b.bounds.maxLat) / 2
          : (b.bounds.minLng + b.bounds.maxLng) / 2;
      return centerA - centerB;
    });

    const left = sorted.slice(0, index);
    const right = sorted.slice(index);

    // Update current node
    node.children = left;
    node.bounds = this.calculateBounds(left);

    // Create new sibling node
    const sibling: SpatialNode = {
      id: `${node.id}_split`,
      bounds: this.calculateBounds(right),
      isLeaf: node.isLeaf,
      children: right,
    };

    // Handle root split
    if (node === this.root) {
      this.root = {
        id: 'root',
        bounds: this.expandBounds(node.bounds, sibling.bounds),
        isLeaf: false,
        children: [node, sibling],
      };
    }
  }

  private chooseSplitAxis(
    children: SpatialNode[]
  ): { axis: 'lat' | 'lng'; index: number } {
    // Try both axes and choose the one with minimum overlap
    const latSplit = this.evaluateSplit(children, 'lat');
    const lngSplit = this.evaluateSplit(children, 'lng');

    return latSplit.overlap < lngSplit.overlap ? latSplit : lngSplit;
  }

  private evaluateSplit(
    children: SpatialNode[],
    axis: 'lat' | 'lng'
  ): { axis: 'lat' | 'lng'; index: number; overlap: number } {
    const sorted = [...children].sort((a, b) => {
      const centerA =
        axis === 'lat'
          ? (a.bounds.minLat + a.bounds.maxLat) / 2
          : (a.bounds.minLng + a.bounds.maxLng) / 2;
      const centerB =
        axis === 'lat'
          ? (b.bounds.minLat + b.bounds.maxLat) / 2
          : (b.bounds.minLng + b.bounds.maxLng) / 2;
      return centerA - centerB;
    });

    let minOverlap = Infinity;
    let bestIndex = Math.floor(children.length / 2);

    // Try different split points
    for (
      let i = this.config.minEntries;
      i <= children.length - this.config.minEntries;
      i++
    ) {
      const leftBounds = this.calculateBounds(sorted.slice(0, i));
      const rightBounds = this.calculateBounds(sorted.slice(i));
      const overlap = this.overlapArea(leftBounds, rightBounds);

      if (overlap < minOverlap) {
        minOverlap = overlap;
        bestIndex = i;
      }
    }

    return { axis, index: bestIndex, overlap: minOverlap };
  }

  private searchNode(
    node: SpatialNode,
    bounds: BoundingBox,
    callback: (property: FederalProperty) => void
  ): void {
    if (!this.boundsIntersect(node.bounds, bounds)) {
      return;
    }

    if (node.isLeaf && node.data) {
      callback(node.data);
    } else if (node.children) {
      for (const child of node.children) {
        this.searchNode(child, bounds, callback);
      }
    }
  }

  private traverseAll(
    node: SpatialNode,
    callback: (property: FederalProperty) => void
  ): void {
    if (node.isLeaf && node.data) {
      callback(node.data);
    } else if (node.children) {
      for (const child of node.children) {
        this.traverseAll(child, callback);
      }
    }
  }

  private buildTree(
    properties: FederalProperty[],
    start: number,
    end: number
  ): SpatialNode {
    const count = end - start + 1;

    if (count <= this.config.maxEntries) {
      // Create leaf node
      const children = properties.slice(start, end + 1).map((p) => ({
        id: p.id,
        bounds: this.pointToBounds(p.latitude, p.longitude),
        isLeaf: true,
        data: p,
      }));

      return {
        id: `leaf_${start}`,
        bounds: this.calculateBounds(children),
        isLeaf: false,
        children,
      };
    }

    // Create internal node
    const childCount = Math.ceil(count / this.config.maxEntries);
    const children: SpatialNode[] = [];

    for (let i = 0; i < childCount; i++) {
      const childStart = start + i * this.config.maxEntries;
      const childEnd = Math.min(
        childStart + this.config.maxEntries - 1,
        end
      );
      children.push(this.buildTree(properties, childStart, childEnd));
    }

    return {
      id: `internal_${start}`,
      bounds: this.calculateBounds(children),
      isLeaf: false,
      children,
    };
  }

  // ==================== Geometric Utilities ====================

  private pointToBounds(lat: number, lng: number): BoundingBox {
    return {
      minLat: lat,
      maxLat: lat,
      minLng: lng,
      maxLng: lng,
    };
  }

  private circleToBounds(
    lat: number,
    lng: number,
    radiusMiles: number
  ): BoundingBox {
    const latDelta = (radiusMiles / EARTH_RADIUS_MILES) * (180 / Math.PI);
    const lngDelta =
      (radiusMiles / (EARTH_RADIUS_MILES * Math.cos((lat * Math.PI) / 180))) *
      (180 / Math.PI);

    return {
      minLat: lat - latDelta,
      maxLat: lat + latDelta,
      minLng: lng - lngDelta,
      maxLng: lng + lngDelta,
    };
  }

  private calculateBounds(nodes: SpatialNode[]): BoundingBox {
    if (nodes.length === 0) {
      return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
    }

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    for (const node of nodes) {
      minLat = Math.min(minLat, node.bounds.minLat);
      maxLat = Math.max(maxLat, node.bounds.maxLat);
      minLng = Math.min(minLng, node.bounds.minLng);
      maxLng = Math.max(maxLng, node.bounds.maxLng);
    }

    return { minLat, maxLat, minLng, maxLng };
  }

  private expandBounds(a: BoundingBox, b: BoundingBox): BoundingBox {
    return {
      minLat: Math.min(a.minLat, b.minLat),
      maxLat: Math.max(a.maxLat, b.maxLat),
      minLng: Math.min(a.minLng, b.minLng),
      maxLng: Math.max(a.maxLng, b.maxLng),
    };
  }

  private boundsIntersect(a: BoundingBox, b: BoundingBox): boolean {
    return !(
      a.maxLat < b.minLat ||
      a.minLat > b.maxLat ||
      a.maxLng < b.minLng ||
      a.minLng > b.maxLng
    );
  }

  private pointInBounds(
    lat: number,
    lng: number,
    bounds: BoundingBox
  ): boolean {
    return (
      lat >= bounds.minLat &&
      lat <= bounds.maxLat &&
      lng >= bounds.minLng &&
      lng <= bounds.maxLng
    );
  }

  private enlargement(bounds: BoundingBox, newBounds: BoundingBox): number {
    const original = this.boundsArea(bounds);
    const expanded = this.boundsArea(this.expandBounds(bounds, newBounds));
    return expanded - original;
  }

  private boundsArea(bounds: BoundingBox): number {
    return (
      (bounds.maxLat - bounds.minLat) * (bounds.maxLng - bounds.minLng)
    );
  }

  private overlapArea(a: BoundingBox, b: BoundingBox): number {
    const overlapLat = Math.max(
      0,
      Math.min(a.maxLat, b.maxLat) - Math.max(a.minLat, b.minLat)
    );
    const overlapLng = Math.max(
      0,
      Math.min(a.maxLng, b.maxLng) - Math.max(a.minLng, b.minLng)
    );
    return overlapLat * overlapLng;
  }

  /**
   * Haversine distance between two points (in miles)
   */
  private haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_MILES * c;
  }

  /**
   * Calculate Hilbert curve value for spatial sorting
   * Ensures better cache locality during bulk loading
   */
  private hilbertValue(lat: number, lng: number): number {
    // Normalize to [0, 1] range
    const x = (lng + 180) / 360;
    const y = (lat + 90) / 180;

    // Convert to integer coordinates (16-bit precision)
    const ix = Math.floor(x * 65535);
    const iy = Math.floor(y * 65535);

    // Calculate Hilbert index
    return this.xyToHilbert(ix, iy, 16);
  }

  private xyToHilbert(x: number, y: number, order: number): number {
    let d = 0;
    let s = order - 1;

    while (s >= 0) {
      const rx = (x >> s) & 1;
      const ry = (y >> s) & 1;

      d += ((3 * rx) ^ ry) << (2 * s);

      // Rotate
      if (ry === 0) {
        if (rx === 1) {
          x = (1 << order) - 1 - x;
          y = (1 << order) - 1 - y;
        }
        [x, y] = [y, x];
      }

      s--;
    }

    return d;
  }
}

/**
 * Singleton instance of the spatial index
 * Initialized once and reused across requests
 */
let globalIndex: FederalPropertyRTree | null = null;

export function getSpatialIndex(): FederalPropertyRTree {
  if (!globalIndex) {
    globalIndex = new FederalPropertyRTree();
  }
  return globalIndex;
}

export function resetSpatialIndex(): void {
  globalIndex = null;
}