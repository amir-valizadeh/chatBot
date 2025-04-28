import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';
import { Message } from "./ChatComponent.tsx";

const isRTL = (text: string) => {
    const farsiPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
    const latinPattern = /[A-Za-z]/g;

    const farsiMatches = text.match(farsiPattern) || [];
    const latinMatches = text.match(latinPattern) || [];

    return farsiMatches.length > latinMatches.length;
};

// Chat message component with markdown support
const ChatMessages = ({ chatHistory }: { chatHistory: Message[] }) => {

    const markdownComponents: Components = {
        code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const isInline = !className || className.indexOf('language-') === -1;

            if (!isInline && language ) {
                return (
                    <SyntaxHighlighter
                        style={dark}
                        language={language}
                        PreTag="div"
                        {...props}
                    >
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                );
            }

            return isInline ? (
                <code className="bg-gray-200 px-1 py-0.5 rounded text-red-500" {...props}>
                    {children}
                </code>
            ) : (
                <SyntaxHighlighter
                    style={dark }
                    language="text"
                    PreTag="div"
                    {...props}
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            );
        },
        // Customize other markdown elements with proper typing
        h3: ({ children }) => <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>,
        ul: ({ children }) => (
            <ul className="list-inside pl-0 rtl:pr-0 mb-4" style={{ listStylePosition: 'inside' }}>
                {children}
            </ul>
        ),
        ol: ({ children }) => (
            <ol className="list-inside pl-0 rtl:pr-0 mb-4" style={{ listStylePosition: 'inside' }}>
                {children}
            </ol>
        ),
        li: ({ children }) => <li className="mb-1">{children}</li>,
        p: ({ children }) => <p className="mb-2">{children}</p>,
        a: ({ href, children }) => (
            <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                {children}
            </a>
        ),
    };

    return (
        <div className="flex flex-col w-full">
            {chatHistory.map((message) => (
                <div
                    key={message.id}
                    className={`max-w-3/4 md:max-w-3/4 sm:max-w-[85%] mb-4 ${
                        message.sender === 'user' ? 'self-end' : 'self-start'
                    }`}
                >
                    <div
                        className={`p-3 rounded-lg font-vazirmatn ${
                            message.sender === 'user' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}
                        dir="auto"
                    >
                        <div
                            className="markdown-content"
                            lang={isRTL(message.text) ? "fa" : "en"}
                            dir={isRTL(message.text) ? "rtl" : "ltr"}
                        >
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                            >
                                {message.text}
                            </ReactMarkdown>
                        </div>
                        {renderAttachment(message)}
                    </div>
                </div>
            ))}
        </div>
    );
};

const handleDownload = (isImage: boolean, filename: string): void => {
    const baseUrl = isImage
        ? `${import.meta.env.VITE_API_BASE_URL || 'http://hurosh.pegaheaftab.com/backend'}/get-image/${import.meta.env.VITE_COMPANY_NAME || 'pegah'}/${filename}`
        : `${import.meta.env.VITE_API_BASE_URL || 'http://hurosh.pegaheaftab.com/backend'}/download-file/${import.meta.env.VITE_COMPANY_NAME || 'pegah'}/${filename}`;

    // Open in new tab or trigger download
    window.open(baseUrl, '_blank');
};

const renderAttachment = (message: Message) => {
    if (message.server_filename) {
        return (
            <div className="mt-2 text-xs md:text-xs text-blue-500 cursor-pointer" onClick={() => handleDownload(false, message.server_filename!)}>
                دانلود فایل
            </div>
        );
    } else if (message.image_name) {
        return (
            <div className="mt-2">
                <div className="text-xs md:text-xs text-blue-500 cursor-pointer" onClick={() => handleDownload(true, message.image_name!)}>
                    دانلود تصویر
                </div>
            </div>
        );
    }
    return null;
};

export default ChatMessages;