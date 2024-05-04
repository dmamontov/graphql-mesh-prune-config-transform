// eslint-disable-next-line import/no-nodejs-modules
import * as fs from 'node:fs';
// eslint-disable-next-line import/no-nodejs-modules
import * as path from 'node:path';
import {
    buildSchema,
    type GraphQLEnumType,
    type GraphQLInputObjectType,
    type GraphQLObjectType,
    type GraphQLSchema,
} from 'graphql';
import { type SubschemaConfig } from '@graphql-tools/delegate';
import PruneConfigTransform from '../src';
import { type PruneConfigTransformConfig } from '../src/types';

describe('PruneConfigTransform', () => {
    let originalSchema: GraphQLSchema;
    let transform: PruneConfigTransform;

    beforeEach(() => {
        originalSchema = buildSchemaFromFile('schema.graphql');
        // @ts-expect-error
        (
            originalSchema.getType('TestInput') as GraphQLInputObjectType
        ).getFields().second.extensions.isCustomDescriptions = true;

        transform = new PruneConfigTransform({
            config: {
                descriptions: {
                    fields: true,
                    inputs: true,
                    enums: true,
                },
            } as PruneConfigTransformConfig,
        });
    });

    it('Should before apply transformations to the schema', () => {
        const inputType = originalSchema.getType('TestInput') as GraphQLInputObjectType;
        expect(inputType.description).toBe('test-input-description');

        const inputTypeFields = inputType.getFields();
        expect(inputTypeFields.first.description).toBe('test-input-field-first-description');
        expect(inputTypeFields.second.description).toBe('test-input-field-second-description');

        const enumType = originalSchema.getType('TestEnum') as GraphQLEnumType;
        expect(enumType.description).toBe('test-enum-description');
        expect(enumType.getValue('FIRST').description).toBe('test-enum-value-first-description');
        expect(enumType.getValue('SECOND').description).toBe('test-enum-value-second-description');

        const queryTestField = originalSchema.getQueryType().getFields().test;
        expect(queryTestField.description).toBe('query-test-description');

        const fieldType = originalSchema.getType('TestResult') as GraphQLObjectType;
        expect(fieldType.description).toBe('test-result-description');

        const fieldTypeFields = fieldType.getFields();
        expect(fieldTypeFields.first.description).toBe('test-result-field-first-description');
        expect(fieldTypeFields.second.description).toBe('test-result-field-second-description');
    });

    it('Should after apply transformations to the schema', () => {
        const transformedSchema = transform.transformSchema(originalSchema, {} as SubschemaConfig);

        const inputType = transformedSchema.getType('TestInput') as GraphQLInputObjectType;
        expect(inputType.description).toBeNull();

        const inputTypeFields = inputType.getFields();
        expect(inputTypeFields.first.description).toBeNull();
        expect(inputTypeFields.second.description).toBe('test-input-field-second-description');

        const enumType = transformedSchema.getType('TestEnum') as GraphQLEnumType;
        expect(enumType.description).toBeNull();
        expect(enumType.getValue('FIRST').description).toBeNull();
        expect(enumType.getValue('SECOND').description).toBeNull();

        const queryTestField = transformedSchema.getQueryType().getFields().test;
        expect(queryTestField.description).toBeNull();

        const fieldType = transformedSchema.getType('TestResult') as GraphQLObjectType;
        expect(fieldType.description).toBeNull();

        const fieldTypeFields = fieldType.getFields();
        expect(fieldTypeFields.first.description).toBeNull();
        expect(fieldTypeFields.second.description).toBeNull();
    });
});

const buildSchemaFromFile = (filePath: string): GraphQLSchema => {
    // eslint-disable-next-line unicorn/prefer-module
    const schemaPath = path.join(__dirname, filePath);
    const schemaString = fs.readFileSync(schemaPath, 'utf8');
    return buildSchema(schemaString);
};
