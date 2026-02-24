'use client';

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';

// Preserve inline style on table cells (background color, text-align, etc.)
const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (el) => el.getAttribute('style'),
        renderHTML: (attrs) => attrs.style ? { style: attrs.style } : {},
      },
    };
  },
});

const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (el) => el.getAttribute('style'),
        renderHTML: (attrs) => attrs.style ? { style: attrs.style } : {},
      },
    };
  },
});
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading2, Heading3,
  List, ListOrdered,
  Link as LinkIcon,
  AlignLeft, AlignCenter, AlignRight,
  Table as TableIcon,
  Rows3,
  Columns3,
  ImagePlus,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
      Table.configure({ resizable: false }),
      TableRow,
      CustomTableCell,
      CustomTableHeader,
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === value) return;
    editor.commands.setContent(value);
  }, [value, editor]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload/image', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('업로드 실패');
      const { url } = await res.json();
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      alert('이미지 업로드에 실패했습니다');
    }
  };

  const handleLink = () => {
    const prev = editor.getAttributes('link').href ?? '';
    const url = window.prompt('URL 입력', prev);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const inTable = editor.isActive('table');

  const btn = (active: boolean) =>
    `p-1.5 rounded transition-colors ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`;

  const tbtn = 'px-2 py-1 text-[11px] rounded transition-colors text-gray-600 hover:bg-gray-100 whitespace-nowrap';

  const sep = 'w-px h-5 bg-gray-200 mx-1 self-center';

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }} className={btn(editor.isActive('bold'))} title="굵게"><Bold size={15} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }} className={btn(editor.isActive('italic'))} title="기울임"><Italic size={15} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }} className={btn(editor.isActive('underline'))} title="밑줄"><UnderlineIcon size={15} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }} className={btn(editor.isActive('strike'))} title="취소선"><Strikethrough size={15} /></button>

        <div className={sep} />

        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }} className={btn(editor.isActive('heading', { level: 2 }))} title="제목 2"><Heading2 size={15} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run(); }} className={btn(editor.isActive('heading', { level: 3 }))} title="제목 3"><Heading3 size={15} /></button>

        <div className={sep} />

        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }} className={btn(editor.isActive('bulletList'))} title="목록"><List size={15} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }} className={btn(editor.isActive('orderedList'))} title="번호 목록"><ListOrdered size={15} /></button>

        <div className={sep} />

        <button type="button" onMouseDown={(e) => { e.preventDefault(); handleLink(); }} className={btn(editor.isActive('link'))} title="링크"><LinkIcon size={15} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); fileInputRef.current?.click(); }} className={btn(false)} title="이미지 삽입"><ImagePlus size={15} /></button>

        <div className={sep} />

        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('left').run(); }} className={btn(editor.isActive({ textAlign: 'left' }))} title="왼쪽 정렬"><AlignLeft size={15} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('center').run(); }} className={btn(editor.isActive({ textAlign: 'center' }))} title="가운데 정렬"><AlignCenter size={15} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('right').run(); }} className={btn(editor.isActive({ textAlign: 'right' }))} title="오른쪽 정렬"><AlignRight size={15} /></button>

        <div className={sep} />

        {/* Table insert */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); }}
          className={btn(inTable)}
          title="테이블 삽입"
        >
          <TableIcon size={15} />
        </button>

        {/* Table context controls — only when cursor is inside a table */}
        {inTable && (
          <>
            <div className={sep} />
            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addRowBefore().run(); }} className={tbtn} title="위에 행 추가">
              <Rows3 size={13} className="inline mr-0.5" />행+위
            </button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addRowAfter().run(); }} className={tbtn} title="아래에 행 추가">
              <Rows3 size={13} className="inline mr-0.5" />행+아래
            </button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteRow().run(); }} className="px-2 py-1 text-[11px] rounded transition-colors text-red-500 hover:bg-red-50 whitespace-nowrap" title="행 삭제">
              행−
            </button>
            <div className={sep} />
            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addColumnBefore().run(); }} className={tbtn} title="왼쪽에 열 추가">
              <Columns3 size={13} className="inline mr-0.5" />열+좌
            </button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addColumnAfter().run(); }} className={tbtn} title="오른쪽에 열 추가">
              <Columns3 size={13} className="inline mr-0.5" />열+우
            </button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteColumn().run(); }} className="px-2 py-1 text-[11px] rounded transition-colors text-red-500 hover:bg-red-50 whitespace-nowrap" title="열 삭제">
              열−
            </button>
            <div className={sep} />
            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteTable().run(); }} className="px-2 py-1 text-[11px] rounded transition-colors text-red-600 hover:bg-red-50 whitespace-nowrap font-medium" title="테이블 삭제">
              테이블 삭제
            </button>
          </>
        )}
      </div>

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none px-4 py-3 min-h-[240px] focus:outline-none [&_.tiptap_img]:max-w-full [&_.tiptap_img]:h-auto [&_.tiptap_img]:my-2 [&_.tiptap_table]:w-full [&_.tiptap_table]:border-collapse [&_.tiptap_td]:border [&_.tiptap_td]:border-gray-300 [&_.tiptap_td]:px-2 [&_.tiptap_td]:py-1.5 [&_.tiptap_td]:min-w-[2rem] [&_.tiptap_th]:border [&_.tiptap_th]:border-gray-300 [&_.tiptap_th]:px-2 [&_.tiptap_th]:py-1.5 [&_.tiptap_th]:bg-gray-100 [&_.tiptap_th]:font-semibold [&_.tiptap_.selectedCell]:bg-blue-50"
      />
    </div>
  );
}
