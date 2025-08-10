import type { Components } from "react-markdown";
import { cx } from "../utils/common";

export const mdComponents: Components = {
  pre({ ...props }: React.HTMLAttributes<HTMLPreElement>) {
    return (
      <pre
        {...props}
        className={cx(
          props.className,
          "max-w-full overflow-x-auto whitespace-pre-wrap break-words",
          "my-0 rounded-lg"
        )}
      />
    );
  },
  code({
    inline,
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) {
    return (
      <code
        {...props}
        className={cx(
          className,
          inline ? "break-words" : "break-words whitespace-pre-wrap"
        )}
      >
        {children}
      </code>
    );
  },
  table(props: React.TableHTMLAttributes<HTMLTableElement>) {
    return (
      <div className="overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent dark:scrollbar-thumb-gray-600">
        <table
          {...props}
          className="border-collapse border border-gray-400 dark:border-gray-600 my-2 w-full max-w-full"
        />
      </div>
    );
  },
  th(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
    return (
      <th
        {...props}
        className="border border-gray-400 dark:border-gray-600 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-left"
      />
    );
  },
  td(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
    return (
      <td
        {...props}
        className="border border-gray-400 dark:border-gray-600 px-2 py-1"
      />
    );
  },
};
