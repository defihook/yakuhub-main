import { useRoutes } from 'react-router-dom';

// routes
import MainRoutes from './MainRoutes';
import YakuRoutes from './YakuRoutes';

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
    return useRoutes([MainRoutes, YakuRoutes]);
}
