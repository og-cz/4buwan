type Props = { size?: number; logo?: string; className?: string };

/** The 4buwan pen wordmark from the original design. An organisation logo replaces it. */
export default function Brand({ size = 56, logo, className = "" }: Props) {
  return <div className={`brand-mark ${className}`}>
    <img src={logo || "/assets/7e738.svg"} alt="4buwan" style={{ height: size, width: "auto" }} />
  </div>;
}
