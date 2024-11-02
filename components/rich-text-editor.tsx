"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  Undo,
  Redo,
} from 'lucide-react';
import { Input } from './ui/input';
import { useState, useCallback } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg border border-neutral-200 dark:border-neutral-800',
        },
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline decoration-primary underline-offset-4',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px]',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;
              const { tr } = view.state;
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
              if (coordinates) {
                view.dispatch(tr.insert(coordinates.pos, view.state.schema.nodes.image.create({ src: base64 })));
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const image = items.find(item => item.type.startsWith('image/'));
        
        if (image) {
          event.preventDefault();
          const file = image.getAsFile();
          if (!file) return false;
          
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64 = e.target?.result as string;
            const { tr } = view.state;
            view.dispatch(tr.replaceSelectionWith(view.state.schema.nodes.image.create({ src: base64 })));
          };
          reader.readAsDataURL(file);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addImage = () => {
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageInput(false);
    }
  };

  const addLink = () => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        editor?.chain().focus().setImage({ src: base64 }).run();
      };
      reader.readAsDataURL(file);
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg">
      <div className="border-b p-2 flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive('bold') && 'bg-muted')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive('italic') && 'bg-muted')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editor.isActive('bulletList') && 'bg-muted')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(editor.isActive('orderedList') && 'bg-muted')}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <label htmlFor="image-upload">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            type="button"
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </label>
        <input
          type="file"
          id="image-upload"
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLinkInput(!showLinkInput)}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {showLinkInput && (
        <div className="p-2 border-b flex gap-2">
          <Input
            type="url"
            placeholder="Paste link URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1"
          />
          <Button onClick={addLink} size="sm">
            Add Link
          </Button>
        </div>
      )}

      <style jsx global>{`
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .ProseMirror img:hover {
          transform: scale(1.01);
        }
        .ProseMirror img.selected {
          outline: 2px solid #0ea5e9;
        }
        .ProseMirror {
          padding: 1rem;
        }
      `}</style>

      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}