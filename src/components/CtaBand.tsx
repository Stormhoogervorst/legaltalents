import Link from "next/link";

export default function CtaBand() {
  return (
    <section
      className="bg-[#587DFE]"
      style={{ padding: "clamp(80px, 10vh, 140px) clamp(24px, 5vw, 80px)" }}
    >
      <div className="max-w-[1400px] mx-auto text-center">
        <span
          className="inline-block rounded-full border border-white/30"
          style={{
            padding: "6px 16px",
            fontSize: "13px",
            fontWeight: 500,
            letterSpacing: "0.02em",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          KLAAR OM TE STARTEN?
        </span>
        <h2
          className="mx-auto"
          style={{
            fontSize: "clamp(32px, 4.5vw, 60px)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            color: "#FFFFFF",
            marginTop: "24px",
            maxWidth: "700px",
          }}
        >
          Start jouw juridische carrière vandaag
        </h2>
        <p
          className="mx-auto"
          style={{
            fontSize: "clamp(15px, 1.1vw, 17px)",
            lineHeight: 1.65,
            color: "rgba(255,255,255,0.8)",
            maxWidth: "500px",
            marginTop: "20px",
          }}
        >
          Bekijk alle openstaande vacatures en vind de perfecte stage of baan
          bij een topwerkgever.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium transition-transform duration-200 hover:scale-[1.03]"
            style={{ fontSize: "15px", color: "#2C337A" }}
          >
            Bekijk vacatures
          </Link>
          <Link
            href="/stages"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 font-medium transition-all duration-200 hover:bg-white/10"
            style={{ fontSize: "15px", color: "#FFFFFF" }}
          >
            Bekijk stages
          </Link>
        </div>
      </div>
    </section>
  );
}
