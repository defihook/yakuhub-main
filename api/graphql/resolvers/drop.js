import GraphQLJSON from 'graphql-type-json';
import { flatten, groupBy, map } from 'lodash';
import Drop from '../../models/drop';

export default {
    JSON: GraphQLJSON,
    Query: {
        getDrops: async (_source, _args, { dataSources }) => {
            const data = await dataSources.dropsAPI.fetchDrops();
            if (data && data.result && data.result.data) {
                const dropGroups = data.result.data;
                const array = flatten(map(Object.keys(dropGroups), (date) => dropGroups[date]));
                console.log(array.length);
                try {
                    await Drop.insertMany(array, { ordered: false });
                } catch (error) {
                    console.error('Ignore insert error');
                }
            }
            const dropData = await Drop.find();
            return groupBy(dropData, 'date');
        },
        fetchRanks: async (_source, _args, { dataSources }) => {
            const data = await dataSources.dropsAPI.fetchRanks();
            return data.result.data;
        }
    }
};
