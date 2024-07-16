import BadgeIconAward1 from '../assets/images/icons/badges/badge-1.svg';
import BadgeIconAward from '../assets/images/icons/badges/award.svg';
import BadgeIconBadge from '../assets/images/icons/badges/badge.svg';
import BadgeIconBestEssay from '../assets/images/icons/badges/best-essay-award.svg';
import BadgeIconBestSinger from '../assets/images/icons/badges/best-singer-award.svg';
import BadgeIconBronzeCup from '../assets/images/icons/badges/bronze-cup.svg';
import BadgeIconBronzeStar from '../assets/images/icons/badges/bronze-star-medal.svg';
import BadgeIconCert from '../assets/images/icons/badges/certificate.svg';
import BadgeIconDiamond1 from '../assets/images/icons/badges/diamond-1.svg';
import BadgeIconDiamond from '../assets/images/icons/badges/diamond.svg';
import BadgeIconDiploma from '../assets/images/icons/badges/diploma.svg';
import BadgeIconDiscord from '../assets/images/icons/badges/discord.svg';
import BadgeIconGemstone1 from '../assets/images/icons/badges/gemstone-1.svg';
import BadgeIconGemstone from '../assets/images/icons/badges/gemstone.svg';
import BadgeIconGoldMedal from '../assets/images/icons/badges/gold-medal.svg';
import BadgeIconLemon from '../assets/images/icons/badges/lemon.svg';
import BadgeIconMotor from '../assets/images/icons/badges/motocross.svg';
import BadgeIconRocket from '../assets/images/icons/badges/rocket.svg';
import BadgeIconShield from '../assets/images/icons/badges/shield.svg';
import BadgeIconSilverStar from '../assets/images/icons/badges/silver-star-medal.svg';
import BadgeIconStarCup from '../assets/images/icons/badges/star-cup.svg';
import BadgeIconStarMedal from '../assets/images/icons/badges/star-medal.svg';
import BadgeIconStar from '../assets/images/icons/badges/star.svg';
import BadgeIconThirdBadge from '../assets/images/icons/badges/third-badge.svg';
import BadgeIconThumbUp from '../assets/images/icons/badges/thumb-up-medal.svg';
import BadgeIconTrophy from '../assets/images/icons/badges/trophy.svg';
import BadgeIconTwitter from '../assets/images/icons/badges/twitter.svg';
import BadgeIconWhale from '../assets/images/icons/badges/whale.svg';
import BadgeIconSales from '../assets/images/icons/badges/winner.svg';
import { Avatar, Tooltip } from '@mui/material';

const BadgeIcons: Record<string, string> = {
    BadgeIconAward1,
    BadgeIconAward,
    BadgeIconBadge,
    BadgeIconBestEssay,
    BadgeIconBestSinger,
    BadgeIconBronzeCup,
    BadgeIconBronzeStar,
    BadgeIconCert,
    BadgeIconDiamond1,
    BadgeIconDiamond,
    BadgeIconDiploma,
    BadgeIconDiscord,
    BadgeIconGemstone,
    BadgeIconGemstone1,
    BadgeIconGoldMedal,
    BadgeIconLemon,
    BadgeIconMotor,
    BadgeIconRocket,
    BadgeIconShield,
    BadgeIconSilverStar,
    BadgeIconStarCup,
    BadgeIconStarMedal,
    BadgeIconStar,
    BadgeIconThirdBadge,
    BadgeIconThumbUp,
    BadgeIconTrophy,
    BadgeIconTwitter,
    BadgeIconWhale,
    BadgeIconSales
};

const Badges = ({ icon, size = 24, alt }: any) => (
    <Tooltip title={alt}>
        <Avatar src={BadgeIcons[icon]} sx={{ width: size, height: size, objectFit: 'contain', backgroundColor: 'transparent' }} alt={alt} />
    </Tooltip>
);

export default Badges;
