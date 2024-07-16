import { ApolloCache, DefaultContext, MutationFunctionOptions, OperationVariables } from '@apollo/client';
import { MouseEvent, TouchEvent } from 'react';

export type NotificationsContextType = {
    anchorRef: any;
    open: boolean;
    notifications: any[];
    unreadCount: number;
    handleToggle: () => void;
    handleClose: (event: MouseEvent<HTMLDivElement> | MouseEvent | TouchEvent) => void;
    createNotification: ({ title, description, icon }: any) => Promise<any>;
    reloadNotifications: () => Promise<void>;
    updateAllStatus: (
        options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined
    ) => Promise<any>;
    updateStatus: (
        options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined
    ) => Promise<any>;
    deleteNotification: (
        options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>> | undefined
    ) => Promise<any>;
};

export enum NotificationStatus {
    ALL = 'all',
    READ = 'read',
    UNREAD = 'unread'
}
