
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
  const {accountId,privateKey , tgUserName , tgName , tgUserBio , tgPicprofile , tgBackground} = body;



  const keyStore = new InMemoryKeyStore();

  await keyStore.setKey( process.env.NEXT_PUBLIC_NETWORK_ID as string, accountId, KeyPair.fromString(privateKey));
  const signerAccount = await connect(accountId, keyStore,  process.env.NEXT_PUBLIC_NETWORK_ID as string);

        const gas = "300000000000000";
        const deposit = "50000000000000000000000";

         const args : any = {
          data: {
            [accountId]: {
                profile: {
                    name:  tgName,
                    description: tgUserBio,
                    linktree: {
                        telegram: tgUserName,
                    },
                    image: {
                      ipfs_cid: tgPicprofile
                    },
                    tags: {
                      dropwallet: "",
                      near: "",
                      genadrop: ""
                    }
                  }
              }
          }

        }

        const action = actionCreators.functionCall(
            "set",
            args,
            new BN(gas),
            new BN(deposit)
          );

          const delegate = await signerAccount.signedDelegate({
            actions: [action],
            blockHeightTtl: 600,
            receiverId:  process.env.NEXT_PUBLIC_NETWORK_ID as string =="mainnet" ? process.env.SOCIAL_NEAR_MAINNET as string : process.env.SOCIAL_NEAR_TESTNET as string,
          });
          try {
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