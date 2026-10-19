import Link from "next/link";
import { SectionLink } from "./SectionLink";

export default function Footer() {
  return (
    <footer className="mt-24 bg-smolder text-paper/80">
      <div className="mx-auto grid max-w-page gap-10 px-5 py-16 md:grid-cols-[1.5fr_1fr_1fr] md:px-8">
        <div>
          <p className="flex items-center gap-1.5 font-display text-2xl font-semibold text-paper">
            ninety<span className="h-2.5 w-2.5 rounded-full bg-solar" aria-hidden />
          </p>
          <p className="mt-4 max-w-sm text-sm">
            Ninety is not legal advice and is not affiliated with the European Union. Your trips stay in your browser.
          </p>
          <p className="mt-4 text-sm">
            Built by devmo · MIT licence ·{" "}
            <a data-testid="footer-source" className="underline underline-offset-4 hover:text-paper" href="https://github.com/mohamedwael201193/ninety">Source on GitHub</a>
          </p>
        </div>
        <div className="text-sm">
          <p className="eyebrow !text-paper/60">Product</p>
          <ul className="mt-3 space-y-2">
            <li><SectionLink hash="#check" className="hover:text-paper">Check my days</SectionLink></li>
            <li><SectionLink hash="#planned-heading" className="hover:text-paper">Plan a trip</SectionLink></li>
            <li><SectionLink hash="#scenarios" className="hover:text-paper">Try a history</SectionLink></li>
            <li><Link href="/ees" data-testid="footer-ees" className="hover:text-paper">EES check</Link></li>
            <li><Link href="/letter" data-testid="footer-letter" className="hover:text-paper">Article 52 letter</Link></li>
            <li><Link href="/parity" className="hover:text-paper">Calculator parity</Link></li>
            <li><Link href="/proof" data-testid="footer-proof" className="hover:text-paper">Proof</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="eyebrow !text-paper/60">Sources</p>
          <ul className="mt-3 space-y-2">
            <li><a className="hover:text-paper underline-offset-4 hover:underline" href="https://eur-lex.europa.eu/eli/reg/2017/2226/oj">Reg. (EU) 2017/2226, Art. 52</a></li>
            <li><a className="hover:text-paper underline-offset-4 hover:underline" href="https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/border-crossing_en">Commission short-stay calculator</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
