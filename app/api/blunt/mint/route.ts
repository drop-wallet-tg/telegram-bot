import { NextResponse } from 'next/server';
import { KeyPair } from "@near-js/crypto";
import { InMemoryKeyStore } from "@near-js/keystores";
import { actionCreators } from "@near-js/transactions";
import BN from "bn.js";
import {
    connect,
    submitTransaction
  } from "@/helper/utils/near/meta-transactions";

export async function POST(req: Request) {
  const body = await req.json();
  const {accountId, seriesId } = body;

 
  const keyStore = new InMemoryKeyStore();

  await keyStore.setKey(process.env.NEXT_PUBLIC_NETWORK_ID as string, process.env.BLUNT_MAINNET as string, KeyPair.fromString(process.env.BLUNT_PRIVATE_KEY_MAINNET as string));

  const signerAccount = await connect(process.env.BLUNT_MAINNET as string, keyStore, process.env.NEXT_PUBLIC_NETWORK_ID as string);
 

  const gas = "300000000000000";
  const deposit = "10000000000000000000000";
  
   const args : object = {
    receiver_id: accountId,
            id: seriesId +"",
      }
      

try {
  const action = actionCreators.functionCall(
    "nft_mint",
    args,
    new BN(gas),
    new BN(deposit)
  );

  const delegate = await signerAccount.signedDelegate({
    actions: [action],
    blockHeightTtl: 600,
    receiverId: process.env.NEXT_PUBLIC_NETWORK_ID as string == "mainnet" ? process.env.BLUNT_MAINNET as string: process.env.BLUNT_TESTNET as string,
  });

  const result = await submitTransaction({
    delegate: delegate,
    network:  process.env.NEXT_PUBLIC_NETWORK_ID as string,
  });
  return NextResponse.json(

    { result },
    {
      status: 200,
      headers: {
        'content-type': 'text/plain',
      },
    },
  );
} catch (error) {
  console.log(error)
  return NextResponse.json(
    { error },
    {
      status: 400,
      headers: {
        'content-type': 'text/plain',
      },
    },
  );
}
}