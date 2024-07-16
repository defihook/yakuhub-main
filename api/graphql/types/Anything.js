const { GraphQLScalarType, Kind } = require('graphql');

function parseLiteral(ast) {
    switch (ast.kind) {
        case Kind.BOOLEAN:
        case Kind.STRING:
            return ast.value;
        case Kind.INT:
        case Kind.FLOAT:
            return Number(ast.value);
        case Kind.LIST:
            return ast.values.map(parseLiteral);
        case Kind.OBJECT:
            return ast.fields.reduce((accumulator, field) => {
                accumulator[field.name.value] = parseLiteral(field.value);
                return accumulator;
            }, {});
        case Kind.NULL:
            return null;
        default:
            throw new Error(`Unexpected kind in parseLiteral: ${ast.kind}`);
    }
}

// eslint-disable-next-line import/prefer-default-export
export const Anything = new GraphQLScalarType({
    name: 'Anything',
    description: 'Any value.',
    parseValue: (value) => value,
    parseLiteral,
    serialize: (value) => value
});
