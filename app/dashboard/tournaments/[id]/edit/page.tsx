import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EditTournamentForm from "./edit-tournament-form";

export const runtime = 'edge';

type Tournament = {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "published" | "ongoing" | "completed" | "cancelled";
  start_date: string | null;
  end_date: string | null;
  entry_start: string | null;
  entry_end: string | null;
  max_participants: number | null;
  min_participants: number;
  entry_fee: number;
  venue: string | null;
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTournamentPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // 大会データを事前に取得
  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !tournament) {
    notFound();
  }

  return <EditTournamentForm tournamentId={id} initialTournament={tournament} />;
}