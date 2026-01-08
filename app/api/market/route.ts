import { NextResponse } from 'next/server';
import { B21_CONTRACT_ADDRESS } from '@/lib/utils';

export const runtime = 'nodejs';

export async function GET() {
  const safeJson = async (res: Response) => {
    try {
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  try {
    const cgRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd', {
      cache: 'no-store',
      headers: { accept: 'application/json' },
    }).catch(() => null as any);
    const cgData = cgRes ? await safeJson(cgRes) : null;

    let b21 = 0;
    const dsRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${B21_CONTRACT_ADDRESS}`, {
      cache: 'no-store',
      headers: { accept: 'application/json' },
    }).catch(() => null as any);
    const dsData = dsRes ? await safeJson(dsRes) : null;
    if (dsData?.pairs?.length && typeof dsData.pairs[0]?.priceUsd === 'string') {
      const parsed = parseFloat(dsData.pairs[0].priceUsd);
      if (Number.isFinite(parsed)) b21 = parsed;
    }

    return NextResponse.json({
      btc: cgData?.bitcoin?.usd && Number.isFinite(cgData.bitcoin.usd) ? cgData.bitcoin.usd : 0,
      eth: cgData?.ethereum?.usd && Number.isFinite(cgData.ethereum.usd) ? cgData.ethereum.usd : 0,
      b21,
    }, { status: 200 });
  } catch {
    return NextResponse.json({ btc: 0, eth: 0, b21: 0 }, { status: 200 });
  }
}
