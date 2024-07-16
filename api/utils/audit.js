import Audit from '../models/audit';

const log = async (params) => {
    const { context, ...otherParams } = params;
    const { req, user } = context;
    await Audit.create({
        user,
        ip: req.ip,
        wallet: user.wallet,
        ...otherParams
    });
};

export default log;
