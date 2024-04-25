//https://docs.near.org/api/rpc/contracts
import { NextResponse } from 'next/server';
import * as nearAPI from "near-api-js";


const stateAccount = async(accountId:string) => {
  try {
    const provider = new nearAPI.providers.JsonRpcProvider({ url: process.env.NEXT_PUBLIC_NETWORK_ID =="mainnet" ? process.env.RPC_MAINNET as string : process.env.RPC_TESTNET as string });
    let res : any = await provider.query({
        request_type: "view_account",
        finality: "final",
        account_id: accountId,
    });
    return res
  } catch (error) {
    return error
  } 
  }

export async function POST(req: Request) {
  const body = await req.json();

const {accountId} = body;

const response =await stateAccount(accountId);


  return NextResponse.json(
    { response },
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    },
  );
}