
import {
    NextResponse
} from 'next/server';
import Redis from 'ioredis';


export async function POST(req: Request) {
    const body = await req.json();
    const { accountId } = body;

    const redis = new Redis();
    let account_reviecer= ""
    if(accountId.includes(".near")){
      account_reviecer = accountId
    }
    else{
      const keys = await redis.keys('*')
      for (const key of keys) {
        const keyData :any  =await redis.get(key)
        const value :any = JSON.parse(keyData);
        if(value.user_telegram?.toLowerCase() == accountId){
          account_reviecer="mrpsycox.near"
        }
      }
    }
    const operationsDoc = `
    query MyQuery {
        mb_views_nft_tokens(
          where: {_and: {nft_contract_id: {_eq: "nft.bluntdao.near"}}, owner: {_eq: "${account_reviecer}"}}
          limit: 30
          order_by: {last_transfer_timestamp: desc}
        ) {
          token_id
          nft_contract_id
          title
          description
          media
          last_transfer_receipt_id
        }
      }
      
  `;
    const result = await fetch(
      process.env.NEXT_PUBLIC_NETWORK_ID as string == "mainnet" ? process.env.MINTBASE_GRAP_MAINNET as string: process.env.MINTBASE_GRAP_TESTNET as string,
        {
            headers: {
                "mb-api-key": "omni-site",
                "Content-Type": "application/json"
            },
          method: "POST",
          body: JSON.stringify({
            query: operationsDoc,
            variables: {},
            operationName: "MyQuery"
          })
        }
      );



const nftOwnedList = await result.json();

let nft :any = {};
nftOwnedList.data.mb_views_nft_tokens.forEach((item:any)=> {
    
    if(nft[item.nft_contract_id]){
        nft[item.nft_contract_id].push(item);
    }else{
        nft[item.nft_contract_id]=[];
        nft[item.nft_contract_id].push(item);
    }
    
  });
    

    return NextResponse.json({nft}, {
        status: 200,
        headers: {
            'content-type': 'application/json',
        },
    }, );
}