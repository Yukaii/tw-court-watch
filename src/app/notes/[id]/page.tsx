import type { Metadata } from "next";
import { NoteDetailClient } from "@/components/NoteDetailClient";

export const metadata: Metadata = {
  title: "個人觀庭筆記",
  robots: { index: false, follow: false },
};

interface NotePageProps {
  params: Promise<{ id: string }>;
}

export default async function NoteDetailPage({ params }: NotePageProps) {
  const { id } = await params;
  return <NoteDetailClient id={id} />;
}
