

// define in prisma.schema
enum TransactionType {
    purchase,
    creditRequest,
    settlement
}

export class TransactionResponse {
    readonly transactionId: number;
    readonly fromId: number;
    readonly toId: number;
    readonly credits: number;
    readonly type: TransactionType;
    readonly description?: string;
    readonly createdAt: Date;
}