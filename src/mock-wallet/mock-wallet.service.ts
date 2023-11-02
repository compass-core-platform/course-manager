import { Injectable } from '@nestjs/common';

@Injectable()
export class MockWalletService {

    getTransactions(adminId: number) {
        return {
            status: 200,
            data: [
                {
                    transactionId: 1,
                    fromId: adminId,
                    toId: 2,
                    credits: 120,
                    type: 'creditRequest',
                    descripiton: `A credit request of 120 credits was made from consumer with id 2`,
                    createdAT: new Date()
                },
                {
                    transactionId: 4,
                    fromId: adminId,
                    toId: 3,
                    credits: 100,
                    type: 'creditRequest',
                    descripiton: `A credit request of 100 credits was made from consumer with id 3`,
                    createdAT: new Date()
                },
            ]
        }
    }

    addCredits(adminId: number, providerId: number, credits: number) {
        return {
            message: "Credits added successfully for the providers' wallet",
            data: {
                credits: credits
            }
        }
    }

    reduceCredits(adminId: number, providerId: number, credits: number) {
        return {
            message: "Credits removed successfully from the providers' wallet",
            data: {
                credits: -credits
            }
        }
    }
}
