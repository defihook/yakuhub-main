import { toast } from 'react-toastify';

export const useToasts = () => {
    const showInfoToast = (message: string | any) => {
        console.log(message);
        toast.info(message);
    };
    const showErrorToast = (message: string | any) => toast.error(message);
    const showSuccessToast = (message: string | any) => toast.success(message);
    const showWarningToast = (message: string | any) => toast.warning(message);
    const showLoadingToast = (message: string | any) => toast.loading(message);
    const dismissToast = () => toast.dismiss();

    return {
        showInfoToast,
        showErrorToast,
        showSuccessToast,
        showWarningToast,
        showLoadingToast,
        dismissToast
    };
};

export default useToasts;
