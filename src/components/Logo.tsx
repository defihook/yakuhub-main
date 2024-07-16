// material-ui
import { useTheme } from '@mui/material/styles';
import { IMAGE_PROXY_LOGO } from 'config/config';

const LOGO_DARK = `https://ik.imagekit.io/g1noocuou2/Yakushima_Studios/YakuXlogo_dark.png?ik-sdk-version=javascript-1.4.3&updatedAt=1655990182347&tr:w-160`;
const LOGO_LIGHT = `https://ik.imagekit.io/g1noocuou2/Yakushima_Studios/YakuXlogo_light.png?ik-sdk-version=javascript-1.4.3&updatedAt=1655990182347&tr:w-160`;

// ==============================|| LOGO SVG ||============================== //

const Logo = () => {
    const theme = useTheme();

    return (
        <img
            src={`${IMAGE_PROXY_LOGO}${theme.palette.mode === 'dark' ? LOGO_LIGHT : LOGO_DARK}`}
            alt="Yaku Labs"
            width="160"
            style={{ verticalAlign: 'middle', paddingTop: '2px' }}
        />
    );
};

export default Logo;
