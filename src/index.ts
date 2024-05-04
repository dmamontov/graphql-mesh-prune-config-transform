import {
    type GraphQLEnumValueConfig,
    type GraphQLFieldConfig,
    type GraphQLInputFieldConfig,
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
import { type ExecutionRequest, type ExecutionResult } from '@graphql-tools/utils';
import {
    TransformCompositeFields,
    TransformEnumValues,
    TransformInputObjectFields,
} from '@graphql-tools/wrap';
import { FieldType, type PruneConfigTransformConfig } from './types';

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
                        FieldType.Field,
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
                        FieldType.Input,
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
                        FieldType.Enum,
                    ) as GraphQLEnumValueConfig,
            ),
        ];
    }

    transformSchema(
        originalWrappingSchema: GraphQLSchema,
        subschemaConfig: SubschemaConfig,
        transformedSchema?: GraphQLSchema,
    ): GraphQLSchema {
        return applySchemaTransforms(
            originalWrappingSchema,
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
        fieldConfig:
            | GraphQLFieldConfig<any, any>
            | GraphQLInputFieldConfig
            | GraphQLEnumValueConfig,
        fieldType: FieldType,
    ): GraphQLFieldConfig<any, any> | GraphQLInputFieldConfig | GraphQLEnumValueConfig {
        const newFieldConfig = fieldConfig;
        if (this.config.descriptions && !fieldConfig?.extensions?.isCustomDescriptions) {
            if (
                (this.config.descriptions.fields && fieldType === FieldType.Field) ||
                (this.config.descriptions.inputs && fieldType === FieldType.Input) ||
                (this.config.descriptions.enums && fieldType === FieldType.Enum)
            ) {
                newFieldConfig.description = null;
            }
        }

        return newFieldConfig;
    }
}
