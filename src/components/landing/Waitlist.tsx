"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useJoinWaitlist } from "@/lib/hooks/waitlist/useWaitlist";
import { PublicApiError } from "@/lib/api-public";

const fieldClass =
  "h-12 w-full rounded-lg border border-border bg-background px-4 text-[15px] text-foreground placeholder:text-slate-light focus:outline-none focus:border-slate-light transition-colors";

export default function Waitlist() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const joinWaitlist = useJoinWaitlist();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinWaitlist.isPending) return;
    joinWaitlist.mutate({
      name: name.trim(),
      email: email.trim(),
      ...(message.trim() ? { message: message.trim() } : {}),
    });
  };

  const result = joinWaitlist.data;

  return (
    <section id="waitlist" className="relative border-b border-border">
      {/* Same rail container as Hero/Announcement, so the vertical rules stay
          continuous down the page. */}
      <div className="max-w-[1200px] mx-auto border-x border-border">
        <div className="px-4 sm:px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Join the waitlist
            </h2>
            <p className="mt-3 text-base text-slate-light">
              Dexxify is in private beta. Leave your details and we&apos;ll
              reach out when a spot opens up.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-md">
            {result ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-accent-lime/20 px-6 py-8 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-mint text-background">
                  <Check size={20} />
                </div>
                <p className="text-base font-semibold text-foreground">
                  {result.alreadyOnWaitlist
                    ? "You're already on the list!"
                    : "You're on the list!"}
                </p>
                <p className="text-sm text-slate-light">
                  We&apos;ll be in touch as soon as a spot opens up.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={fieldClass}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <textarea
                  placeholder="Anything else you'd like us to know? (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className={`${fieldClass} h-auto resize-none py-3`}
                />

                {joinWaitlist.isError && (
                  <p className="text-sm text-error">
                    {joinWaitlist.error instanceof PublicApiError
                      ? joinWaitlist.error.message
                      : "Something went wrong. Please try again."}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={joinWaitlist.isPending}
                  className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-accent-mint px-6 text-[15px] font-medium text-background hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 transition-[filter] duration-200"
                >
                  {joinWaitlist.isPending ? "Joining…" : "Join waitlist"}
                  {!joinWaitlist.isPending && <ArrowRight size={14} />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
