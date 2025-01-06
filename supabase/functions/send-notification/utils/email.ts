const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

export async function sendEmail(to: string, subject: string, html: string) {
  console.log("Sending email:", { to, subject });
  
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    throw new Error("RESEND_API_KEY is not set");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Antlers <notifications@antlers.app>",
      to: [to],
      subject,
      html,
      text: subject, // Adding plain text version without any HTML or images
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Resend API error:", error);
    throw new Error(`Failed to send email: ${error}`);
  }

  console.log("Email sent successfully");
  return await res.json();
}