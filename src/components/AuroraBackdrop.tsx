/**
 * The single, site-wide background — a soft gradient with blurred colour
 * blobs. Rendered once in the root layout, fixed behind all page content.
 */
export function AuroraBackdrop() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(165deg, #faf9f6 0%, #eef0fb 48%, #f1ecf8 100%)",
        }}
      />
      <div
        className="absolute -left-32 -top-24 h-[30rem] w-[30rem] rounded-full opacity-50 blur-3xl"
        style={{ background: "#c7d2fe" }}
      />
      <div
        className="absolute -right-28 top-1/4 h-[28rem] w-[28rem] rounded-full opacity-40 blur-3xl"
        style={{ background: "#fbcfe8" }}
      />
      <div
        className="absolute -bottom-32 left-1/4 h-[28rem] w-[28rem] rounded-full opacity-35 blur-3xl"
        style={{ background: "#bae6fd" }}
      />
    </div>
  );
}
