import Badges from 'components/BadgeIcons';
import '../overview.scss';

const SkillBox = ({ stakedYakuNfts }: any) => {
    console.log('STAKED_YAKU_NFTS', stakedYakuNfts);

    return (
        <section className="mb-4">
            <h2 className="high-text mb-3 text-lg font-bold">Badges</h2>
            {stakedYakuNfts.length > 0 ? (
                <div className="flex items-center gap-2">
                    <Badges icon="BadgeIconLemon" alt="Yaku Holder" />

                    {stakedYakuNfts.filter((el: any) => el.amount >= 2000000000 && el.amount < 4000000000) && (
                        <Badges icon="BadgeIconMotor" alt="Bike Holder" />
                    )}

                    {stakedYakuNfts.filter((el: any) => el.amount === 4000000000).length > 9 && (
                        <Badges icon="BadgeIconWhale" alt="Whale" />
                    )}

                    {stakedYakuNfts.filter((el: any) => el.amount === 36000000000) && (
                        <Badges icon="BadgeIconDiamond" alt="Mansion Owner" />
                    )}
                </div>
            ) : (
                <p className="mid-text text-center">No badges</p>
            )}
        </section>
    );
};

export default SkillBox;
