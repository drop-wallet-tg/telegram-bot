import { NextResponse } from 'next/server';
import { KeyPair } from '@near-js/crypto';
import { connect} from '@/helper/utils/near/meta-transactions';
import { InMemoryKeyStore } from '@near-js/keystores';
import { actionCreators } from "@near-js/transactions";
const { generateSeedPhrase } = require('near-seed-phrase');
import BN from "bn.js";
// near call mainnet create_account '{"new_account_id": "kurodenjiro699.near", "new_public_key": "ed25519:"}' --deposit 0.00182 --accountId kurodenjiro.near
export async function POST(req: Request) {
  const body = await req.json();
  const {  accountId } = body;

 const keyStore = new InMemoryKeyStore();
 const {seedPhrase, publicKey, secretKey} = generateSeedPhrase()
 
  await keyStore.setKey(process.env.NEXT_PUBLIC_NETWORK_ID as string, process.env.NEXT_PUBLIC_NETWORK_ID as string == "mainnet" ? process.env.NEXT_PUBLIC_RELAYER_ACCOUNT_ID_NEAR_MAINNET as string: process.env.NEXT_PUBLIC_RELAYER_ACCOUNT_ID_NEAR_TESTNET as string, KeyPair.fromString( process.env.NEXT_PUBLIC_NETWORK_ID as string == "mainnet" ? process.env.RELAYER_PRIVATE_KEY_NEAR_MAINNET as string: process.env.RELAYER_PRIVATE_KEY_NEAR_TESTNET as string));
  const signerAccount = await connect(process.env.NEXT_PUBLIC_NETWORK_ID as string == "mainnet" ? process.env.NEXT_PUBLIC_RELAYER_ACCOUNT_ID_NEAR_MAINNET as string: process.env.NEXT_PUBLIC_RELAYER_ACCOUNT_ID_NEAR_TESTNET as string, keyStore, process.env.NEXT_PUBLIC_NETWORK_ID as string);
  const gas = "200000000000000";
  const deposit = "0";
  // const args : any = {
  //   "new_account_id": accountId,
  //   "new_public_key": publicKey
  // }
  const argsWithSocial : any = {
    new_account_id: accountId,
    options: {
      contract_bytes: null,
      full_access_keys: [
        publicKey
      ],
      limited_access_keys: [
        {
          allowance: "250000000000000",
          method_names: "",
          public_key: "ed25519:FQzxfWrjAy1C62hL4cc47cRpUdnrLinajj69yLjwB2DG",
          receiver_id: "social.near"
        }
      ]
    }
  }
const action = actionCreators.functionCall(
  "create_account_advanced",
  argsWithSocial,
  new BN(gas),
  new BN(deposit)
);


try {
  const result = await signerAccount.signAndSendTransaction({
    actions: [action],
    receiverId: "near",
  });
    return NextResponse.json(
        { privateKey: secretKey,seed:seedPhrase , result},
        {
          status: 200,
          headers: {
            'content-type': 'text/plain',
          },
        },
      );
  
} catch (error:any) {
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