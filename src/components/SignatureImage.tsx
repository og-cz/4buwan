export default function SignatureImage({ src, alt, faded = false }: { src: string; alt: string; faded?: boolean }) {
  return <div className={`signature ${faded ? "faded" : ""}`}><img src={src} alt={alt} loading="lazy" /></div>;
}
