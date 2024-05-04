# Prune Config Transform for GraphQL Mesh

This README provides a detailed guide on how to integrate and use the Prune Config Transform in your GraphQL Mesh setup. This transform plugin allows you to selectively remove descriptions from your GraphQL schema, which can be useful for minimizing the size of the schema or for privacy reasons.

## Installation

Before you can use the Prune Config Transform, you need to install it along with GraphQL Mesh if you haven't already done so. You can install these using npm or yarn.

```bash
npm install @dmamontov/graphql-mesh-prune-config-transform
```

or

```bash
yarn add @dmamontov/graphql-mesh-prune-config-transform
```

## Configuration

### Modifying tsconfig.json

To make TypeScript recognize the Prune Config Transform, you need to add an alias in your tsconfig.json.

Add the following paths configuration under the compilerOptions in your tsconfig.json file:

```json
{
  "compilerOptions": {
    "paths": {
       "prune-config": ["node_modules/@dmamontov/graphql-mesh-prune-config-transform"]
    }
  }
}
```

### Adding the Transform to GraphQL Mesh

You need to include the Prune Config Transform in your GraphQL Mesh configuration file (usually .meshrc.yaml). Below is an example configuration that demonstrates how to use this transform:

```yaml
transforms:
  - pruneConfig:
      descriptions: true
```

## Conclusion

Remember, always test your configurations in a development environment before applying them in production to ensure that everything works as expected.