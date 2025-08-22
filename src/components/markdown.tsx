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
          "my-0 rounded-lg border",
          // light
          "bg-gray-50 text-gray-900 border-gray-200",
          // dark
          "dark:bg-gray-900/60 dark:text-gray-100 dark:border-gray-700"
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
          inline
            ? [
                "break-words px-1.5 py-0.5 rounded",
                "bg-gray-100 text-gray-900",
                "dark:bg-gray-800/70 dark:text-gray-100",
              ].join(" ")
            : "break-words whitespace-pre-wrap"
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
          className={cx(
            "my-2 w-full max-w-full border-collapse border",
            // light
            "border-gray-300 text-gray-900",
            // dark
            "dark:border-gray-700 dark:text-gray-100"
          )}
        />
      </div>
    );
  },

  th(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
    return (
      <th
        {...props}
        className={cx(
          "px-2 py-1 text-left border font-semibold",
          // light
          "border-gray-300 bg-gray-100 text-gray-900",
          // dark
          "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        )}
      />
    );
  },

  td(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
    return (
      <td
        {...props}
        className={cx(
          "px-2 py-1 border",
          // light
          "border-gray-300 text-gray-800",
          // dark (slightly dimmer than header but still ≥4.5:1 contrast)
          "dark:border-gray-700 dark:text-gray-200"
        )}
      />
    );
  },
};
