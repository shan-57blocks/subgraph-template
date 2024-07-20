import { Address, BigInt, log } from '@graphprotocol/graph-ts';

import { Transfer } from '../generated/ERC20/ERC20';
import { Account, TransferEvent } from '../generated/schema';

export function handleTransferEvent(event: Transfer): void {
  const fromAccountId = event.params.from.toHexString();
  let fromAccount = Account.load(event.params.from.toHexString());
  if (!fromAccount) {
    fromAccount = new Account(fromAccountId);
    fromAccount.id = fromAccountId;
    fromAccount.totalAmountReceived = BigInt.fromI32(0);
    fromAccount.totalAmountSent = BigInt.fromI32(0);
  }
  fromAccount.totalAmountReceived = fromAccount.totalAmountReceived.plus(
    event.params.value
  );
  fromAccount.save();

  const toAccountId = event.params.to.toHexString();
  let toAccount = Account.load(event.params.to.toHexString());
  if (!toAccount) {
    toAccount = new Account(toAccountId);
    toAccount.id = toAccountId;
    toAccount.totalAmountReceived = BigInt.fromI32(0);
    toAccount.totalAmountSent = BigInt.fromI32(0);
  }
  toAccount.totalAmountSent = toAccount.totalAmountSent.plus(
    event.params.value
  );

  const transferEvent = new TransferEvent(event.transaction.hash.toHexString());
  transferEvent.tx = event.transaction.hash;
  transferEvent.amount = event.params.value;
  transferEvent.timestamp = event.block.timestamp;
  transferEvent.from = event.params.from;
  transferEvent.to = event.params.to;
  transferEvent.save();
}
