import directives from './directives';
// misc
import root from './root';
import api from './api';
import drop from './drop';
import indexRpc from './indexRpc';
import gems from './gems';
import hyperspace from './hyperspace';
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
import metadata from './metadata';
import coingecko from './coingecko';
import solscan from './solscan';

// workspace
import workspace from './workspace';

import wallet from './wallet';
import claimer from './claimer';
import coral from './coral';

export default [
    directives,
    user,
    space,
    proposal,
    workspace,
    api,
    drop,
    indexRpc,
    wallet,
    claimer,
    root,
    gems,
    hyperspace,
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
