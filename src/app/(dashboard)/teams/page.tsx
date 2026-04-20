"use client";

import { useState } from "react";
import { UserPlus, Users } from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import InviteStaffModal from "@/components/dashboard/teams/InviteStaffModal";

export default function TeamsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Teams"
        description="Invite and manage your team members."
        actions={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-3.5 text-sm font-medium text-[#09090B] hover:bg-white transition-colors"
          >
            <UserPlus size={15} />
            Invite Staff
          </button>
        }
      />

      <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F]">
        <EmptyState
          icon={<Users size={30} strokeWidth={1.5} />}
          title="No team members yet"
          description="Invite your first staff member to get started."
          className="py-20"
        />
      </section>

      <InviteStaffModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(payload) => {
          // TODO: POST /teams/invite
          console.log("invite staff", payload);
        }}
      />
    </div>
  );
}
