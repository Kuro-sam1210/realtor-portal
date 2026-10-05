import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PortalShell } from "@/app/_components/PortalShell";
import { type Generation, getDashboard, getGenerations } from "@/lib/data";
import { day, panel, td, th } from "@/lib/ui";

const GENERATIONS = [
  { level: 1, title: "First Generation" },
  { level: 2, title: "Second Generation" },
  { level: 3, title: "Third Generation" },
];

export default async function Downlines() {
  const data = await getDashboard();
  if (!data) redirect("/login");

  const generations = await getGenerations();

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const origin = `${protocol}://${host}`;

  return (
    <PortalShell userName={data.me.full_name} isAdmin={data.me.is_admin}>
      <h1 className="mb-3 text-3xl text-zinc-700">User Downlines</h1>

      <div className={`${panel} p-5`}>
        <div className="rounded border border-zinc-200 p-5">
          {GENERATIONS.map(({ level, title }) => (
            <GenerationTable
              key={level}
              title={title}
              origin={origin}
              members={generations.filter((member) => member.generation === level)}
            />
          ))}
        </div>
      </div>
    </PortalShell>
  );
}

function GenerationTable({
  title,
  members,
  origin,
}: {
  title: string;
  members: Generation[];
  origin: string;
}) {
  return (
    <section className="mb-8 last:mb-0">
      <h2 className="mb-3 text-2xl text-zinc-700">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border border-zinc-200">
          <thead>
            <tr className="divide-x divide-zinc-200">
              <th className={`${th} text-base normal-case tracking-normal text-zinc-800`}>Username</th>
              <th className={`${th} text-base normal-case tracking-normal text-zinc-800`}>Email</th>
              <th className={`${th} text-base normal-case tracking-normal text-zinc-800`}>Birth</th>
              <th className={`${th} text-base normal-case tracking-normal text-zinc-800`}>Referal</th>
              <th className={`${th} text-base normal-case tracking-normal text-zinc-800`}>Phone</th>
              <th className={`${th} text-base normal-case tracking-normal text-zinc-800`}>Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {members.length === 0 ? (
              <tr>
                <td className={`${td} text-zinc-500`} colSpan={6}>
                  Nobody at this generation yet.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="divide-x divide-zinc-200">
                  <td className={td}>{member.full_name}</td>
                  <td className={td}>{member.email}</td>
                  <td className={td}>{member.date_of_birth ? day(member.date_of_birth) : "-"}</td>
                  <td className={td}>{member.ref_code}</td>
                  <td className={td}>{member.phone ?? "-"}</td>
                  <td className={`${td} break-all`}>{`${origin}/?ref=${member.ref_code}`}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
