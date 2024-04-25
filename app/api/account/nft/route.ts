
import {
    NextResponse
} from 'next/server';



export async function POST(req: Request) {
    const body = await req.json();
    const { accountId } = body;


    const operationsDoc = `
    query MyQuery {
      mb_views_nft_tokens(
        where: {owner: {_eq: "${accountId}"}}
        limit: 30
        order_by: {last_transfer_timestamp: desc}
      ) {
        token_id
        nft_contract_id
        nft_contract_name
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