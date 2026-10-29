import { useEffect } from "react";
import Icon from "./Icon";

export default function Toast({ message, onClose }: { message: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(t);
  }, [message, onClose]);
  if (!message) return null;
  return <div className="toast" role="status"><Icon name="check" size={14} />{message}</div>;
}
