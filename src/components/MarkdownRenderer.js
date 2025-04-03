import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const MarkdownRenderer = ({ content }) => {
  return (
    <article className="prose prose-lg md:prose-xl lg:prose-2xl mx-auto dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeRaw]} 
        components={{
          h1: ({ node, ...props }) => <h1 className="text-xl sm:text-4xl md:text-5xl font-bold mt-6 mb-4" {...props} />, 
          h2: ({ node, ...props }) => <h2 className="text-lg sm:text-3xl md:text-4xl font-semibold mt-5 mb-3" {...props} />, 
          h3: ({ node, ...props }) => <h3 className="text-md sm:text-2xl md:text-3xl font-medium mt-4 mb-2" {...props} />, 
          h4: ({ node, ...props }) => <h4 className="text-lg sm:text-xl md:text-2xl font-medium mt-3 mb-2" {...props} />, 
          h5: ({ node, ...props }) => <h5 className="text-base sm:text-lg md:text-xl font-medium mt-2 mb-1" {...props} />, 
          h6: ({ node, ...props }) => <h6 className="text-sm sm:text-base md:text-lg font-medium mt-1 mb-1" {...props} />, 
          
          // Paragraph
          p: ({ node, ...props }) => <p className="text-base sm:text-lg md:text-lg leading-relaxed mb-4" {...props} />, 

          // Lists
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 sm:pl-6 md:pl-8 mb-4" {...props} />, 
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 sm:pl-6 md:pl-8 mb-4" {...props} />, 

          // Table
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-600" {...props} />
            </div>
          ), 
          th: ({ node, ...props }) => <th className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 p-2 text-left" {...props} />, 
          td: ({ node, ...props }) => <td className="border border-gray-300 dark:border-gray-600 p-2" {...props} />, 

          // Images
          img: ({ node, ...props }) => <img className="w-full max-w-3xl mx-auto rounded-lg shadow-lg" {...props} />, 

          // Blockquotes
          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-500 pl-4 italic my-4 text-lg sm:text-xl" {...props} />, 

          // Code Blocks
          code({ node, inline, className, children, ...props }) {
            return inline ? (
              <code className="bg-gray-200 dark:bg-gray-800 text-sm px-1 py-0.5 rounded" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto">
                <code {...props}>{children}</code>
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
};

export default MarkdownRenderer;
