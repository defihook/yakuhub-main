import { Notification } from '../../models/models';

export default {
    Query: {
        getNotificationsByUserId: async (root, args, context, info) => {
            return await Notification.find({ userId: context.user.id });
        }
    },
    Mutation: {
        createNotification: async (root, args, context, info) => {
            return await new Notification({
                title: args.title,
                date: args.date,
                description: args.description,
                icon: args.icon,
                status: args.status,
                userId: context.user.id
            }).save();
        },
        updateNotificationStatus: async (root, args, context, info) => {
            const result = await Notification.findByIdAndUpdate(args.id, { status: args.status }, { new: true });
            return result ? true : false;
        },
        updateAllNotificationsStatus: async (root, args, context, info) => {
            const result = await Notification.updateMany({ userId: context.user.id }, { status: args.status });
            return result ? true : false;
        },
        deleteNotification: async (root, args, context, info) => {
            const result = await Notification.findByIdAndDelete(args.id);
            return result ? true : false;
        }
    }
};
