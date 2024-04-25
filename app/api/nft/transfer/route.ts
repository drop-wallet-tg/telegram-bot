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

  const { privateKey, accountId ,receiverId , tokenId ,nftContractId} = body;


  const keyStore = new InMemoryKeyStore();

  await keyStore.setKey(process.env.NEXT_PUBLIC_NETWORK_ID as string, accountId, KeyPair.fromString(privateKey));
  const signerAccount = await connect(accountId, keyStore, process.env.NEXT_PUBLIC_NETWORK_ID as string);
  

  const gas = "200000000000000";
  const deposit = "1";

   const args : any = {
        token_id: tokenId,
        receiver_id: receiverId,
      }
  const action = actionCreators.functionCall(
      "nft_transfer",
      args,
      new BN(gas),
      new BN(deposit)
    );

    const delegate = await signerAccount.signedDelegate({
      actions: [action],
      blockHeightTtl: 600,
      receiverId: nftContractId,
    });

    try {
      const result = await submitTransaction({
        delegate: delegate,
        network: process.env.NEXT_PUBLIC_NETWORK_ID as string,
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