type Props = { size?: number; label?: string; logo?: string; className?: string };

/** Icon + "4buwan" wordmark (text) + optional small label. An organisation logo replaces the icon only. */
export default function Brand({ size = 32, label, logo, className = "" }: Props) {
  return <div className={`brand-mark ${className}`}>
    <img src={logo || "/brand/4buwan-icon.svg"} alt="" width={size} height={size} style={{ width: size, height: size }} />
    <div><strong>4buwan</strong>{label && <span>{label}</span>}</div>
  </div>;
}
