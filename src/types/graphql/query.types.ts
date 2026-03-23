export type FilterOperator =
    | "EQUALS"
    | "NOT_EQUALS"
    | "GREATER_THAN"
    | "LESS_THAN"
    | "GREATER_THAN_OR_EQUALS"
    | "LESS_THAN_OR_EQUALS"
    | "IN"
    | "NOT_IN"
    | "LIKE"
    | "ILIKE"
    | "NOT_LIKE"
    | "IS_NULL"
    | "IS_NOT_NULL"
    | "BETWEEN"
    | "NOT_BETWEEN";

export type LogicalOperator = "AND" | "OR";

export type SortDirection = "ASC" | "DESC";

export type PageRequest = {
    pageIndex?: number;
    pageSize?: number;
}

export type SortRequest = {
    field: string;
    direction: SortDirection
}

export type Filter = {
    key: string;
    operator: FilterOperator;
    value?: string;
    values?: string[];
};

export type FilterGroup = {
    operator?: LogicalOperator;
    filters?: Filter[];
    filterGroups?: FilterGroup[];
};

export type FilterRequest = {
    filters?: Filter[];
    filterGroups?: FilterGroup[];
    sort?: SortRequest[];
};