
import * as nearAPI from "near-api-js";
import axios from "axios";
import { NextResponse } from 'next/server';
import {Big} from 'big.js';




type data ={ contractId: string; method: string; args:any}


const viewMethod = async(data:data) => {
  try {
    const provider = new nearAPI.providers.JsonRpcProvider({ url: process.env.NEXT_PUBLIC_NETWORK_ID =="mainnet" ? process.env.RPC_MAINNET as string : process.env.RPC_TESTNET as string });
    let res : any = await provider.query({
      request_type: 'call_function',
      account_id: data.contractId,
      method_name: data.method,
      args_base64: Buffer.from(JSON.stringify(data.args)).toString('base64'),
      finality: 'final',
    });
    return JSON.parse(Buffer.from(res.result).toString())
  } catch (error) {
    return 0
  } 
  }
  const stateAccount = async(accountId:string) => {
    try {
      const provider = new nearAPI.providers.JsonRpcProvider({ url: process.env.NEXT_PUBLIC_NETWORK_ID =="mainnet" ? process.env.RPC_MAINNET as string : process.env.RPC_TESTNET as string });
      let res : any = await provider.query({
          request_type: "view_account",
          finality: "final",
          account_id: accountId,
      });
      return res.amount
    } catch (error) {
      return 0
    } 
    }
    
    const getToken = async(accountId : string) => {
      
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_NETWORK_ID =="mainnet" ? process.env.KITWALLET_MAINNET as string : process.env.KITWALLET_TESTNET as string}/account/${accountId}/likelyTokensFromBlock?fromBlockTimestamp=0`); 
        const tokenPrice : any = (await axios.get(`${process.env.NEXT_PUBLIC_NETWORK_ID =="mainnet"  ? process.env.REFFINANCE_MAINNET as string : process.env.REFFINANCE_TESTNET as string}`)).data;
        const contractData = data.list;
        const nearBalance =  await stateAccount(accountId)
        let token :any =[];
        const nearMetadata = {
          spec: 'ft-1.0.0',
          name: 'NEAR',
          symbol: 'NEAR',
          icon: null,
          reference: null,
          reference_hash: null,
          decimals: 24
        }
        const parsedNearBalance = Big(nearBalance)
            .div(Big(10).pow(nearMetadata.decimals))
            .toFixed(5);
            
        const nearUsdPrice = parseFloat(tokenPrice['wrap.near'].price);
        
        const nearBalanceInUsd = parseFloat(parsedNearBalance) * nearUsdPrice ;
        
        const contract = 'NEAR'
        if(nearBalanceInUsd){
          token.push({
            ...nearMetadata,
            balance: parsedNearBalance,
            nearUsdPrice,
            contract,
            balanceInUsd: nearBalanceInUsd ? nearBalanceInUsd.toFixed(2) : null,
          })  ;
        }
       
          for (let contract of contractData) {
          const ftMetadata = await viewMethod({contractId:contract,method:"ft_metadata" ,args:{}});
         
          const ftBalance = await viewMethod({contractId:contract,method:"ft_balance_of" ,args:{
              account_id: accountId,
            }});
          
          
          const parsedBalance : any = null
          if (ftBalance && ftMetadata) {
            Big(ftBalance)
            .div(Big(10).pow(ftMetadata.decimals))
            .toFixed(5);
          }
          
          let usdPrice : number= 0;
          let balanceInUsd = null;
          if( tokenPrice[contract]){
            usdPrice = parseFloat(tokenPrice[contract].price);
            balanceInUsd = parseFloat(parsedBalance) * usdPrice;
          }
     
        if( balanceInUsd){
          token.push({
            ...ftMetadata,
            balance: parsedBalance,
            usdPrice,
            contract,
            balanceInUsd: balanceInUsd ? balanceInUsd.toFixed(2) : null,
          })  ;
        }
      
        }
        
        return token
    }
export async function POST(req: Request) {
  const body = await req.json();
  const {  accountId } = body;
try {
 const token = await getToken(accountId);
  return NextResponse.json(
    {  token }
  );
} catch (error) {
  return NextResponse.json(
    {  error },
    {
      status: 400,
      headers: {
        'content-type': 'application/json',
      },
    },
  );
}

}