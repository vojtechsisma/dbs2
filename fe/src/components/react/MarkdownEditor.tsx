import { useState } from "react";
import {
  UndoRedo,
  MDXEditor,
  CreateLink,
  CodeToggle,
  listsPlugin,
  quotePlugin,
  toolbarPlugin,
  headingsPlugin,
  BlockTypeSelect,
  linkDialogPlugin,
  thematicBreakPlugin,
  BoldItalicUnderlineToggles,
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";

interface Props {
  defaultValue?: string;
}

const MarkdownEditor = ({ defaultValue }: Props) => {
  const [value, setValue] = useState<string>(defaultValue || "");

  return (
    <>
      <textarea
        name="content"
        id="content"
        className="hidden"
        value={value}
      ></textarea>
      <MDXEditor
        className="[&_a]:underline [&_a]:text-blue-600 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h2]:text-xl [&_h2]:mt-4 [&_h2]:font-bold [&_h3]:text-lg [&_h3]:mt-2 [&_h3]:font-bold [&_p]:my-4 w-full min-h-[20rem] rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkDialogPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles />
                <CreateLink />
                <CodeToggle />
              </>
            ),
          }),
        ]}
        markdown={defaultValue || ""}
        placeholder="Write something..., you can use markdown syntax here."
        onChange={setValue}
      />
    </>
  );
};

export default MarkdownEditor;
