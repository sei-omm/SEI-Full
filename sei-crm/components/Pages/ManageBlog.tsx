"use client";

import React, { useEffect, useRef } from "react";
import Editor from "../Editor";
import Input from "../Input";
import ChooseFileInput from "../ChooseFileInput";
import { InfoLayout } from "../Account/InfoLayout";
import TextArea from "../TextArea";

// interface IProps {
//   blog_id: number | "add";
// }

export default function ManageBlog() {
  // const isNew = blog_id === "add";

  const blogContentRef = useRef<string>("");

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--ckeditor5-preview-height",
      "850px"
    );
  }, []);

  return (
    <div key={Math.random()}>
      {/* <Tabs
        tabs={[
          {
            name: "Basic Info",
            slug: "?tab=basic",
          },
        ]}
      /> */}

      <form className="space-y-5">
        <InfoLayout className="w-full space-y-5">
          <ChooseFileInput
            id="choose_thumbnail"
            label="Choose Blog Thumbnail"
            fileName="Choose Blog Thumbnail"
            disableUpload // remove after testing
            accept="image/*"
          />
          <Input placeholder="Type Your Blog Heading" label="Blog Heading *" />

          <Editor
            storageFolderName="blogs"
            label="Blog Content"
            textEditorContentRef={blogContentRef}
          />
        </InfoLayout>

        <InfoLayout className="w-full space-y-3">
          <h2 className="font-semibold text-xl">Blog Meta Info</h2>
          <div className="space-y-3">
            <Input
              label="Blog Meta Title"
              name="meta_title"
              placeholder="Type Blog Meta Title"
            />
            <TextArea
              label="Blog Meta Description"
              name="meta_description"
              placeholder="Type Blog Meta Description"
            />
            <Input
              label="Blog Keywords"
              name="meta_keywords"
              placeholder="Keyword 1, Keyword 2, Keyword 3"
            />
            <Input
              label="Canonical Url"
              name="meta_canonical_url"
              placeholder="https://www.seiedutrust.com"
            />
          </div>
        </InfoLayout>
      </form>
    </div>
  );
}
