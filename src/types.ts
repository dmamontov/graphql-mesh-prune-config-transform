import {
    type GraphQLEnumType,
    type GraphQLEnumValueConfig,
    type GraphQLFieldConfig,
    type GraphQLInputFieldConfig,
    type GraphQLInputObjectType,
    type GraphQLInterfaceType,
    type GraphQLObjectType,
    type GraphQLUnionType,
} from 'graphql';

export interface PruneConfigTransformConfig {
    descriptions: PruneConfigDescriptionsTransformConfig;
}

export interface PruneConfigDescriptionsTransformConfig {
    fields: boolean;
    inputs: boolean;
    enums: boolean;
}

export enum ApplyType {
    Field,
    Input,
    Enum,
}

export type CompositeType = GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType;

export type FieldConfigType =
    | GraphQLFieldConfig<any, any>
    | GraphQLInputFieldConfig
    | GraphQLEnumValueConfig
    | GraphQLInputObjectType
    | GraphQLEnumType
    | CompositeType;
