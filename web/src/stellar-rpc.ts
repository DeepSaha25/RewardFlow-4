// Stellar RPC and Contract Interaction Utilities

import * as StellarSDK from "@stellar/stellar-sdk";
import { stellarNetwork, tokenAddress, poolAddress } from "./stellar-contracts";

const server = new StellarSDK.SorobanRpc.Server(stellarNetwork.rpcUrl);
const keypair = StellarSDK.Keypair.random(); // Placeholder - replaced by wallet auth

/// Get account details from Stellar
export async function getAccountDetails(address: string) {
  try {
    const account = await server.getAccount(address);
    return account;
  } catch (error) {
    console.error("Failed to fetch account:", error);
    throw error;
  }
}

/// Helper to build and send a contract invocation transaction
export async function invokeContract(
  contractId: string,
  method: string,
  args: StellarSDK.xdr.SCVal[],
  signer: StellarSDK.Keypair,
  sourceAccount: StellarSDK.Account
) {
  try {
    const contractInterface = getContractInterface(contractId);
    
    const operation = StellarSDK.Operation.invokeHostFunction({
      hostFunction: StellarSDK.xdr.HostFunction.hostFunctionTypeInvokeContract(
        StellarSDK.xdr.InvokeContractArgs.invokeContractArgs(
          StellarSDK.xdr.ScAddress.scAddressTypeContract(
            StellarSDK.xdr.Hash.fromXDRObject(
              StellarSDK.xdr.Hash.hash(
                Buffer.from(contractId.replace("C", ""), "hex")
              )
            )
          ),
          StellarSDK.xdr.ScSymbol.scSymbol(method),
          new StellarSDK.xdr.ScValList(args)
        )
      ),
      footprint: new StellarSDK.xdr.LedgerFootprint(
        new StellarSDK.xdr.ScMapEntry[0](),
        new StellarSDK.xdr.LedgerKey[0]()
      ),
    });

    const transaction = new StellarSDK.TransactionBuilder(sourceAccount, {
      fee: "1000",
      networkPassphrase: stellarNetwork.passphrase,
    })
      .addOperation(operation)
      .setSequenceTimeout(300)
      .build();

    transaction.sign(signer);
    const result = await server.sendTransaction(transaction);
    return result;
  } catch (error) {
    console.error("Contract invocation failed:", error);
    throw error;
  }
}

/// Helper to read contract state
export async function readContractState(contractId: string, dataKey: string) {
  try {
    const contractDataXdr = await server.getContractData(
      contractId,
      StellarSDK.xdr.ScVal.scValTypeSymbol(
        StellarSDK.xdr.ScSymbol.scSymbol(dataKey)
      ),
      StellarSDK.SorobanRpc.Durability.Persistent
    );
    return contractDataXdr;
  } catch (error) {
    console.error("Failed to read contract state:", error);
    throw error;
  }
}

/// Get contract interface (stub - in real implementation would use contract ABI)
function getContractInterface(contractId: string) {
  // This would be replaced with actual contract metadata
  return {};
}

/// Helper to decode Stellar amount (stroops to decimal)
export function formatAmount(stroops: bigint, decimals: number = 7): string {
  const factor = BigInt(10 ** decimals);
  const wholePart = stroops / factor;
  const fractionalPart = stroops % factor;
  const fractional = fractionalPart.toString().padStart(decimals, "0").replace(/0+$/, "");
  return fractional ? `${wholePart.toString()}.${fractional}` : wholePart.toString();
}

/// Helper to parse amount to Stellar (decimal to stroops)
export function parseAmount(amount: string, decimals: number = 7): bigint {
  const [wholePart = "0", fractionalPart = "0"] = amount.split(".");
  const paddedFractional = fractionalPart.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(wholePart + paddedFractional);
}

/// Poll for contract events (simple implementation)
export async function pollContractEvents(
  contractId: string,
  eventType: string,
  sinceSequence: number = 0
) {
  try {
    // Query transactions that invoked the contract
    const transactions = await server.getTransactions()
      .forAccount(contractId)
      .build()
      .call();

    const events = [];
    for (const tx of transactions.records) {
      // Parse transaction for relevant events
      if (tx.type_i === 1) { // InvokeHostFunction operation
        // In real implementation, decode and filter events
        events.push(tx);
      }
    }
    return events;
  } catch (error) {
    console.error("Failed to poll contract events:", error);
    return [];
  }
}
