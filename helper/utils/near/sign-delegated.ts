import { actionCreators } from '@near-js/transactions';
import BN from 'bn.js';

import { instatiateAccount} from './meta-transactions';

export const signDelegatedTransaction = async ({
  network,
  signer,
  privateKey,
  transaction,
  contractAddress,
}: {
  network: string;
  signer: string;
  privateKey: string;
  transaction: {
    methodName: string;
    args: any;
    gas: string | number;
    deposit: string | number;
  };
  contractAddress: string;
}) => {
 const signerAccount = await instatiateAccount(network, signer, privateKey);
  //const signerAccount = await connect(signer, keyStore, network);

  const action = actionCreators.functionCall(
    transaction.methodName,
    JSON.parse(transaction.args),
    new BN(transaction.gas),
    new BN(transaction.deposit),
  );

  const delegate = await signerAccount.signedDelegate({
    actions: [action],
    blockHeightTtl: 600,
    receiverId: contractAddress,
  });

  return delegate;
};
