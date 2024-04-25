
import { KeyPair } from "@near-js/crypto";
import { InMemoryKeyStore } from "@near-js/keystores";
import { actionCreators } from "@near-js/transactions";
import { NextResponse } from "next/server";
import { deserialize } from 'borsh';
import BN from "bn.js";
import {
  connect,
  submitTransaction
} from "@/helper/utils/near/meta-transactions";

//near call <ft-contract> ft_transfer '{"receiver_id": "<receiver-account>", "amount": "<amount>"}' --accountId <your-account> --depositYocto 1
//https://near-examples.github.io/token-factory/
//https://near-faucet.io/
export async function POST(req: Request) {
  const body = await req.json();

  const { privateKey, accountId ,receiverId , amount , tokenContract} = body;

  
  const keyStore = new InMemoryKeyStore();
  
  await keyStore.setKey(process.env.NEXT_PUBLIC_NETWORK_ID as string, accountId, KeyPair.fromString(privateKey));
  const signerAccount = await connect(accountId, keyStore, process.env.NEXT_PUBLIC_NETWORK_ID as string);


if(tokenContract == 'NEAR'){
  const newAmount = (parseInt(amount)-50000000000000000000).toLocaleString('fullwide', {useGrouping:false}) ;
  try {
    const result = await signerAccount.signAndSendTransaction({
      receiverId: receiverId,
      actions: [actionCreators.transfer(new BN(newAmount))],
    });
    return NextResponse.json(
      { status: "successful" },
      {
        status: 200,
        headers: {
          "content-type": "text/plain",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error },
      {
        status: 400,
        headers: {
          "content-type": "text/plain",
        },
      }
    );
  }
}else{
  const gas = "300000000000000";
  const deposit = "30000000000000000000000";
  const args : any = {
    amount: amount,
    receiver_id: receiverId,
  }
const action = actionCreators.functionCall(
  "ft_transfer",
  args,
  new BN(gas),
  new BN(deposit)
);
   const deserializeDelegate = await signerAccount.signedDelegate({
    actions: [action],
    blockHeightTtl: 600,
    receiverId: tokenContract,
  });
  try {
    const result = await submitTransaction({
      delegate: deserializeDelegate,
      network:  process.env.NEXT_PUBLIC_NETWORK_ID as string,
    });
    return NextResponse.json(
      { status: "successful" },
      {
        status: 200,
        headers: {
          "content-type": "text/plain",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error },
      {
        status: 400,
        headers: {
          "content-type": "text/plain",
        },
      }
    );
  }
}






 
}