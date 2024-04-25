//https://nearblocks.io/txns/Fav9xhijNQgRYc82bQinByujKVrjZRwpA1HGrCB4bT4e#execution

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
  const {accountId,cid,privateKey,friendliness,energy,density,diversity,content} = body;



  const keyStore = new InMemoryKeyStore();
  const findHashtags = (searchText:string) =>{
    const regexp = /\B\#\w\w+\b/g
    const result = searchText.match(regexp) || [];
        return result;
    }
  await keyStore.setKey( process.env.NEXT_PUBLIC_NETWORK_ID as string, accountId, KeyPair.fromString(privateKey));
  const signerAccount = await connect(accountId, keyStore,  process.env.NEXT_PUBLIC_NETWORK_ID as string);

  const tags : string[] = findHashtags(content);
  const tagsArg : any = [];
  tagsArg.push( {
    key:"proofofvibes",
    value:{
        type:"social",
        path:`${accountId}/post/main`
    }
})
tagsArg.push( {
  key:"ProofOfVibes",
  value:{
  type:"social",
  path:`${accountId}/post/main`}
})
tagsArg.push(  {
  key:"Drop Wallet",
  value:{
      type:"social",
      path:`${accountId}/post/main`
  }
})
  tags.forEach(element => {
    tagsArg.push({
        key: element,
        value: {
            type: "social",
            path: `${accountId}/post/main`
        }
    })
  });
        const gas = "300000000000000";
        const deposit = "50000000000000000000000";
        let args : any = {
            data: {
              [accountId]: {
                post: {
                  main: JSON.stringify({
                    type:"md",
                    image:{
                        ipfs_cid:cid
                    },
                    text:`#ProofOfVibes #   @proofofvibes.near ${content} \n ## **Vibe-rating**  ❤️ **Friendliness:** ${friendliness}/10 ⚡️ **Energy:** ${energy}/10 🧊 **Density:** ${density}/10 🌈 **Diversity:** ${diversity}/10`,
                    metadata:{
                        tastemaker:[]
                    }
                }),
                rating: `${parseInt(friendliness)+parseInt(energy)+parseInt(density)+parseInt(diversity)}`,
                friendliness: `${friendliness}0`,
                energy: `${energy}0`,
                density: `${density}0`,
                diversity: `${diversity}0`
                },
                index: {
                  post: JSON.stringify({key:"main",value:{type:"md"}}),
                  hashtag: JSON.stringify(tagsArg),
                  notify: JSON.stringify({
                    key:"proofofvibes.near",
                    value:{
                        type:"mention",
                        item:{
                            type:"social",
                            path:`${accountId}/post/main`
                        }
                    }
                })
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