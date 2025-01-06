import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmail } from "../utils/email.ts";

export async function handleReportCreated(
  supabase: SupabaseClient,
  userEmail: string,
  data: { reportId?: string }
) {
  if (!data.reportId) throw new Error("Report ID is required");

  const { data: report } = await supabase
    .from("hunting_reports")
    .select(`
      *,
      hunt_type:hunt_types(name),
      created_by_profile:profiles!hunting_reports_created_by_fkey(
        firstname,
        lastname
      )
    `)
    .eq("id", data.reportId)
    .single();

  if (!report) throw new Error("Report not found");

  const subject = `Ny jaktrapport - ${report.hunt_type.name}`;
  const html = `
    <h2>Ny jaktrapport</h2>
    <p>En ny jaktrapport har skapats av ${report.created_by_profile.firstname} ${report.created_by_profile.lastname}.</p>
    <p><strong>Jakttyp:</strong> ${report.hunt_type.name}</p>
    <p><strong>Datum:</strong> ${report.date}</p>
    ${report.description ? `<p><strong>Beskrivning:</strong> ${report.description}</p>` : ''}
  `;

  return await sendEmail(userEmail, subject, html);
}