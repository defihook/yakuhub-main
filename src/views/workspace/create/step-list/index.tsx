import { Dispatch, SetStateAction } from 'react';

const Steps = [
    {
        step: 1,
        title: 'Create your WorkSpace',
        detail: 'Add a profile picture for your WorkSpace (JPEG, PNG or GIF), give it a name and add a description. WorkSpace details can also be changed after deployment'
    },
    {
        step: 2,
        title: 'Add users',
        detail: 'Add users who will access and use the WorkSpace and their roles in your team (it will appear in their Yaku profile). They can be changed after WorkSpace deployment'
    },
    {
        step: 3,
        title: 'Review and confirm',
        detail: 'One last look at the selected parameters before the WorkSpace is deployed'
    }
];

interface StepListProps {
    step: number;
    setStep: Dispatch<SetStateAction<number>>;
}

const StepList = ({ step, setStep }: StepListProps) => {
    const circleStyle = (currentStep: number) => {
        if (currentStep === step) {
            return 'active';
        }
        if (currentStep < step) {
            return 'passed';
        }
        return '';
    };

    return (
        <ul className="mb-0">
            {Steps.map((el, idx) => (
                <li key={idx} className="step-list">
                    <span className={circleStyle(el.step)} />
                    <div>
                        <h3 className={`secondary-title ${step >= el.step ? '' : 'text-muted'}`}>{el.title}</h3>
                        <p className={`detail-text mt-1 ${step >= el.step ? 'text-white' : 'text-muted'}`}>{el.detail}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default StepList;
