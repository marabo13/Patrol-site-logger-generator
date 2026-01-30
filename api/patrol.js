export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
  if (!WEBHOOK_URL) {
    return res.status(500).send("Missing DISCORD_WEBHOOK_URL");
  }

  const b = req.body || {};
  const fields = [];

  if (b.username) fields.push({ name:"Officer", value:`**${b.username}**`, inline:true });
  if (b.rank) fields.push({ name:"Rank", value:`**${b.rank}**`, inline:true });

  if (b.rank==="Arbiter") {
    fields.push({
      name:"Supervised by",
      value:b.mentor?`**Quaestor ${b.mentor}**`:"**None provided**",
      inline:false
    });
  }

  if (b.startISO) fields.push({ name:"Start", value:`\`${b.startISO}\``, inline:false });
  if (b.endISO) fields.push({ name:"End", value:`\`${b.endISO}\``, inline:false });
  if (b.durationText) fields.push({ name:"Duration", value:`**${b.durationText}**`, inline:true });
  if (b.arrests!==undefined) fields.push({ name:"Arrests", value:`**${b.arrests}**`, inline:true });

  const attendees = Array.isArray(b.attendees) && b.attendees.length
    ? b.attendees.map(x=>`• ${x}`).join("\n").slice(0,1000)
    : "None";

  fields.push({ name:"Attendees", value:attendees, inline:false });

  const embed = {
    title:b.action==="Start Patrol"?"🟢 Patrol Started":"🔴 Patrol Ended",
    color:b.action==="Start Patrol"?0x2ecc71:0xe74c3c,
    fields,
    timestamp:b.time||new Date().toISOString(),
    footer:{ text:"DCoJ Patrol Logger" }
  };

  const r = await fetch(WEBHOOK_URL,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({embeds:[embed]})
  });

  if(!r.ok) return res.status(500).send("Discord webhook failed");
  res.status(200).send("OK");
}
