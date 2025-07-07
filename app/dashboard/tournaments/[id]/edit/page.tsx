import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EditTournamentForm from "./edit-tournament-form";

export const runtime = 'edge';

type Tournament = {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "ongoing" | "completed" | "cancelled";
  start_date: string | null;
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