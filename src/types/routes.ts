import { ComponentType } from 'react';

export interface RouteMeta {
    layout?: 'default' | 'plain' | 'full';
    headerTitle?: string;
    [key: string]: any;
}

// 1. Define the structure of your route
export interface RouteObject {
    key: string;
    path: string;
    component: ComponentType<any>;
    authority?: string[];
    meta?: RouteMeta;
    subMenu?: RouteObject[];
}

// 2. Explicitly tell TypeScript this returns an array of RouteObject: RouteObject[]
const flattenRoutes = (routes: RouteObject[]): RouteObject[] => {
    return routes.flatMap((route) => [
        route,
        ...(route.subMenu ? flattenRoutes(route.subMenu) : [])
    ]);
};