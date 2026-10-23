import { useRef, useState, type DragEvent } from "react";
import Icon from "./Icon";
import SignatureImage from "./SignatureImage";

type Props = { file: File | null; previewUrl: string | null; onFile: (file: File) => void; title?: string; hint?: string };

export default function Dropzone({ file, previewUrl, onFile, title = "Add Questioned Signature", hint = "Drop or upload an image of one signature" }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  function drop(e: DragEvent) {
    e.preventDefault(); setOver(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }
  return <>
    <input ref={input} className="hidden" type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
    <button className={`upload-area ${file ? "loaded" : ""} ${over ? "drag-over" : ""}`} onClick={() => input.current?.click()} onDragOver={e => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={drop}>
      {file && previewUrl ? <><SignatureImage src={previewUrl} alt="Questioned signature" /><span>{file.name}</span></> : <><i><Icon name="upload" /></i><strong>{title}</strong><small>{hint}</small></>}
    </button>
  </>;
}
