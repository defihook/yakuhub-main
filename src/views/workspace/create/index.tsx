import { useState } from 'react';
import StepList from './step-list';
import ProfileForm from './profile-form';
import UsersForm from './users-form';
import ReviewForm from './review-form';

const Create = () => {
    const address = JSON.parse(localStorage.getItem('address') || '{}');
    console.log('CURRENT_USER: ', address);
    const [step, setStep] = useState<number>(1);
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [image, setImage] = useState<any>(null);
    const [website, setWebsite] = useState<string>('');
    const [twitter, setTwitter] = useState<string>('');
    const [discord, setDiscord] = useState<string>('');
    const [token, setToken] = useState<string>('');
    const [users, setUsers] = useState<any[]>([]);

    return (
        <div className="create-container">
            <div className="create-header">
                <h2 className="primary-title">Create your WorkSpace with Yaku in a few clicks</h2>
                <p className="detail-text text-muted">
                    The most secure and intuitive way to manage on-chain assets individually or together with your team
                </p>
            </div>

            <div className="create-main flex justify-between">
                <div className="create-main-left hidden lg:block">
                    <StepList step={step} setStep={setStep} />
                </div>

                <div className="create-main-right">
                    {step === 1 && (
                        <ProfileForm
                            address={address}
                            setStep={setStep}
                            name={name}
                            setName={setName}
                            description={description}
                            setDescription={setDescription}
                            image={image}
                            setImage={setImage}
                            website={website}
                            setWebsite={setWebsite}
                            twitter={twitter}
                            setTwitter={setTwitter}
                            discord={discord}
                            setDiscord={setDiscord}
                            token={token}
                            setToken={setToken}
                        />
                    )}
                    {step === 2 && <UsersForm setStep={setStep} users={users} setUsers={setUsers} />}
                    {step === 3 && (
                        <ReviewForm
                            address={address}
                            setStep={setStep}
                            name={name}
                            description={description}
                            image={image}
                            website={website}
                            twitter={twitter}
                            discord={discord}
                            token={token}
                            users={users}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Create;
