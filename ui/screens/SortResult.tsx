// interface OverpassResult {
//     type: string;
//     id: number;
//     lat: number;
//     lon: number;
//     tags: {
//         [key: string]: string;
//     };
// }
import { OverpassElement,OverpassNode } from "./OverpassElement";
export interface Point {
    lat: number;
    lon: number;
}
function getCoordinates(element: OverpassElement, elementsMap: Map<number, OverpassElement>): Point | null {
    if (element.type === "node") {
        // Для нода координаты уже есть
        return { lat: element.lat, lon: element.lon };
    } else if (element.type === "way") {
        // Для пути вычисляем средние координаты всех нодов
        const nodes = element.nodes
            .map(nodeId => elementsMap.get(nodeId))
            .filter(node => node?.type === "node") as OverpassNode[];

        if (nodes.length === 0) return null;

        const avgLat = nodes.reduce((sum, node) => sum + node.lat, 0) / nodes.length;
        const avgLon = nodes.reduce((sum, node) => sum + node.lon, 0) / nodes.length;
        return { lat: avgLat, lon: avgLon };
    } else if (element.type === "relation") {
        // Для отношения вычисляем координаты первого найденного элемента
        for (const member of element.members) {
            const memberElement = elementsMap.get(member.ref);
            if (memberElement) {
                const coords = getCoordinates(memberElement, elementsMap);
                if (coords) return coords;
            }
        }
        return null;
    }
    return null;
}
function calculateDistance(point1: Point, point2: Point): number {
    const R = 6371e3; // радиус Земли в метрах
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lon - point1.lon) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export function sortByDistance(results: OverpassElement[], center: Point, elementsMap: Map<number, OverpassElement>): OverpassElement[] {
    return results.sort((a, b) => {
        const coordsA = getCoordinates(a, elementsMap);
        const coordsB = getCoordinates(b, elementsMap);

        if (!coordsA || !coordsB) return 0; // Если координаты не найдены, оставляем порядок неизменным

        const distanceA = calculateDistance(center, coordsA);
        const distanceB = calculateDistance(center, coordsB);
        return distanceA - distanceB;
    });
}