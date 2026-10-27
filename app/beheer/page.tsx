import Editor from '@/components/beheer/Editor';
import Login from '@/components/beheer/Login';
import { isIngelogd, wachtwoordIngesteld } from '@/lib/beheerAuth';
import { laadConfig } from '@/lib/configLaden';
import { opslagModus } from '@/lib/opslag';

export const dynamic = 'force-dynamic';

export default async function BeheerPage() {
  if (!(await isIngelogd())) return <Login wachtwoordIngesteld={wachtwoordIngesteld()} />;
  const config = await laadConfig();
  return <Editor beginConfig={config} modus={opslagModus()} />;
}
