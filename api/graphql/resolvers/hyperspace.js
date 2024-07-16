import { filter, map } from 'lodash';
import Leaderboard from '../../models/leaderboard';
import { ETH } from '../../utils/chain';

export default {
    Query: {
        getProjectStats: async (_source, args, { dataSources }) => {
            if (args.condition && args.condition.projectIds) {
                const statsData = await Leaderboard.find({
                    'stats.project_id': {
                        $in: args.condition.projectIds
                    }
                });
                if (statsData.length === args.condition.projectIds.length) {
                    return {
                        project_stats: map(statsData, ({ stats }) => stats),
                        pagination_info: {
                            current_page_number: 1,
                            current_page_size: statsData.length,
                            has_next_page: false,
                            total_page_number: 1
                        }
                    };
                }
            }
            let data;
            if (args.chain === ETH) {
                data = await dataSources.gemsAPI.getProjectStats(args.condition, args.orderBy, args.paginationInfo);
                return data;
            }
            data = await dataSources.hyperspaceAPI.getProjectStats(args.condition, args.orderBy, args.paginationInfo);
            const projectsStats = data.project_stats;
            await Leaderboard.bulkWrite(
                map(projectsStats, (stats) => ({
                    updateOne: {
                        filter: { type: 'project', 'stats.project_id': stats.project_id },
                        update: { $set: { stats } },
                        upsert: true
                    }
                }))
            );
            if (args.condition.projectIds) {
                const stats = await Leaderboard.find({
                    'stats.project_id': {
                        $in: args.condition.projectIds
                    }
                });
                return { project_stats: stats, pagination_info: data.pagination_info };
            }
            return data;
        },
        getLeaderboards: async (_source, args, { dataSources }) => {
            const {
                condition = {
                    volume_1day: 1000,
                    volume_1hr: 100
                }
            } = args;
            try {
                const topVolMovers = await dataSources.hyperspaceAPI.getProjectStats(
                    { is_verified: true },
                    { field_name: 'volume_1day', sort_order: 'DESC' },
                    { page_number: 1, page_size: 3 }
                );
                const topSales = await dataSources.hyperspaceAPI.getProjectStats(
                    { is_verified: true },
                    { field_name: 'volume_7day', sort_order: 'DESC' },
                    { page_number: 1, page_size: 3 }
                );
                const topFloorMovers = await dataSources.hyperspaceAPI.getProjectStats(
                    { is_verified: true },
                    { field_name: 'floor_price_1day_change', sort_order: 'DESC' },
                    { page_number: 1, page_size: 300 }
                );
                const result = {
                    topVolMovers: topVolMovers.project_stats,
                    topSales: topSales.project_stats,
                    topFloorMovers: filter(
                        topFloorMovers?.project_stats,
                        ({ project, volume_1day, volume_1hr }) =>
                            volume_1day > condition.volume_1day && volume_1hr > condition.volume_1hr && project.me_slug
                    ).slice(0, 3)
                };
                const leaders = await Leaderboard.findOneAndUpdate({ type: 'dashboard' }, result, { new: true, upsert: true });
                return leaders;
            } catch (error) {
                console.error(error);
                const leaders = await Leaderboard.findOne({ type: 'dashboard' });
                return leaders;
            }
        },
        getYakuCollectionsStats: async (_source, args, { dataSources }) => {
            const { project_stats } = await dataSources.hyperspaceAPI.getProjectStats({ projectIds: ['yakucorp1', 'capsulex', 'yakux'] });
            const data = await dataSources.magicEdenAPI.fetchStats('yaku_corp_capsulex');
            let projectsStats = project_stats;
            if (data && project_stats) {
                projectsStats = map(project_stats, (prj) =>
                    prj.project_id === 'capsulex'
                        ? {
                              ...prj,
                              num_of_token_listed: data[0]?.listedCount,
                              project: { supply: 6489 }
                          }
                        : prj
                );
            }

            const stats = await Leaderboard.findOneAndUpdate(
                { type: 'yakuCollections' },
                { stats: projectsStats },
                { new: true, upsert: true }
            );

            return stats;
        },
        searchProjectByName: async (_source, args, { dataSources }) => {
            let data;
            if (args.chain === ETH) {
                data = await dataSources.gemsAPI.searchProjectByName(args.condition);
                return data;
            }
            data = await dataSources.hyperspaceAPI.searchProjectByName(args.condition);
            return data;
        },
        getProjectStatHistory: async (_source, args, { dataSources }) => {
            const data = await dataSources.hyperspaceAPI.getProjectStatHistory(args.condition);
            return data;
        },
        getMarketplaceSnapshot: async (_source, args, { dataSources, user }) => {
            let data;
            if (args.chain === ETH) {
                data = await dataSources.gemsAPI.getMarketplaceSnapshot(args.condition, args.orderBy, args.paginationInfo);
                return data;
            }
            data = await dataSources.hyperspaceAPI.getMarketplaceSnapshot(args.condition, args.orderBy, args.paginationInfo);
            return data;
        },
        getMarketplaceActivities: async (_source, args, { dataSources, user }) => {
            let data;
            if (args.chain === ETH) {
                data = await dataSources.gemsAPI.getMarketplaceActivities(args.condition, args.paginationInfo);
                return data;
            }
            data = await dataSources.hyperspaceAPI.getMarketplaceActivities(args.condition, args.paginationInfo);
            return data;
        },
        getNonMpaProjectHistory: async (_source, args, { dataSources, user }) => {
            const data = await dataSources.hyperspaceAPI.getNonMpaProjectHistory(args.condition, args.paginationInfo);
            return data;
        },
        getTokenHistory: async (_source, args, { dataSources }) => {
            const data = await dataSources.hyperspaceAPI.getTokenHistory(args.condition, args.paginationInfo);
            return data;
        },
        getTokenState: async (_source, args, { dataSources }) => {
            const data = await dataSources.hyperspaceAPI.getTokenState(args.condition, args.orderBy, args.paginationInfo);
            return data;
        },
        getWalletStats: async (_source, args, { dataSources }) => {
            const data = await dataSources.hyperspaceAPI.getWalletStats(args.condition, args.orderBy, args.paginationInfo);
            return data;
        },
        getWalletStatsHist: async (_source, args, { dataSources }) => {
            const data = await dataSources.hyperspaceAPI.getWalletStatsHist(args.condition);
            return data;
        },
        getUserListings: async (_source, args, { dataSources }) => {
            const data = await dataSources.hyperspaceAPI.getUserListings(args.condition);
            return data;
        }
    },
    Mutation: {
        createBuyTx: async (_source, args, { dataSources }) => {
            let data;
            if (args.chain === ETH) {
                data = await dataSources.gemsAPI.createBuyTx(args.buyerAddress, args.tokens);
                return data;
            }
            data = await dataSources.hyperspaceAPI.createBuyTx(args.buyerAddress, args.price, args.tokenAddress, args.buyerBroker);
            return data;
        },
        createDelistTx: async (_source, args, { dataSources }) => {
            const data = await dataSources.hyperspaceAPI.createDelistTx(args.sellerAddress, args.tokenAddress);
            return data;
        }
    }
};
