export const SVG_NS = 'http://www.w3.org/2000/svg';

export type SvgOptions = {
    width: number;
    height: number;
};

export function makeSvg(doc: Document, options: SvgOptions): SVGElement {
    const ret = doc.createElementNS(SVG_NS, 'svg');
    ret.setAttribute('viewBox', `0 0 ${options.width} ${options.height}`);
    ret.setAttribute('width', `${options.width}px`);
    ret.setAttribute('height', `${options.height}px`);
    return ret;
}

export type SvgRectOptions = {
    x: number;
    y: number;
    width: number;
    height: number;
    fill?: string;
    stroke?: string;
};

export function makeSvgRect(doc: Document, options: SvgRectOptions): SVGRectElement {
    const ret = doc.createElementNS(SVG_NS, 'rect');
    ret.setAttribute('x', String(options.x));
    ret.setAttribute('y', String(options.y));
    ret.setAttribute('width', String(options.width));
    ret.setAttribute('height', String(options.height));
    ret.setAttribute('fill', options.fill ?? 'none');
    ret.setAttribute('stroke', options.stroke ?? 'none');
    return ret;
}

export type SvgPathOptions = {
    path: string[] | string;
    open?: boolean;
    fill?: string;
    stroke?: string;
};

export function makeSvgPath(doc: Document, options: SvgPathOptions): SVGPathElement {
    const ret = doc.createElementNS(SVG_NS, 'path');
    if (typeof options.path === 'string') {
        ret.setAttribute('d', options.path);
    } else {
        const pathStr = 'M' + options.path.join(' L') + (options.open ? '' : ' Z');
        ret.setAttribute('d', pathStr);
    }
    ret.setAttribute('fill', options.fill ?? 'none');
    ret.setAttribute('stroke', options.stroke ?? 'none');
    return ret;
}

export type SvgPatternOptions = {
    id: string;
    width: number;
    height: number;
};

export function makeSvgPattern(doc: Document, options: SvgPatternOptions): SVGPatternElement {
    const ret = doc.createElementNS(SVG_NS, 'pattern');
    ret.setAttribute('id', options.id);
    ret.setAttribute('x', '0');
    ret.setAttribute('y', '0');
    ret.setAttribute('width', String(options.width));
    ret.setAttribute('height', String(options.height));
    ret.setAttribute('patternUnits', 'userSpaceOnUse');
    return ret;
}

export type SvgTextOptions = {
    x: number,
    y: number,
    bold?: boolean,
    size: number,
    color: string,
    text: string,
};

export function makeSvgText(doc: Document, options: SvgTextOptions): SVGTextElement {
    const ret = doc.createElementNS(SVG_NS, 'text');
    ret.setAttribute('x', String(options.x));
    ret.setAttribute('y', String(options.y));
    ret.setAttribute('font-family', 'sans-serif');
    if (options.bold) {
        ret.setAttribute('font-weight', 'bold');
    }
    ret.setAttribute('font-size', `${options.size}px`);
    ret.setAttribute('text-anchor', 'middle');
    ret.setAttribute('dominant-baseline', 'middle');
    ret.setAttribute('fill', options.color);
    ret.textContent = options.text;
    return ret;
}

export type SvgCircleOptions = {
    x: number,
    y: number,
    radius: number,
    fill?: string;
    stroke?: string;
};

export function makeSvgCircle(doc: Document, options: SvgCircleOptions): SVGCircleElement {
    const ret = doc.createElementNS(SVG_NS, 'circle');
    ret.setAttribute('cx', String(options.x));
    ret.setAttribute('cy', String(options.y));
    ret.setAttribute('r', String(options.radius));
    ret.setAttribute('fill', options.fill ?? 'none');
    ret.setAttribute('stroke', options.stroke ?? 'none');
    return ret;
}

export type SvgPolylineOptions = {
    stroke: string;
    strokeWidth: number;
};

export function makeSvgPolyline(doc: Document, options: SvgPolylineOptions): SVGPolylineElement {
    const ret = doc.createElementNS(SVG_NS, 'polyline');
    ret.setAttribute('fill', 'none');
    ret.setAttribute('stroke', options.stroke);
    ret.setAttribute('stroke-width', String(options.strokeWidth));
    return ret;
}