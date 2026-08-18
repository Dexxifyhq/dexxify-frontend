export default function Hero() {
  return (
    <section className="relative">
      {/* Vertical rails mark the content container, as in the reference */}
      <div className="max-w-[1200px] mx-auto border-x border-border">
        <div className="px-6  pt-32 pb-28 lg:pt-36 lg:pb-36">
          {/* Announcement pill */}
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-accent-lime text-foreground text-[15px] font-medium px-4 py-2 rounded-md hover:brightness-95 transition-[filter] duration-200"
          >
            Now in private beta
            <svg
              width="13"
              height="13"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>

          {/* Headline — bold statement, then a lighter continuation */}
          <h1 className="mt-8 max-w-[950px] text-4xl sm:text-5xl lg:text-[3.6rem] tracking-tight leading-[1.12]">
            <span className="font-bold text-foreground">
              Crypto payments and payouts, settled in Naira.
            </span>{' '}
            <span className="font-normal text-slate-light">
              Accept crypto from your customers or pay your users in crypto,
              with an API-first stack.
            </span>
          </h1>

          {/* CTAs */}
          <div className="flex items-center gap-3 mt-10 flex-wrap">
            <a
              href="/register"
              className="inline-flex h-12 px-6 items-center text-[15px] font-medium text-foreground bg-accent-mint rounded-lg hover:brightness-95 transition-[filter] duration-200"
            >
              Get Started
            </a>
            <a
              href="#"
              className="inline-flex h-12 px-6 items-center text-[15px] font-medium text-foreground bg-background border border-border rounded-lg hover:border-slate-light transition-colors duration-200"
            >
              View Docs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
