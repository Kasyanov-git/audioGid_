export interface OverpassNode {
    type: "node";
    id: number;
    lat: number;
    lon: number;
    tags?: {
        [key: string]: string;
    };
}

interface OverpassWay {
    type: "way";
    id: number;
    nodes: number[]; // Список id нодов, из которых состоит путь
    tags?: {
        [key: string]: string;
    };
}

interface OverpassRelation {
    type: "relation";
    id: number;
    members: Array<{
        type: "node" | "way" | "relation";
        ref: number; // id элемента
        role: string; // Роль элемента в отношении
    }>;
    tags?: {
        [key: string]: string;
    };
}

export type OverpassElement = OverpassNode | OverpassWay | OverpassRelation;