// misc
import api from './api';
import drop from './drop';
import gems from './gems';
import hyperspace from './hyperspace';
import indexRpc from './indexRpc';
import favouriteMint from './favourite-mint';
import userMint from './user-mint';
import mintColor from './mint-color';
import mintNotification from './mint-notification';
import notification from './notification';

// user
import user from './user';

// spaces
import space from './space';
import proposal from './proposal';

// workspace
import workspace from './workspace';

// eslint-disable-next-line import/no-named-as-default
import Anything from '../types/Anything';

import wallet from './wallet';
import claimer from './claimer';
import metadata from './metadata';
import coingecko from './coingecko';
import solscan from './solscan';
import coral from './coral';

export default [
    user,
    api,
    drop,
    indexRpc,
    space,
    workspace,
    proposal,
    wallet,
    claimer,
    gems,
    hyperspace,
    wallet,
    claimer,
    Anything,
    metadata,
    favouriteMint,
    userMint,
    mintColor,
    mintNotification,
    notification,
    coingecko,
    solscan,
    coral
];
