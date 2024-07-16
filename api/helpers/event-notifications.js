import { MintNotification, Notification } from '../models/models';
import moment from 'moment';
import { filter } from 'lodash';
import { Promise } from 'bluebird';

const runCronJob = async () => {
    const all = await MintNotification.find({ notified: '' });
    const ids = [];
    await Promise.each(
        filter(
            all,
            ({ notified, date }) => !notified && moment(date).diff(moment(), 'days') <= 1 && moment(date).diff(moment(), 'days') > 0
        ),
        async (current) => {
            const { date, userId, title, _id } = current;
            const description = `The mint ${title} is ${moment(date).fromNow()}! Get ready.`;
            const found = await Notification.find({ userId, description });
            if (!found || found.length === 0) {
                await Notification.create({
                    userId,
                    title: `The mint of ${title} is coming!`,
                    description,
                    date: moment().toISOString(),
                    icon: 'planet',
                    status: 'unread'
                });
                ids.push(_id);
            }
        }
    );
    await MintNotification.updateMany(
        {
            _id: {
                $in: ids
            }
        },
        { notified: moment().toISOString() }
    );
};

export default runCronJob;
