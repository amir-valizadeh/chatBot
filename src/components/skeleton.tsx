import React from 'react';

interface MessageSkeletonLoaderProps {
    count?: number;
}

const MessageSkeletonLoader: React.FC<MessageSkeletonLoaderProps> = ({ count = 3 }) => {
    return (
        <>
            {/* User message skeleton */}
            {Array(count).fill(0).map((_, index) => (
                <React.Fragment key={index}>
                    {/* User message - right aligned */}
                    <div className="max-w-3/4 mb-4 self-end">
                        <div className="p-3 rounded-lg bg-blue-50 text-right">
                            <div className="h-4 bg-blue-100 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-blue-100 rounded w-1/2"></div>
                        </div>
                    </div>

                    {/* Bot message - left aligned */}
                    <div className="max-w-3/4 mb-4 self-start">
                        <div className="p-3 rounded-lg bg-gray-50 text-right">
                            <div className="h-4 bg-gray-100 rounded w-5/6 mb-2"></div>
                            <div className="h-4 bg-gray-100 rounded w-4/5 mb-2"></div>
                            <div className="h-4 bg-gray-100 rounded w-3/5"></div>
                        </div>
                    </div>
                </React.Fragment>
            ))}
        </>
    );
};

export {MessageSkeletonLoader};

interface SidebarSkeletonLoaderProps {
    itemCount?: number;
}

const SidebarSkeletonLoader: React.FC<SidebarSkeletonLoaderProps> = ({ itemCount = 5 }) => {
    return (
        <div className="w-full">
            {/* Header section */}
            <div className="flex flex-col items-end gap-4 mb-4">
                <div className="h-6 bg-gray-200 rounded w-24"></div>
                <div className="flex gap-2 w-full items-center">
                    <div className="h-5 bg-gray-200 rounded w-5 mr-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-5 bg-gray-200 rounded w-5"></div>
                </div>
            </div>

            {/* Today section */}
            <div className="mb-4">
                <div className="h-4 bg-gray-200 rounded w-16 mb-3 ml-auto"></div>
                {Array(itemCount).fill(0).map((_, index) => (
                    <div
                        key={`today-${index}`}
                        className="h-5 bg-gray-200 rounded w-full mb-3"
                    ></div>
                ))}
            </div>

            {/* Last 7 days section */}
            <div className="mb-4">
                <div className="h-4 bg-gray-200 rounded w-20 mb-3 ml-auto"></div>
                {Array(Math.max(1, Math.floor(itemCount / 2))).fill(0).map((_, index) => (
                    <div
                        key={`week-${index}`}
                        className="h-5 bg-gray-200 rounded w-full mb-3"
                    ></div>
                ))}
            </div>
        </div>
    );
};

export {SidebarSkeletonLoader};