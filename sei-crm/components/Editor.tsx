import { useState, useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";

import {
  DecoupledEditor,
  AccessibilityHelp,
  Alignment,
  Autoformat,
  AutoImage,
  AutoLink,
  Autosave,
  BalloonToolbar,
  BlockQuote,
  BlockToolbar,
  Bold,
  Code,
  CodeBlock,
  Essentials,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  HtmlComment,
  HtmlEmbed,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  Paragraph,
  RemoveFormat,
  SelectAll,
  ShowBlocks,
  SimpleUploadAdapter,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Style,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  Underline,
  Undo,
  EditorConfig,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import "@/app/editor.css";
import { uploadToVercel } from "@/utils/uploadToVercel";

interface IProps {
  defaultValue?: string;
  textEditorContentRef: React.MutableRefObject<string>;
  label?: string;
  storageFolderName: string;
}

export default function Editor({
  defaultValue,
  textEditorContentRef,
  label,
  storageFolderName,
}: IProps) {
  const editorContainerRef = useRef<any>(null);
  const editorMenuBarRef = useRef<HTMLDivElement>(null);
  const editorToolbarRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef(null);

  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    setIsLayoutReady(true);

    return () => setIsLayoutReady(false);
  }, []);

  function uploadAdapter(loader: any) {
    return {
      upload: () => {
        return new Promise((resolve, reject) => {
          loader.file.then((file: File) => {
            uploadToVercel({
              fileName: [`/${storageFolderName}/${file.name}`],
              file: [file],
              endPoint: "/upload/editor",
              convartToWebp: file.type.includes("image"),
              onUploaded(blob) {
                resolve({ default: blob[0].url });
              },
              onError(error) {
                reject(error.message);
              },
            });
          });
        });
      },
    };
  }

  function uploadPlugin(editor: any) {
    editor.plugins.get("FileRepository").createUploadAdapter = (
      loader: any
    ) => {
      return uploadAdapter(loader);
    };
  }
  const editorConfig: EditorConfig | undefined = {
    toolbar: {
      items: [
        "undo",
        "redo",
        "|",
        "showBlocks",
        "findAndReplace",
        "selectAll",
        "|",
        "heading",
        "style",
        "|",
        "fontSize",
        "fontFamily",
        "fontColor",
        "fontBackgroundColor",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "subscript",
        "superscript",
        "code",
        "removeFormat",
        "|",
        "specialCharacters",
        "horizontalLine",
        "link",
        "insertImage",
        "insertImageViaUrl",
        "insertTable",
        "highlight",
        "blockQuote",
        "codeBlock",
        "htmlEmbed",
        "|",
        "alignment",
        "|",
        "indent",
        "outdent",
        "|",
        "accessibilityHelp",
      ],
      shouldNotGroupWhenFull: false,
    },
    htmlEmbed: {
      showPreviews: true,
    },
    extraPlugins: [uploadPlugin],
    plugins: [
      AccessibilityHelp,
      Alignment,
      Autoformat,
      AutoImage,
      AutoLink,
      Autosave,
      BalloonToolbar,
      BlockQuote,
      BlockToolbar,
      Bold,
      Code,
      CodeBlock,
      Essentials,
      FindAndReplace,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      GeneralHtmlSupport,
      Heading,
      Highlight,
      HorizontalLine,
      HtmlComment,
      HtmlEmbed,
      ImageBlock,
      ImageCaption,
      ImageInline,
      ImageInsert,
      ImageInsertViaUrl,
      ImageResize,
      ImageStyle,
      ImageTextAlternative,
      ImageToolbar,
      ImageUpload,
      Indent,
      IndentBlock,
      Italic,
      Link,
      LinkImage,
      Paragraph,
      RemoveFormat,
      SelectAll,
      ShowBlocks,
      SimpleUploadAdapter,
      SpecialCharacters,
      SpecialCharactersArrows,
      SpecialCharactersCurrency,
      SpecialCharactersEssentials,
      SpecialCharactersLatin,
      SpecialCharactersMathematical,
      SpecialCharactersText,
      Strikethrough,
      Style,
      Subscript,
      Superscript,
      Table,
      TableCaption,
      TableCellProperties,
      TableColumnResize,
      TableProperties,
      TableToolbar,
      TextTransformation,
      Underline,
      Undo,
    ],
    balloonToolbar: ["bold", "italic", "|", "link", "insertImage"],
    blockToolbar: [
      "fontSize",
      "fontColor",
      "fontBackgroundColor",
      "|",
      "bold",
      "italic",
      "|",
      "link",
      "insertImage",
      "insertTable",
      "|",
      "indent",
      "outdent",
    ],
    fontFamily: {
      supportAllValues: true,
    },
    fontSize: {
      options: [10, 12, 14, "default", 18, 20, 22],
      supportAllValues: true,
    },
    heading: {
      options: [
        {
          model: "paragraph",
          title: "Paragraph",
          class: "ck-heading_paragraph",
        },
        {
          model: "heading1",
          view: "h1",
          title: "Heading 1",
          class: "ck-heading_heading1",
        },
        {
          model: "heading2",
          view: "h2",
          title: "Heading 2",
          class: "ck-heading_heading2",
        },
        {
          model: "heading3",
          view: "h3",
          title: "Heading 3",
          class: "ck-heading_heading3",
        },
        {
          model: "heading4",
          view: "h4",
          title: "Heading 4",
          class: "ck-heading_heading4",
        },
        {
          model: "heading5",
          view: "h5",
          title: "Heading 5",
          class: "ck-heading_heading5",
        },
        {
          model: "heading6",
          view: "h6",
          title: "Heading 6",
          class: "ck-heading_heading6",
        },
      ],
    },
    htmlSupport: {
      allow: [
        {
          name: /^.*$/,
          styles: true,
          attributes: true,
          classes: true,
        },
      ],
    },
    image: {
      upload: {
        types: ["png", "jpg", "webp"],
      },
      toolbar: [
        "toggleImageCaption",
        "imageTextAlternative",
        "|",
        "imageStyle:inline",
        "imageStyle:wrapText",
        "imageStyle:breakText",
        "|",
        "resizeImage",
      ],
    },
    initialData: defaultValue || "",
    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: "https://",
      decorators: {
        toggleDownloadable: {
          mode: "manual",
          label: "Downloadable",
          attributes: {
            download: "file",
          },
        },
      },
    },
    menuBar: {
      isVisible: true,
    },
    placeholder: "Type or paste your content here!",
    style: {
      definitions: [
        {
          name: "Article category",
          element: "h3",
          classes: ["category"],
        },
        {
          name: "Title",
          element: "h2",
          classes: ["document-title"],
        },
        {
          name: "Subtitle",
          element: "h3",
          classes: ["document-subtitle"],
        },
        {
          name: "Info box",
          element: "p",
          classes: ["info-box"],
        },
        {
          name: "Side quote",
          element: "blockquote",
          classes: ["side-quote"],
        },
        {
          name: "Marker",
          element: "span",
          classes: ["marker"],
        },
        {
          name: "Spoiler",
          element: "span",
          classes: ["spoiler"],
        },
        {
          name: "Code (dark)",
          element: "pre",
          classes: ["fancy-code", "fancy-code-dark"],
        },
        {
          name: "Code (bright)",
          element: "pre",
          classes: ["fancy-code", "fancy-code-bright"],
        },
      ],
    },
    table: {
      contentToolbar: [
        "tableColumn",
        "tableRow",
        "mergeTableCells",
        "tableProperties",
        "tableCellProperties",
      ],
    },
  };

  const onEditorReady = (editor: DecoupledEditor) => {
    if (editorToolbarRef.current) {
      editorToolbarRef.current.appendChild(
        editor.ui.view.toolbar.element as Node
      );
    }

    if (editorMenuBarRef.current) {
      editorMenuBarRef.current.appendChild(editor.ui.view.menuBarView.element as Node)
    }
  };

  const onEditorDestroy = () => {
    if (editorToolbarRef.current) {
      Array.from(editorToolbarRef.current.children).forEach((child: any) =>
        child.remove()
      );
    }

    if (editorMenuBarRef.current) {
      Array.from(editorMenuBarRef.current.children).forEach((child: any) =>
        child.remove()
      );
    }
  };

  return (
    <div className="main-container">
      <span className="block font-semibold text-sm pl-1 mb-[0.5rem]">
        {label}
      </span>
      <div
        className="editor-container editor-container_document-editor editor-container_include-style"
        ref={editorContainerRef}
      >
        <div
          className="editor-container__menu-bar"
          ref={editorMenuBarRef}
        ></div>
        <div className="editor-container__toolbar" ref={editorToolbarRef}></div>
        <div className="editor-container__editor-wrapper">
          <div className="editor-container__editor">
            <div ref={editorRef}>
              {isLayoutReady && (
                <CKEditor
                  onChange={(_, editor) =>
                    (textEditorContentRef.current = editor.getData())
                  }
                  onReady={onEditorReady}
                  onAfterDestroy={onEditorDestroy}
                  editor={DecoupledEditor}
                  config={editorConfig}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
