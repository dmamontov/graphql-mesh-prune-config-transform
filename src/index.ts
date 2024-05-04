import { type GraphQLSchema } from 'graphql';
import { type Transform } from '@graphql-tools/delegate';
import { MapperKind, mapSchema } from '@graphql-tools/utils';
import { type PruneConfigTransformConfig } from './types';

export default class PruneConfigTransform implements Transform {
    public noWrap: boolean = false;
    private readonly config: PruneConfigTransformConfig;

    constructor({ config }: { config: PruneConfigTransformConfig }) {
        this.config = config;
    }

    transformSchema(schema: GraphQLSchema): GraphQLSchema {
        const schemaMapper: Record<string, any> = {};
        for (const kind in MapperKind) {
            // @ts-expect-error
            schemaMapper[MapperKind[kind]] = (config: any) => this.prune(config);
        }

        return mapSchema(schema, schemaMapper);
    }

    private prune(config: any): any {
        if (this.config.descriptions && config.description && !config?.extensions?.description) {
            config.description = null;
        }

        return config;
    }
}
