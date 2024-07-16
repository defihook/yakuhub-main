import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver } from 'graphql';

export default function isAuthenticated(schema, directiveName) {
    return mapSchema(schema, {
        // Executes once for each object field definition in the schema
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
            // Check whether this field has the specified directive
            const isAuthenticatedDirective = getDirective(schema, fieldConfig, directiveName)
                ? getDirective(schema, fieldConfig, directiveName)[0]
                : undefined;

            if (isAuthenticatedDirective) {
                // Get this field's original resolver
                const { resolve = defaultFieldResolver } = fieldConfig;

                fieldConfig.resolve = async function (source, args, context, info) {
                    if (!context.user) throw new AuthenticationError('Missing token.');
                    const result = await resolve(source, args, context, info);
                    return result;
                };
                return fieldConfig;
            }
        }
    });
}
