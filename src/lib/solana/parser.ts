import { ParsedTransactionWithMeta } from '@solana/web3.js';
import { TransactionNode } from '../types';

export const parseTransaction = (
    tx: ParsedTransactionWithMeta,
    targetWallet: string
): TransactionNode => {
    const { blockTime, slot, transaction, meta } = tx;
    const signature = transaction.signatures[0];
    const timestamp = blockTime || 0;

    // Extract counterparties and programs
    const counterparties: Set<string> = new Set();
    const programs: Set<string> = new Set();

    // Parse instructions
    transaction.message.instructions.forEach(ix => {
        programs.add(ix.programId.toString());

        // In parsed transactions, some instructions have 'accounts'
        if ('accounts' in ix) {
            ix.accounts.forEach(acc => {
                const addr = acc.toString();
                if (addr !== targetWallet) {
                    counterparties.add(addr);
                }
            });
        }
    });

    // Determine type (simplified logic)
    let type: TransactionNode['type'] = 'unknown';
    if (programs.has('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')) {
        type = 'transfer';
    } else if (programs.has('JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4')) {
        type = 'swap';
    }

    return {
        signature,
        timestamp,
        slot,
        type,
        counterparties: Array.from(counterparties),
        programs: Array.from(programs),
    };
};

export const parseTransactionHistory = (
    history: ParsedTransactionWithMeta[],
    targetWallet: string
): TransactionNode[] => {
    return history.map(tx => parseTransaction(tx, targetWallet));
};
