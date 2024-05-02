export interface PruneConfigTransformConfig {
    descriptions: PruneConfigDescriptionsTransformConfig;
}

export interface PruneConfigDescriptionsTransformConfig {
    fields: boolean;
    inputs: boolean;
    enums: boolean;
}

export enum FieldType {
    Field,
    Input,
    Enum,
}
