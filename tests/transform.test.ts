import {
    GraphQLEnumType,
    GraphQLInputObjectType,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
} from 'graphql';
import { type SubschemaConfig } from '@graphql-tools/delegate';
import PruneConfigTransform from '../src';
import { type PruneConfigTransformConfig } from '../src/types';

describe('Transform tests', () => {
    const config: PruneConfigTransformConfig = {
        descriptions: {
            fields: true,
            inputs: true,
            enums: true,
        },
    };

    const transform = new PruneConfigTransform({ config });

    const inputType = new GraphQLInputObjectType({
        name: 'InputType',
        fields: {
            name: {
                type: new GraphQLNonNull(GraphQLString),
                description: 'Name input field',
            },
            custom: {
                type: new GraphQLNonNull(GraphQLString),
                description: 'Custom input field',
                extensions: {
                    isCustomDescriptions: true,
                },
            },
        },
    });

    const enumType = new GraphQLEnumType({
        name: 'EnumType',
        values: {
            VALUE1: { description: 'First Value' },
            VALUE2: { description: 'Second Value' },
        },
    });

    const testType = new GraphQLObjectType({
        name: 'TestType',
        fields: {
            field: {
                type: GraphQLString,
                description: 'A field',
            },
            enum: {
                type: enumType,
                description: 'An enum field',
            },
        },
    });

    const queryType = new GraphQLObjectType({
        name: 'Query',
        fields: {
            test: {
                type: testType,
                args: {
                    input: {
                        type: inputType,
                    },
                },
                resolve: () => ({}),
            },
        },
    });

    it('Should apply transformations to the schema', () => {
        const schema = new GraphQLSchema({ query: queryType });

        let inputTypeFields = (schema.getType('InputType') as GraphQLInputObjectType).getFields();
        expect(inputTypeFields.name.description).toBe('Name input field');
        expect(inputTypeFields.custom.description).toBe('Custom input field');

        let enumTypeValues = (schema.getType('EnumType') as GraphQLEnumType).getValues();
        expect(enumTypeValues[0].description).toBe('First Value');
        expect(enumTypeValues[1].description).toBe('Second Value');

        let queryTypeFields = (
            schema.getQueryType().getFields().test.type as GraphQLObjectType
        ).getFields();
        expect(queryTypeFields.field.description).toBe('A field');
        expect(queryTypeFields.enum.description).toBe('An enum field');

        const transformedSchema = transform.transformSchema(schema, {} as SubschemaConfig);

        inputTypeFields = (
            transformedSchema.getType('InputType') as GraphQLInputObjectType
        ).getFields();
        expect(inputTypeFields.name.description).toBeNull();
        expect(inputTypeFields.custom.description).toBe('Custom input field');

        enumTypeValues = (transformedSchema.getType('EnumType') as GraphQLEnumType).getValues();
        expect(enumTypeValues[0].description).toBeNull();
        expect(enumTypeValues[1].description).toBeNull();

        queryTypeFields = (
            transformedSchema.getQueryType().getFields().test.type as GraphQLObjectType
        ).getFields();
        expect(queryTypeFields.field.description).toBeNull();
        expect(queryTypeFields.enum.description).toBeNull();
    });
});
