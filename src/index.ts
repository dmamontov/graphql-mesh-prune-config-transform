import {
    type GraphQLEnumType,
    type GraphQLEnumValueConfig,
    type GraphQLFieldConfig,
    type GraphQLInputFieldConfig,
    type GraphQLInputObjectType,
    type GraphQLSchema,
} from 'graphql';
import {
    applyRequestTransforms,
    applyResultTransforms,
    applySchemaTransforms,
} from '@graphql-mesh/utils';
import {
    type DelegationContext,
    type SubschemaConfig,
    type Transform,
} from '@graphql-tools/delegate';
import {
    MapperKind,
    mapSchema,
    type ExecutionRequest,
    type ExecutionResult,
} from '@graphql-tools/utils';
import {
    TransformCompositeFields,
    TransformEnumValues,
    TransformInputObjectFields,
} from '@graphql-tools/wrap';
import {
    ApplyType,
    type CompositeType,
    type FieldConfigType,
    type PruneConfigTransformConfig,
} from './types';

export default class PruneConfigTransform implements Transform {
    public noWrap: boolean = false;
    private readonly config: PruneConfigTransformConfig;
    private readonly transformers: Array<
        TransformCompositeFields | TransformInputObjectFields | TransformEnumValues
    >;

    constructor({ config }: { config: PruneConfigTransformConfig }) {
        this.config = config;

        this.transformers = [
            new TransformCompositeFields(
                (
                    typeName: string,
                    fieldName: string,
                    fieldConfig: GraphQLFieldConfig<any, any>,
                ): GraphQLFieldConfig<any, any> =>
                    this.apply(
                        typeName,
                        fieldName,
                        fieldConfig,
                        ApplyType.Field,
                    ) as GraphQLFieldConfig<any, any>,
            ),
            new TransformInputObjectFields(
                (
                    typeName: string,
                    fieldName: string,
                    inputFieldConfig: GraphQLInputFieldConfig,
                ): GraphQLInputFieldConfig =>
                    this.apply(
                        typeName,
                        fieldName,
                        inputFieldConfig,
                        ApplyType.Input,
                    ) as GraphQLInputFieldConfig,
            ),
            new TransformEnumValues(
                (
                    typeName: string,
                    externalValue: string,
                    enumValueConfig: GraphQLEnumValueConfig,
                ): GraphQLEnumValueConfig =>
                    this.apply(
                        typeName,
                        externalValue,
                        enumValueConfig,
                        ApplyType.Enum,
                    ) as GraphQLEnumValueConfig,
            ),
        ];
    }

    transformSchema(
        originalWrappingSchema: GraphQLSchema,
        subschemaConfig: SubschemaConfig,
        transformedSchema?: GraphQLSchema,
    ): GraphQLSchema {
        const transformedOriginalSchema = mapSchema(originalWrappingSchema, {
            [MapperKind.INPUT_OBJECT_TYPE]: (typeConfig: GraphQLInputObjectType) =>
                this.apply(
                    typeConfig.name,
                    typeConfig.name,
                    typeConfig,
                    ApplyType.Input,
                ) as GraphQLInputObjectType,
            [MapperKind.ENUM_TYPE]: (typeConfig: GraphQLEnumType) =>
                this.apply(
                    typeConfig.name,
                    typeConfig.name,
                    typeConfig,
                    ApplyType.Enum,
                ) as GraphQLEnumType,
            [MapperKind.COMPOSITE_TYPE]: (typeConfig: CompositeType) =>
                this.apply(
                    typeConfig.name,
                    typeConfig.name,
                    typeConfig,
                    ApplyType.Field,
                ) as CompositeType,
        });

        return applySchemaTransforms(
            transformedOriginalSchema,
            subschemaConfig,
            transformedSchema,
            this.transformers,
        );
    }

    /* istanbul ignore next */
    public transformRequest(
        originalRequest: ExecutionRequest,
        delegationContext: DelegationContext,
        transformationContext: any,
    ): ExecutionRequest {
        return applyRequestTransforms(
            originalRequest,
            delegationContext,
            transformationContext,
            this.transformers,
        );
    }

    /* istanbul ignore next */
    transformResult(
        originalResult: ExecutionResult,
        delegationContext: DelegationContext,
        transformationContext: any,
    ) {
        return applyResultTransforms(
            originalResult,
            delegationContext,
            transformationContext,
            this.transformers,
        );
    }

    private apply(
        _typeName: string,
        _fieldName: string,
        fieldConfig: FieldConfigType,
        fieldType: ApplyType,
    ): FieldConfigType {
        const newFieldConfig = fieldConfig;
        if (this.config.descriptions && !fieldConfig?.extensions?.isCustomDescriptions) {
            if (
                (this.config.descriptions.fields && fieldType === ApplyType.Field) ||
                (this.config.descriptions.inputs && fieldType === ApplyType.Input) ||
                (this.config.descriptions.enums && fieldType === ApplyType.Enum)
            ) {
                newFieldConfig.description = null;
            }
        }

        return newFieldConfig;
    }
}
