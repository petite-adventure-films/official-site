// Figma: https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=153-166
import { useRef, useState } from 'react';
import { EditorContent, useEditor, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Menu, MenuItem, TextField } from '@mui/material';
import { validLink, type BodyNode } from '../draft';
import { AssetImage, AssetLink } from '../media-nodes';
import { MediaPicker } from './MediaPicker';
// Drop editor-generated null/default rendering attrs, not content or supported formatting.
function stored(n: JSONContent): BodyNode {
  const keys = n.type === 'assetImage' ? ['assetId', 'alt'] : n.type === 'assetLink' ? ['assetId', 'assetKind'] : n.type === 'link' ? ['href', 'target', 'title'] : n.type === 'heading' ? ['level'] : n.type === 'orderedList' ? ['start'] : [];
  const attrs = Object.fromEntries(Object.entries(n.attrs ?? {}).filter(([k, v]) => keys.includes(k) && v != null));
  return { type: n.type!, ...(n.text !== undefined ? { text: n.text } : {}), ...(Object.keys(attrs).length ? { attrs } : {}), ...(n.content ? { content: n.content.map(stored) } : {}), ...(n.marks ? { marks: n.marks.map(stored) } : {}) };
}
export function BodyEditor({ value, change }: { value: BodyNode; change: (doc: BodyNode) => void }) {
  const latest = useRef(change); latest.current = change;
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const [more, setMore] = useState<HTMLElement | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [mediaKind, setMediaKind] = useState<'image' | 'document' | null>(null);
  const [alt, setAlt] = useState<string | null>(null);
  const editor = useEditor({ extensions: [AssetImage, AssetLink, StarterKit.configure({ heading: { levels: [2, 3, 4] }, codeBlock: false, trailingNode: false, link: { openOnClick: false, autolink: false, linkOnPaste: false, isAllowedUri: validLink } })],
    content: value, shouldRerenderOnTransaction: true,
    editorProps: { attributes: { role: 'textbox', 'aria-label': '本文', 'aria-multiline': 'true', class: 'cms-body-editor' } },
    onUpdate: ({ editor }) => latest.current(stored(editor.getJSON())),
  });
  const badLink = link !== null && link !== '' && !validLink(link);
  return <div className="rounded border border-cms-divider flex flex-col gap-cms-content">
    <div className="p-cms-heading flex flex-col gap-cms-actions">
      <div className="flex flex-wrap gap-cms-actions">
        <Button size="small" color="inherit" disabled={!editor} onClick={e => setMenu(e.currentTarget)}>段落・見出し</Button>
        <Button size="small" color="inherit" aria-pressed={editor?.isActive('bold') ?? false} onClick={() => editor?.chain().focus().toggleBold().run()}>太字</Button>
        <Button size="small" color="inherit" aria-pressed={editor?.isActive('bulletList') ?? false} onClick={() => editor?.chain().focus().toggleBulletList().run()}>箇条書き</Button>
        <Button size="small" color="inherit" aria-pressed={editor?.isActive('orderedList') ?? false} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>番号付き</Button>
        <Button size="small" color="inherit" aria-pressed={editor?.isActive('blockquote') ?? false} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>引用</Button>
        <Button size="small" color="inherit" onClick={() => setLink(editor?.getAttributes('link').href ?? '')}>リンク</Button>
      </div>
      <div className="flex flex-wrap gap-cms-actions">
        <Button size="small" color="inherit" disabled={!editor} onClick={() => editor?.isActive('assetImage') ? setAlt(editor.getAttributes('assetImage').alt ?? '') : setMediaKind('image')}>画像</Button>
        <Button size="small" color="inherit" disabled={!editor} onClick={() => setMediaKind('document')}>PDF</Button>
        <Button size="small" disabled>動画</Button>
        <Button size="small" color="inherit" onClick={e => setMore(e.currentTarget)}>その他</Button>
        <Button size="small" color="inherit" disabled={!editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()}>元に戻す</Button>
        <Button size="small" color="inherit" disabled={!editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()}>やり直す</Button>
      </div>
    </div>
    <EditorContent editor={editor} className="px-cms-content pb-cms-content" />
    {mediaKind && <MediaPicker kind={mediaKind} close={() => setMediaKind(null)} insert={(assetId, text) => {
      if (mediaKind === 'image') editor?.chain().focus().insertContent([{ type: 'assetImage', attrs: { assetId, alt: text } }, { type: 'paragraph' }]).run();
      else editor?.chain().focus().insertContent({ type: 'text', text, marks: [{ type: 'assetLink', attrs: { assetId, assetKind: 'document' } }] }).run();
      setMediaKind(null);
    }} />}
    <Dialog open={alt !== null} onClose={() => setAlt(null)} fullWidth maxWidth="sm"><DialogTitle variant="subtitle2">画像の代替テキスト</DialogTitle><DialogContent><TextField autoFocus fullWidth margin="dense" label="代替テキスト" value={alt ?? ''} onChange={e => setAlt(e.target.value)} /></DialogContent><DialogActions><Button onClick={() => setAlt(null)}>キャンセル</Button><Button disabled={(alt?.length ?? 0) > 2000} onClick={() => { editor?.chain().focus().updateAttributes('assetImage', { alt }).run(); setAlt(null); }}>適用</Button></DialogActions></Dialog>
    <Menu anchorEl={menu} open={Boolean(menu)} onClose={() => setMenu(null)}>
      <MenuItem onClick={() => { editor?.chain().focus().setParagraph().run(); setMenu(null); }}>段落</MenuItem>
      {([2, 3, 4] as const).map(level => <MenuItem key={level} onClick={() => { editor?.chain().focus().toggleHeading({ level }).run(); setMenu(null); }}>見出し{level}</MenuItem>)}
    </Menu>
    <Menu anchorEl={more} open={Boolean(more)} onClose={() => setMore(null)}>
      <MenuItem onClick={() => { editor?.chain().focus().toggleItalic().run(); setMore(null); }}>斜体</MenuItem>
      <MenuItem onClick={() => { editor?.chain().focus().toggleUnderline().run(); setMore(null); }}>下線</MenuItem>
      <MenuItem onClick={() => { editor?.chain().focus().toggleStrike().run(); setMore(null); }}>取り消し線</MenuItem>
      <MenuItem onClick={() => { editor?.chain().focus().setHorizontalRule().run(); setMore(null); }}>区切り線</MenuItem>
    </Menu>
    <Dialog open={link !== null} onClose={() => setLink(null)} fullWidth maxWidth="sm"><DialogTitle>リンク</DialogTitle><DialogContent>
      <TextField autoFocus fullWidth label="リンク先URL" margin="dense" value={link ?? ''} error={badLink} helperText={badLink ? 'http・httpsのURL、またはmailtoのメールアドレスを入力してください。' : undefined} onChange={e => setLink(e.target.value)} />
    </DialogContent><DialogActions><Button onClick={() => setLink(null)}>キャンセル</Button><Button disabled={badLink} onClick={() => { const chain = editor?.chain().focus().extendMarkRange('link'); if (link) chain?.unsetMark('assetLink').setLink({ href: link }).run(); else chain?.unsetMark('assetLink').unsetLink().run(); setLink(null); }}>適用</Button></DialogActions></Dialog>
  </div>;
}
