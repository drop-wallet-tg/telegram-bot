import { NextResponse } from 'next/server';
import { KeyPair, PublicKey } from '@near-js/crypto';
import { connect, submitTransaction , fundAccount } from '@/helper/utils/near/meta-transactions';
import { InMemoryKeyStore } from '@near-js/keystores';
import BN from 'bn.js';
import { actionCreators, FunctionCallPermission} from "@near-js/transactions";
import Redis from 'ioredis';

const { generateSeedPhrase } = require('near-seed-phrase');
export async function POST(req: Request) {
  const body = await req.json();
  const { accountId, privateKey } = body;
  const redis = new Redis();

  const keyStore = new InMemoryKeyStore();

  await keyStore.setKey(process.env.NEXT_PUBLIC_NETWORK_ID as string, accountId, KeyPair.fromString(privateKey));

  const signerAccount = await connect(accountId, keyStore, process.env.NEXT_PUBLIC_NETWORK_ID as string);

  const { seedPhrase, publicKey, secretKey } = generateSeedPhrase()
  // await signerAccount.addKey(publicKey);
  const state = await signerAccount.getAccessKeys();
  console.log("aa",KeyPair.fromString(privateKey).getPublicKey().toString()) 
  console.log("accesskeyList", state)

  try {
    fundAccount(accountId,process.env.NEXT_PUBLIC_NETWORK_ID as string)
    
    const deserializeDelegate = await signerAccount.signedDelegate({
      receiverId: accountId,
      blockHeightTtl: 600,
      actions: [actionCreators.addKey(PublicKey.fromString(publicKey), actionCreators.fullAccessKey())],
    });
    const data = await submitTransaction({
      delegate: deserializeDelegate,
      network: process.env.NEXT_PUBLIC_NETWORK_ID as string,
    });

    
    if (data) {
    

      const keys = await redis.keys('*')
     // let private_key: any = "";
      for (const key of keys) {
        const keyData: any = await redis.get(key)
        const value: any = JSON.parse(keyData);
        if (value.accountId == accountId) {
         // private_key = value.privateKey;
          value.privateKey = secretKey;
          redis.set(key, JSON.stringify(value));
        }
      }

      await keyStore.setKey(process.env.NEXT_PUBLIC_NETWORK_ID as string, accountId, KeyPair.fromString(secretKey));

      const signerAccount = await connect(accountId, keyStore, process.env.NEXT_PUBLIC_NETWORK_ID as string);
    
      const deserializeDelegateDeleteKey = await signerAccount.signedDelegate({
        receiverId: accountId,
        blockHeightTtl: 600,
        actions: [actionCreators.deleteKey(KeyPair.fromString(privateKey).getPublicKey())],
      });

      await submitTransaction({
        delegate: deserializeDelegateDeleteKey,
        network: process.env.NEXT_PUBLIC_NETWORK_ID as string,
      });

      return NextResponse.json(
        { seed: seedPhrase },
        {
          status: 200,
          headers: {
            'content-type': 'text/plain',
          },
        },
      );
    }


  } catch (error: any) {
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