import { Address, BigInt, log } from '@graphprotocol/graph-ts';

import { Transfer } from '../generated/ERC20/ERC20';
import { Account, TransferEvent } from '../generated/schema';

export function handleTransfer(event: Transfer): void {
  const { from, to, value } = event.params;

  const fromAccountId = from.toHexString();
  let fromAccount = Account.load(from.toHexString());
  if (!fromAccount) {
    fromAccount = new Account(fromAccountId);
    fromAccount.id = fromAccountId;
    fromAccount.totalAmountReceived = BigInt.fromI32(0);
    fromAccount.totalAmountSent = BigInt.fromI32(0);
  }
  fromAccount.totalAmountReceived = fromAccount.totalAmountReceived.plus(value);
  fromAccount.save();

  const toAccountId = to.toHexString();
  let toAccount = Account.load(to.toHexString());
  if (!toAccount) {
    toAccount = new Account(toAccountId);
    toAccount.id = toAccountId;
    toAccount.totalAmountReceived = BigInt.fromI32(0);
    toAccount.totalAmountSent = BigInt.fromI32(0);
  }
  toAccount.totalAmountSent = toAccount.totalAmountSent.plus(value);

  const transferEvent = new TransferEvent(event.transaction.hash.toHexString());
  transferEvent.tx = event.transaction.hash;
  transferEvent.amount = value;
  transferEvent.timestamp = event.block.timestamp;
  transferEvent.from = from;
  transferEvent.to = to;
  transferEvent.save();
}
